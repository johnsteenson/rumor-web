import { TileMap, TileChangeEntry, TileChange } from '@/types/map';

export class ChangeRegistry {

  private map!: TileMap;

  private changes: TileChange[] = [];

  set tileMap(map: TileMap) {
    this.map = map;
  }

  public newChangeList() {
    this.changes.push({
      entries: [],
    });
  }

  public getActiveChangeList(): TileChange {
    return this.changes[this.changes.length - 1];
  }

  public addChanges(changeList: TileChangeEntry[]) {
    if (this.changes.length < 1) {
      return;
    }

    for (const change of changeList) {
      const offset: number = this.map.w * change.y + change.x,
        changes = this.changes[this.changes.length - 1],
        layer = this.map.layer[change.l];

      change.pt = layer.templateData[offset];
      change.pv = layer.visibleData[offset];
      layer.templateData[offset] = change.t;
      layer.visibleData[offset] = change.v;

      changes.entries.push(change);
    }
  }

  public revertLastChangeList(): TileChange | null {
    if (this.changes.length < 1) {
      return null;
    }

    const lastChangeList: TileChange = this.changes.pop() as TileChange;

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