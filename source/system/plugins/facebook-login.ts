import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { log } from "../views/custom";
import { listener } from "../listener";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fca from "facebook-chat-api";
fca.logging(false);
const loginPromisified = promisify(fca.login);

export async function login() {
  try {
    log("FACEBOOK", "Logging in...");
    const cookiesPath = join(__dirname, "..", "..", "..", "cookies.json");
    if (!existsSync(cookiesPath)) {
      throw new Error("cookies.json file not found");
    }
    const appState = JSON.parse(readFileSync(cookiesPath, "utf-8"));
    if (Array.isArray(appState) && appState.length === 0) {
      throw new Error("No Appstate provided");
    }
    const config = global.Totoro?.config || {
      fcaOptions: {
        listenEvents: true,
        forceLogin: false,
        selfListen: false,
        autoReconnect: true,
        autoMarkDelivery: true,
      },
    };
    const api = await loginPromisified({ appState }, {
      listenEvents: config.fcaOptions.listenEvents,
      forceLogin: config.fcaOptions.forceLogin,
      selfListen: config.fcaOptions.selfListen,
      userAgent: config.fcaOptions.userAgent,
      autoReconnect: config.fcaOptions.autoReconnect,
      autoMarkDelivery: config.fcaOptions.autoMarkDelivery,
    });
    api.listenMqtt((err, event) => {
      if (err) {
        const errorMessage = err.error || err.message || String(err);
        log("ERROR", `MQTT error: ${errorMessage}`);
        return;
      }
      listener({ api, event });
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return api;
  } catch (error) {
    const errorMessage = error.error || error.message || String(error);
    log("FACEBOOK", `Login failed: ${errorMessage}`);
  }
}
