import { handleEvent } from './handler/handleEvent';
import { handleCommand } from './handler/handleCommand';

export async function listener({ api, event }: { api: any; event: any }): Promise<void> {
  if (!event.body) return;

  const usedPrefix = global.Totoro.prefix;

  if (!event.body.startsWith(usedPrefix)) return;

  const [commandName, ...args] = event.body.slice(usedPrefix.length).split(' ');
  const command = global.Totoro.commands.get(commandName.toLowerCase());

  const chatBox = {
    react: (emoji: string) => api.setMessageReaction(emoji, event.messageID, () => {}),
    send: (message: string, id?: string) => api.sendMessage(message, id || event.threadID, event.messageID),
    addParticipant: (uid: string) => api.addUserToGroup(uid, event.threadID),
    removeParticipant: (uid: string) => api.removeUserFromGroup(uid, event.threadID),
    threadInfo: async () => await api.getThreadInfo(event.threadID),
  };

  const response = {
    ...chatBox,
    send: (message: string, goal?: string): Promise<boolean> => {
      return new Promise((res, rej) => {
        api.sendMessage(message, goal || event.threadID, (err: any) => {
          if (err) rej(err);
          else res(true);
        });
      });
    },
    edit: (msg: string, mid: string): Promise<boolean> => {
      return new Promise((res, rej) => {
        api.editMessage(msg, mid, (err: any) => {
          if (err) rej(err);
          else res(true);
        });
      });
    },
    fbPost: async ({ body, attachment }: { body?: string; attachment?: any[] }): Promise<any> => {
      return new Promise((resolve, reject) => {
        api.createPost({ body: body || '', attachment: attachment || [] }, (error: any, data: any) => {
          if (error) {
            console.error('Facebook Post Error:', error);
            reject({ success: false, message: 'Failed to create post', error });
            return;
          }

          if (!data?.data || data.errors) {
            console.error('Unexpected API Response:', data);
            reject({ success: false, message: 'API returned an error', data });
            return;
          }

          console.log('Post Successful:', data);
          resolve({ success: true, data });
        });
      });
    },
  };

  const entryObj = {
    api,
    response,
    event,
    args,
  };

  if (command) {
    const { config } = command.meta;
    const senderID = event.senderID;

    const admins = global.Totoro.config.admins || [];
    const moderators = global.Totoro.config.moderators || [];

    const isAdmin = admins.includes(senderID);
    const isModerator = moderators.includes(senderID);

    if (config?.botAdmin && !isAdmin) {
      await chat.send('Access denied, you don\'t have rights to use this admin-only command.');
      return;
    }

    if (config?.botModerator && !isModerator && !isAdmin) {
      await chat.send('Access denied, you don\'t have rights to use this moderator-only command.');
      return;
    }

    try {
      await command.execute(entryObj);
    } catch (err) {
      console.error(`Error executing command "${commandName}":`, err);
    }
    return;
  }

  console.log(`Unknown command: ${commandName}`);

  switch (event.type) {
    case 'message':
      handleCommand({ ...entryObj });
      break;
    case 'event':
      handleEvent({ ...entryObj });
      break;
    case 'message_reply':
      handleCommand({ ...entryObj });
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
