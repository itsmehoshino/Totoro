import { handleEvent } from './handler/handleEvent';
import { handleCommand } from './handler/handleCommand';

export async function listener({ api, event }: { api: any; event: any }): Promise<void> {

    const entryObj = {
      api,
      event,
    }

  switch (event.type){
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

