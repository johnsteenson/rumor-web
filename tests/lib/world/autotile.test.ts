import { shallowMount } from '@vue/test-utils';
import { visitSurroundingTiles, getRectangularTileIndex } from '@/lib/world/autotile';

describe('Autotile Helpers', () => {
  it('should visit all surrounding tiles for 1x1 placement', () => {
    const X = 4,
      Y = 2,
      W = 10,
      H = 10;

    const set = new Set();
    set.add('3,1');
    set.add('4,1');
    set.add('5,1');
    set.add('3,3');
    set.add('4,3');
    set.add('5,3');
    set.add('3,2');
    set.add('5,2');

    visitSurroundingTiles(X, Y, 1, 1, W, H, (x: number, y: number) => {
      const key = `${x},${y}`;
      expect(set.has(key)).toBeTruthy();
      set.delete(key);
    });

    expect(set.size).toBe(0);
  });

  it('should visit all surrounding tiles for a 2x2 placement', () => {
    const X = 4,
      Y = 2,
      W = 10,
      H = 10;

    const set = new Set();
    set.add('3,1');
    set.add('4,1');
    set.add('5,1');
    set.add('6,1');
    set.add('3,2');
    set.add('6,2');
    set.add('3,3');
    set.add('6,3');
    set.add('3,4');
    set.add('4,4');
    set.add('5,4');
    set.add('6,4');

    visitSurroundingTiles(X, Y, 2, 2, W, H, (x: number, y: number) => {
      const key = `${x},${y}`;
      expect(set.has(key)).toBeTruthy();
      set.delete(key);
    });

    expect(set.size).toBe(0);
  });

  it('should visit all surrounding tiles for a 1x1 placement on the left edge', () => {
    const X = 0,
      Y = 2,
      W = 10,
      H = 10;

    const set = new Set();
    set.add('0,1');
    set.add('1,1');
    set.add('0,3');
    set.add('1,3');
    set.add('1,2');

    visitSurroundingTiles(X, Y, 1, 1, W, H, (x: number, y: number) => {
      const key = `${x},${y}`;
      expect(set.has(key)).toBeTruthy();
      set.delete(key);
    });

    expect(set.size).toBe(0);
  });
});
