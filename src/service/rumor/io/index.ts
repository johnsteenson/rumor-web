import { RumorService } from "@/service/rumor/interface";

import { createLayers } from "@/lib/world/tilemap";
import { TileMap, TileChange, TileChangeEntry } from '@/types/map';
import { Tileset } from '@/types/tileset';

import { serializeChanges, deserializeChanges } from './serialize';

import tileset from "@/data/tileset-world.json";

export class RumorServiceIo extends RumorService {

  private socketClient: SocketIOClient.Socket;

  constructor(socketClient: SocketIOClient.Socket) {
    super();

    this.socketClient = socketClient;
    this.registerEvents();
  }

  private registerEvents() {
    this.socketClient.on("getMap", (mapData: any) => {
      const map: TileMap = mapData as TileMap;
      map.layer = createLayers(map.w, map.h, 2, map.buffer);
      map.tileset = tileset as Tileset; // mapData.tileset as Tileset;

      this.onGetMapCallback(map);
    });

    this.socketClient.on("updateMap", (changes: ArrayBuffer) => {
      const tileChanges: TileChangeEntry[] = deserializeChanges(changes);

      this.onMapUpdateCallback(tileChanges);
    });
  }

  public getMap(mapId: string) {
    this.socketClient.emit('getMap', mapId);
  }

  public updateMap(changes: TileChange) {

    const changeBuf = serializeChanges(changes.entries);

    this.socketClient.emit('updateMap', changeBuf);
  }

}