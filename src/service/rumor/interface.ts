import { TileChange } from '@/types/map';

export abstract class RumorService {

  protected onGetMapCallback!: Function;

  protected onMapUpdateCallback!: Function;

  protected onMapTreeUpdateCallback!: Function;

  public onGetMap(callback: Function) {
    this.onGetMapCallback = callback;
  }

  public onMapUpdate(callback: Function) {
    this.onMapUpdateCallback = callback;
  }

  public onMapTreeUpdate(callback: Function) {
    this.onMapTreeUpdateCallback = callback;
  }
  abstract getMap(mapId: string): void;

  abstract getMapTree(): void;


  abstract updateMap(changes: TileChange): void;

}