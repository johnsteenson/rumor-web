interface Window {
  ResizeObserver: ResizeObserver;
}

interface ResizeObserver {
  new(callback: any): ResizeObserver;
  observe: (target: Element) => void;
  unobserve: (target: Element) => void;
  disconnect: () => void;
}