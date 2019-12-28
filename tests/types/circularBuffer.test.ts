import { shallowMount } from '@vue/test-utils';
import { visitSurroundingTiles, getRectangularTileIndex } from '@/lib/world/autotile';
import { CircularBuffer } from '@/types/circularBuffer';

describe('Circular Buffer', () => {
  it('should get back object after first insert', () => {
    const testObj = {
      val: "TEST"
    };

    const buffer = new CircularBuffer<Object>(3);

    buffer.push(testObj);

    const top = buffer.top();

    expect(top).toBe(testObj);
  });

  it('should get back second object', () => {
    const testObj1 = {
      val: "TEST"
    }, testObj2 = {
      val: "TEST2"
    };
    let top;

    const buffer = new CircularBuffer<Object>(3);

    buffer.push(testObj1);
    buffer.push(testObj2);

    top = buffer.pop();

    expect(top).toBe(testObj2);

    top = buffer.pop();

    expect(top).toBe(testObj1);
  });

  it('should overwrite first inserted objects after capacity is full', () => {
    const testObj1 = {
      val: "TEST"
    }, testObj2 = {
      val: "TEST2"
    }, testObj3 = {
      val: "TEST3"
    }, testObj4 = {
      val: "TEST4"
    }, testObj5 = {
      val: "TEST5"
    };
    let top;

    const buffer = new CircularBuffer<Object>(3);

    buffer.push(testObj1);
    buffer.push(testObj2);
    buffer.push(testObj3);
    buffer.push(testObj4);
    buffer.push(testObj5);

    top = buffer.pop();
    expect(top).toBe(testObj5);

    top = buffer.pop();
    expect(top).toBe(testObj4);

    top = buffer.pop();
    expect(top).toBe(testObj3);

    top = buffer.pop();
    expect(top).toBe(null);
  });

  it('should return null for getting top of empty buffer', () => {
    const buffer = new CircularBuffer<Object>(3);

    let top = buffer.pop();
    expect(top).toBe(null);
  })
});
