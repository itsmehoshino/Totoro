import { promisify } from 'util';

export function createResponse(api, event) {
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
    reply: (message: string, goal?: string): Promise<boolean> => {
      return new Promise((res, rej) => {
        api.sendMessage(
          { body: message, replyToMessage: event.messageID },
          goal || event.threadID,
          (err: any) => {
            if (err) rej(err);
            else res(true);
          }
        );
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

  return response;
}
