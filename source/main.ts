import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from './system/views/custom';
import { starter } from './system/views/starter';
import EventEmitter from "events";
import './global';

const bot = new EventEmitter();
global.bot = bot;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on("unhandledRejection", (error) => console.log("ERROR", error));
process.on("uncaughtException", (error) => console.log("ERROR", error.stack));

global.Totoro = {
  get config() {
    try {
      return JSON.parse(
        fs.readFileSync(join(__dirname, "..", "settings.json"), "utf-8")
      );
    } catch (error) {
      log("ERROR", "Missing settings.json file!");
      throw error;
    }
  },
  set config(config) {
    const data = global.Totoro.config;
    const newData = { ...data, ...config };
    const stringData = JSON.stringify(newData, null, 2);
    fs.writeFileSync(join(__dirname, "..", "settings.json"), stringData);
  },
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  replies: new Map(),
};

Object.assign(global.Totoro, {
  get prefix() {
    return global.Totoro.config.prefix;
  },
  get subprefix() {
    return global.Totoro.config.subprefix;
  },
  get maintenance() {
    return global.Totoro.config.maintenance;
  },
  get developer() {
    return global.Totoro.config.developer;
  },
  get admin() {
    return global.Totoro.config.admin;
  },
  get moderator() {
    return global.Totoro.config.moderator;
  },
});

async function main() {
  await starter();
}

main();