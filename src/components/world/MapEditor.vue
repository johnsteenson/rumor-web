<template>
  <div class="map-base">
    <CanvasScrollport
      :scrollRect="scrollRect"
      :size="containerArea"
      :hideHScroll="hideHScroll"
      :hideVScroll="hideVScroll"
      @update="updateScrollRect"
    >
      <canvas
        @pointerdown="pointerDown"
        @pointermove="pointerMove"
        @pointerup="pointerUp"
        @contextmenu="contextMenu"
        width="400"
        height="300"
      ></canvas>
    </CanvasScrollport>
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
  TileDraw,
  TileChange
} from "../../types/map";

import { namespace } from "vuex-class";

import MapBase from "./MapBase.vue";

import CanvasScrollport from "@/components/ui/CanvasScrollport.vue";

const world = namespace("world");

@Component({
  components: { CanvasScrollport }
})
export default class MapEditor extends MapBase {
  private baseCoor!: Rect;
  private lastDrawCoor: Point = { x: -1, y: -1 };
  private startDrawCoor: Point = { x: -1, y: -1 };

  private isMouseDown: boolean = false;

  private created() {
    this.baseCoor = {} as Rect;
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

  private getSelectionCoorForMapCoor(
    baseX: number,
    baseY: number,
    selX: number,
    selY: number
  ): number {
    let shiftSelX =
        (baseX + selX - this.startDrawCoor.x) %
        this.tilesetView.tileSelection.w,
      shiftSelY =
        (baseY + selY - this.startDrawCoor.y) %
        this.tilesetView.tileSelection.h;

    /* Loop around to end of selection rect if moving negatively along axis (left or up) */
    if (shiftSelX < 0) {
      shiftSelX = this.tilesetView.tileSelection.w - Math.abs(shiftSelX);
    }

    if (shiftSelY < 0) {
      shiftSelY = this.tilesetView.tileSelection.h - Math.abs(shiftSelY);
    }

    return this.tilesetView.tileSelection.tileIndices[
      shiftSelY * this.tilesetView.tileSelection.w + shiftSelX
    ];
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
        Math.floor(this.baseCoor.l / this.tileSize.scaledW) +
        tileDrawRect.tile.l,
      y =
        Math.floor(this.baseCoor.t / this.tileSize.scaledH) +
        tileDrawRect.tile.t,
      section = this.tilesetView.tileset.sections[this.tilesetView.curSection],
      tileSelection = this.tilesetView.tileSelection;

    if (this.startDrawCoor.x === -1) {
      this.startDrawCoor.x = x;
      this.startDrawCoor.y = y;
    }

    if (this.lastDrawCoor.x === x && this.lastDrawCoor.y === y) {
      return;
    }

    /* TODO Make interpolation work with multiple tiles.  This may no longer be needed now that drawing has considerably
       sped up after only drawing the tiles changed */
    /*
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
          l: this.tilesetView.curLayer,
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
          l: this.tilesetView.curLayer,
          data: [
            {
              s: this.tilesetView.curSection,
              t: tileIndex
            }
          ]
        });
      }
    }
    */

    this.lastDrawCoor.x = x;
    this.lastDrawCoor.y = y;

    /* TODO For now, redraw all the tiles when placing multiple tiles.  If it's too slow, I'll do a check to not 
       redraw any tiles inside of the last drawn rect */

    const changes: TileDrawData[] = [];

    for (let selY = 0; selY < tileSelection.h; selY++) {
      for (let selX = 0; selX < tileSelection.w; selX++) {
        const selTileIndex = this.getSelectionCoorForMapCoor(x, y, selX, selY);

        changes.push({
          s: this.tilesetView.curSection,
          t: selTileIndex
        });
      }
    }

    this.applyDraw({
      x,
      y,
      w: tileSelection.w,
      h: tileSelection.h,
      l: this.tilesetView.curLayer,
      data: changes
    });
  }

  public pointerDown(event: PointerEvent) {
    switch (event.button) {
      case 0:
        /*
        if (this.clickScrollbars(event.clientX, event.clientY)) {
          this.drawMap();
          return;
        }
        */

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

  public pointerUp(event: PointerEvent) {
    this.isMouseDown = false;
    this.lastDrawCoor.x = -1;
    this.lastDrawCoor.y = -1;
    this.startDrawCoor.x = -1;
    this.startDrawCoor.y = -1;
  }

  public pointerMove(event: PointerEvent) {
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

<style scoped>
div.map-base {
  position: relative;
  width: 100%;
  height: 100%;
  /* overflow: hidden; */
  box-sizing: border-box;

  border: 1;
  border-style: groove solid;
  background: linear-gradient(#333, #555);
}

/*
canvas {
  width: calc(100% - 16px);
}
*/
</style>
