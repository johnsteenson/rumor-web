
type HandlerStack = Function[];

const handlerStacks: Map<String, HandlerStack> = new Map();

export function registerWindowEvent(event: String, callback: Function) {
  const handlerStack: HandlerStack | undefined = handlerStacks.get(event),
    newHandler = (event: Event) => {
      callback(event);
    };

  if (!handlerStack) {
    const newStack: Function[] = [newHandler];
    handlerStacks.set(event, newStack);

    window.addEventListener(event as any, newHandler as EventListenerOrEventListenerObject, true);
  } else {
    if (handlerStack.length > 0) {
      const lastEvent = handlerStack[handlerStack.length - 1];
      window.removeEventListener(event as any, lastEvent as EventListenerOrEventListenerObject, true);
    }

    handlerStack.push(newHandler);
    window.addEventListener(event as any, newHandler as EventListenerOrEventListenerObject, true);
  }
}

export function unregisterWindowEvent(event: String): boolean {
  const handlerStack: HandlerStack | undefined = handlerStacks.get(event);

  if (!handlerStack) {
    return false;
  }

  const handler = handlerStack.pop();

  if (!handler) {
    return false;
  }

  window.removeEventListener(event as any, handler as EventListenerOrEventListenerObject, true);

  if (handlerStack.length > 0) {
    const lastHandler = handlerStack[handlerStack.length - 1];
    window.addEventListener(event as any, lastHandler as EventListenerOrEventListenerObject);
  }

  return true;
}

