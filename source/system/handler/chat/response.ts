import { promisify } from 'util';

export class Response {
  constructor(api, event) {
    this.api = api;
    this.event = event;
  }

  send(message, goal) {
    return new Promise((res, rej) => {
      this.api.sendMessage(message, goal || this.event.threadID, (err) => {
        if (err) rej(err);
        else res(true);
      });
    });
  }

  reply(message, goal) {
    return new Promise((res, rej) => {
      this.api.sendMessage(message, this.event.messageID, goal || this.event.threadID, (err) => {
        if (err) rej(err);
        else res(true);
      });
    });
  }

  edit(msg, mid) {
    return new Promise((res, rej) => {
      this.api.editMessage(msg, mid, (err) => {
        if (err) rej(err);
        else res(true);
      });
    });
  }
}
