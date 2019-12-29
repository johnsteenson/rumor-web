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
import { TileSize, Rect, Point } from "@/types/geometry";
import { isRectEqual, createRectFromPts } from "@/lib/geometry";
import {
  MapView,
  TileChangeEntry,
  ToolType,
  TileDrawData,
  TileDraw,
  TileChange,
  TileSelection
} from "../../types/map";

import { namespace } from "vuex-class";

import MapBase from "./MapBase.vue";

import CanvasScrollport from "@/components/ui/CanvasScrollport.vue";
import { getMouseCoor } from "../../canvas/utils";

const world = namespace("world");

enum MapPointerMode {
  OFF = 0,
  DRAWING,
  SCROLLING,
  COPYING
}

const MAX_COPY_SIZE = 6;

@Component({
  components: { CanvasScrollport }
})
export default class MapEditor extends MapBase {
  private baseCoor!: Rect;

  private lastDrawTileCoor: Point = { x: -1, y: -1 };
  private startDrawTileCoor: Point = { x: -1, y: -1 };
  private lastHoverRect: Rect = { l: -1, r: -1, t: -1, b: -1 };

  private pointerMode: MapPointerMode = MapPointerMode.OFF;
  private showHoverRect: boolean = true;

  private created() {
    this.baseCoor = {} as Rect;
  }

  private applyDraw(tileDraw: TileDraw) {
    switch (this.toolView.tool) {
      case ToolType.PENCIL:
        this.mapStore.mapMutator.pencil(tileDraw);
        break;

      case ToolType.FILL:
        this.pointerMode = MapPointerMode.OFF;
        this.mapStore.mapMutator.fill(tileDraw);
        break;

      case ToolType.RECTANGLE:
        this.showHoverRect = false;
        this.mapStore.mapMutator.rectangle(tileDraw, this.startDrawTileCoor);
        break;
    }
  }

  private releaseTool() {
    switch (this.toolView.tool) {
      case ToolType.RECTANGLE:
        this.showHoverRect = true;
        break;
    }

    this.pointerMode = MapPointerMode.OFF;
    this.lastDrawTileCoor.x = -1;
    this.lastDrawTileCoor.y = -1;
    this.startDrawTileCoor.x = -1;
    this.startDrawTileCoor.y = -1;
  }

  private getSelectionCoorForMapCoor(
    baseX: number,
    baseY: number,
    selX: number,
    selY: number
  ): number {
    let shiftSelX =
        (baseX + selX - this.startDrawTileCoor.x) %
        this.toolView.tileSelection.w,
      shiftSelY =
        (baseY + selY - this.startDrawTileCoor.y) %
        this.toolView.tileSelection.h;

    /* Loop around to end of selection rect if moving negatively along axis (left or up) */
    if (shiftSelX < 0) {
      shiftSelX = this.toolView.tileSelection.w - Math.abs(shiftSelX);
    }

    if (shiftSelY < 0) {
      shiftSelY = this.toolView.tileSelection.h - Math.abs(shiftSelY);
    }

    return this.toolView.tileSelection.tileIndices[
      shiftSelY * this.toolView.tileSelection.w + shiftSelX
    ];
  }

  public drawSelectedTiles(event: PointerEvent) {
    const mouse = getMouseCoor(event, this.canvas),
      map = this.map,
      tilePt = this.canvasToTileCoor(mouse.x, mouse.y),
      section = this.tilesetView.tileset.sections[this.tilesetView.curSection],
      tileSelection = this.toolView.tileSelection;

    if (this.startDrawTileCoor.x === -1) {
      this.startDrawTileCoor.x = tilePt.x;
      this.startDrawTileCoor.y = tilePt.y;
    }

    if (
      this.lastDrawTileCoor.x === tilePt.x &&
      this.lastDrawTileCoor.y === tilePt.y
    ) {
      return;
    }

    this.lastDrawTileCoor.x = tilePt.x;
    this.lastDrawTileCoor.y = tilePt.y;

    /* TODO For now, redraw all the tiles when placing multiple tiles.  If it's too slow, I'll do a check to not 
       redraw any tiles inside of the last drawn rect */

    const changes: TileDrawData[] = [];

    for (let selY = 0; selY < tileSelection.h; selY++) {
      for (let selX = 0; selX < tileSelection.w; selX++) {
        const selTileIndex = this.getSelectionCoorForMapCoor(
          tilePt.x,
          tilePt.y,
          selX,
          selY
        );

        changes.push({
          s: this.tilesetView.curSection,
          t: selTileIndex
        });
      }
    }

    this.applyDraw({
      x: tilePt.x,
      y: tilePt.y,
      w: tileSelection.w,
      h: tileSelection.h,
      l: this.tilesetView.curLayer,
      data: changes
    });
  }

