export default {
  meta: {
    name: 'ping',
    aliases: ['p'],
    category: 'utility',
    description: 'Checks if the bot is responsive',
    developer: 'Francis Loyd Raval',
    usage: '!ping [optional message]',
    role: 0,
    cooldown: 5,
  },
  async execute({ response, args, event }) {
    const message = args.length > 0 ? args.join(' ') : 'Pong!';
    const info = await response.send(`🏓 ${message}`);
    if (!info) {
      await response.send('Failed to send ping response.');
    }
  },
};