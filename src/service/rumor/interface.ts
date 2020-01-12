import { TileChange } from '@/types/map';

export abstract class RumorService {

  protected onGetMapCallback!: Function;

  public onGetMap(callback: Function) {
    this.onGetMapCallback = callback;
  }
  abstract getMap(mapId: string): void;


  abstract updateMap(changes: TileChange): void;

}