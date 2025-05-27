import { log } from '../views/custom';
import { aliases, role, cooldown } from '../listener';

export async function handleCommand({ api, event }) {
  if (!event.body) return;
  let [commandName, ...args] = event.body.trim().split(/\s+/);
  let prefixUsed: string | null = null;
  if (commandName.startsWith(global.Totoro.prefix)) {
    prefixUsed = global.Totoro.prefix;
  } else if (commandName.startsWith(global.Totoro.subprefix)) {
    prefixUsed = global.Totoro.subprefix;
  } else {
    return;
  }
  commandName = commandName.slice(prefixUsed.length).toLowerCase();
  if (!commandName) return;
  const mainCommandName = aliases(commandName);
  const hasPermission = role(event.senderID, mainCommandName);
  if (!hasPermission) {
    log('PERMISSION', `User ${event.senderID} denied access to command: ${mainCommandName}`);
    api.sendMessage('You do not have permission to use this command.', event.threadID);
    return;
  }
  const canExecute = await cooldown(event.senderID, event.threadID, mainCommandName, api);
  if (!canExecute) return;
  const command = global.Totoro.commands.get(mainCommandName);
  if (!command) {
    log('COMMAND', `Unknown command: ${mainCommandName}`);
    api.sendMessage(`Unknown command: ${mainCommandName}. Use ${global.Totoro.prefix}help for a list of commands.`, event.threadID);
    return;
  }
  const entryObj: EntryObj = {
    api,
    replies: global.Totoro.replies,
    args,
    event,
    cooldown,
    database: new (require('../../totoro/resources/plugins/database/data/database.ts').default)(),
    usersDB: new (require('../../totoro/resources/plugins/database/user/userDB.ts').default)(),
    threadDB: new (require('../../totoro/resources/plugins/database/thread/threadDB.ts').default)(),
  };
  try {
    await command.execute(entryObj);
    log('COMMAND', `Executed command: ${command.meta.name} by user ${event.senderID} in thread ${event.threadID}`);
  } catch (error) {
    log('ERROR', `Failed to execute command ${command.meta.name}: ${error.message}`);
    api.sendMessage(`Error executing command: ${error.message}`, event.threadID);
  }
}