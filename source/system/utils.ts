import { readdir } from 'fs/promises';
import { join } from 'path';
import { log } from './views/custom';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const util = {
  async loadCommands() {
    let commandCount = 0;
    try {
      const commandsDir = join(__dirname, '..', '..', 'totoro', 'modules', 'commands');
      const files = await readdir(commandsDir);
      for (const file of files.filter(f => f.endsWith('.ts') || f.endsWith('.js'))) {
        try {
          const command = (await import(join(commandsDir, file))).default;
          if (!command) {
            log('FAILED', `No default export in command file: ${file}, please open your code`);
            continue;
          }
          if (!command.meta) {
            log('FAILED', `Missing 'meta' property in command file: ${file}, please open your code`);
            continue;
          }
          if (!command.meta.name) {
            log('FAILED', `Missing 'meta.name' property in command file: ${file}, please open your code`);
            continue;
          }
          if (!command.execute || typeof command.execute !== 'function') {
            log('FAILED', `Missing or invalid 'execute' property in command file: ${file}, please open your code`);
            continue;
          }
          global.Totoro.commands.set(command.meta.name, command);
          for (const alias of command.meta.aliases || []) {
            global.Totoro.commands.set(alias, command);
          }
          commandCount++;
          log('COMMANDS', `Loaded command: ${command.meta.name} (Category: ${command.meta.category})`);
        } catch (error) {
          log('FAILED', `Error loading command file ${file}: ${error.message}`);
        }
      }
      if (commandCount === 0) {
        log('SYSTEM', 'No commands loaded');
      } else {
        log('SYSTEM', `Successfully loaded ${commandCount} commands`);
      }
    } catch (error) {
      log('ERROR', `Failed to load commands: ${error.message}`);
      throw error;
    }
  },

  async loadEvents() {
    let eventCount = 0;
    try {
      const eventsDir = join(__dirname, '..', '..', 'totoro', 'modules', 'events');
      const files = await readdir(eventsDir);
      for (const file of files.filter(f => f.endsWith('.ts') || f.endsWith('.js'))) {
        try {
          const event = (await import(join(eventsDir, file))).default;
          if (!event || !event.name || typeof event.execute !== 'function') {
            log('FAILED', `Invalid event file: ${file}, please open your code`);
            continue;
          }
          global.Totoro.events.set(event.name, event);
          eventCount++;
          log('EVENTS', `Loaded event: ${event.name}`);
        } catch (error) {
          log('FAILED', `Error loading event file ${file}: ${error.message}`);
        }
      }
      if (eventCount === 0) {
        log('SYSTEM', 'No events loaded');
      } else {
        log('SYSTEM', `Successfully loaded ${global.Totoro.events.size} events`);
      }
    } catch (error) {
      log('ERROR', `Failed to load events: ${error.message}`);
      throw error;
    }
  },
};

export default util;