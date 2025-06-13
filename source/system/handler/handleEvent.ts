export async function handleEvent({ ...entryObj }: { [key: string]: any }) {
  const { events } = global.Totoro as { events: Map<any, { meta: { name: string }; onEvent: Function }> };
  const { api, event, response } = entryObj;

  try {
    for (const { meta, onEvent } of events.values()) {
      if (event && meta.name) {
        const args = event.body?.split("");
        try {
          await onEvent({
            ...entryObj,
            args,
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}
