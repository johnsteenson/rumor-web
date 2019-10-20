import { TileSize } from '@/types/primitives';

export class TileImage {
  private canvas: HTMLCanvasElement;
  private tileSize: TileSize;
  private tilesPerRow: number;
  private totalTiles: number;

  constructor(canvas: HTMLCanvasElement, tileSize: TileSize) {
    this.canvas = canvas;
    this.tileSize = tileSize;

    this.tilesPerRow = canvas.width / tileSize.scaledW;

    this.totalTiles = this.tilesPerRow * (canvas.height / tileSize.scaledH);
  }


  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }


  public drawImage(destCtx: CanvasRenderingContext2D, x: number, y: number) {
    destCtx.drawImage(this.canvas, x, y);
  }

  public drawTile(destCtx: CanvasRenderingContext2D, x: number, y: number, i: number) {
    const sx: number = (i % this.tilesPerRow) * this.tileSize.scaledW,
      sy: number = Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH;
    destCtx.drawImage(
      this.canvas, sx, sy, this.tileSize.scaledW, this.tileSize.scaledH,
      x, y, this.tileSize.scaledW, this.tileSize.scaledH,
    );
  }

  public drawSubTiles(destCtx: CanvasRenderingContext2D, x: number, y: number, i: number, flagMask: number) {
    const sx: number = (i % this.tilesPerRow) * this.tileSize.scaledW,
      sy: number = Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH,
      subW: number = this.tileSize.scaledW / 2,
      subH: number = this.tileSize.scaledH / 2;

    if (flagMask & 8) { // NW
      destCtx.drawImage(
        this.canvas, sx, sy, subW, subH,
        x, y, subW, subH,
      );
    }
    if (flagMask & 4) { // NE
      destCtx.drawImage(
        this.canvas, sx + subW, sy, subW, subH,
        x + subW, y, subW, subH,
      );
    }
    if (flagMask & 2) { // SW
      destCtx.drawImage(
        this.canvas, sx, sy + subH, subW, subH,
        x, y + subH, subW, subH,
      );
    }
    if (flagMask & 1) { // SE
      destCtx.drawImage(
        this.canvas, sx + subW, sy + subH, subW, subH,
        x + subW, y + subH, subW, subH,
      );
    }
  }



}
