import { log } from '../../../../source/system/views/custom';
import { Response } from '../../../../source/system/handler/chat/response';

export class TotoroHM {
  private subcommands;

  constructor(subcommands) {
    this.subcommands = subcommands;
  }

  async runinContext(ctx) {
    const { response, event, fonts, styler, TotoroHM } = ctx;
    const context = this.subcommands.find((sc) => sc.context)?.context || 'Please choose an option:';
    const subcommandList = this.subcommands
      .map((sc, index) => sc.text ? `${index + 1}. ${sc.text}` : null)
      .filter(Boolean)
      .join('\n');

    if (!subcommandList) {
      log('ERROR', 'No valid subcommands provided in TotoroHM');
      await response.send(fonts.sans('No subcommands available.'), event.threadID);
      return;
    }

    const menuMessage = fonts.sans(
      `${context}\n\n${subcommandList}\n${this.subcommands.length + 1}. Back\n${this.subcommands.length + 2}. Nevermind\n\nReply with a number to select an option.`
    );

    const sendMenu = async (targetResponse: Response, targetEvent: any) => {
      const { messageID, replies } = await targetResponse.setReply(menuMessage, targetEvent.threadID);
      replies(async ({ response: replyResponse, event: replyEvent, fonts }) => {
        const userInput = replyEvent.body.trim();
        const choice = parseInt(userInput, 10) - 1;

        if (isNaN(choice) || choice < 0 || choice > this.subcommands.length + 1) {
          await replyResponse.send(
            fonts.sans(`Invalid choice. Please reply with a number between 1 and ${this.subcommands.length + 2}.`),
            replyEvent.threadID
          );
          return;
        }

        if (choice === this.subcommands.length) {
          await this.runinContext({ response: replyResponse, event: replyEvent, fonts });
          return;
        }

        if (choice === this.subcommands.length + 1) {
          await replyResponse.send(fonts.sans('Goodbye'), replyEvent.threadID);
          return;
        }

        if (!this.subcommands[choice].execute) {
          await replyResponse.send(
            fonts.sans(`Invalid choice. Please reply with a number between 1 and ${this.subcommands.length + 2}.`),
            replyEvent.threadID
          );
          return;
        }

        try {
          await this.subcommands[choice].execute({ response: replyResponse, fonts });
          log('INFO', `Executed subcommand "${this.subcommands[choice].subcommand || choice}" for message ID ${messageID}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          log('ERROR', `Error executing subcommand "${this.subcommands[choice].subcommand || choice}": ${errorMessage}`);
          await replyResponse.send(
            fonts.sans(`Error executing option ${choice + 1}: ${errorMessage}`),
            replyEvent.threadID
          );
        }
      });
    };

    await sendMenu(response, event);
  }
}