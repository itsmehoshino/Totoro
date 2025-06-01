const meta = {
  name: 'test',
  aliases: ['t'],
};

async function execute({ response }) {
  response.send('Test command executed');
}

export default { meta, execute };
