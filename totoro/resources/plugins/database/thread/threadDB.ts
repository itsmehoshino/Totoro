import mongoose, { Schema } from 'mongoose';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

class ThreadDB {
  private uri: string | undefined;
  private defaults: { groupName: string | null; isApproved: boolean; isBanned: boolean; lastModified: number };
  private isJsonMode: boolean;
  private jsonFilePath: string;
  private cache: { [key: string]: any };
  private ThreadModel: any;

  constructor({ uri = process.env.MONGO_URI }: { uri?: string } = {}) {
    this.defaults = {
      groupName: null,
      isApproved: false,
      isBanned: false,
      lastModified: Date.now(),
    };
    this.uri = uri ?? process.env.MONGO_URI;
    this.isJsonMode = false;
    this.jsonFilePath = path.join('data', 'threadData.json');
    this.cache = {};

    if (!this.uri) {
      console.warn('No MongoDB URI provided, falling back to JSON mode');
      this.isJsonMode = true;
      this.cache = this.loadJsonDataSync();
    } else {
      const threadSchema = new Schema({
        key: { type: String, required: true, unique: true },
        value: {
          groupName: { type: String, default: null },
          isApproved: { type: Boolean, default: false },
          isBanned: { type: Boolean, default: false },
          lastModified: { type: Number, default: Date.now },
        },
      });
      this.ThreadModel = mongoose.model('ThreadData', threadSchema, 'totoroThreads');
    }
  }

  private loadJsonDataSync(): { [key: string]: any } {
    try {
      if (!fs.existsSync(this.jsonFilePath)) {
        const exampleData = {
          '1001': {
            groupName: null,
            isApproved: true,
            isBanned: false,
            lastModified: Date.now(),
          },
          '1002': {
            groupName: 'Pending Group',
            isApproved: false,
            isBanned: false,
            lastModified: Date.now(),
          },
          '1003': {
            groupName: null,
            isApproved: false,
            isBanned: true,
            lastModified: Date.now(),
          },
        };
        fs.mkdirSync(path.dirname(this.jsonFilePath), { recursive: true });
        fs.writeFileSync(this.jsonFilePath, JSON.stringify(exampleData, null, 2));
        return exampleData;
      }
      const data = fs.readFileSync(this.jsonFilePath, 'utf8');
      return JSON.parse(data) || {};
    } catch (error) {
      console.error('Error loading JSON data:', error);
      return {};
    }
  }

  private async saveJsonData(data: any): Promise<void> {
    try {
      await fsPromises.mkdir(path.dirname(this.jsonFilePath), { recursive: true });
      await fsPromises.writeFile(this.jsonFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving JSON data:', error);
    }
  }

  private updateCache(threadID: string, value: any): void {
    this.cache[threadID] = value;
    if (this.isJsonMode) {
      this.saveJsonData(this.cache);
    }
  }

  private process(data: any): any {
    data = data || {};
    data.groupName = typeof data.groupName === 'string' ? data.groupName.trim() : null;
    data.isApproved = typeof data.isApproved === 'boolean' ? data.isApproved : false;
    data.isBanned = typeof data.isBanned === 'boolean' ? data.isBanned : false;
    data.lastModified = typeof data.lastModified === 'number' ? data.lastModified : Date.now();
    return data;
  }

  async connect(): Promise<void> {
    if (this.isJsonMode) {
      return;
    }
    try {
      await mongoose.connect(this.uri!);
    } catch (error) {
      console.error('MONGODB Error:', error);
      throw error;
    }
  }

  async getCache(threadID: string): Promise<any> {
    if (!this.cache[threadID]) {
      await this.get(threadID);
    }
    return JSON.parse(JSON.stringify(this.cache[threadID]));
  }

  async get(threadID: string): Promise<any> {
    let data: any;
    if (this.isJsonMode) {
      data = this.process(this.cache[threadID] || { ...this.defaults });
    } else {
      const doc = await this.ThreadModel.findOne({ key: threadID }).exec();
      data = this.process(doc ? doc.value : { ...this.defaults });
    }
    this.updateCache(threadID, data);
    return data;
  }

  async addPendingThread(threadID: string, groupName: string): Promise<void> {
    const threadData = await this.get(threadID);
    if (!threadData.isApproved && !threadData.isBanned) {
      const updatedData = {
        ...threadData,
        groupName,
        isApproved: false,
        lastModified: Date.now(),
      };
      if (this.isJsonMode) {
        this.updateCache(threadID, updatedData);
      } else {
        await this.ThreadModel.updateOne(
          { key: threadID },
          { $set: { value: updatedData } },
          { upsert: true }
        ).exec();
        this.updateCache(threadID, updatedData);
      }
    }
  }

  async isApproved(threadID: string): Promise<boolean> {
    const threadData = await this.get(threadID);
    return threadData.isApproved && !threadData.isBanned;
  }

  async approve(threadID: string): Promise<void> {
    const threadData = await this.get(threadID);
    const updatedData = {
      ...threadData,
      isApproved: true,
      isBanned: false,
      groupName: null,
      lastModified: Date.now(),
    };
    if (this.isJsonMode) {
      this.updateCache(threadID, updatedData);
    } else {
      await this.ThreadModel.updateOne(
        { key: threadID },
        { $set: { value: updatedData } },
        { upsert: true }
      ).exec();
      this.updateCache(threadID, updatedData);
    }
  }

  async deny(threadID: string): Promise<void> {
    const threadData = await this.get(threadID);
    if (!threadData.isApproved) {
      const updatedData = {
        ...threadData,
        groupName: null,
        lastModified: Date.now(),
      };
      if (this.isJsonMode) {
        this.updateCache(threadID, updatedData);
      } else {
        await this.ThreadModel.updateOne(
          { key: threadID },
          { $set: { value: updatedData } },
          { upsert: true }
        ).exec();
        this.updateCache(threadID, updatedData);
      }
    }
  }

  async ban(threadID: string) {
    const threadData = await this.get(threadID);
    const updatedData = {
      ...threadData,
      isBanned: true,
      isApproved: false,
      groupName: null,
      lastModified: Date.now(),
    };
    if (this.isJsonMode) {
      this.updateCache(threadID, updatedData);
    } else {
      await this.ThreadModel.updateOne(
        { key: threadID },
        { $set: { value: updatedData } },
        { upsert: true }
      ).exec();
      this.updateCache(threadID, updatedData);
    }
  }

  async unban(threadID: string) {
    const threadData = await this.get(threadID);
    const updatedData = {
      ...threadData,
      isBanned: false,
      lastModified: Date.now(),
    };
    if (this.isJsonMode) {
      this.updateCache(threadID, updatedData);
    } else {
      await this.ThreadModel.updateOne(
        { key: threadID },
        { $set: { value: updatedData } },
        { upsert: true }
      ).exec();
      this.updateCache(threadID, updatedData);
    }
  }

  async getPendingThread(threadID: string): Promise<any> {
    const threadData = await this.get(threadID);
    if (!threadData.isApproved && threadData.groupName && !threadData.isBanned) {
      return { name: threadData.groupName };
    }
    return null;
  }
}

export default ThreadDB;
