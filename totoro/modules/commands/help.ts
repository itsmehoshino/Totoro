const meta = {
  name: "help",
};

const styler = {
  title: { font: 'doubleStruck', text: 'HELP', icon: '🌟' },
  context: { font: 'bold' },
  design: 'lines6',
};

async function execute({ response }) {
  // Get all command names from global.Totoro.commands
  const commands = global.Totoro?.commands;
  if (!commands || commands.size === 0) {
    await response.reply("No commands are currently available.");
    return;
  }

  const commandNames = Array.from(commands.keys()).sort();
  const message = commandNames
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n");
  await response.reply(message);
}

export default { meta, execute, styler };
