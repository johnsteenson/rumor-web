import { Point } from '@/types/geometry';

const BOX_WIDTH = 16;

let leftArrow: HTMLCanvasElement;
let rightArrow: HTMLCanvasElement;
let upArrow: HTMLCanvasElement;
let downArrow: HTMLCanvasElement;

export function getBackgroundBrush() {

}

export function getLeftArrow() {
  if (leftArrow) {
    return leftArrow;
  }
  const canvas: HTMLCanvasElement = document.createElement('canvas'),
    context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = BOX_WIDTH;
  canvas.height = BOX_WIDTH;

  context.beginPath();
  context.fillStyle = '#F1F1F1';
  context.rect(0, 0, BOX_WIDTH, BOX_WIDTH);
  context.fill();
  context.beginPath();
  context.strokeStyle = '#555555';
  context.lineWidth = 2;
  context.moveTo(BOX_WIDTH - 6, 4);
  context.lineTo(6, BOX_WIDTH / 2);
  context.lineTo(BOX_WIDTH - 6, BOX_WIDTH - 4);
  context.stroke();

  leftArrow = canvas;

  return leftArrow;
}

export function getRightArrow() {
  if (rightArrow) {
    return rightArrow;
  }
  const canvas: HTMLCanvasElement = document.createElement('canvas'),
    context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = BOX_WIDTH;
  canvas.height = BOX_WIDTH;

  context.beginPath();
  context.fillStyle = '#F1F1F1';
  context.rect(0, 0, BOX_WIDTH, BOX_WIDTH);
  context.fill();
  context.beginPath();
  context.strokeStyle = '#555555';
  context.lineWidth = 2;
  context.moveTo(6, 4);
  context.lineTo(BOX_WIDTH - 6, BOX_WIDTH / 2);
  context.lineTo(6, BOX_WIDTH - 4);
  context.stroke();

  rightArrow = canvas;

  return rightArrow;
}

export function getUpArrow() {
  if (upArrow) {
    return upArrow;
  }
  const canvas: HTMLCanvasElement = document.createElement('canvas'),
    context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = BOX_WIDTH;
  canvas.height = BOX_WIDTH;

  context.beginPath();
  context.fillStyle = '#F1F1F1';
  context.rect(0, 0, BOX_WIDTH, BOX_WIDTH);
  context.fill();
  context.beginPath();
  context.strokeStyle = '#555555';
  context.lineWidth = 2;
  context.moveTo(4, BOX_WIDTH - 6);
  context.lineTo(BOX_WIDTH / 2, 6);
  context.lineTo(BOX_WIDTH - 4, BOX_WIDTH - 6);
  context.stroke();

  upArrow = canvas;

  return upArrow;
}

export function getDownArrow() {
  if (downArrow) {
    return downArrow;
  }
  const canvas: HTMLCanvasElement = document.createElement('canvas'),
    context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = BOX_WIDTH;
  canvas.height = BOX_WIDTH;

  context.beginPath();
  context.fillStyle = '#F1F1F1';
  context.rect(0, 0, BOX_WIDTH, BOX_WIDTH);
  context.fill();
  context.beginPath();
  context.strokeStyle = '#555555';
  context.lineWidth = 2;
  context.moveTo(4, 6);
  context.lineTo(BOX_WIDTH / 2, BOX_WIDTH - 6);
  context.lineTo(BOX_WIDTH - 4, 6);
  context.stroke();

  downArrow = canvas;

  return downArrow;
}

export function getMouseCoor(event: MouseEvent, canvas: HTMLCanvasElement): Point {
  const boundingRect = canvas.getBoundingClientRect(),
    xScale = canvas.width / (boundingRect.right - boundingRect.left),
    yScale = canvas.height / (boundingRect.bottom - boundingRect.top);

  return {
    x: (event.x - boundingRect.left) * xScale,
    y: (event.y - boundingRect.top) * yScale
  }
}