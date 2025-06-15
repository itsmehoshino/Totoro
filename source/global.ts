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
      restartMqtt?: {
        listen: boolean;
        time?: number;
      };
    }

    interface CommandMeta {
      name: string;
      role?: number;
      aliases?: string[];
      cooldown?: number;
      developer?: string;
      description?: string;
      usage?: string;
      style?: {
        type: string;
        title: string;
        footer: string;
      };
      font?: {
        title?: FontTypes | FontTypes[];
        content?: FontTypes | FontTypes[];
        footer?: FontTypes | FontTypes[];
      };
    }

    interface Command {
      meta: CommandMeta;
      execute: (context: CommandContext) => Promise<void>;
    }

    interface EventMeta {
      name: string;
      description?: string;
      developer?: string;
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

    interface EntryObj {
      api: any;
      styler: Styler;
      response: Response;
      event: MessengerEvent;
      args: string[];
      fonts: font;
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
