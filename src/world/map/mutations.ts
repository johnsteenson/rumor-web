import { TileMap, TileChange, TileDraw, TileChangeEntry } from "@/types/map";
import { getRectangularTileIndex, visitSurroundingTiles, getWaterTileIndex, calculateTileValue, getSurroundingTiles, getAllTiles } from '@/lib/world/autotile';
import { Point } from '@/types/geometry';
import { unpackMapBuf, packMapBuf } from '@/lib/world/tilemap';
import { TemplateTileType } from '@/types/tileset';
import { createRectFromPts } from '@/lib/geometry';
import { ChangeRegistry } from './changeRegistry';

import { getServiceInterface } from '@/service/rumor';

const MAX_ITERATIONS = 25000;

export class MapMutator {
  private map!: TileMap;

  private mapUpdate: Function;

  private initialized: boolean = false;

  private changeRegistry: ChangeRegistry = new ChangeRegistry();

  constructor(mapUpdate: Function) {
    this.mapUpdate = mapUpdate;


  }

  set tileMap(map: TileMap) {
    this.map = map;
    this.changeRegistry.tileMap = map;

    if (!this.initialized) {
      this.attachServiceListener();
    }
  }

  private attachServiceListener() {
    this.initialized = true;

    const serviceInterface = getServiceInterface();

    serviceInterface.onMapUpdate((tileChanges: TileChangeEntry[]) => {
      this.changeRegistry.newChangeList();
      this.changeRegistry.addChanges(tileChanges);

      this.mapUpdate(tileChanges);
    });
  }

  private correctSurroundingAutotiles(points: Point[], preview: boolean = false) {
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

    this.changeRegistry.addChanges(changeList);
  }

  public newChange() {
    this.changeRegistry.newChangeList();
  }

  public pencil(tileDraw: TileDraw) {
    const w = this.map.w,
      h = this.map.h,
      changeList = this.changeRegistry.getActiveChangeList()!,
      changeListStart = changeList.entries.length;

    for (const [i, drawData] of tileDraw.data.entries()) {
      const layer = this.map.layer[tileDraw.l],
        templateTileValue = packMapBuf(drawData.s, drawData.t),
        px = tileDraw.x + (i % tileDraw.w),
        py = tileDraw.y + (Math.floor(i / tileDraw.w)),
        tileValue = calculateTileValue(layer, this.map.tileset, px, py, w, h, templateTileValue);

      this.changeRegistry.addChanges([{
        x: px,
        y: py,
        l: tileDraw.l,
        t: templateTileValue,
        v: tileValue,
        pt: 0,
        pv: 0
      }]);
    }

    if (tileDraw.l === 0) { // Only correct surrounding tiles for first layer.  No auto-tiles on second layer for now
      this.correctSurroundingAutotiles(getAllTiles(tileDraw.x, tileDraw.y, tileDraw.w, tileDraw.h, w, h, tileDraw.l));
    }

    this.mapUpdate(changeList.entries.slice(changeListStart));
  }

  public fill(tileDraw: TileDraw) {
    const w = this.map.w,
      h = this.map.h;

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

            this.changeRegistry.addChanges([{
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

          this.correctSurroundingAutotiles(surroundingTiles);
        }
      }

      doFill(tileDraw.x, tileDraw.y, layer.templateData[tileDraw.y * w + tileDraw.x]);
    }

    this.mapUpdate();
  }

  public rectangle(tileDraw: TileDraw, drawTo: Point) {
    const w = this.map.w,
      h = this.map.h,
      layer = this.map.layer[tileDraw.l],
      rect = createRectFromPts({ x: tileDraw.x, y: tileDraw.y }, drawTo),
      lastChanges = this.changeRegistry.revertLastChangeList();

    this.changeRegistry.newChangeList();

    for (let y = rect.t; y < rect.b; y++) {
      for (let x = rect.l; x < rect.r; x++) {
        const templateTileValue = packMapBuf(tileDraw.data[0].s, tileDraw.data[0].t),
          tileValue = calculateTileValue(layer, this.map.tileset, x, y, w, h, templateTileValue);

        this.changeRegistry.addChanges([{
          x,
          y,
          l: tileDraw.l,
          v: tileValue,
          t: templateTileValue,
          pv: 0,
          pt: 0
        }]);
      }
    }

    if (tileDraw.l === 0) { // Only correct surrounding tiles for first layer.  No auto-tiles on second layer for now
      this.correctSurroundingAutotiles(getAllTiles(rect.l, rect.t, rect.r - rect.l, rect.b - rect.t, w, h, tileDraw.l));
    }

    /* Push the reverted changes from the last view of rectangle to the map editor to be drawn */
    if (lastChanges) {
      this.mapUpdate(lastChanges.entries);
    }

    this.mapUpdate(this.changeRegistry.getActiveChangeList()!.entries);
  }

  public async flushChanges(changes?: TileChange) {
    const serviceInterface = await getServiceInterface();
    if (changes) {
      serviceInterface.updateMap(changes);
    } else {
      serviceInterface.updateMap(this.changeRegistry.filterActiveChangeList()!);
    }
  }

  public undo() {
    const lastChanges = this.changeRegistry.revertLastChangeList();

    if (!lastChanges) {
      return;
    }

    this.flushChanges(lastChanges);
    this.mapUpdate(lastChanges.entries);
  }


}