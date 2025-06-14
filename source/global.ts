import { EventEmitter } from 'events';
import { Response } from './system/handler/chat/response';

declare global {
  var bot: EventEmitter;
  var Totoro: TotoroAI.GlobalTotoro;

  namespace TotoroAI {
    interface Config {
      prefix: string;
      subprefix?: string;
      botname?: string;
      maintenance?: boolean;
      developer: string[];
      admin?: string[];
      moderator?: string[];
      replyTimeout?: number;
      debug?: boolean;
      fcaOptions?: {
        listenEvents: boolean;
        forceLogin: boolean;
        selfListen: boolean;
        autoReconnect: boolean;
        autoMarkDelivery: boolean;
        userAgent?: string;
      };
      restartMqtt?: {
        listen: boolean;
        time?: number;
      };
    }

    interface CommandMeta {
      name: string;
      aliases?: string[];
      role?: number;
      cooldown?: number;
    }

    interface Command {
      meta: CommandMeta;
      execute: (context: CommandContext) => Promise<void>;
    }

    interface EventMeta {
      name: string;
    }

    interface EventHandler {
      meta: EventMeta;
      onEvent: (context: EventContext) => Promise<void>;
    }

    interface ReplyCallback {
      (params: { response: Response; api: FacebookApi; event: MessengerEvent }): Promise<void>;
    }

    interface MessengerEvent {
      type: string;
      threadID: string;
      senderID?: string;
      body?: string;
      messageID?: string;
      messageReply?: {
        messageID: string;
        senderID: string;
      };
      [key: string]: any;
    }

    interface FacebookApi {
      sendMessage: (message: string | object, threadID: string) => Promise<{ messageID: string }>;
      editMessage: (message: string, messageID: string) => Promise<any>;
      listenMqtt: (callback: (err: any, event: MessengerEvent) => void) => void;
    }

    interface EntryObj {
      api: FacebookApi;
      response: Response;
      event: MessengerEvent;
      args: string[];
    }

    interface CommandContext extends EntryObj {}

    interface EventContext extends EntryObj {
      args?: string[];
    }

    interface TotoroUtils {
      loadCommands: () => Promise<void>;
      loadEvents: () => Promise<void>;
    }

    interface GlobalTotoro {
      prefix: string;
      config: Config;
      commands: Map<string, Command>;
      events: Map<string, EventHandler>;
      replies: Map<string, ReplyCallback>;
      cooldowns: Map<string, number>;
      utils: TotoroUtils;
    }
  }
}

export {};
