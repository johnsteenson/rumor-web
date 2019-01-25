import { ImageManager } from '@/canvas/imageManager';
import { Tileset } from '@/types/tileset';
import { TileImage } from './tileImage';

class TilePalette {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private tileset?: Tileset;
  private image?: TileImage;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  public drawTiles() {
    let sx: number = 0,
      sy: number = 0;

    // for (let i = 0; i < this.tileset!.tiles.length; i += 1) {
    for (const tile of this.tileset!.tiles) {
      const t: number = tile.tiles[0].t[0];
      this.image!.drawTile(this.context, sx, sy, t);
      sx += this.tileset!.tileSize.w;
    }

    /*
    for (let i = 0; i < this.image.totalTiles; i += 1) {
      this.image.drawTile(this.context, sx, sy, i);
      sx += 16;
      if (i > 0 && i % this.tilesPerRow === 0) {
        sx = 0;
        sy += 16;
      }
    }
    */
  }

  // TODO Change this from loading a tileImage to a tileSet class
  public loadTileset(tileset: Tileset) {
    const tileImage = createTileImage(`/images/${tileset.imageFile}`, tileset.tileSize);
    ImageManager.getInstance().createTileImage(`/image/${tileset.imageFile}`)
    this.tileset = tileset;
    this.tileSize = tileSize;

    tileImage.then((image) => {
      this.image = image;
      this.tilesPerRow = Math.floor(this.canvas.width / tileSize.scaledW);
      this.tileset = tileset;
      console.log(tileset);
      this.drawTiles();
    });
  }

  public selectTilesInRegion(l, t, r, b) {
    // For now, select left and topmost tile only
    const tileIndex = Math.floor(Math.floor(t / this.tileSize.scaledH) * this.tilesPerRow)
       + Math.floor(l / this.tileSize.scaledW);

    return [tileIndex];
  }
}

export default TilePalette;
