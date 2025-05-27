let isConnected = false;

import { log } from './views/custom';
import { handleReply } from './handler/handleReply';
import { handleCommand } from './handler/handleCommand';
import { handleEvent } from './handler/handleEvent';
import Database from '../../totoro/resources/plugins/database/data/database.ts';
import UsersDB from '../../totoro/resources/plugins/database/user/userDB.ts';
import ThreadDB from '../../totoro/resources/plugins/database/thread/threadDB.ts';

const database = new Database();
const usersDB = new UsersDB();
const threadDB = new ThreadDB();

export async function listener({ api, event }) {
  if (!isConnected) {
    await database.connect();
    await usersDB.connect();
    await threadDB.connect();
    isConnected = true;
  }

  log({ ...event, participantIDs: {} });

  const entryObj: EntryObj = {
    api,
    replies: global.Totoro.replies,
    args: [],
    event,
    cooldown,
    database,
    usersDB,
    threadDB,
  };

  switch (event.type) {
    case "event":
      handleEvent({ ...entryObj });
      break;
    case "message":
      await handleCommand({ ...entryObj });
      break;
    case "message_reply":
      handleReply({ ...entryObj });
      await handleCommand({ ...entryObj });
      break;
    default:
      break;
  }
}

export function aliases(commandName: string): string {
  const command = global.Totoro.commands.get(commandName);
  if (command?.meta?.name) {
    return command.meta.name;
  }
  return commandName;
}

export function role(userID: string, commandName: string): boolean {
  const command = global.Totoro.commands.get(commandName);
  if (!command?.meta?.role) return true;
  const role = command.meta.role;
  const config = global.Totoro.config;

  switch (role) {
    case 0:
      return true;
    case 1:
      return userID === config.developer;
    case 2:
      return config.admin?.includes(userID) ?? false;
    case 3:
      return config.moderator?.includes(userID) ?? false;
    default:
      return false;
  }
}

export async function cooldown(userID: string, threadID: string, commandName: string, api: any): Promise<boolean> {
  const command = global.Totoro.commands.get(commandName);
  if (!command?.meta?.cooldown) return true;
  const cooldownKey = `${userID}:${threadID}:${commandName}`;
  const now = Date.now();
  const cooldownEnd = global.Totoro.cooldowns.get(cooldownKey);
  if (cooldownEnd && now < cooldownEnd) {
    const remaining = Math.ceil((cooldownEnd - now) / 1000);
    await api.sendMessage(`Please wait ${remaining} seconds before using this command again.`, threadID);
    return false;
  }
  global.Totoro.cooldowns.set(cooldownKey, now + command.meta.cooldown * 1000);
  setTimeout(() => global.Totoro.cooldowns.delete(cooldownKey), command.meta.cooldown * 1000);
  return true;
}