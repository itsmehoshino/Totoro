const meta = {
  name: "test"
};

async function execute({ response, event, fonts }) {
  const { messageID, replies } = await response.setReply(
    fonts.sans('Hello! Reply with "yes" to continue or anything else to stop.'),
    event.threadID
  );

  replies(async ({ response: replyResponse, event: replyEvent, fonts }) => {
    const userReply = replyEvent.body.trim().toLowerCase();
    if (userReply === 'yes') {
      const { messageID: nextMessageID, replies: nextReplies } = await replyResponse.setReply(
        fonts.sans('Great! Reply with "done" to finish.'),
        replyEvent.threadID
      );

      nextReplies(async ({ response: nextResponse, event: nextEvent, fonts }) => {
        const nextReply = nextEvent.body.trim().toLowerCase();
        if (nextReply === 'done') {
          await nextResponse.send(fonts.sans('You completed the test!'), nextEvent.threadID);
        } else {
          await nextResponse.send(fonts.sans('Expected "done", but thanks for trying!'), nextEvent.threadID);
        }
      });
    } else {
      await replyResponse.send(fonts.sans('Okay, stopping here.'), replyEvent.threadID);
    }
  });
}

export default { meta, execute };