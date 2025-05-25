import { log } from './custom';
import { discord } from '../plugins/discord-login';
import { login } from '../plugins/facebook-login';
import { telegram } from '../plugins/telegram-login';
import util from '../utils';


export async function starter(){
  console.clear();
  const top = ` 
         ▀█▀ █▀█ ▀█▀ █▀█ █▀█ █▀█
         ░█░ █▄█ ░█░ █▄█ █▀▄ █▄█
     DEVELOPED BY: FRANCIS LOYD RAVAL`;
  log(top, "");
  console.log();
  log("SYSTEM", "Hello Developer, Welcome to Hoshino!");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  log("SYSTEM", "Hoshino is now running...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await util.loadCommands();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await util.loadEvents();
  log("LOGIN", "Preceeding to login...");
  await login();
  await discord();
  await telegram();
  log("NOTE", "This is a beta version, please report any bugs to the developer.");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  log("SYSTEM", "Totoro is now online and ready to use!")
}