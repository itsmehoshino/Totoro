import { CassMongo, CassMongoManager } from './cass-mongo';
import { config } from 'dotenv';

config();

const manager = new CassMongoManager();

const cassMongo = manager.getInstance({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/myDatabase',
  collection: 'keyvalue',
  ignoreError: true,
  allowClear: true,
});

let isInitialized = false;
async function initializeMongo() {
  if (!isInitialized) {
    try {
      await cassMongo.start();
      isInitialized = true;
    } catch (error) {
      throw error;
    }
  }
}

initializeMongo().catch((error) => {});

export { cassMongo, manager };