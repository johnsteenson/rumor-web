<template>
  <div class="map-base">
    <canvas width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { ImageManager } from "@/canvas/imageManager";
import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { TileSize, Rect, Point, TileDrawRect } from "@/types/geometry";
import {
  MapView,
  TileMap,
  TileChange,
  TileChangeEntry,
  TileDraw
} from "../../types/map";

import { namespace } from "vuex-class";
import { TileImage } from "../../canvas/tileImage";
import {
  Tileset,
  TilesetSection,
  Tile,
  TilesetView,
  ToolView
} from "../../types/tileset";

import * as resizeHandler from "@/lib/resizeHandler";
import { unpackMapBuf } from "../../lib/world/tilemap";
import { getFirstTile } from "../../lib/world/tileset";
import { throttle } from "lodash";

import CanvasBase from "./CanvasBase.vue";

import { MapStore } from "@/world/map";

const world = namespace("world");

const MAX_LAYER = 2; // hardcoded for now

@Component
export default class MapBase extends CanvasBase {
  @Prop() protected tilesetView!: TilesetView;
  @Prop() protected toolView!: ToolView;
  @Prop() protected useMap!: TileMap;
  @Prop() protected useMapStore!: boolean;

  @Inject("mapStore") protected mapStore!: MapStore;

  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;
  protected image!: TileImage[];
  protected tileset!: Tileset;
  protected tileSize!: TileSize;

  protected mapOffset!: Point;
  protected tileDrawRect!: TileDrawRect;

  protected mapViewport!: Rect;
  protected visibleViewport!: Rect;
  protected map!: TileMap;

  /*
  public mounted() {
    this.canvas = this.$el.getElementsByTagName(
      "canvas"
    )[0] as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    resizeHandler.add(this.$el, (el: Element, rect: DOMRect) => {
      this.canvas.width = Math.floor(rect.width);
      this.canvas.height = Math.floor(rect.height);

      this.drawMap();
    });

    this.$nextTick(() => {
      this.$forceUpdate();
    });
  }
*/

  @Watch("tilesetView.tileset", { immediate: true, deep: true }) tilesetChange(
    tileset: Tileset
  ) {
    this.tileset = tileset;
    this.refreshTilesetImage();
    this.refreshViewport();
  }

  @Watch("tilesetView.tileSize", { immediate: true, deep: true })
  tileSizeChange(tileSize: TileSize) {
    this.tileSize = tileSize;
    this.refreshTilesetImage();
    this.refreshViewport();
  }

  @Watch("useMap", { immediate: true, deep: false }) useMapChange(
    map: TileMap
  ) {
    this.map = map;
    this.drawMap();
    this.refreshViewport();
  }

  @Watch("useMapStore", { immediate: true, deep: false }) useMapStoreChange(
    useMapStore: boolean
  ) {
    if (useMapStore) {
      this.$nextTick(() => {
        this.mapStore.onMapChange((map: TileMap) => {
          this.map = map;
          this.refreshViewport();
          this.scrollViewportTo(0, 0);
          this.updateCoordinates();
          this.drawMap();
        });

        this.mapStore.onMapUpdate((tileChange?: TileChangeEntry[]) => {
          if (tileChange) {
            this.drawTiles(tileChange);
          } else {
            this.drawMap();
          }
        });
      });
    }
  }

  protected refresh() {
    this.$nextTick(() => {
      this.$forceUpdate();
    });
  }

  protected updateCoordinates() {
    this.mapOffset = this.calculateCenterCoorOffset();
    this.tileDrawRect = this.calculateTileDrawRect(this.map, this.tileSize);
  }

  protected onResize() {
    this.$nextTick(() => {
      this.updateCoordinates();
      this.drawMap();
    });
  }

  protected refreshViewport() {
    if (!this.canvas || !this.map || !this.tileset || !this.tileSize) {
      return;
    }

    this.setViewport({
      l: 0,
      r: this.map.w * this.tileSize.scaledW,
      t: 0,
      b: this.map.h * this.tileSize.scaledH
    });
  }

  protected async refreshTilesetImage() {
    if (!this.tileset || !this.tileSize) {
      return;
    }

    const mapSectionsToImage = async (section: TilesetSection) => {
      return await ImageManager.getInstance().getTileImage(
        `/images/${section.imageFile}`,
        this.tileSize
      );
    };

    this.image = await Promise.all(
      this.tileset.sections.map((section: TilesetSection) =>
        mapSectionsToImage(section)
      )
    );

    this.drawMap();
  }

  public calculateCenterCoorOffset(): Point {
    const boundingRect = this.canvas.getBoundingClientRect();

    const widgetCenterCoor: Point = {
      x: (boundingRect.right - boundingRect.left) / 2,
      y: (boundingRect.bottom - boundingRect.top) / 2
    };

    const mapCenterCoor: Point = {
      x: (this.map.w * this.tileSize.scaledW) / 2,
      y: (this.map.h * this.tileSize.scaledH) / 2
    };

    const offset: Point = {
      x: widgetCenterCoor.x - mapCenterCoor.x,
      y: widgetCenterCoor.y - mapCenterCoor.y
    };

    return {
      x: offset.x > 0 ? Math.floor(offset.x) : 0,
      y: offset.y > 0 ? Math.floor(offset.y) : 0
    };
  }

  public tileToCanvasCoor(x: number, y: number): Point {
    return {
      x:
        this.mapOffset.x +
        (x - this.tileDrawRect.tile.l) * this.tileSize.scaledW,
      y:
        this.mapOffset.y +
        (y - this.tileDrawRect.tile.t) * this.tileSize.scaledH
    };
  }

