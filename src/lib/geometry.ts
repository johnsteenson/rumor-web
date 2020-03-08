import { Point, Rect, Dimension } from '@/types/geometry';

export function createRectFromPts(p1: Point, p2: Point, maxSize?: number): Rect {
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

  if (maxSize) {
    if (r - l > maxSize) {
      r = l + maxSize;
    }

    if (b - t > maxSize) {
      b = t + maxSize;
    }
  }

  return {
    l, r, t, b
  }
}

export function clipRectToArea(rect: Rect, w: number, h: number): Rect {
  const outRect: Rect = {
    l: rect.l > 0 ? rect.l : 0,
    t: rect.t > 0 ? rect.t : 0,
    r: rect.r < w ? rect.r : w,
    b: rect.b < h ? rect.b : h
  };

  return outRect;
}

export function isRectEqual(r1: Rect, r2: Rect): boolean {
  if (
    r1.l === r1.l &&
    r1.t === r2.t &&
    r1.r === r2.r &&
    r1.b === r2.b
  ) {
    return true;
  }

  return false;
}

export function isPtInArea(pt: Point, w: number, h: number) {
  if (pt.x >= 0 && pt.x < w && pt.y >= 0 && pt.y < h) {
    return true;
  }

  return false;
}

export function isPtInRect(pt: Point, r: Rect): boolean {
  if (pt.x >= r.l && pt.x < r.r && pt.y >= r.t && pt.y < r.b) {
    return true;
  }

  return false;
}