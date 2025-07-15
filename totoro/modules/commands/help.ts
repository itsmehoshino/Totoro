const meta = {
  name: "help",
};

const styler = {
  title: { font: "doubleStruck", text: "HELP", icon: "🌟" },
  context: { font: "bold" },
  design: "lines6",
};

async function execute({ response }) {
  const commands = global.Totoro?.commands;
  if (!commands || commands.size === 0) {
    await response.reply("No commands are currently available.");
    return;
  }

  const primaryCommands = Array.from(commands.entries())
    .filter(([key, cmd]) => key === cmd.meta.name.toLowerCase())
    .map(([_, cmd]) => cmd.meta.name)
    .sort();

  const message = primaryCommands
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n");
  await response.reply(message);
}

export default { meta, execute, styler };