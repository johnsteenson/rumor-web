<template>
  <div class="map-base">
    <canvas
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseup="mouseUp"
      @contextmenu="contextMenu"
      width="400"
      height="300"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { TileSize, Rect, Point } from "@/types/primitives";
import {
  MapView,
  TileChangeEntry,
  ToolType,
  TileDrawData,
  TileDraw
} from "../../types/map";

import { namespace } from "vuex-class";

import MapBase from "./MapBase.vue";

const world = namespace("world");

@Component
export default class MapEditor extends MapBase {
  private baseCoor!: Rect;
  private lastDrawCoor!: Point;

  private isMouseDown!: boolean;

  private created() {
    this.baseCoor = {} as Rect;
    this.lastDrawCoor = { x: -1, y: -1 };
    this.isMouseDown = false;
  }

  private applyDraw(tileDraw: TileDraw) {
    switch (this.tilesetView.tool) {
      case ToolType.PENCIL:
        this.mapStore.mapMutator.pencil(tileDraw);
        break;

      case ToolType.FILL:
        this.isMouseDown = false;
        this.mapStore.mapMutator.fill(tileDraw);
        break;
    }
  }

  public async drawSelectedTiles(clientX: number, clientY: number) {
    const boundingRect = this.canvas.getBoundingClientRect(),
      xScale = (boundingRect.right - boundingRect.left) / this.canvas.width,
      yScale = (boundingRect.bottom - boundingRect.top) / this.canvas.height,
      map = this.map,
      tileDrawRect = this.calculateTileDrawRect(map, this.tileSize);

    this.baseCoor.l = clientX - boundingRect.left - this.mapOffset.x;
    this.baseCoor.t = clientY - boundingRect.top - this.mapOffset.y;
    this.baseCoor.r = 0;
    this.baseCoor.b = 0;

    const x =
        Math.floor(this.baseCoor.l / this.tileSize.scaledW) + tileDrawRect.l,
      y = Math.floor(this.baseCoor.t / this.tileSize.scaledH) + tileDrawRect.t,
      section = this.tilesetView.tileset.sections[this.tilesetView.curSection],
      tileIndex = this.tilesetView.tileSelection.tileIndices[0],
      templateTile = section.templateTiles[tileIndex],
      tile = section.tiles[tileIndex].t,
      tileDisplayIndex = Array.isArray(tile) ? tile[0] : tile;

    if (this.lastDrawCoor.x === x && this.lastDrawCoor.y === y) {
      return;
    }

    if (this.lastDrawCoor.x > -1 && Math.abs(this.lastDrawCoor.x - x) > 1) {
      for (
        let fx = Math.min(this.lastDrawCoor.x, x);
        fx < Math.max(this.lastDrawCoor.x, x);
        fx++
      ) {
        this.applyDraw({
          x: fx,
          y,
          w: 1,
          h: 1,
          l: 0,
          data: [
            {
              s: this.tilesetView.curSection,
              t: tileIndex
            }
          ]
        });
      }
    }

    if (this.lastDrawCoor.y > -1 && Math.abs(this.lastDrawCoor.y - y) > 1) {
      for (
        let fy = Math.min(this.lastDrawCoor.y, y);
        fy < Math.max(this.lastDrawCoor.y, y);
        fy++
      ) {
        this.applyDraw({
          x,
          y: fy,
          w: 1,
          h: 1,
          l: 0,
          data: [
            {
              s: this.tilesetView.curSection,
              t: tileIndex
            }
          ]
        });
      }
    }

    this.lastDrawCoor.x = x;
    this.lastDrawCoor.y = y;

    this.applyDraw({
      x,
      y,
      w: 1,
      h: 1,
      l: 0,
      data: [
        {
          s: this.tilesetView.curSection,
          t: tileIndex
        }
      ]
    });
  }

  public mouseDown(event: MouseEvent) {
    switch (event.button) {
      case 0:
        if (this.clickScrollbars(event.clientX, event.clientY)) {
          this.drawMap();
          return;
        }

        this.isMouseDown = true;
        this.mapStore.mapMutator.newChange();
        this.drawSelectedTiles(event.clientX, event.clientY);
        break;

      case 2:
        this.mapStore.mapMutator.undo();

        break;
    }

    this.refresh();
  }

  public mouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.lastDrawCoor.x = -1;
    this.lastDrawCoor.y = -1;
  }

  public mouseMove(event: MouseEvent) {
    if (this.isMouseDown) {
      /*
      console.log(
        `Mouse has moved to ${event.clientX},${
          event.clientY
        } at ${performance.now()}`
      );
      */
      this.drawSelectedTiles(event.clientX, event.clientY);
    }
  }

  public contextMenu(event: MouseEvent) {
    event.preventDefault();
  }
}
</script>

<style>
</style>
