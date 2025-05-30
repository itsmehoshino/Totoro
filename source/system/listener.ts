let isConnected = false;
import { handleReply } from './handler/handleReply';
import { handleCommand } from './handler/handleCommand';
import { handleEvent } from './handler/handleEvent';
import Database from '../../totoro/resources/plugins/database/data/database.ts';
import ThreadDB from '../../totoro/resources/plugins/database/thread/threadDB.ts';

const database = new Database();
const threadDB = new ThreadDB();

export async function listener({ api, event }) {
  if (!isConnected) {
    await database.connect();
    await threadDB.connect();
    isConnected = true;
  }

  console.log({ ...event, participantIDs: {} });

  if (event.type === 'event' && event.logMessageType === 'log:subscribe') {
    const threadID = event.threadID;
    const threadData = await threadDB.get(threadID);
    if (threadData.isBanned) {
      await api.sendMessage('This group is banned from using the bot.', threadID);
      return;
    }
    const isApproved = await threadDB.isApproved(threadID);
    const pending = await threadDB.getPendingThread(threadID);
    if (!isApproved && !pending) {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName || 'Unnamed Group';
        await threadDB.addPendingThread(threadID, groupName);
        const developerID = global.Totoro.config.developer;
        await api.sendMessage(
          `Bot added to group: ${groupName} (ID: ${threadID}). Use "!approve ${threadID}" to approve, "!deny ${threadID}" to deny, or "!ban ${threadID}" to ban.`,
          developerID
        );
        await api.sendMessage('Awaiting developer approval to activate.', threadID);
      } catch (error) {
        log('ERROR', `Failed to process group addition for ${threadID}: ${error.message}`);
      }
    }
    return;
  }

  const threadData = await threadDB.get(event.threadID);
  if (threadData.isBanned || !(await threadDB.isApproved(event.threadID))) {
    return;
  }

  const entryObj = {
    api,
    replies: global.Totoro.replies,
    args: event.body?.split(' ') || [],
    event,
    cooldown,
    database,
    threadDB,
  };

  switch (event.type) {
    case 'event':
      handleEvent({ ...entryObj });
      break;
    case 'message':
      await handleCommand({ ...entryObj });
      break;
    case 'message_reply':
      handleReply({ ...entryObj });
      await handleCommand({ ...entryObj });
      break;
    default:
      break;
  }
}

export function aliases(commandName) {
  const command = global.Totoro.commands.get(commandName);
  return command?.meta?.name || commandName;
}

export function role(userID, commandName) {
  const command = global.Totoro.commands.get(commandName);
  if (!command?.meta?.role) return true;
  const role = command.meta.role;
  const config = global.Totoro.config;
  switch (role) {
    case 0: return true;
    case 1: return userID === config.developer;
    case 2: return config.admin?.includes(userID) ?? false;
    case 3: return config.moderator?.includes(userID) ?? false;
    default: return false;
  }
}

export async function cooldown(userID, threadID, commandName, api) {
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
