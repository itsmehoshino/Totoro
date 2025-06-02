const meta = {
  name: 'test',
  aliases: ['t'],
};

async function execute({ response }) {
  const info = await response.setReply("mismo?");
   info.replies(({ response }) => {
    response.reply("misskaba?");
  });
}

export default { meta, execute };
