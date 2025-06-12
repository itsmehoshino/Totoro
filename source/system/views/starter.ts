import { log } from './custom';
import { login } from '../plugins/facebook-login';
import util from '../utils';
import { server } from '../plugins/server/server';

export async function starter() {
  console.clear();
  const top = ` 
         ▀█▀ █▀█ ▀█▀ █▀█ █▀█ █▀█
         ░█░ █▄█ ░█░ █▄█ █▀▄ █▄█
     DEVELOPED BY: FRANCIS LOYD RAVAL`;
  log(top, "");
  console.log();
  log("SYSTEM", "Hello Developer, Welcome to Totoro!");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  log("SYSTEM", "Totoro is now running...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await util.loadCommands();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await util.loadEvents();
  log("LOGIN", "Preceeding to login...");
  await login();
  log("NOTE", "This is a beta version, please report any bugs to the developer.");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  log("SERVER", "Starting server...");
  await server();
  if (global.Totoro?.config?.restartMqtt?.listen) {
    const restartTime = (global.Totoro.config.restartMqtt.time || 30) * 60 * 1000;
    log("SYSTEM", `Auto-restart enabled. Restarting every ${global.Totoro.config.restartMqtt.time || 30} minutes.`);
    setInterval(async () => {
      log("SYSTEM", "Initiating auto-restart...");
      try {
        await util.loadCommands();
        await util.loadEvents();
        log("SYSTEM", "Commands and events reloaded.");
        log("LOGIN", "Re-initiating login...");
        await login();
        log("SERVER", "Restarting server...");
        await server();
        log("SYSTEM", "Auto-restart completed successfully.");
      } catch (error) {
        log("ERROR", `Auto-restart failed: ${error.message}`);
      }
    }, restartTime);
  } else {
    log("SYSTEM", "Auto-restart is disabled.");
  }
}
