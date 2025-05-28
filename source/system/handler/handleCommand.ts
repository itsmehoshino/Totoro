import { log } from '../views/custom';
import { aliases, role, cooldown } from '../listener';

export async function handleCommand({ api, replies, args, event, cooldown, database, usersDB, threadDB }) {
  try {
    if (!event.body || typeof event.body !== 'string') return;
    if (!(await threadDB.isApproved(event.threadID))) {
      await api.sendMessage('This group is not approved. Awaiting developer approval.', event.threadID);
      return;
    }
    const prefix = global.Totoro.prefix || '!';
    const subprefix = global.Totoro.subprefix || '#';
    const body = event.body.trim();
    if (!body.startsWith(prefix) && !body.startsWith(subprefix)) {
      return;
    }
    const commandText = body.startsWith(prefix)
      ? body.slice(prefix.length).trim()
      : body.slice(subprefix.length).trim();
    let [commandName, ...commandArgs] = commandText.split(" ");
    commandName = commandName.toLowerCase();
    commandArgs = commandArgs.filter(arg => arg);
    commandName = aliases(commandName);
    const command = global.Totoro.commands.get(commandName);
    if (!command) {
      log('INFO', `Unknown command: ${commandName} from user ${event.senderID} in thread ${event.threadID}`);
      return;
    }
    if (!role(event.senderID, commandName)) {
      await api.sendMessage(
        `You do not have permission to use the "${commandName}" command.`,
        event.threadID
      );
      log('INFO', `Permission denied for user ${event.senderID} on command ${commandName}`);
      return;
    }
    if (!(await cooldown(event.senderID, event.threadID, commandName, api))) {
      log('INFO', `Cooldown active for user ${event.senderID} on command ${commandName}`);
      return;
    }
    const response = {
      send: (msg, goal) => {
        return new Promise((res) => {
          try {
            api.sendMessage(msg, goal || event.threadID, (_, info) => res(info));
          } catch (error) {
            log('ERROR', `Failed to send message for command ${commandName}: ${error.message}`);
            res(null);
          }
        });
      },
    };
    await command.execute({
      response,
      args: commandArgs,
      event,
      database,
      usersDB,
      threadDB,
    });
    log('COMMANDS', `Executed command: ${commandName} with args [${commandArgs.join(', ')}] by user ${event.senderID} in thread ${event.threadID}`);
  } catch (error) {
    log('ERROR', `Command handling failed: ${error.message}`);
    await api.sendMessage('An error occurred while processing your command.', event.threadID);
  }
}