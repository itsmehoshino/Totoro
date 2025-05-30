import { log } from '../views/custom';
import { aliases, role, cooldown } from '../listener';

export async function handleCommand({ api, replies, args, event, cooldown, database, usersDB, threadDB, threadData }) {
  try {
    if (!event.body || typeof event.body !== 'string') {
      log('DEBUG', `Invalid event body from user ${event.senderID} in thread ${event.threadID}`);
      return;
    }

    if (threadData.isBanned) {
      await api.sendMessage('This group is banned from using the bot.', event.threadID);
      log('INFO', `Thread ${event.threadID} is banned, command ignored`);
      return;
    }
    if (!threadData.isApproved) {
      await api.sendMessage(
        'This group is not approved. Awaiting developer approval. Contact the developer or try again later.',
        event.threadID
      );
      log('INFO', `Thread ${event.threadID} is not approved, command ignored`);
      return;
    }

    const prefix = global.Totoro.config.prefix || '!';
    const subprefix = global.Totoro.config.subprefix || '#';
    if (!args[0]?.startsWith(prefix) && !args[0]?.startsWith(subprefix)) {
      log('DEBUG', `Message from ${event.senderID} in thread ${event.threadID} does not start with prefix (${prefix}) or subprefix (${subprefix})`);
      return;
    }

    const commandText = args[0].startsWith(prefix)
      ? args.join(' ').slice(prefix.length).trim()
      : args.join(' ').slice(subprefix.length).trim();
    const [commandName, ...commandArgs] = commandText.split(/\s+/);
    const normalizedCommand = aliases(commandName.toLowerCase());
    if (!normalizedCommand) {
      log('INFO', `Invalid command or alias: ${commandName} from user ${event.senderID} in thread ${event.threadID}`);
      await api.sendMessage(`Unknown command: ${commandName}. Try ${prefix}help for available commands.`, event.threadID);
      return;
    }

    const command = global.Totoro.commands.get(normalizedCommand);
    if (!command) {
      log('INFO', `Unknown command: ${normalizedCommand} from user ${event.senderID} in thread ${event.threadID}`);
      await api.sendMessage(`Unknown command: ${normalizedCommand}. Try ${prefix}help for available commands.`, event.threadID);
      return;
    }

    if (!role(event.senderID, normalizedCommand)) {
      await api.sendMessage(
        `You do not have permission to use the "${normalizedCommand}" command.`,
        event.threadID
      );
      log('INFO', `Permission denied for user ${event.senderID} on command ${normalizedCommand}`);
      return;
    }

    if (!(await cooldown(event.senderID, event.threadID, normalizedCommand, api))) {
      log('INFO', `Cooldown active for user ${event.senderID} on command ${normalizedCommand}`);
      return;
    }

    const response = {
      send: (msg, goal) =>
        new Promise((res) => {
          try {
            api.sendMessage(msg, goal || event.threadID, (_, info) => res(info));
          } catch (error) {
            log('ERROR', `Failed to send message for command ${normalizedCommand}: ${error.message}`);
            res(null);
          }
        }),
    };

    await command.execute({ response, args: commandArgs, event, database, usersDB, threadDB });
    log('COMMANDS', `Executed command: ${normalizedCommand} with args [${commandArgs.join(', ')}] by user ${event.senderID} in thread ${event.threadID}`);
  } catch (error) {
    const errorMessage = error.message || String(error);
    log('ERROR', `Command handling failed: ${errorMessage}`);
    await api.sendMessage(`Error executing ${normalizedCommand || 'command'}: ${errorMessage}`, event.threadID);
  }
}
