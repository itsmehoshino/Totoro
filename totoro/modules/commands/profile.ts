const meta = {
  name: 'profile',
  role: 0,
  cooldown: 5,
  aliases: ['p'],
};

async function execute(ctx) {
  try {
    await ctx.totoroHM(
      {
        context: 'Manage your game profile by replying with a number:\nOptions: Register to create a profile, Balance to check your in-game money.',
        subcommands: [
          {
            subcommand: 'register',
            text: 'Register your profile with a name and username',
            async execute({ response, database, event, args }) {
              try {
                const userID = event.senderID;
                const profileKey = `user:${userID}:profile`;
                const existingProfile = await database.get(profileKey);

                if (existingProfile) {
                  response.reply('You are already registered! Use option 2 to check your balance.\nReply "back" to return to the menu.');
                  return;
                }

                const [name, username] = args.slice(1).join(' ').split('|').map(s => s.trim());
                if (!name || !username) {
                  response.reply('Please provide a name and username (e.g., !profile register John | john_doe).\nReply "back" to return to the menu.');
                  return;
                }

                if (username.length < 3 || username.length > 20) {
                  response.reply('Username must be 3-20 characters.\nReply "back" to return to the menu.');
                  return;
                }

                const usernameExists = await database.containsKey(`username:${username}`);
                if (usernameExists) {
                  response.reply('Username already taken. Choose another.\nReply "back" to return to the menu.');
                  return;
                }

                const profile = { name, username, balance: 0 };
                await database.bulkPut({
                  [profileKey]: profile,
                  [`username:${username}`]: userID,
                });

                response.reply(`Profile registered! Name: ${name}, Username: ${username}, Balance: 0 coins.\nReply "back" to return to the menu.`);
              } catch (error) {
                response.reply('Failed to register profile. Try again later.');
              }
            },
          },
          {
            subcommand: 'balance',
            text: 'Check your in-game balance',
            async execute({ response, database, event }) {
              try {
                const userID = event.senderID;
                const profileKey = `user:${userID}:profile`;
                const profile = await database.get(profileKey);

                if (!profile) {
                  response.reply('You are not registered. Use option 1 to register.\nReply "back" to return to the menu.');
                  return;
                }

                response.reply(`Your profile: Name: ${profile.name}, Username: ${profile.username}, Balance: ${profile.balance} coins.\nReply "back" to return to the menu.`);
              } catch (error) {
                response.reply('Failed to retrieve balance. Try again later.');
              }
            },
          },
        ],
      },
      ctx
    );
  } catch (error) {
    ctx.response.reply('An error occurred. Try again later.');
  }
}

export default { meta, execute };
