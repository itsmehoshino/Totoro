import { Response } from './chat/response';

export async function handleCommand({ api, event }) {
  if (!event.body) return;

  const mainPrefix = global.Totoro.prefix;
  const subPrefix = global.Totoro.config.subprefix || '';
  let usedPrefix = '';

  if (event.body.startsWith(mainPrefix)) {
    usedPrefix = mainPrefix;
  } else if (subPrefix && event.body.startsWith(subPrefix)) {
    usedPrefix = subPrefix;
  } else {
    return;
  }

  const response = Response(api, event);

  if (global.Totoro.config.maintenance && !global.Totoro.config.developer.includes(event.senderID)) {
    response.send('The bot is currently under maintenance and cannot be used', event.threadID);
    return;
  }

  const [commandName, ...args] = event.body.slice(usedPrefix.length).split(' ');
  const command = global.Totoro.commands.get(commandName.toLowerCase());

  const entryObj = {
    api,
    response,
    event,
    args,
  };

  if (command) {
    const userRole = global.Totoro.config.developer.includes(event.senderID)
      ? 1
      : global.Totoro.config.admin.includes(event.senderID)
      ? 2
      : global.Totoro.config.moderator.includes(event.senderID)
      ? 3
      : 0;

    const requiredRole = command.meta?.role ?? 0;

    if (userRole > requiredRole && userRole !== 1) {
      response.send('You do not have permission to use this command', event.threadID);
      return;
    }

    try {
      await command.execute(entryObj);
    } catch (err) {
      console.error(`Error executing command "${commandName}":`, err);
    }
    return;
  }

  response.send(`Command not found, use ${mainPrefix}help to view the command`, event.threadID);
}
