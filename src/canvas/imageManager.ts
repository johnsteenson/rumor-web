import { TileSize } from '@/types/primitives';
import { TileImage } from '@/canvas/tileImage';

export class ImageManager {
  public static getInstance(): ImageManager {
    if (!ImageManager._instance) {
      ImageManager._instance = new ImageManager();
      return ImageManager._instance;
    }

    return ImageManager._instance;

  }

  private static _instance: ImageManager;

  private imageFiles: Map<String, HTMLImageElement>;

  private constructor() {

  }

  public async createTileImage(imagePath: string, tileSize: TileSize): TileImage {
    const image: HTMLImageElement = await this.fetchImage(imagePath);

    const canvas = document.createElement('canvas'),
      ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image,
      0,
      0,
      image.width * tileSize.scale,
      image.height * tileSize.scale,
    );

    return new TileImage(canvas, tileSize);
  }

  private fetchImage(imagePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageFiles.has(imagePath)) {
        return resolve(this.imageFiles.get(imagePath));
      }

      const img: HTMLImageElement = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.src = imagePath;
    });
  }


}

