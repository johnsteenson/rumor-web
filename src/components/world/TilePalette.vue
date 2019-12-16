<template>
  <div class="tile-palette">
    <CanvasScrollport
      :scrollRect="scrollRect"
      :size="containerArea"
      :hideHScroll="hideHScroll"
      :hideVScroll="hideVScroll"
      @update="updateScrollRect"
    >
      <canvas
        class="drawable"
        @mousedown="mouseDown"
        @mousemove="mouseMove"
        @mouseup="mouseUp"
        @contextmenu="contextMenu"
        width="1"
        height="1"
      ></canvas>
    </CanvasScrollport>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { TilesetView } from "@/types/tileset";
import { TileSize, Rect, Point } from "@/types/primitives";
import TilesetBase from "./TilesetBase.vue";
import { TileSelection } from "../../types/map";

import CanvasScrollport from "@/components/ui/CanvasScrollport.vue";
import { getMouseCoor } from "../../canvas/utils";

const world = namespace("world");

@Component({
  components: {
    CanvasScrollport
  }
})
export default class TilePalette extends TilesetBase {
  private baseCoor = {} as Rect;
  private isMouseDown: boolean = false;

  public mouseDown(event: MouseEvent) {
    const boundingRect = this.canvas.getBoundingClientRect(),
      xScale = this.canvas.width / (boundingRect.right - boundingRect.left),
      yScale = this.canvas.height / (boundingRect.bottom - boundingRect.top),
      mouse: Point = getMouseCoor(event, this.canvas);

    this.baseCoor.l = mouse.x * xScale + this.scrollRect.innerL;
    this.baseCoor.t = mouse.y * yScale + this.scrollRect.innerT;
    this.baseCoor.r = this.baseCoor.l + this.tilesetView.tileSize.scaledW;
    this.baseCoor.b = this.baseCoor.t + this.tilesetView.tileSize.scaledH;

    const tileSelection = this.createSelectionFromRect(this.baseCoor);
    this.isMouseDown = true;

    this.$emit("tile-selected", tileSelection);
  }

  public mouseMove(event: MouseEvent) {
    event.preventDefault();
    if (this.isMouseDown) {
      // TODO Add ability to select multiple tiles
    }
  }

  public mouseUp(event: MouseEvent) {
    this.isMouseDown = false;

    if (event.button === 2) {
      event.preventDefault();
    }
  }

  public contextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  public createSelectionFromRect(rect: Rect): TileSelection {
    // For now, select left and topmost tile only
    const l = Math.floor(rect.l / this.tilesetView.tileSize.scaledW),
      t = Math.floor(rect.t / this.tilesetView.tileSize.scaledH),
      r = Math.floor(rect.r / this.tilesetView.tileSize.scaledW),
      b = Math.floor(rect.b / this.tilesetView.tileSize.scaledH),
      tileIndices = [];

    for (let y = t; y < b; y++) {
      for (let x = l; x < r; x++) {
        tileIndices.push(y * this.tilesPerRow + x);
      }
    }

    return {
      w: r - l,
      h: b - t,
      tileIndices
    };
  }

  public getSelectionRect(selection: TileSelection): Rect {
    const firstTile = selection.tileIndices[0],
      tilesPerRow = this.section.tilesPerRow,
      x = firstTile % tilesPerRow,
      y = Math.floor(firstTile / tilesPerRow),
      tileSize: TileSize = this.tilesetView.tileSize;

    return {
      l: x * tileSize.scaledW,
      t: y * tileSize.scaledH,
      r: (x + selection.w) * tileSize.scaledW,
      b: (y + selection.h) * tileSize.scaledH
    };
  }

  public drawSelectionRect(rect: Rect) {
    const x = rect.l - this.scrollRect.innerL,
      y = rect.t - this.scrollRect.innerT,
      w = rect.r - rect.l,
      h = rect.b - rect.t;

    this.context.lineWidth = 1;
    this.context.strokeStyle = "#111111";
    this.context.strokeRect(x, y, w, h);
    this.context.strokeRect(x + 3, y + 3, w - 4, h - 4);
    this.context.strokeStyle = "#ffff55";
    this.context.strokeRect(x + 1, y + 1, w - 2, h - 2);
    this.context.strokeStyle = "#ffffff";
    this.context.strokeRect(x + 2, y + 2, w - 3, h - 3);
  }

  public draw() {
    this.drawTiles();

    const rect = this.getSelectionRect(this.tilesetView.tileSelection);
    this.drawSelectionRect(rect);
  }
}
</script>

<style scoped>
div.tile-palette {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  border: 1px;
  border-style: groove solid;
  box-sizing: border-box;
  padding: 0 0 0 0;
}

canvas {
  width: calc(100% - 16px);
}
</style>
