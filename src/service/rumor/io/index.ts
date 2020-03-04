import { RumorService } from "@/service/rumor/interface";

import { createLayers } from "@/lib/world/tilemap";
import { TileMap, TileChange, TileChangeEntry, TileMapTree } from '@/types/map';
import { Tileset } from '@/types/tileset';

import { serializeChanges, deserializeChanges } from './serialize';
import { connectSocket, ConnectResponse } from './connect';

import store from '@/store';

import tileset from "@/data/tileset-world.json";
import { Store } from 'vuex';

export class RumorServiceIo extends RumorService {

  private store!: Store<any>;

  private socketClient!: SocketIOClient.Socket;

  constructor() {
    super();
  }

  private registerSocketEvents() {
    this.socketClient.on("getMap", (mapData: any) => {
      const map: TileMap = mapData as TileMap;
      map.layer = createLayers(map.w, map.h, 2, map.buffer);
      map.tileset = (tileset as unknown) as Tileset; // mapData.tileset as Tileset;

      this.onGetMapCallback(map);
    });

    this.socketClient.on("updateMap", (changes: ArrayBuffer) => {
      const tileChanges: TileChangeEntry[] = deserializeChanges(changes);

      this.onMapUpdateCallback(tileChanges);
    });

    this.socketClient.on("getMapTree", (tree: TileMapTree) => {

      this.onMapTreeUpdateCallback(tree);
    });
  }

  public registerStoreEvents(store: Store<any>) {
    this.store = store;
  }

  public async connect(token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      connectSocket(token)
        .then((response: ConnectResponse) => {
          this.socketClient = response.socketClient;
          this.store.commit('project/setSignedInUser', response.username);

          this.registerSocketEvents();
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  public getMap(mapId: string) {
    this.socketClient.emit('getMap', mapId);
  }

  public getMapTree() {
    this.socketClient.emit('getMapTree');
  }

  public updateMap(changes: TileChange) {

    const changeBuf = serializeChanges(changes.entries);

    this.socketClient.emit('updateMap', changeBuf);
  }

}