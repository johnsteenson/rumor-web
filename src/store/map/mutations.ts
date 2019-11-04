import { TileMap, TileChange, TileDraw, TileChangeEntry } from "@/types/map";
import { getRectangularTileIndex, visitSurroundingTiles, getWaterTileIndex, calculateTileValue } from '@/lib/world/autotile';
import { Point } from '@/types/primitives';
import { unpackMapBuf, packMapBuf } from '@/lib/world/tilemap';
import { TemplateTileType } from '@/types/tileset';

import { worldModule } from '@/store/world';
import { WorldState } from '../world/types';

const state: WorldState = worldModule.state as WorldState;

export class MapMutator {
  private map!: TileMap;
  private changes: TileChange[] = [];
  private mapUpdate: Function;

  constructor(mapUpdate: Function) {
    this.mapUpdate = mapUpdate;
  }

  set tileMap(map: TileMap) {
    this.map = map;
  }

  private correctSurroundingAutotiles(points: Point[]) {
    const w = this.map.w,
      h = this.map.h;

    let tileValue;
    const changeList: TileChangeEntry[] = [];

    for (const point of points) {
      const layer = this.map.layer[point.l!],
        templateTileValue = layer.templateData[point.y * w + point.x],
        unpackedVal = unpackMapBuf(templateTileValue),
        templateTile = state.tileset.sections[unpackedVal[0]].templateTiles[unpackedVal[1]];

      if (templateTile.type === TemplateTileType.SINGLE) {
        continue;
      }

      tileValue = calculateTileValue(layer, state.tileset, point.x, point.y, w, h, templateTileValue);
      changeList.push({
        x: point.x,
        y: point.y,
        l: point.l!,
        t: templateTileValue,
        v: tileValue,
        pt: 0,
        pv: 0
      });
    }

    this.applyTileChanges(changeList);
  }

  private applyTileChanges(changeList: TileChangeEntry[]) {
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

  public newChange() {
    this.changes.push({
      entries: [],
    });
  }

  public pencil(tileDraw: TileDraw) {
    const w = this.map.w,
      h = this.map.h,
      surroundingTiles: Point[] = [];

    for (const drawData of tileDraw.data) {
      const layer = this.map.layer[tileDraw.l];
      const section = state.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      let tileValue;

      tileValue = calculateTileValue(layer, state.tileset, tileDraw.x, tileDraw.y, w, h, templateTileValue);
      this.applyTileChanges([{
        x: tileDraw.x,
        y: tileDraw.y,
        l: tileDraw.l,
        t: templateTileValue,
        v: tileValue,
        pt: 0,
        pv: 0
      }]);

      visitSurroundingTiles(tileDraw.x, tileDraw.y, tileDraw.w, tileDraw.h, w, h, (px: number, py: number) => {
        surroundingTiles.push({
          x: px,
          y: py,
          l: tileDraw.l
        });

      });

      this.correctSurroundingAutotiles(surroundingTiles);
    }

    this.mapUpdate(this.changes[this.changes.length - 1]);
  }

  public fill(tileDraw: TileDraw) {
    const w = this.map.w,
      h = this.map.h;

    for (const drawData of tileDraw.data) {
      const layer = this.map.layer[tileDraw.l];
      const section = state.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      const doFill = (x: number, y: number, repTTV: number) => {
        const tileValue = calculateTileValue(layer, state.tileset, x, y, w, h, templateTileValue);
        const surroundingTiles: Point[] = [];
        this.applyTileChanges([{
          x,
          y,
          l: tileDraw.l,
          t: templateTileValue,
          v: tileValue,
          pv: 0,
          pt: 0
        }]);

        if (x > 0 && layer.templateData[y * w + (x - 1)] === repTTV) {
          doFill(x - 1, y, repTTV);
        }

        if (y > 0 && layer.templateData[(y - 1) * w + x] === repTTV) {
          doFill(x, y - 1, repTTV);
        }

        if (x < w && layer.templateData[y * w + (x + 1)] === repTTV) {
          doFill(x + 1, y, repTTV);
        }

        if (y < h && layer.templateData[(y + 1) * w + x] === repTTV) {
          doFill(x, y + 1, repTTV);
        }

        visitSurroundingTiles(x, y, 1, 1, w, h, (px: number, py: number) => {
          surroundingTiles.push({
            x: px,
            y: py,
            l: tileDraw.l
          });
        });

        this.correctSurroundingAutotiles(surroundingTiles);
      };

      doFill(tileDraw.x, tileDraw.y, layer.templateData[tileDraw.y * w + tileDraw.x]);
    }

    this.mapUpdate(this.changes[this.changes.length - 1]);
  }

  public undo() {
    if (this.changes.length < 1) {
      return;
    }

    const lastChanges = this.changes.pop();

    for (let i = lastChanges!.entries.length - 1; i >= 0; i--) {
      const change = lastChanges!.entries[i];
      const offset: number = this.map.w * change.y + change.x;
      const layer = this.map.layer[change.l];
      layer.templateData[offset] = change.pt;
      layer.visibleData[offset] = change.pv;
    }

    this.mapUpdate(lastChanges);
  }


}