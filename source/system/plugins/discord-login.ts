import { Client, GatewayIntentBits } from 'discord.js';

export async function discord(){
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
  client.once('ready', () => {
    log("DISCORD", `Logged in as ${client.user.tag}`);
  })
}