import { log } from '../views/custom';
import { Response } from './chat/response';
import fonts from '../../totoro/resources/styler/fonter/fonts';
import { styler } from '../../totoro/resources/styler/design/styler';

export async function handleReply({ api, event }) {
  if (!api || !event || !event.body || !event.senderID || !event.threadID || !event.messageReply?.messageID) {
    log('ERROR', 'Invalid reply handler input: missing required fields');
    return;
  }

  const response = new Response(api, event, '');

  const repliedMessageID = event.messageReply.messageID;
  const replyCallback = global.Totoro.replies.get(repliedMessageID);
  if (!replyCallback) {
    log('INFO', `No reply handler found for message ID: ${repliedMessageID}`);
    return;
  }

  try {
    await replyCallback({ response, api, event, fonts, styler });
    log('INFO', `Executed reply handler for message ID ${repliedMessageID} by user ${event.senderID}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('ERROR', `Error executing reply for message ID ${repliedMessageID}: ${errorMessage}`);
    response.send(`An error occurred while processing your reply: ${errorMessage}`, event.threadID);
  }
}
