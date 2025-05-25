import { readFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { log } from "../views/custom";
import { listener } from "../listener";

try {
  require.resolve("facebook-chat-api");
} catch (e) {
  console.log("facebook-chat-api not found, installing...");
  execSync("npm install ruingl/facebook-chat-api", { stdio: "inherit" });
}

import fca from "facebook-chat-api";
fca.logging(false);
const loginPromisified = promisify(fca.login);

export async function login() {
  try {
    const credentials = JSON.parse(
      readFileSync(join(__dirname, "..", "..", "..", "cookies.json"), "utf-8")
    );
    const appState = credentials.appState;
    const api = await loginPromisified({ appState });
    const FCA = global.Totoro?.config?.fcaOptions;
    if (FCA) {
      api.setOptions(FCA);
    }
    api.listenMqtt((err, event) => {
      if (err) {
        log("ERROR", err);
        return;
      }
      listener({ api, event });
    });
    return api;
  } catch (error) {
    log("ERROR", `Login failed: ${error.message}`);
    throw error;
  }
}