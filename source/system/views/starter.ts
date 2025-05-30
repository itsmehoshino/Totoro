import { log } from './custom';
import { login } from '../plugins/facebook-login';
import util from '../utils';
import express from 'express';

const app = express();

export async function starter(){
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
  app.listen(3000, () => {
    log("SYSTEM", "Totoro is now online and ready to use!");
  })
}