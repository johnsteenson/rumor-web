declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'circular-buffer' {
  class CircularBuffer<T> {
    constructor(size: number);

    size(): number;
    enq(value: T): T;
    deq(value: T): T;
    push(value: T): T;
    pop(value: T): T;
  }

}
