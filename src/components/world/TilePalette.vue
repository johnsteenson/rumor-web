<template>
  <div class="tile-palette" @wheel="onWheel">
    <CanvasScrollport
      :scrollRect="scrollRect"
      :size="containerArea"
      :hideHScroll="hideHScroll"
      :hideVScroll="hideVScroll"
      @update="updateScrollRect"
    >
      <canvas
        class="drawable"
        @pointerdown="pointerDown"
        @pointermove="pointerMove"
        @pointerup="pointerUp"
        @contextmenu="contextMenu"
        width="1"
        height="1"
      ></canvas>
    </CanvasScrollport>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { TilesetView, ToolView } from "@/types/tileset";
import { Axis, TileSize, Rect, Point } from "@/types/geometry";
import TilesetBase from "./TilesetBase.vue";
import { TileSelection } from "../../types/map";

import { registerWindowEvent, unregisterWindowEvent } from "@/lib/windowEvent";

import CanvasScrollport from "@/components/ui/CanvasScrollport.vue";
import { getMouseCoor } from "../../canvas/utils";

const world = namespace("world");

const WHEEL_SCROLL_SPEED = 70;

@Component({
  components: {
    CanvasScrollport
  }
})
export default class TilePalette extends TilesetBase {
  private baseCoor = {} as Rect;
  private lastTilePt: Point = { x: -1, y: -1 };
  private isMouseDown: boolean = false;

  @Prop() protected toolView!: ToolView;

  @Watch("toolView", { immediate: true, deep: false }) toolChange(
    view: ToolView
  ) {
    this.$nextTick(() => {
      this.draw();
    });
  }

  public mounted() {
    // registerWindowEvent("wheel", this.onWheel.bind(this));
  }

  public beforeDestroy() {
    // unregisterWindowEvent("wheel");
  }

  public pointerDown(event: PointerEvent) {
    const mouse: Point = getMouseCoor(event, this.canvas),
      clickPt: Point = {
        x: mouse.x + this.scrollRect.innerL,
        y: mouse.y + this.scrollRect.innerT
      };

    this.lastTilePt.x = Math.floor(clickPt.x / this.tileSize.scaledW);
    this.lastTilePt.y = Math.floor(clickPt.y / this.tileSize.scaledH);

    this.baseCoor.l = this.lastTilePt.x;
    this.baseCoor.t = this.lastTilePt.y;
    this.baseCoor.r = this.baseCoor.l + 1;
    this.baseCoor.b = this.baseCoor.t + 1;

    const tileSelection = this.createSelectionFromRect(this.baseCoor);

    this.isMouseDown = true;

    this.$emit("tileSelected", tileSelection);
  }

  public pointerMove(event: PointerEvent) {
    event.preventDefault();
    if (this.isMouseDown) {
      const mouse: Point = getMouseCoor(event, this.canvas),
        clickPt: Point = {
          x: mouse.x + this.scrollRect.innerL,
          y: mouse.y + this.scrollRect.innerT
        },
        tilePt: Point = {
          x: Math.floor(clickPt.x / this.tileSize.scaledW),
          y: Math.floor(clickPt.y / this.tileSize.scaledH)
        },
        selCoor: Rect = { ...this.baseCoor };

      if (tilePt.x === this.lastTilePt.x && tilePt.y === this.lastTilePt.y) {
        return;
      }

      this.lastTilePt = { ...tilePt };

      if (tilePt.x > this.baseCoor.l) {
        selCoor.r = tilePt.x + 1;
      } else {
        selCoor.l = tilePt.x;
      }

      if (tilePt.y > this.baseCoor.t) {
        selCoor.b = tilePt.y + 1;
      } else {
        selCoor.t = tilePt.y;
      }

      const tileSelection = this.createSelectionFromRect(selCoor);
      this.$emit("tileSelected", tileSelection);
    }
  }

  public pointerUp(event: PointerEvent) {
    this.isMouseDown = false;

    if (event.button === 2) {
      event.preventDefault();
    }
  }

  public onWheel(event: WheelEvent) {
    if (event.deltaY > 0) {
      this.scrollViewport(0, WHEEL_SCROLL_SPEED);
    } else {
      this.scrollViewport(0, -WHEEL_SCROLL_SPEED);
    }
  }

  public contextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  public createSelectionFromRect(rect: Rect): TileSelection {
    const l = Math.floor(rect.l / this.tilesetView.tileSize.scaledW),
      t = Math.floor(rect.t / this.tilesetView.tileSize.scaledH),
      r = Math.floor(rect.r / this.tilesetView.tileSize.scaledW),
      b = Math.floor(rect.b / this.tilesetView.tileSize.scaledH),
      tileIndices = [];

    for (let y = rect.t; y < rect.b; y++) {
      for (let x = rect.l; x < rect.r; x++) {
        tileIndices.push(y * this.tilesPerRow + x);
      }
    }

    return {
      w: rect.r - rect.l,
      h: rect.b - rect.t,
      tileIndices,
      fromMap: false
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

    if (!this.toolView.tileSelection.fromMap) {
      const rect = this.getSelectionRect(this.toolView.tileSelection);
      this.drawSelectionRect(rect);
    }
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
