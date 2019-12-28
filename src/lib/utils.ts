import { Point, Rect } from '@/types/primitives';

export function clampBetween(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function rectBetweenPts(p1: Point, p2: Point): Rect {
  let l, r, t, b;

  if (p1.x < p2.x) {
    l = p1.x;
    r = p2.x + 1;
  } else if (p1.x > p2.x) {
    l = p2.x;
    r = p1.x + 1;
  }
  else {
    l = p1.x;
    r = l + 1;
  }

  if (p1.y < p2.y) {
    t = p1.y;
    b = p2.y + 1;
  } else if (p1.y > p2.y) {
    t = p2.y;
    b = p1.y + 1;
  }
  else {
    t = p1.y;
    b = t + 1;
  }

  return {
    l, r, t, b
  }
}