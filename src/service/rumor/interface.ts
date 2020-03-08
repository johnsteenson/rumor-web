import { TileChange } from '@/types/map';
import { Store } from 'vuex';

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

  abstract connect(token: string): Promise<void>;

  abstract registerStoreEvents(store: Store<any>): void;

  abstract getMap(mapId: string): void;

  abstract getMapTree(): void;


  abstract updateMap(changes: TileChange): void;

}