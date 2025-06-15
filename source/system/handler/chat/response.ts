import { promisify } from 'util';
import { log } from '../../views/custom';
import { styler } from '../../../../totoro/resources/styler/design/styler';

export class Response {
  private api;
  private event;
  private sendMessage;
  private editMessage;
  private commandName;

  constructor(api, event, commandName) {
    if (!api || !event || !event.threadID || typeof api.sendMessage !== 'function' || typeof api.editMessage !== 'function') {
      log('ERROR', 'Invalid Response initialization');
      throw new Error('Invalid Response initialization');
    }
    this.api = api;
    this.event = event;
    this.commandName = commandName;
    this.sendMessage = promisify(api.sendMessage.bind(api));
    this.editMessage = promisify(api.editMessage.bind(api));
  }

  async send(message, goal) {
    if (!message || (!goal && !this.event.threadID)) {
      log('ERROR', 'Invalid message or threadID');
      throw new Error('Invalid message or threadID');
    }
    try {
      const threadID = goal || this.event.threadID;
      const result = await this.sendMessage(message, threadID);
      log('INFO', `Sent message to thread ${threadID}`);
      return { messageID: result?.messageID };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log('ERROR', `Failed to send message: ${errorMessage}`);
      throw err;
    }
  }

  async setReply(message, goal) {
    if (!message || (!goal && !this.event.threadID)) {
      log('ERROR', 'Invalid message or threadID');
      throw new Error('Invalid message or threadID');
    }
    try {
      const threadID = goal || this.event.threadID;
      const result = await this.sendMessage(message, threadID);
      log('INFO', `Set reply message to thread ${threadID}`);
      const messageID = result?.messageID;
      return {
        messageID,
        replies: (callback) => {
          if (typeof callback !== 'function') {
            log('ERROR', 'Invalid reply callback');
            throw new Error('Invalid reply callback');
          }
          if (messageID) {
            global.Totoro.replies.set(messageID, callback);
            log('INFO', `Registered reply handler for message ID ${messageID}`);
            setTimeout(() => global.Totoro.replies.delete(messageID), 1000 * 60 * 5);
          } else {
            log('WARNING', 'No messageID returned; reply handler not registered');
          }
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log('ERROR', `Failed to set reply message: ${errorMessage}`);
      throw err;
    }
  }

  async reply(message, goal) {
    if (!message || (!goal && !this.event.threadID)) {
      log('ERROR', 'Invalid reply message or threadID');
      throw new Error('Invalid reply message or threadID');
    }
    try {
      const threadID = goal || this.event.threadID;
      let formattedMessage = message;
      if (this.commandName && global.Totoro?.commands?.has(this.commandName)) {
        const command = global.Totoro.commands.get(this.commandName);
        if (command.styler) {
          formattedMessage = styler.format(command.styler, message);
        }
      }
      const result = await new Promise((resolve, reject) => {
        this.api.sendMessage(
          formattedMessage,
          threadID,
          (err, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(info);
            }
          },
          this.event.messageID
        );
      });
      log('INFO', `Sent reply to thread ${threadID}`);
      return { messageID: result?.messageID };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log('ERROR', `Failed to send reply: ${errorMessage}`);
      throw err;
    }
  }

  async edit(msg, mid) {
    if (!msg || !mid) {
      log('ERROR', 'Invalid message or messageID');
      throw new Error('Invalid message or messageID');
    }
    try {
      const result = await this.editMessage(msg, mid);
      log('INFO', `Edited message ${mid}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log('ERROR', `Failed to edit message: ${errorMessage}`);
      throw err;
    }
  }
}