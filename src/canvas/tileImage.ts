import { TileSize } from '@/types/geometry';

export class TileImage {
  private canvas: HTMLCanvasElement;
  private tileSize: TileSize;
  private tilesPerRow: number;
  private totalTiles: number;

  private subtileCache: Map<number, HTMLCanvasElement>
    = new Map<number, HTMLCanvasElement>();

  constructor(canvas: HTMLCanvasElement, tileSize: TileSize) {
    this.canvas = canvas;
    this.tileSize = tileSize;

    this.tilesPerRow = Math.floor(canvas.width / tileSize.scaledW);

    this.totalTiles = this.tilesPerRow * Math.floor((canvas.height / tileSize.scaledH));
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
    const sx: number = Math.floor((i % this.tilesPerRow) * this.tileSize.scaledW),
      sy: number = Math.floor(Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH);

    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(this.tileSize.scaledW)) {
      console.log('DRAWING NON-INTEGER', x, y);
    }

    destCtx.drawImage(
      this.canvas, sx, sy, this.tileSize.scaledW, this.tileSize.scaledH,
      x, y, this.tileSize.scaledW, this.tileSize.scaledH,
    );
  }

  private createSubtile(i: number, flagMask: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas'),
      ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D,
      sx: number = Math.floor((i % this.tilesPerRow) * this.tileSize.scaledW),
      sy: number = Math.floor(Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH),
      subW: number = Math.floor(this.tileSize.scaledW / 2),
      subH: number = Math.floor(this.tileSize.scaledH / 2);

    if (flagMask & 8) { // NW
      ctx.drawImage(
        this.canvas, sx, sy, subW, subH,
        0, 0, subW, subH,
      );
    }
    if (flagMask & 4) { // NE
      ctx.drawImage(
        this.canvas, sx + subW, sy, subW, subH,
        subW, 0, subW, subH,
      );
    }
    if (flagMask & 2) { // SW
      ctx.drawImage(
        this.canvas, sx, sy + subH, subW, subH,
        0, subH, subW, subH,
      );
    }
    if (flagMask & 1) { // SE
      ctx.drawImage(
        this.canvas, sx + subW, sy + subH, subW, subH,
        subW, subH, subW, subH,
      );
    }

    return canvas;
  }

  public drawSubTiles(destCtx: CanvasRenderingContext2D, x: number, y: number, i: number, flagMask: number) {
    // console.time('drawSubTiles');
    const sx: number = Math.floor((i % this.tilesPerRow) * this.tileSize.scaledW),
      sy: number = Math.floor(Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH),
      subW: number = Math.floor(this.tileSize.scaledW / 2),
      subH: number = Math.floor(this.tileSize.scaledH / 2),
      key = (i << 12) | flagMask;

    let subtile = this.subtileCache.get(key);

    if (!subtile) {
      subtile = this.createSubtile(i, flagMask);
      this.subtileCache.set(key, subtile);
    }

    destCtx.drawImage(subtile, x, y);

    /*
    if(this.subtileCache.has(key)) {
      this.subtileCache.get(key)
      destCtx.drawImage
    }

    // console.log(`drawSubTiles sx=${sx} sy=${sy} subW=${subW} subH=${subH} x=${x} y=${y}`);

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
    // console.timeEnd('drawSubTiles');
    */
  }



}
