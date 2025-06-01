import { log } from './views/custom';
import { handleEvent } from './handler/handleEvent';
import { handleCommand } from './handler/handleCommand';
import { handleReply } from './handler/handleReply';

export async function listener({ api, event }) {
  if (!api || !event || typeof event.type !== 'string') {
    log('ERROR', 'Invalid listener input: missing or invalid api or event');
    return;
  }

  try {
    switch (event.type) {
      case 'message':
        await handleCommand({ api, event });
        break;
      case 'event':
        await handleEvent({ api, event });
        break;
      case 'message_reply':
        if (event.body?.startsWith(global.Totoro.config.prefix)) {
          await handleCommand({ api, event });
        } else if (event.messageReply?.messageID && global.Totoro.replies.has(event.messageReply.messageID)) {
          await handleReply({ api, event });
        }
        break;
      default:
        log('WARNING', `Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('ERROR', `Error processing event ${event.type}: ${errorMessage}`);
  }
}
