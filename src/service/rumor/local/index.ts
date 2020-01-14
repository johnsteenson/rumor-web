import { RumorService } from "@/service/rumor/interface";
import { createMap } from '@/lib/world/tilemap';

import tileset from "@/data/tileset-world.json";
import { TileMap } from '@/types/map';
import { Tileset } from '@/types/tileset';

export class RumorServiceLocal extends RumorService {

  private map: TileMap;

  public constructor() {
    super();

    this.map = createMap("Local Map", 200, 200, tileset as any);
  }

  public getMap(mapId: string) {
    if (this.onGetMapCallback) {
      this.onGetMapCallback(this.map)
    }
  }

  public updateMap() {

  }

}