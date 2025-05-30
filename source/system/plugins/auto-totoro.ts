import express from "express";
import crypto from "crypto";
import { listener } from "../system/listener";

const router = express.Router();
const allResolve = new Map<string, (value: any) => void>();

router.get("/postWReply", async (req: express.Request, res: express.Response) => {
  if (!req.query.senderID) {
    return res.json({
      result: {
        body: "❌ Please Enter your senderID on query. it allows any idenfitiers, please open your code.",
      },
      status: "success",
    });
  }

  const event = new Event(req.query as any);
  event.messageID = `id_${crypto.randomUUID()}`;

  const botResponse = await new Promise<any>(async (resolve, reject) => {
    allResolve.set(event.messageID!, resolve);
    const apiFake = new Proxy(
      {
        sendMessage(form: string | any, _threadID: string, third?: (response: any) => void) {
          const nform = normalizeMessageForm(form);
          const response = {
            result: {
              body: nform.body || "",
              messageID: `id_${crypto.randomUUID()}`,
              timestamp: Date.now().toString(),
            },
            status: "success",
          };
          resolve(response);
          if (typeof third === "function") {
            try {
              third(response);
            } catch (error) {
              console.error(error);
            }
          }
        },
      },
      {
        get(target: any, prop: string) {
          if (prop in target) {
            return target[prop];
          }
          return (...args: any[]) => {
            console.log(
              `Warn: 
    api.${prop}(${args
                .map((i) => `[ ${typeof i} ${i?.constructor?.name || ""} ]`)
                .join(",")}) has no effect!`
            );
          };
        },
      }
    );

    try {
      await listener({ api: apiFake, event });
    } catch (error) {
      console.error(error);
    }
  });

  res.json(botResponse);
});

const pref = "web:";

function formatIP(ip: string | undefined): string {
  try {
    ip = ip?.replaceAll("custom_", "");
    return `${pref}${ip}`;
  } catch (error) {
    console.error("Error in formatting IP:", error);
    return ip || "";
  }
}

class Event {
  body: string;
  senderID: string;
  threadID: string;
  messageID: string;
  type: string;
  timestamp: string;
  isGroup: boolean;
  participantIDs: string[];
  attachments: any[];
  mentions: Record<string, any>;
  isWeb: boolean;
  userID?: string;
  messageReply?: {
    senderID?: string;
    [key: string]: any;
  };

  constructor(info: any = {}) {
    const defaults = {
      body: "",
      senderID: "0",
      threadID: "0",
      messageID: "0",
      type: "message",
      timestamp: Date.now().toString(),
      isGroup: false,
      participantIDs: [],
      attachments: [],
      mentions: {},
      isWeb: true,
    };

    Object.assign(this, defaults, info);

    if (this.userID && this.isWeb) {
      this.userID = formatIP(this.senderID);
    }
    this.senderID = formatIP(this.senderID);
    this.threadID = formatIP(this.threadID);

    if (
      this.messageReply &&
      typeof this.messageReply === "object" &&
      this.messageReply.senderID
    ) {
      this.messageReply.senderID = formatIP(this.messageReply.senderID);
    }

    if (Array.isArray(this.participantIDs)) {
      this.participantIDs = this.participantIDs.map((id) => formatIP(id));
    }

    if (this.mentions && Object.keys(this.mentions).length > 0) {
      this.mentions = Object.fromEntries(
        Object.entries(this.mentions).map(([key, value]) => [formatIP(key), value])
      );
    }
  }
}

function normalizeMessageForm(form: string | any | undefined): any {
  let result: any = {};
  if (form) {
    if (typeof form === "object") {
      result = form;
    } else if (typeof form === "string") {
      result = {
        body: form,
      };
    }
    if (result.attachment && !Array.isArray(result.attachment)) {
      result.attachment = [result.attachment];
    }
    return result;
  }
  return {
    body: undefined,
  };
}

export default router;
