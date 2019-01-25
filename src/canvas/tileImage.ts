import { TileSize } from '@/types/primitives';

export class TileImage {
  private canvas: HTMLCanvasElement;
  private image: HTMLImageElement;
  private tileSize: TileSize;
  private tilesPerRow: number;
  private totalTiles: number;

  constructor(canvas: HTMLCanvasElement, tileSize: TileSize) {
    this.canvas = canvas;
    this.tileSize = tileSize;

    this.tilesPerRow = canvas.width / tileSize.scaledW;
    this.totalTiles = this.tilesPerRow * (canvas.height / tileSize.scaledH);
  }

  public resize(tileSize: TileSize) {
    this.tileSize = tileSize;
    this.canvas = document.createElement('canvas');

    const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;

    ctx.drawImage(this.image,
      0,
      0,
      this.image.width * tileSize.scale,
      this.image.height * tileSize.scale,
    );
  }

  public drawImage(destCtx: CanvasRenderingContext2D, x: number, y: number) {
    destCtx.drawImage(this.canvas, x, y);
  }

  public drawTile(destCtx: CanvasRenderingContext2D, x: number, y: number, i: number) {
    const sx: number = (i % this.tilesPerRow) * this.tileSize.w,
      sy: number = Math.floor(i / this.tilesPerRow) * this.tileSize.h;
    destCtx.drawImage(
      this.canvas, sx, sy, this.tileSize.w, this.tileSize.h,
      x, y, this.tileSize.w, this.tileSize.h,
    );
  }



}
