import { readFileSync } from 'fs-extra';
import { join, resolve } from 'path';
import { log } from './views/custom';

export async function util = {
  async loadCommands() {
    const commandsPath = resolve(__dirname, "../Totoro/modules/commands");
    log("SYSTEM", "Loading commands..")
  }
}