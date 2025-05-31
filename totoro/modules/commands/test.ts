export default meta = {
    name: 'test',
    aliases: ['t'],
  },
  execute: async ({ response, event }) => {
    await response.send('Test command executed!', event.threadID);
  },

