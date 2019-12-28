import { TileSize } from '@/types/geometry';
import { TileImage } from '@/canvas/tileImage';

export class ImageManager {
  public static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
      return ImageManager.instance;
    }

    return ImageManager.instance;

  }

  private static instance: ImageManager;

  private imageFiles: Map<String, HTMLImageElement> = new Map<String, HTMLImageElement>();

  private constructor() {

  }

  public async getTileImage(imagePath: string, tileSize: TileSize): Promise<TileImage> {
    const image: HTMLImageElement = await this.fetchImage(imagePath);

    const canvas = document.createElement('canvas'),
      ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.width = Math.floor(image.width * tileSize.scale);
    canvas.height = Math.floor(image.height * tileSize.scale);

    ctx.drawImage(image,
      0,
      0,
      Math.floor(image.width * tileSize.scale),
      Math.floor(image.height * tileSize.scale),
    );

    return new TileImage(canvas, tileSize);
  }

  private fetchImage(imagePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageFiles.has(imagePath)) {
        return resolve(this.imageFiles.get(imagePath));
      }

      const img: HTMLImageElement = new Image();

      img.addEventListener('load', () => {
        this.imageFiles.set(imagePath, img);
        resolve(img);
      });

      img.src = imagePath;
    });
  }


}

