import { debounce } from 'lodash';

const handlers: Map<Element, Function> = new Map();

let observer: ResizeObserver;

if (window.ResizeObserver) {
  observer = new window.ResizeObserver((entries: any, obs: ResizeObserver) => {
    for (const entry of entries) {
      const handler = handlers.get(entry.target);

      if (handler) {
        handler(entry.target, entry.contentRect);
      }
    }
  });
} else {

  const handleResize = debounce(() => {
    handlers.forEach((resizeHandler: Function, el: Element) => {
      resizeHandler(el, el.getBoundingClientRect());
    });
  }, 300);

  window.addEventListener('resize', handleResize);
}

export function add(el: Element, handler: Function) {
  const debouncedHandler = handler;
  handlers.set(el, debouncedHandler);

  if (observer) {
    observer.observe(el);
  }

  handler(el, el.getBoundingClientRect());
}

export function remove(el: Element) {
  handlers.delete(el)

  if (observer) {
    observer.unobserve(el);
  }
}

