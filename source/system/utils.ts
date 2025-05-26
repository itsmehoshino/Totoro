import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { log } from './views/custom';
import { inspect } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..', '..');

async function loadCommands() {
  let commandCount = 0;

  try {
    const commandsPath = resolve(__dirname, '..', 'totoro', 'modules', 'commands');
    log('DEBUG', `Loading commands from ${commandsPath}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log('SYSTEM', 'Deploying commands...');

    const files = readdirSync(commandsPath).filter(
      (file) => file.endsWith('.ts')
    );

    if (files.length === 0) {
      log('SYSTEM', 'No commands found to deploy.');
      return;
    }

    for (const file of files) {
      const path = join(commandsPath, file);
      let command;
      try {
        command = path;
        if ('default' in command) {
          command = command.default;
        }
      } catch (error) {
        log('ERROR', error instanceof Error ? error.message : inspect(error));
        continue;
      }

      const { meta, execute } = command ?? {};
      if (!meta || !execute) {
        log('WARNING', `Missing 'meta' or 'execute' in ${file}.`);
        continue;
      }

      if (!meta.name) {
        log('WARNING', `Missing 'name' in meta for ${file}.`);
        continue;
      }

      if (typeof execute !== 'function') {
        log('WARNING', `Invalid 'execute' function in ${file}.`);
        continue;
      }

      try {
        global.Totoro.commands.set(meta.name, command);
        commandCount++;
        log('COMMANDS', `Deployed ${meta.name} successfully`);

        if (Array.isArray(meta.aliases)) {
          for (const alias of meta.aliases) {
            global.Totoro.commands.set(alias, command);
            log('ALIASES', `Registered alias "${alias}" for ${meta.name}`);
          }
        }
      } catch (error) {
        log('ERROR', `Failed to deploy ${meta.name}: ${error instanceof Error ? error.message : inspect(error)}`);
      }
    }

    log('SYSTEM', `Loaded ${commandCount} command(s) successfully`);
  } catch (error) {
    log('ERROR', `Error loading commands: ${error instanceof Error ? error.message : inspect(error)}`);
  }
}

async function loadEvents() {
  let eventCount = 0;

  try {
    const eventsPath = resolve(__dirname, '..', 'totoro', 'modules', 'events');
    log('DEBUG', `Loading events from ${eventsPath}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log('SYSTEM', 'Deploying events...');

    const files = readdirSync(eventsPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js')
    );

    if (files.length === 0) {
      log('SYSTEM', 'No events found to deploy.');
      return;
    }

    for (const file of files) {
      const path = join(eventsPath, file);
      let event;
      try {
        event = require(path);
        if ('default' in event) {
          event = event.default;
        }
      } catch (error) {
        log('ERROR', error instanceof Error ? error.message : inspect(error));
        continue;
      }

      const { meta, process } = event ?? {};
      if (!meta || !process) {
        log('WARNING', `Missing 'meta' or 'process' in ${file}.`);
        continue;
      }

      if (!meta.name) {
        log('WARNING', `Missing 'name' in meta for ${file}.`);
        continue;
      }

      if (typeof process !== 'function') {
        log('WARNING', `Invalid 'process' function in ${file}.`);
        continue;
      }

      try {
        global.Totoro.events.set(meta.name, event);
        eventCount++;
        log('EVENTS', `Deployed ${meta.name} successfully`);
      } catch (error) {
        log('ERROR', `Failed to deploy ${meta.name}: ${error instanceof Error ? error.message : inspect(error)}`);
      }
    }

    log('SYSTEM', `Loaded ${eventCount} event(s) successfully`);
  } catch (error) {
    log('ERROR', `Error loading events: ${error instanceof Error ? error.message : inspect(error)}`);
  }
}

export default { loadCommands, loadEvents };