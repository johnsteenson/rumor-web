<template>
  <div class="map-base">
    <canvas width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { ImageManager } from "@/canvas/imageManager";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { TileSize, Rect, Point } from "@/types/primitives";
import { MapView, TileMap } from "../../types/map";

import { namespace } from "vuex-class";
import { TileImage } from "../../canvas/tileImage";
import { Tileset, TilesetSection, Tile } from "../../types/tileset";

import * as resizeHandler from "@/lib/resizeHandler";
import { unpackMapBuf } from "../../lib/world/tilemap";
import { getFirstTile } from "../../lib/world/tileset";
import { throttle } from "lodash";
const world = namespace("world");

@Component
export default class MapBase extends Vue {
  @Prop() protected mapView!: MapView;

  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;
  protected image!: TileImage[];
  protected tileset!: Tileset;
  protected tileSize!: TileSize;
  protected mapOffset!: Point;
  protected map!: TileMap;

  protected callResize: Function = throttle((w: number, h: number) => {
    this.canvas.width = w;
    this.canvas.height = h;
  }, 300);

  public mounted() {
    this.canvas = this.$el.getElementsByTagName(
      "canvas"
    )[0] as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    /*
    const resizeHandler = () => {
      const rect = this.$el.getBoundingClientRect();

      this.canvas.width = rect.width;
      this.canvas.height = rect.height;

      this.drawMap();
    };
    */

    resizeHandler.add(this.$el, (el: Element, rect: DOMRect) => {
      console.log(rect);

      //      this.callResize(Math.floor(rect.width), Math.floor(rect.height));
      this.canvas.width = Math.floor(rect.width);
      this.canvas.height = Math.floor(rect.height);

      this.drawMap();
    });
    // addResizeHandler(resizeHandler);

    // setTimeout(resizeHandler, 100); // Temporary stopgap since this is called before box is properly sized

    this.$nextTick(() => {
      this.$forceUpdate();
    });
  }

  @Watch("mapView.tileset", { immediate: true, deep: true }) tilesetChange(
    tileset: Tileset
  ) {
    this.tileset = tileset;
    this.refreshTilesetImage();
  }

  @Watch("mapView.tileSize", { immediate: true, deep: true }) tileSizeChange(
    tileSize: TileSize
  ) {
    this.tileSize = tileSize;
    this.refreshTilesetImage();
  }

  @Watch("mapView.map", { immediate: true, deep: true }) mapViewChange(
    map: TileMap
  ) {
    this.map = map;
    this.drawMap();
  }

  protected refresh() {
    this.$nextTick(() => {
      this.$forceUpdate();
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
      x: offset.x > 0 ? offset.x : 0,
      y: offset.y > 0 ? offset.y : 0
    };
  }

  public drawMap() {
    if (!this.map || !this.image || !this.tileSize) {
      return;
    }

    const map = this.map,
      tileSize = this.tileSize;

    this.mapOffset = this.calculateCenterCoorOffset();

    let x: number = 0,
      y: number = 0,
      k: number = 0,
      sx: number = this.mapOffset.x,
      sy: number = this.mapOffset.y,
      mapBuf: number,
      mapVal: number[],
      tileIndex: number,
      sectionNum: number,
      tile: Tile;

    for (y = 0; y < map.h; y++) {
      for (x = 0; x < map.w; x++) {
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
  }
}
</script>

<style scoped="false">
canvas {
  position: absolute;
}

div.map-base {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 100%;
  min-height: 100%;

  border: 1;
  border-style: groove solid;
  background: linear-gradient(#333, #555);
}
</style>
