const handlers: Map<String, Function> = new Map();

export function registerWindowEvent(event: String, callback: Function) {
  const handler: Function | undefined = handlers.get(event),
    newHandler = (event: Event) => {
      callback(event);
    };

  if (handler) {
    window.removeEventListener(event as any, handler as EventListenerOrEventListenerObject, true);
  }

  handlers.set(event, newHandler);
  window.addEventListener(event as any, newHandler as EventListenerOrEventListenerObject, true);
}

export function unregisterWindowEvent(event: String) {
  const handler: Function | undefined = handlers.get(event);

  if (!handler) {
    return;
  }

  window.removeEventListener(event as any, handler as EventListenerOrEventListenerObject, true);
}

