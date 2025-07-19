const meta = {
  name: "test4"
};

async function execute(ctx) {
  const home = new TotoroHM([
    {
      context: "Hi, what would you choose?",
    },
    {
      subcommand: "test 1",
      text: "use test1",
      execute: async ({ response, fonts }) => {
        await response.reply(fonts.sans("Hi from test1!"), ctx.event.threadID);
      },
    },
    {
      subcommand: "test 2",
      text: "use test2",
      execute: async ({ response, fonts }) => {
        await response.reply(fonts.sans("Hi from test2!"), ctx.event.threadID);
      },
    },
  ]);

  await home.runinContext(ctx);
}

export default { meta, execute };