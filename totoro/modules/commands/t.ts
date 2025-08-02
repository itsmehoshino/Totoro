const meta = {
  name: 'test4',
};

async function execute(ctx) {
  await ctx.totoroHM(
    {
      context: 'Hi what would you choose',
      subcommands: [
        {
          subcommand: 'test 1',
          text: 'use test1',
          async execute({ response, fonts }) {
            response.reply(fonts.sans('hi'));
          },
        },
        {
          subcommand: 'test 2',
          text: 'use test2',
          async execute({ response, fonts }) {
            response.reply(fonts.sans('hi'));
          },
        },
      ],
    },
    ctx
  );
}

export default { meta, execute };