  public canvasToTileCoor(x: number, y: number): Point {
    return {
      x:
        Math.floor((x - this.mapOffset.x) / this.tileSize.scaledW) +
        this.tileDrawRect.tile.l,
      y:
        Math.floor((y - this.mapOffset.y) / this.tileSize.scaledH) +
        this.tileDrawRect.tile.t
    };
  }

  public tileToCanvasRect(rect: Rect): Rect {
    return {
      l:
        this.mapOffset.x +
        (rect.l - this.tileDrawRect.tile.l) * this.tileSize.scaledW,
      t:
        this.mapOffset.y +
        (rect.t - this.tileDrawRect.tile.t) * this.tileSize.scaledH,
      r:
        this.mapOffset.x +
        (rect.r - this.tileDrawRect.tile.l) * this.tileSize.scaledW,
      b:
        this.mapOffset.y +
        (rect.b - this.tileDrawRect.tile.t) * this.tileSize.scaledH
    };
  }

  public calculateTileDrawRect(map: TileMap, tileSize: TileSize): TileDrawRect {
    const rect: Rect = {
      l: Math.floor(this.scrollRect.innerL / this.tileSize.scaledW),
      r: Math.ceil(this.scrollRect.innerR / this.tileSize.scaledW),
      t: Math.floor(this.scrollRect.innerT / this.tileSize.scaledH),
      b: Math.ceil(this.scrollRect.innerB / this.tileSize.scaledH)
    };

    if (rect.r > map.w) {
      rect.r = map.w;
    }
    if (rect.b > map.h) {
      rect.b = map.h;
    }

    return { tile: rect, offset: { x: 0, y: 0 } };
  }

  protected drawTile(
    sectionId: number,
    tileId: number,
    sx: number,
    sy: number
  ) {
    try {
      const tile = this.tileset.sections[sectionId].tiles[tileId];

      if (Array.isArray(tile.t)) {
        const len: number = tile.flen || tile.t.length;
        let quarter: number = tile.quarter || 255;

        for (let k = 0; k < len; k++) {
          this.image[sectionId].drawSubTiles(
            this.context,
            sx,
            sy,
            tile.t[k],
            quarter
          );
          quarter = quarter >> 4;
        }
      } else {
        this.image[sectionId].drawTile(this.context, sx, sy, tile.t as number);
      }
    } catch (error) {
      console.log(
        "ERROR DRAWING TILE: ",
        this.image,
        sectionId,
        tileId,
        sx,
        sy
      );
      console.error(error);
    }
  }

  protected redrawRect(rect: Rect) {
    if (!this.map || !this.image || !this.tileSize) {
      return;
    }

    let x: number = 0,
      y: number = 0,
      l: number = 0,
      startPt: Point = this.tileToCanvasCoor(rect.l, rect.t),
      sx: number = startPt.x,
      sy: number = startPt.y,
      map: TileMap = this.map,
      mapBuf: number,
      mapVal: number[];

    for (y = rect.t; y < rect.b; y++) {
      for (x = rect.l; x < rect.r; x++) {
        for (l = 0; l < MAX_LAYER; l++) {
          mapBuf = map.layer[l].visibleData[y * map.w + x];
          mapVal = unpackMapBuf(mapBuf);

          /* Don't draw tile if it's an empty tile */
          if (l > 0 && mapVal[1] === 0) {
            continue;
          }

          if (l >= 1) {
          }
          if (l < 1 || mapVal[1] !== 0) {
            this.drawTile(mapVal[0], mapVal[1], sx, sy);
          }
        }

        sx = sx + this.tileSize.scaledW;
      }
      sx = startPt.x;
      sy = sy + this.tileSize.scaledH;
    }
  }

  protected drawTiles(tileChanges: TileChangeEntry[]) {
    if (!this.map || !this.image || !this.tileSize) {
      return;
    }

    const map = this.map,
      tileSize = this.tileSize;

    this.mapOffset = this.calculateCenterCoorOffset();
    this.tileDrawRect = this.calculateTileDrawRect(map, tileSize);

    let tileDrawRect: TileDrawRect = this.calculateTileDrawRect(map, tileSize),
      rect = tileDrawRect.tile,
      k = 0,
      l = 0,
      sx: number = this.mapOffset.x,
      sy: number = this.mapOffset.y,
      mapBuf: number,
      mapVal: number[],
      tileIndex: number,
      sectionNum: number;

    for (const entry of tileChanges) {
      if (
        entry.x < rect.l ||
        entry.x > rect.r ||
        entry.y < rect.t ||
        entry.y > rect.b
      ) {
        continue;
      }

      const drawPt = this.tileToCanvasCoor(entry.x, entry.y);

      for (l = 0; l < MAX_LAYER; l++) {
        mapBuf = map.layer[l].visibleData[entry.y * map.w + entry.x];
        mapVal = unpackMapBuf(mapBuf);

        this.drawTile(mapVal[0], mapVal[1], drawPt.x, drawPt.y);
      }
    }
  }

  public drawMap() {
    if (!this.map || !this.image || !this.tileSize) {
      return;
    }

    const map = this.map,
      tileSize = this.tileSize;

    this.tileDrawRect = this.calculateTileDrawRect(map, tileSize);
    this.mapOffset = this.calculateCenterCoorOffset();

    this.redrawRect(this.tileDrawRect.tile);
  }
}
</script>

<style scoped="false">
</style>
