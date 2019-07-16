import {debounce} from 'lodash';

const handlers: Set<Function> = new Set();

const handleResize = debounce(() => {
  handlers.forEach((resizeHandler: Function) => {
    resizeHandler();
  });
}, 300);

window.addEventListener('resize', handleResize);

export function addResizeHandler(handler: Function) {
  handlers.add(handler);
  handler();
}