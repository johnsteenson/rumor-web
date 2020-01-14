import { TileMap, TileChangeEntry, TileChange } from '@/types/map';
import { CircularBuffer } from '@/types/circularBuffer';
import { Nullable } from '@/types/primitives';

const UNDO_BUFFER_SIZE = 5;

export class ChangeRegistry {

  private map!: TileMap;

  private changes: CircularBuffer<TileChange> = new CircularBuffer(UNDO_BUFFER_SIZE);

  private pointsVisited: Map<number, TileChangeEntry> = new Map();

  set tileMap(map: TileMap) {
    this.map = map;
  }

  public newChangeList(): TileChange {
    this.changes.push({
      entries: [],
    });

    this.pointsVisited.clear();

    return this.changes.top() as TileChange;
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
        layer = this.map.layer[change.l],
        visited = this.pointsVisited.get(offset);

      if (layer.templateData[offset] === change.t && layer.visibleData[offset] === change.v) {
        continue;
      }

      if (visited) {
        visited.l = -1; /* Mark as change to filter out when done */

        change.pt = visited.pt;
        change.pv = visited.pv;
      } else {
        change.pt = layer.templateData[offset];
        change.pv = layer.visibleData[offset];
      }

      changes.entries.push(change);
      this.pointsVisited.set(offset, change);

      layer.templateData[offset] = change.t;
      layer.visibleData[offset] = change.v;
    }
  }

  public filterActiveChangeList(): Nullable<TileChange> {
    const changes = this.changes.top();

    if (!changes) {
      return null;
    }

    changes.entries = changes.entries.filter((change: TileChangeEntry) => change.l !== -1);
    return changes;
  }

  public revertLastChangeList(): Nullable<TileChange> {
    const lastChangeList = this.changes.pop();

    if (!lastChangeList) {
      return null;
    }

    lastChangeList.entries = lastChangeList.entries.filter((change: TileChangeEntry) => change.l !== -1);

    for (let i = lastChangeList.entries.length - 1; i >= 0; i--) {
      const change = lastChangeList.entries[i];

      const offset: number = this.map.w * change.y + change.x,
        layer = this.map.layer[change.l];

      change.t = change.pt;
      change.v = change.pv;

      layer.templateData[offset] = change.t;
      layer.visibleData[offset] = change.v;
    }

    return lastChangeList;
  }

}