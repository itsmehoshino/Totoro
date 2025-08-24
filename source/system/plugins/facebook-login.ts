import { readFileSync, existsSync } from "fs"; 
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { log } from "../views/custom";
import { listener } from "../listener";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  require.resolve("chatbox-fca-remake");
} catch (e) {
  log("INFO", "chatbox-fca-remake not found, installing...");
  try {
    execSync("npm install chatbox-fca-remake", { stdio: "inherit" });
    log("INFO", "chatbox-fca-remake installed successfully");
  } catch (installError) {
    log("ERROR", `Failed to install chatbox-fca-remake: ${installError.message}`);
    throw installError;
  }
}

const loginPromisified = promisify(require("chatbox-fca-remake"));

export async function login() {
  try {
    log("FACEBOOK", "Logging in...");
    const appStatePath = join(__dirname, "..", "..", "..", "appstate.json");
    if (!existsSync(appStatePath)) {
      throw new Error("appstate.json file not found");
    }
    const appState = JSON.parse(readFileSync(appStatePath, "utf-8"));
    if (Array.isArray(appState) && appState.length === 0) {
      throw new Error("No Appstate provided");
    }
    const config = global.Totoro?.config?.fcaOptions || {
      listenEvents: true,
      forceLogin: false,
      selfListen: false,
      autoReconnect: true,
      autoMarkDelivery: true,
    };
    const api = await loginPromisified({ appState }, config);
    api.setOptions(config);
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
    throw error;
  }
}