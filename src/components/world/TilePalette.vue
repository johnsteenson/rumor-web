<template>
  <div>
    <canvas
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseup="mouseUp"
      @contextmenu="contextMenu"
      width="200"
      height="300"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { TilesetView } from "@/types/tileset";
import { TileSize, Rect } from "@/types/primitives";
import TilesetBase from "./TilesetBase.vue";
import { TileSelection } from "../../types/map";

const world = namespace("world");

@Component
export default class TilePalette extends TilesetBase {
  private baseCoor = {} as Rect;
  private isMouseDown: boolean = false;

  public mouseDown(event: MouseEvent) {
    const boundingRect = this.canvas.getBoundingClientRect(),
      xScale = this.canvas.width / (boundingRect.right - boundingRect.left),
      yScale = this.canvas.height / (boundingRect.bottom - boundingRect.top);

    this.baseCoor.l = (event.clientX - boundingRect.left) * xScale;
    this.baseCoor.t = (event.clientY - boundingRect.top) * yScale;
    this.baseCoor.r = this.baseCoor.l + this.tilesetView.tileSize.scaledW;
    this.baseCoor.b = this.baseCoor.t + this.tilesetView.tileSize.scaledH;

    const tileSelection = this.createSelectionFromRect(this.baseCoor);
    this.isMouseDown = true;

    this.$emit("tile-selected", tileSelection);
  }

  public mouseMove(event: MouseEvent) {
    if (this.mouseDown) {
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
    const w = rect.r - rect.l,
      h = rect.b - rect.t;

    this.context.lineWidth = 1;
    this.context.strokeStyle = "#111111";
    this.context.strokeRect(rect.l, rect.t, w, h);
    this.context.strokeRect(rect.l + 3, rect.t + 3, w - 4, h - 4);
    this.context.strokeStyle = "#ffff55";
    this.context.strokeRect(rect.l + 1, rect.t + 1, w - 2, h - 2);
    this.context.strokeStyle = "#ffffff";
    this.context.strokeRect(rect.l + 2, rect.t + 2, w - 3, h - 3);
  }

  public draw() {
    this.drawTiles();

    const rect = this.getSelectionRect(this.tilesetView.tileSelection);
    this.drawSelectionRect(rect);
  }
}
</script>

<style>
</style>
