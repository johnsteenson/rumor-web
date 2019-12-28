import { TileMap, TileChangeEntry, TileChange } from '@/types/map';
import { CircularBuffer } from '@/types/circularBuffer';
import { Nullable } from '@/types/primitives';

const UNDO_BUFFER_SIZE = 5;

export class ChangeRegistry {

  private map!: TileMap;

  private changes: CircularBuffer<TileChange> = new CircularBuffer(UNDO_BUFFER_SIZE);

  set tileMap(map: TileMap) {
    this.map = map;
  }

  public newChangeList() {
    this.changes.push({
      entries: [],
    });
  }

  public getActiveChangeList(): Nullable<TileChange> {
    return this.changes.top();
  }

  public addChanges(changeList: TileChangeEntry[]) {
    const changes = this.changes.top();

    if (!changes) {
      return;
    }

    for (const change of changeList) {
      const offset: number = this.map.w * change.y + change.x,
        layer = this.map.layer[change.l];

      change.pt = layer.templateData[offset];
      change.pv = layer.visibleData[offset];
      layer.templateData[offset] = change.t;
      layer.visibleData[offset] = change.v;

      changes.entries.push(change);
    }
  }

  public revertLastChangeList(): Nullable<TileChange> {
    const lastChangeList = this.changes.pop();

    if (!lastChangeList) {
      return null;
    }

    for (let i = lastChangeList.entries.length - 1; i >= 0; i--) {
      const change = lastChangeList.entries[i];
      const offset: number = this.map.w * change.y + change.x,
        layer = this.map.layer[change.l];

      change.t = change.pt;
      change.v = change.pv;

      layer.templateData[offset] = change.pt;
      layer.visibleData[offset] = change.pv;
    }

    return lastChangeList
  }

}