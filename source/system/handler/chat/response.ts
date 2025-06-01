import { promisify } from 'util';

export class Response {
  constructor(api, event) {
    this.api = api;
    this.event = event;
    this.sendMessage = promisify(api.sendMessage.bind(api));
    this.editMessage = promisify(api.editMessage.bind(api));
  }

  async send(message, goal) {
    try {
      await this.sendMessage(message, goal || this.event.threadID);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async edit(msg, mid) {
    try {
      await this.editMessage(msg, mid);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
