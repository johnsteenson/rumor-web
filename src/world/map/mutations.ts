import { TileMap, TileChange, TileDraw, TileChangeEntry } from "@/types/map";
import { getRectangularTileIndex, visitSurroundingTiles, getWaterTileIndex, calculateTileValue } from '@/lib/world/autotile';
import { Point } from '@/types/primitives';
import { unpackMapBuf, packMapBuf } from '@/lib/world/tilemap';
import { TemplateTileType } from '@/types/tileset';

const MAX_ITERATIONS = 25000;

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
        templateTile = this.map.tileset.sections[unpackedVal[0]].templateTiles[unpackedVal[1]];

      if (templateTile.type === TemplateTileType.SINGLE) {
        continue;
      }

      tileValue = calculateTileValue(layer, this.map.tileset, point.x, point.y, w, h, templateTileValue);
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
      surroundingTiles: Point[] = [],
      changeListStart = this.changes[this.changes.length - 1].entries.length;

    for (const drawData of tileDraw.data) {
      const layer = this.map.layer[tileDraw.l];
      const section = this.map.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      let tileValue;

      tileValue = calculateTileValue(layer, this.map.tileset, tileDraw.x, tileDraw.y, w, h, templateTileValue);
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

    this.mapUpdate(this.changes[this.changes.length - 1].entries.slice(changeListStart));
  }

  public fill(tileDraw: TileDraw) {
    const w = this.map.w,
      h = this.map.h,
      changeListStart = this.changes[this.changes.length - 1].entries.length;

    for (const drawData of tileDraw.data) {
      const layer = this.map.layer[tileDraw.l];
      const section = this.map.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      const doFill = (x: number, y: number, repTTV: number) => {
        if (repTTV === templateTileValue) {
          return;
        }

        const stack: Point[] = [{
          x,
          y
        }];
        let count = 0;

        while (stack.length > 0 && count < MAX_ITERATIONS) {
          const pt = stack.pop(),
            surroundingTiles: Point[] = [];

          count++;

          if (pt == null) {
            break;
          }

          if (layer.templateData[pt.y * w + pt.x] !== repTTV) {
            continue;
          }

          let pw = pt.x, scanUp = true, scanDown = true;
          while (pw > 0 && layer.templateData[pt.y * w + (pw - 1)] === repTTV) {
            pw--;
          }

          while (pw < w && layer.templateData[pt.y * w + pw] === repTTV) {
            const tileValue = calculateTileValue(layer, this.map.tileset, pt.x, pt.y, w, h, templateTileValue);

            this.applyTileChanges([{
              x: pw,
              y: pt.y,
              l: tileDraw.l,
              t: templateTileValue,
              v: tileValue,
              pv: 0,
              pt: 0
            }]);

            visitSurroundingTiles(pw, pt.y, 1, 1, w, h, (px: number, py: number) => {
              surroundingTiles.push({
                x: px,
                y: py,
                l: tileDraw.l
              });
            });

            if (pt.y > 0) {
              if (scanUp && layer.templateData[(pt.y - 1) * w + pw] === repTTV) {
                stack.push({ x: pw, y: pt.y - 1 });
              }
              scanUp = layer.templateData[(pt.y - 1) * w + pw] !== repTTV
            }

            if (pt.y < h) {
              if (scanDown && layer.templateData[(pt.y + 1) * w + pw] === repTTV) {
                stack.push({ x: pw, y: pt.y + 1 })
              }
              scanDown = layer.templateData[(pt.y + 1) * w + pw] !== repTTV;
            }

            pw++;
          }

          this.correctSurroundingAutotiles(surroundingTiles)
        }
      }

      doFill(tileDraw.x, tileDraw.y, layer.templateData[tileDraw.y * w + tileDraw.x]);
    }

    this.mapUpdate();
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