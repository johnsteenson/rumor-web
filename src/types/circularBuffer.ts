import { Nullable } from './primitives';

export class CircularBuffer<T> {

  private buffer: Array<T>;

  private pointer: number;

  private size: number;

  private slotsFilled: number;

  constructor(size: number) {
    this.buffer = new Array<T>(size);
    this.size = size;
    this.pointer = -1;
    this.slotsFilled = 0;
  }

  public push(value: T) {
    if (this.slotsFilled < 1) {
      this.pointer = 0;
    } else {
      this.pointer = this.pointer + 1;

      if (this.pointer >= this.size) {
        this.pointer = 0;
      }
    }

    this.buffer[this.pointer] = value;
    this.slotsFilled = (this.slotsFilled < this.size) ? this.slotsFilled + 1 : this.slotsFilled;
  }

  public pop(): Nullable<T> {
    if (this.slotsFilled < 1) {
      return null;
    }

    const item: T = this.buffer[this.pointer];
    this.pointer = this.pointer - 1;
    this.slotsFilled = this.slotsFilled - 1;

    if (this.pointer < 0) {
      this.pointer = this.size - 1;
    }

    return item;
  }

  public top(): Nullable<T> {
    if (this.slotsFilled < 1) {
      return null;
    }

    return this.buffer[this.pointer];
  }

  public empty(): boolean {
    return this.slotsFilled === 0 && this.pointer === 0;
  }

  public clear() {
    this.pointer = 0;
    this.slotsFilled = 0;
  }

}