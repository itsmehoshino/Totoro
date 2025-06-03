const meta = {
  name: 'test',
  aliases: ['t'],
};

async function execute({ response, event }) {
  const registerReply = async (prompt) => {
    try {
      const info = await response.setReply(prompt);
      info.replies(({ response }) => {
        response.reply("misskaba?").then(() => {
          registerReply("mismo?");
        });
      });
    } catch (err) {
      response.send(`Error: ${err.message}`, event.threadID);
    }
  };

  await registerReply("mismo?");
}

export default { meta, execute };
