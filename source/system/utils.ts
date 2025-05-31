import { log } from './views/custom';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MODULES_DIR = join(__dirname, '..', '..', 'totoro', 'modules');
const FILE_EXTENSION = '.ts';

const util = {
  async loadCommands() {
    const filePath = join(MODULES_DIR, 'commands');
    let loadfiles = [];
    
    try {
      loadfiles = (await readdir(filePath)).filter((file) => file.endsWith(FILE_EXTENSION));
    } catch (error) {
      log('ERROR', `Failed to read commands directory: ${error.message}`);
      return;
    }

    if (loadfiles.length === 0) {
      log('COMMAND', 'No commands available to deploy');
      return;
    }

    for (const file of loadfiles) {
      const commandPath = join(filePath, file);
      try {
        const command = await import(commandPath);
        const { meta, execute } = command;

        if (!meta) {
          log('WARNING', `Missing 'meta' in command file: ${file}`);
          continue;
        }

        if (typeof execute !== 'function') {
          log('WARNING', `Invalid 'execute' function in command file: ${file}`);
          continue;
        }

        if (!meta.name) {
          log('WARNING', `Missing 'name' in meta for command file: ${file}`);
          continue;
        }

        if (global.Totoro.commands.has(meta.name)) {
          log('WARNING', `Command name "${meta.name}" already registered, skipping: ${file}`);
          continue;
        }

        global.Totoro.commands.set(meta.name, command);
        log('COMMAND', `Deployed command "${meta.name}" successfully`);

        if (Array.isArray(meta.aliases)) {
          for (const alias of meta.aliases) {
            if (global.Totoro.commands.has(alias)) {
              log('WARNING', `Alias "${alias}" for command "${meta.name}" already exists`);
              continue;
            }
            global.Totoro.commands.set(alias, command);
            log('COMMAND', `Registered alias "${alias}" for command "${meta.name}"`);
          }
        }
      } catch (error) {
        log('ERROR', `Failed to load command ${file}: ${error.stack}`);
      }
    }
  },

  async loadEvents() {
    const filePath = join(MODULES_DIR, 'events');
    let loadfiles = [];

    try {
      loadfiles = (await readdir(filePath)).filter((file) => file.endsWith(FILE_EXTENSION));
    } catch (error) {
      log('ERROR', `Failed to read events directory: ${error.message}`);
      return;
    }

    if (loadfiles.length === 0) {
      log('EVENT', 'No events available to deploy');
      return;
    }

    for (const file of loadfiles) {
      const eventPath = join(filePath, file);
      try {
        const event = await import(eventPath);
        const { meta, onEvent } = event;

        if (!meta) {
          log('WARNING', `Missing 'meta' in event file: ${file}`);
          continue;
        }

        if (typeof onEvent !== 'function') {
          log('WARNING', `Invalid 'onEvent' function in event file: ${file}`);
          continue;
        }

        if (!meta.name) {
          log('WARNING', `Missing 'name' in meta for event file: ${file}`);
          continue;
        }

        if (global.Totoro.events.has(meta.name)) {
          log('WARNING', `Event name "${meta.name}" already registered, skipping: ${file}`);
          continue;
        }

        global.Totoro.events.set(meta.name, event);
        log('EVENT', `Deployed event "${meta.name}" successfully`);
      } catch (error) {
        log('ERROR', `Failed to load event ${file}: ${error.stack}`);
      }
    }
  },
};

export default util;
