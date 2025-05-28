import mongoose, { Schema, Document } from 'mongoose';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserStatsManager {
  private uri: string | undefined;
  private defaults: { balance: number; diamonds: number; username: string | null };
  private isJsonMode: boolean;
  private jsonFilePath: string;
  private cache: { [key: string]: any };
  private UserStatsModel: mongoose.Model;

  constructor({ uri = process.env.MONGO_URI }: { uri?: string } = {}) {
    this.defaults = {
      balance: 0,
      diamonds: 0,
      username: null,
    };
    this.uri = uri ?? process.env.MONGO_URI;
    this.isJsonMode = false;
    this.jsonFilePath = path.join(__dirname, 'userStats.json');
    this.cache = {};

    if (!this.uri) {
      console.warn("No MongoDB URI provided, falling back to JSON mode");
      this.isJsonMode = true;
      this.cache = this.loadJsonDataSync();
    } else {
      const userStatsSchema = new Schema<IUserStats>({
        key: { type: String, required: true, unique: true },
        value: {
          balance: { type: Number, default: 0 },
          diamonds: { type: Number, default: 0 },
          username: { type: String, default: null },
          lastModified: { type: Number, default: Date.now },
        },
      });
      this.UserStatsModel = mongoose.model<IUserStats>('UserStats', userStatsSchema, 'totorodata');
    }
  }

  private loadJsonDataSync(): { [key: string]: any } {
    try {
      if (fs.existsSync(this.jsonFilePath)) {
        const data = fs.readFileSync(this.jsonFilePath, 'utf8');
        return JSON.parse(data) || {};
      }
      return {};
    } catch (error) {
      console.error("Error loading JSON data:", error);
      return {};
    }
  }

  private async saveJsonData(data: any): Promise<void> {
    try {
      await fsPromises.writeFile(this.jsonFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error saving JSON data:", error);
    }
  }

  private updateCache(key: string, value: any): void {
    this.cache[key] = value;
    if (this.isJsonMode) {
      this.saveJsonData(this.cache);
    }
  }

  private process(data: any): any {
    data = data || {};
    data.balance = typeof data.balance === "number" ? data.balance : 0;
    if (data.balance > Number.MAX_SAFE_INTEGER) {
      data.balance = Number.MAX_SAFE_INTEGER;
    }
    if (data.username) {
      data.username = data.username.trim();
    }
    return data;
  }

  async connect(): Promise<void> {
    if (this.isJsonMode) {
      return;
    }
    try {
      await mongoose.connect(this.uri!);
      await this.UserStatsModel.create({ key: 'test', value: this.defaults });
    } catch (error) {
      console.error("MONGODB Error:", error);
      throw error;
    }
  }

  async getCache(key: string): Promise<any> {
    if (!this.cache[key]) {
      await this.get(key);
    }
    return JSON.parse(JSON.stringify(this.cache[key]));
  }

  async get(key: string): Promise<any> {
    let data: any;
    if (this.isJsonMode) {
      data = this.process(this.cache[key] || {
        ...this.defaults,
        lastModified: Date.now(),
      });
    } else {
      const doc = await this.UserStatsModel.findOne({ key }).exec();
      data = this.process(
        doc ? doc.value : { ...this.defaults, lastModified: Date.now() }
      );
    }
    this.updateCache(key, data);
    return data;
  }

  async deleteUser(key: string): Promise<any> {
    if (this.isJsonMode) {
      delete this.cache[key];
      await this.saveJsonData(this.cache);
      return this.getAll();
    }
    await this.UserStatsModel.deleteOne({ key }).exec();
    delete this.cache[key];
    return this.getAll();
  }

  async remove(key: string, removedProperties: string[] = []): Promise<any> {
    const user = await this.get(key);
    for (const item of removedProperties) {
      delete user[item];
    }
    if (this.isJsonMode) {
      this.updateCache(key, user);
      return this.getAll();
    }
    await this.UserStatsModel.updateOne(
      { key },
      { $set: { value: user } },
      { upsert: true }
    ).exec();
    this.updateCache(key, user);
    return this.getAll();
  }

  async set(key: string, updatedProperties: any = {}): Promise<void> {
    const user = await this.get(key);
    const updatedUser = {
      ...user,
      ...updatedProperties,
      lastModified: Date.now(),
    };
    if (this.isJsonMode) {
      this.updateCache(key, updatedUser);
    } else {
      await this.UserStatsModel.updateOne(
        { key },
        { $set: { value: updatedUser } },
        { upsert: true }
      ).exec();
      this.updateCache(key, updatedUser);
    }
  }

  async getAllOld(): Promise<any> {
    if (this.isJsonMode) {
      return { ...this.cache };
    }
    const docs = await this.UserStatsModel.find().exec();
    const result: { [key: string]: any } = {};
    docs.forEach(doc => {
      result[doc.key] = doc.value;
    });
    return result;
  }

  async getAll(): Promise<any> {
    const allData = await this.getAllOld();
    const result: { [key: string]: any } = {};
    for (const key in allData) {
      result[key] = this.process(allData[key]);
      this.cache[key] = result[key];
    }
    return result;
  }

  async queryAllItem(query: any): Promise<any> {
    if (this.isJsonMode) {
      const result: { [key: string]: any } = {};
      for (const key in this.cache) {
        let matches = true;
        for (const field in query) {
          if (this.cache[key][field] !== query[field]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          result[key] = this.process(this.cache[key]);
        }
      }
      return result;
    }
    try {
      const mongoQuery: any = {};
      for (const field in query) {
        mongoQuery[`value.${field}`] = query[field];
      }
      const docs = await this.UserStatsModel.find(mongoQuery).lean().select('key value').exec();
      const result: { [key: string]: any } = {};
      docs.forEach((doc: any) => {
        result[doc.key] = this.process(doc.value);
        this.cache[doc.key] = result[doc.key];
      });
      return result;
    } catch (error) {
      console.error("Error querying items:", error);
      return {};
    }
  }

  async toLeanObject(): Promise<any> {
    if (this.isJsonMode) {
      return { ...this.cache };
    }
    try {
      const results = await this.UserStatsModel.find().lean().select('key value').exec();
      const resultObj: { [key: string]: any } = {};
      results.forEach((doc: any) => {
        resultObj[doc.key] = doc.value;
      });
      return resultObj;
    } catch (error) {
      console.error("Error getting entries:", error);
      return {};
    }
  }
}

export default UserStatsManager;