import { CassMongoManager } from "./cass-mongo";
import * as dotenv from "dotenv";

dotenv.config();

export class TotoroDB {
  private manager: CassMongoManager;
  private db: InstanceType<typeof CassMongoManager.prototype.getInstance>;

  constructor(collection: string = "totoroGameDB") {
    this.manager = new CassMongoManager();
    const uri = this.getMongoURI();
    this.db = this.manager.getInstance({
      uri,
      collection,
      ignoreError: true,
      allowClear: true,
    });
  }

  private getMongoURI(): string {
    const defaultURI = "mongodb://localhost:27017/testdb";
    const mongoURI = process.env.MONGO_URI || defaultURI;
    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined in environment variables (MONGO_URI)");
    }
    return mongoURI;
  }

  getDatabase() {
    return this.db;
  }

  async start() {
    await this.db.start();
  }

  async put(key: any, value: any) {
    await this.db.put(key, value);
  }

  async get(key: any) {
    return await this.db.get(key);
  }

  async remove(key: any) {
    await this.db.remove(key);
  }

  async clear() {
    await this.db.clear();
  }

  async entries() {
    return await this.db.entries();
  }
}