  public copySelectedTiles(event: PointerEvent) {
    const mouse = getMouseCoor(event, this.canvas),
      map = this.map,
      tilePt = this.canvasToTileCoor(mouse.x, mouse.y),
      section = this.tilesetView.tileset.sections[this.tilesetView.curSection];

    let tileSelection: TileSelection;

    if (this.startDrawTileCoor.x === -1) {
      this.startDrawTileCoor.x = tilePt.x;
      this.startDrawTileCoor.y = tilePt.y;
    }

    if (
      this.lastDrawTileCoor.x === tilePt.x &&
      this.lastDrawTileCoor.y === tilePt.y
    ) {
      return;
    }

    this.lastDrawTileCoor.x = tilePt.x;
    this.lastDrawTileCoor.y = tilePt.y;

    const copyRect = createRectFromPts(
        this.startDrawTileCoor,
        this.lastDrawTileCoor,
        MAX_COPY_SIZE
      ),
      tileIndices = [];

    for (let y = copyRect.t; y < copyRect.b; y++) {
      for (let x = copyRect.l; x < copyRect.r; x++) {
        const t = this.map.layer[this.tilesetView.curLayer].templateData[
          y * this.map.w + x
        ];
        tileIndices.push(t);
      }
    }

    tileSelection = {
      w: copyRect.r - copyRect.l,
      h: copyRect.b - copyRect.t,
      tileIndices: tileIndices,
      fromMap: true
    };

    this.$emit("tileSelected", tileSelection);
  }

  public drawHoverRect(event: PointerEvent) {
    const mouse = getMouseCoor(event, this.canvas),
      tilePt = this.canvasToTileCoor(mouse.x, mouse.y),
      tileSelection = this.toolView.tileSelection;

    let hoverRect: Rect;

    switch (this.pointerMode) {
      case MapPointerMode.COPYING:
        hoverRect = createRectFromPts(
          this.startDrawTileCoor,
          tilePt,
          MAX_COPY_SIZE
        );
        break;

      default:
        hoverRect = {
          l: tilePt.x,
          t: tilePt.y,
          r: tilePt.x + tileSelection.w,
          b: tilePt.y + tileSelection.h
        };
        break;
    }

    /* Don't redraw rect if it hasn't changed */
    if (isRectEqual(hoverRect, this.lastHoverRect)) {
      return;
    }

    if (this.lastHoverRect.l !== -1) {
      this.redrawRect(this.lastHoverRect);
    }

    this.redrawRect(hoverRect);
    this.drawSelectionRect(this.tileToCanvasRect(hoverRect));

    this.lastHoverRect = hoverRect;
  }

  public drawSelectionRect(rect: Rect) {
    const x = rect.l,
      y = rect.t,
      w = rect.r - rect.l,
      h = rect.b - rect.t;

    this.context.lineWidth = 1;
    this.context.strokeStyle = "#111111";
    this.context.strokeRect(x + 1, y + 1, w - 2, h - 2);
    this.context.strokeRect(x + 4, y + 4, w - 6, h - 6);
    this.context.strokeStyle = "#ffff55";
    this.context.strokeRect(x + 2, y + 2, w - 4, h - 4);
    this.context.strokeStyle = "#ffffff";
    this.context.strokeRect(x + 3, y + 3, w - 5, h - 5);
  }

  public pointerDown(event: PointerEvent) {
    switch (event.button) {
      case 0:
        this.pointerMode = MapPointerMode.DRAWING;
        this.mapStore.mapMutator.newChange();
        this.drawSelectedTiles(event);
        break;
      case 2:
        this.pointerMode = MapPointerMode.COPYING;
        this.copySelectedTiles(event);
        break;
    }

    this.refresh();
  }

  public pointerUp(event: PointerEvent) {
    this.releaseTool();
  }

  public pointerMove(event: PointerEvent) {
    switch (this.pointerMode) {
      case MapPointerMode.DRAWING:
        // Check for right-click undo
        if (event.buttons & 2) {
          this.releaseTool();
          this.mapStore.mapMutator.undo();
        } else {
          this.drawSelectedTiles(event);
        }

        break;

      case MapPointerMode.COPYING:
        this.copySelectedTiles(event);
        break;
    }

    if (this.showHoverRect) {
      this.drawHoverRect(event);
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
