const meta = {
  name: 'test',
  aliases: ['t'],
};

async function execute({ response }) {
  response.reply('Test command executed');
}

export default { meta, execute };
