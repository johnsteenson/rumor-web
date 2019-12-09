<template>
  <div class="map-base">
    <canvas width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { ImageManager } from "@/canvas/imageManager";
import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { TileSize, Rect, Point } from "@/types/primitives";
import { MapView, TileMap, TileChange, TileChangeEntry } from "../../types/map";

import { namespace } from "vuex-class";
import { TileImage } from "../../canvas/tileImage";
import {
  Tileset,
  TilesetSection,
  Tile,
  TilesetView
} from "../../types/tileset";

import * as resizeHandler from "@/lib/resizeHandler";
import { unpackMapBuf } from "../../lib/world/tilemap";
import { getFirstTile } from "../../lib/world/tileset";
import { throttle } from "lodash";

import CanvasBase from "./CanvasBase.vue";

import { MapStore } from "@/world/map";

const world = namespace("world");

@Component
export default class MapBase extends CanvasBase {
  @Prop() protected tilesetView!: TilesetView;
  @Prop() protected useMap!: TileMap;
  @Prop() protected useMapStore!: boolean;

  @Inject("mapStore") protected mapStore!: MapStore;

  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;
  protected image!: TileImage[];
  protected tileset!: Tileset;
  protected tileSize!: TileSize;
  protected mapOffset!: Point;
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
          this.drawMap();
          this.refreshViewport();
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

  protected onResize() {
    this.drawMap();
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

  public calculateTileDrawRect(map: TileMap, tileSize: TileSize): Rect {
    const tileDrawRect: Rect = {
      l: Math.floor(this.scrollRect.innerL / this.tileSize.scaledW),
      r: Math.ceil(this.scrollRect.innerR / this.tileSize.scaledW),
      t: Math.floor(this.scrollRect.innerT / this.tileSize.scaledH),
      b: Math.ceil(this.scrollRect.innerB / this.tileSize.scaledH)
    };

    if (tileDrawRect.r > map.w) {
      tileDrawRect.r = map.w;
    }
    if (tileDrawRect.b > map.h) {
      tileDrawRect.b = map.h;
    }

    return tileDrawRect;
  }

  public drawTiles(tileChanges: TileChangeEntry[]) {
    if (!this.map || !this.image || !this.tileSize) {
      return;
    }

    const map = this.map,
      tileSize = this.tileSize;

    this.mapOffset = this.calculateCenterCoorOffset();

    let tileDrawRect: Rect = this.calculateTileDrawRect(map, tileSize),
      k: number = 0,
      sx: number = this.mapOffset.x,
      sy: number = this.mapOffset.y,
      mapBuf: number,
      mapVal: number[],
      tileIndex: number,
      sectionNum: number,
      tile: Tile;

    for (const entry of tileChanges) {
      if (
        entry.x < tileDrawRect.l ||
        entry.x > tileDrawRect.r ||
        entry.y < tileDrawRect.t ||
        entry.y > tileDrawRect.b
      ) {
        continue;
      }

      mapBuf = map.layer[0].visibleData[entry.y * map.w + entry.x];
      mapVal = unpackMapBuf(mapBuf);

      tile = this.tileset.sections[mapVal[0]].tiles[mapVal[1]];

      const x = entry.x - tileDrawRect.l,
        y = entry.y - tileDrawRect.t;

      if (Array.isArray(tile.t)) {
        const len: number = tile.flen || tile.t.length;
        let quarter: number = tile.quarter || 255;

        for (k = 0; k < len; k++) {
          this.image[mapVal[0]].drawSubTiles(
            this.context,
            this.mapOffset.x + x * tileSize.scaledW,
            this.mapOffset.y + y * tileSize.scaledH,
            tile.t[k],
            quarter
          );
          quarter = quarter >> 4;
        }
      } else {
        this.image[mapVal[0]].drawTile(
          this.context,
          this.mapOffset.x + x * tileSize.scaledW,
          this.mapOffset.y + y * tileSize.scaledH,
          tile.t as number
        );
        // this.image!.drawTile(this.context, sx, sy, tile.t as number);
      }
    }

    // this.drawScrollbars();
    // });
  }

  public drawMap() {
    if (!this.map || !this.image || !this.tileSize) {
      return;
    }

    window.requestAnimationFrame(() => {
      const map = this.map,
        tileSize = this.tileSize;

      this.mapOffset = this.calculateCenterCoorOffset();

      let x: number = 0,
        y: number = 0,
        tileDrawRect: Rect = this.calculateTileDrawRect(map, tileSize),
        k: number = 0,
        sx: number = this.mapOffset.x,
        sy: number = this.mapOffset.y,
        mapBuf: number,
        mapVal: number[],
        tileIndex: number,
        sectionNum: number,
        tile: Tile;

      for (y = tileDrawRect.t; y < tileDrawRect.b; y++) {
        for (x = tileDrawRect.l; x < tileDrawRect.r; x++) {
          mapBuf = map.layer[0].visibleData[y * map.w + x];
          mapVal = unpackMapBuf(mapBuf);

          tile = this.tileset.sections[mapVal[0]].tiles[mapVal[1]];

          if (Array.isArray(tile.t)) {
            const len: number = tile.flen || tile.t.length;
            let quarter: number = tile.quarter || 255;

            for (k = 0; k < len; k++) {
              this.image[mapVal[0]].drawSubTiles(
                this.context,
                sx,
                sy,
                tile.t[k],
                quarter
              );
              quarter = quarter >> 4;
            }
          } else {
            this.image[mapVal[0]].drawTile(
              this.context,
              sx,
              sy,
              tile.t as number
            );
            // this.image!.drawTile(this.context, sx, sy, tile.t as number);
          }

          //tileIndex = getFirstTile(this.tileset.sections[0].tiles[mapVal[1]].t);

          //this.image[ mapVal[0] ].drawTile(this.context, sx, sy, tileIndex);
          sx = sx + tileSize.scaledW;
        }
        sx = this.mapOffset.x;
        sy = sy + tileSize.scaledH;
      }

      // this.drawScrollbars();
    });
  }
}
</script>

<style scoped="false">
</style>
