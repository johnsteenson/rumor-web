import { TileChange } from '@/types/map';

export abstract class RumorService {

  protected onGetMapCallback!: Function;

  protected onMapUpdateCallback!: Function;

  public onGetMap(callback: Function) {
    this.onGetMapCallback = callback;
  }

  public onMapUpdate(callback: Function) {
    this.onMapUpdateCallback = callback;
  }
  abstract getMap(mapId: string): void;


  abstract updateMap(changes: TileChange): void;

}