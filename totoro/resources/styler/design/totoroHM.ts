import { log } from '../../../../source/system/views/custom';

export async function totoroHM(config, ctx) {
  const { response, api, event, fonts, styler } = ctx;

  if (!config.context || !Array.isArray(config.subcommands) || config.subcommands.length === 0) {
    log('ERROR', 'Invalid totoroHM config: context and non-empty subcommands array are required');
    return;
  }

  for (const subcommand of config.subcommands) {
    if (!subcommand.subcommand || !subcommand.text || typeof subcommand.execute !== 'function') {
      log('ERROR', `Invalid subcommand: ${JSON.stringify(subcommand)}`);
      return;
    }
  }

  const subcommandsWithNevermind = [
    ...config.subcommands,
    {
      subcommand: 'nevermind',
      text: 'Nevermind',
      async execute({ response }) {
        response.reply(fonts.sans('Goodbye friend'));
      },
    },
  ];

  async function sendMenu(threadID) {
    const menuItems = subcommandsWithNevermind.map((sub, index) => `${index + 1}. ${sub.text}`).join('\n');
    const message = fonts.sans(`${config.context}\n\n${menuItems}\n\nPlease reply to this message with a number to select an option.`);

    try {
      const messageInfo = await response.reply(message, threadID);
      if (!messageInfo?.messageID) {
        log('ERROR', 'Failed to send menu message: no messageID returned');
        return;
      }

      global.Totoro.replies.set(messageInfo.messageID, async ({ response, api, event, fonts, styler }) => {
        const userInput = event.body?.trim();
        const choice = parseInt(userInput, 10) - 1;

        if (isNaN(choice) || choice < 0 || choice >= subcommandsWithNevermind.length) {
          response.reply(fonts.sans(`Invalid choice. Please reply with a number between 1 and ${subcommandsWithNevermind.length}.`));
          return;
        }

        const selectedSubcommand = subcommandsWithNevermind[choice];
        try {
          const subcommandResponse = await selectedSubcommand.execute({ response, api, event, fonts, styler });
          log('INFO', `Executed subcommand "${selectedSubcommand.subcommand}" for message ID ${messageInfo.messageID}`);

          if (subcommandResponse?.messageID) {
            global.Totoro.replies.set(subcommandResponse.messageID, async ({ response, api, event }) => {
              const backInput = event.body?.trim().toLowerCase();
              if (backInput === 'back') {
                await sendMenu(event.threadID);
                global.Totoro.replies.delete(subcommandResponse.messageID);
              }
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          log('ERROR', `Error executing subcommand "${selectedSubcommand.subcommand}": ${errorMessage}`);
          response.reply(fonts.sans(`Error executing "${selectedSubcommand.subcommand}": ${errorMessage}`));
        }

        global.Totoro.replies.delete(messageInfo.messageID);
      });

      log('INFO', `Sent menu for command in thread ${threadID}, message ID ${messageInfo.messageID}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log('ERROR', `Failed to send menu message: ${errorMessage}`);
      response.reply(fonts.sans('An error occurred while displaying the menu. Please try again.'));
    }
  }

  await sendMenu(event.threadID);
}