import { TileMap, TileChange, TileChangeEntry } from '@/types/map';

import { MapMutator } from './mutations';

export class MapStore {

  private _mapMutator: MapMutator;

  private _map!: TileMap;

  private onMapChangeCallback!: Function;

  private onMapUpdateCallback!: Function;

  constructor() {
    this._mapMutator = new MapMutator(this.mapUpdate.bind(this));
  }

  private mapUpdate(changes: TileChangeEntry[]) {
    this.onMapUpdateCallback(changes);
  }

  set map(map: TileMap) {
    this._map = map;
    this._mapMutator.tileMap = map;

    if (this.onMapChangeCallback) {
      this.onMapChangeCallback(this._map);
    }
  }

  get map(): TileMap {
    return this._map;
  }

  get mapMutator() {
    return this._mapMutator;
  }

  public onMapChange(callback: Function) {
    this.onMapChangeCallback = callback;
    callback(this._map);
  }

  public onMapUpdate(callback: Function) {
    this.onMapUpdateCallback = callback;
  }
};
