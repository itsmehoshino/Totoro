const meta: TotoroAI.CommandMeta = {
  name: "test",
};

const styler = {
  title: { font: 'bold', text: 'Example Command' },
  context: { font: 'sans' },
  footer: { font: 'bold', text: 'Totoro Bot v1.0' },
  design: 'lines1',
};

async function execute({ response }) {
  await response.reply("hi");
}

export default { meta, execute, styler };