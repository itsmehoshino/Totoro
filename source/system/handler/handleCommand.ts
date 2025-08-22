import { Response } from './chat/response';
import { styler } from '../../../totoro/resources/styler/design/styler';
import fonts from '../../../totoro/resources/styler/fonter/fonts';
import { totoroHM } from '../../../totoro/resources/styler/design/totoroHM';
import { cassMongo } from '../../../totoro/resources/plugins/database/data/database';

export async function handleCommand({ api, event }) {
  if (!event.body) return;

  const mainPrefix = global.Totoro.prefix;
  const subPrefix = global.Totoro.config.subprefix || '';
  const botName = global.Totoro.config.botname || '';
  let usedPrefix = '';

  if (event.body.startsWith(mainPrefix)) {
    usedPrefix = mainPrefix;
  } else if (subPrefix && event.body.startsWith(subPrefix)) {
    usedPrefix = subPrefix;
  } else if (botName && event.body.toLowerCase().includes(botName.toLowerCase())) {
    const response = new Response(api, event, '');
    response.reply(fonts.sans(`Hello there!! Missed me? Oh dont know my prefix and subprefix? Here my prefix and subprefix my friend:\n\nPREFIX: [${mainPrefix}]\nSUBPREFIX: [${subPrefix || 'None'}]\n\n${fonts.bold("Developed by: ")} Francis Loyd Raval.`, event.threadID));
    return;
  } else {
    return;
  }

  const response = new Response(api, event, '');

  if (global.Totoro.config.maintenance && !global.Totoro.config.developer.includes(event.senderID)) {
    response.send('The bot is currently under maintenance and cannot be used', event.threadID);
    return;
  }

  const [commandName, ...args] = event.body.slice(usedPrefix.length).split(' ');
  const command = global.Totoro.commands.get(commandName.toLowerCase());

  const entryObj = {
    api,
    response: new Response(api, event, commandName.toLowerCase()),
    event,
    args,
    fonts,
    styler,
    totoroHM,
    database: cassMongo,
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
      response.send(fonts.sans('You do not have permission to use this command'));
      return;
    }

    try {
      await command.execute(entryObj);
    } catch (err) {
      console.error(`Error executing command "${commandName}":`, err);
    }
    return;
  }

  response.reply(fonts.sans(`Command not found, use ${mainPrefix}help to view the command`));
}