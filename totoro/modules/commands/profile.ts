function generateGameID() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  return `${randomLetter}${randomNumber}`;
}

const meta = {
  name: 'profile',
  role: 0,
  cooldown: 5,
  aliases: ['p', 'pf'],
};

async function execute(ctx) {
  try {
    await ctx.totoroHM(
      {
        context: 'Manage your game profile by replying with a number:\nOptions: Register to create a profile, Info to check your stats, Change username for 5000 coins.',
        subcommands: [
          {
            subcommand: 'register',
            text: 'Register with a username',
            async execute({ response, database, event, args }) {
              try {
                const userID = event.senderID;
                const profileKey = `user:${userID}:profile`;
                const profile = await database.get(profileKey);
                if (profile && profile.username) {
                  response.reply('You are already registered! Use option 2 to check your stats.\nReply "back" to return to the menu.');
                  return;
                }
                if (args.length < 2 || !args[1]) {
                  response.reply('Please provide a username (e.g., !profile register john_doe).\nReply "back" to return to the menu.');
                  return;
                }
                const username = args[1].trim();
                if (username.length < 1 || username.length > 20) {
                  response.reply('Username must be 1-20 characters.\nReply "back" to return to the menu.');
                  return;
                }
                const usernameExists = await database.containsKey(`username:${username}`);
                if (usernameExists) {
                  response.reply('Username already taken. Choose another.\nReply "back" to return to the menu.');
                  return;
                }
                const gameid = generateGameID();
                await database.bulkPut({
                  [profileKey]: {
                    username,
                    gameid,
                    balance: 0,
                    diamonds: 0,
                    isAdmin: false,
                    isModerator: false,
                    trophies: [],
                  },
                  [`username:${username}`]: userID,
                });
                response.reply(`Successfully registered as ${username}! Game ID: ${gameid}\nReply "back" to return to the menu.`);
              } catch (error) {
                response.reply('Failed to register profile. Try again later.' + error.stack);
              }
            },
          },
          {
            subcommand: 'info',
            text: 'Check your balance, diamonds, gameid, and trophies',
            async execute({ response, database, event }) {
              try {
                const userID = event.senderID;
                const profileKey = `user:${userID}:profile`;
                const profile = await database.get(profileKey);
                if (!profile || !profile.username) {
                  response.reply('You need to register first! Use option 1 to register.\nReply "back" to return to the menu.');
                  return;
                }
                const { balance = 0, diamonds = 0, username, gameid = 'N/A', trophies = [] } = profile;
                const texts = [
                  `Name: ${username}`,
                  `Game ID: ${gameid}`,
                  `Balance: ${Number(balance).toLocaleString()}`,
                  `Diamonds: ${Number(diamonds).toLocaleString()}`,
                  `Trophies: ${trophies.length}`,
                ];
                response.reply(texts.join('\n') + '\nReply "back" to return to the menu.');
              } catch (error) {
                response.reply('Failed to retrieve profile. Try again later.' + error.stack);
              }
            },
          },
          {
            subcommand: 'changeusername',
            text: 'Change your username for 5000 coins',
            async execute({ response, database, event, args }) {
              try {
                const userID = event.senderID;
                const profileKey = `user:${userID}:profile`;
                const profile = await database.get(profileKey);
                if (!profile || !profile.username) {
                  response.reply('You need to register first! Use option 1 to register.\nReply "back" to return to the menu.');
                  return;
                }
                if (args.length < 2 || !args[1]) {
                  response.reply('Please provide a new username (e.g., !profile changeusername new_name).\nReply "back" to return to the menu.');
                  return;
                }
                const newUsername = args[1].trim();
                if (newUsername.length < 1 || newUsername.length > 20) {
                  response.reply('Username must be 1-20 characters.\nReply "back" to return to the menu.');
                  return;
                }
                if (profile.balance < 5000) {
                  response.reply(`You need ${Number(5000).toLocaleString()} coins to change your username!\nReply "back" to return to the menu.`);
                  return;
                }
                const usernameExists = await database.containsKey(`username:${newUsername}`);
                if (usernameExists) {
                  response.reply('Username already taken. Choose another.\nReply "back" to return to the menu.');
                  return;
                }
                await database.bulkPut({
                  [profileKey]: {
                    username: newUsername,
                    gameid: profile.gameid || generateGameID(),
                    balance: profile.balance - 5000,
                    diamonds: profile.diamonds || 0,
                    isAdmin: false,
                    isModerator: false,
                    trophies: profile.trophies || [],
                  },
                  [`username:${newUsername}`]: userID,
                });
                if (profile.username) {
                  await database.remove(`username:${profile.username}`);
                }
                response.reply(`Username changed to ${newUsername}! ${Number(5000).toLocaleString()} coins deducted.\nReply "back" to return to the menu.`);
              } catch (error) {
                response.reply('Failed to change username. Try again later.');
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
