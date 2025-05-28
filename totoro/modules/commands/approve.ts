export default {
  meta: {
    name: 'approve',
    aliases: [],
    category: 'admin',
    description: 'Approves bot activation in a group',
    developer: 'Francis Loyd Raval',
    usage: '!approve <threadID>',
    role: 1, 
    cooldown: 0,
  },
  execute: async ({ response, args, event, threadDB, api }) => {
    if (args.length < 1) {
      await response.send('Usage: !approve <threadID>');
      return;
    }
    const threadID = args[0];
    const pendingInfo = await threadDB.getPendingThread(threadID);
    if (!pendingInfo) {
      await response.send(`No pending approval for thread ID: ${threadID}`);
      return;
    }

    let groupName = 'Unnamed Group';
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      groupName = threadInfo.threadName || 'Unnamed Group';
    } catch (error) {
      console.error(`Error fetching thread info for ${threadID}:`, error);
    }

    await threadDB.approve(threadID);
    await response.send(`Approved bot for group: ${groupName} (ID: ${threadID})`);
    await response.send('Bot approved and active!', threadID);
  },
};