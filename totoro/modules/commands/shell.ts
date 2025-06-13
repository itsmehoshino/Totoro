import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const meta = {
  name: 'shell',
  aliases: ['sh', 'cmd'],
  role: 1
};

async function execute({ response, args }) {
  if (!args || args.length === 0) {
    return response.reply('Error: No command provided. Usage: `shell <command>`');
  }

  const command = args.join(' ');

  const disallowedCommands = ['rm -rf', 'sudo', 'mkfs', 'dd', ':(){ :|:& };:', 'reboot', 'shutdown'];
  if (disallowedCommands.some(disallowed => command.toLowerCase().includes(disallowed))) {
    return response.reply('Error: This command is not allowed for safety reasons.');
  }

  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 10000 });

    let reply = '';
    if (stdout) reply += `**Output:**\n\`\`\`\n${stdout.trim()}\n\`\`\`\n`;
    if (stderr) reply += `**Errors:**\n\`\`\`\n${stderr.trim()}\n\`\`\`\n`;

    if (reply.length > 1900) {
      reply = reply.slice(0, 1900) + '\n**...Output truncated...**';
    }

    response.reply(reply || 'Command executed successfully (no output).');
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    response.reply(`Error executing command:\n\`\`\`\n${errorMessage.trim()}\n\`\`\``);
  }
}

export default { meta, execute };
