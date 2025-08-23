import { log } from '../views/custom';
import { Response } from './chat/response';
import { styler } from '../../../totoro/resources/styler/design/styler';
import fonts from '../../../totoro/resources/styler/fonter/fonts';
import { totoroHM } from '../../../totoro/resources/styler/design/totoroHM';
import { cassMongo } from '../../../totoro/resources/plugins/database/data/database';

export async function handleCommand({ api, event }) {
  if (!event.body) return;

  const mainPrefix = global.Totoro.prefix;
  let subPrefixes = Array.isArray(global.Totoro.config.subprefixes)
    ? global.Totoro.config.subprefixes.filter(prefix => typeof prefix === 'string' && prefix)
    : [];

  const invalidSubPrefixes = subPrefixes.filter(prefix => prefix === mainPrefix);
  if (invalidSubPrefixes.length > 0) {
    log('WARNING', `Sub-prefixes matching main prefix "${mainPrefix}" removed: ${invalidSubPrefixes.join(', ')}`);
    subPrefixes = subPrefixes.filter(prefix => prefix !== mainPrefix);
  }

  const botName = global.Totoro.config.botname || '';
  let usedPrefix = '';

  if (event.body.startsWith(mainPrefix)) {
    usedPrefix = mainPrefix;
  } else {
    const matchedSubPrefix = subPrefixes.find(prefix => event.body.startsWith(prefix));
    if (matchedSubPrefix) {
      usedPrefix = matchedSubPrefix;
    } else if (botName && event.body.toLowerCase().includes(botName.toLowerCase())) {
      const response = new Response(api, event, '');
      const subPrefixText = subPrefixes.length > 0 ? subPrefixes.join(', ') : 'None';
      response.reply(fonts.sans(
        `Hello there!! Missed me? Oh don't know my prefix and subprefixes? Here they are, my friend:\n\n` +
        `PREFIX: [${mainPrefix}]\nSUBPREFIXES: [${subPrefixText}]\n\n` +
        `${fonts.bold("Developed by: ")} Francis Loyd Raval.`,
        event.threadID
      ));
      return;
    } else {
      return;
    }
  }

  const response = new Response(api, event, '');

  if (global.Totoro.config.maintenance && !global.Totoro.config.developer.includes(event.senderID)) {
    response.reply(fonts.sans('The bot is currently under maintenance and cannot be used'));
    return;
  }

  const [commandName, ...args] = event.body.slice(usedPrefix.length).split(' ');
  const command = global.Totoro.commands.get(commandName.toLowerCase());

  if (command) {
    const cooldownKey = `${event.senderID}:${commandName.toLowerCase()}`;
    const cooldownTime = (command.meta?.cooldown ?? 5) * 1000;
    const lastUsed = global.Totoro.cooldowns.get(cooldownKey);

    if (lastUsed) {
      const timeSinceLastUsed = Date.now() - lastUsed;
      if (timeSinceLastUsed < cooldownTime) {
        const remainingSeconds = Math.ceil((cooldownTime - timeSinceLastUsed) / 1000);
        log('INFO', `User ${event.senderID} attempted "${commandName}" during cooldown. ${remainingSeconds}s remaining.`);
        response.reply(fonts.sans(
          `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'} before using ${usedPrefix}${commandName} again.`
        ));
        return;
      }
    }

    const userRole = global.Totoro.config.developer.includes(event.senderID)
      ? 1
      : global.Totoro.config.admin.includes(event.senderID)
      ? 2
      : global.Totoro.config.moderator.includes(event.senderID)
      ? 3
      : 0;

    const requiredRole = command.meta?.role ?? 0;

    if (userRole > requiredRole && userRole !== 1) {
      response.reply(fonts.sans('You do not have permission to use this command'));
      return;
    }

    try {
      await command.execute({
        api,
        response: new Response(api, event, commandName.toLowerCase()),
        event,
        args,
        fonts,
        styler,
        totoroHM,
        database: cassMongo,
      });

      global.Totoro.cooldowns.set(cooldownKey, Date.now());
      setTimeout(() => global.Totoro.cooldowns.delete(cooldownKey), cooldownTime);
    } catch (err) {
      log('ERROR', `Error executing command "${commandName}": ${err.message}`);
      response.reply(fonts.sans(`Error executing command "${commandName}". Try again later.`));
    }
    return;
  }

  response.reply(fonts.sans(`Command not found, use ${mainPrefix}help to view the command`));
}