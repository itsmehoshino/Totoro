import { log } from "./views/custom";
import * as fs from "fs";
import * as path from "path";

const util = {
  async loadCommands(): Promise<void> {
    const filePath = path.resolve(process.cwd(), "../../totoro/modules/commands");
    const loadfiles = fs.readdirSync(filePath).filter((file) => file.endsWith(".ts"));

    if (loadfiles.length === 0) {
      log("COMMAND", "No commands available to deploy");
      return;
    }

    for (const file of loadfiles) {
      const commandPath = path.join(filePath, file);
      const command = require(commandPath);
      const { meta, execute } = command ?? {};

      if (!meta) {
        log("WARNING", `Missing 'meta' for the command: ${file}`);
        continue;
      }

      if (typeof execute !== "function") {
        log("WARNING", `Invalid 'execute' function for the command: ${file}`);
        continue;
      }

      try {
        if (meta.name) {
          log("COMMAND", `Deployed ${meta.name} successfully`);
          global.Totoro.commands.set(meta.name, command);

          if (Array.isArray(meta.aliases)) {
            for (const alias of meta.aliases) {
              global.Totoro.commands.set(alias, command);
              log("ALIASES", `Alias "${alias}" registered for command "${meta.name}"`);
            }
          }
        } else {
          log("WARNING", `Meta missing 'name' for the command: ${file}`);
        }
      } catch (error) {
        log("ERROR", `Failed to deploy ${meta.name}: ${(error as Error).stack}`);
      }
    }
  },

  async loadEvents(): Promise<void> {
    const filePath = path.resolve(process.cwd(), "../../totoro/modules/events");
    const loadfiles = fs.readdirSync(filePath).filter((file) => file.endsWith(".ts"));

    if (loadfiles.length === 0) {
      log("EVENT", "No events available to deploy");
      return;
    }

    for (const file of loadfiles) {
      const eventPath = path.join(filePath, file);
      const event = require(eventPath);
      const { meta, onEvent } = event ?? {};

      if (!meta) {
        log("WARNING", `Missing 'meta' for the event: ${file}`);
        continue;
      }

      if (typeof onEvent !== "function") {
        log("WARNING", `Missing 'onEvent' function for the event: ${file}`);
        continue;
      }

      try {
        if (meta.name) {
          log("COMMAND", `Deployed ${meta.name} successfully.`);
          global.Totoro.events.set(meta.name, event);
        } else {
          log("ERROR", `Meta missing 'name' for the event: ${file}`);
        }
      } catch (error) {
        log("ERROR", `Failed to deploy ${file}: ${(error as Error).stack}`);
      }
    }
  }
};

export default util;
