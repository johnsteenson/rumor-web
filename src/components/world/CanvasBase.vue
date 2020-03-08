<template>
  <div class="map-base">
    <canvas width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { TileSize, Rect, Point, Dimension, ScrollRect } from "@/types/geometry";

import {
  getLeftArrow,
  getRightArrow,
  getUpArrow,
  getDownArrow
} from "@/canvas/utils";

import { clampBetween } from "@/lib/utils";

import * as resizeHandler from "@/lib/resizeHandler";

const SCROLLBAR_WIDTH = 16;
const SCROLLBAR_OFFSET = 8;

@Component
export default class CanvasBase extends Vue {
  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;

  private scrollbarWidth: number = SCROLLBAR_WIDTH;

  protected drawArea: Dimension = {
    w: 0,
    h: 0
  };

  protected containerArea: Dimension = {
    w: 0,
    h: 0
  };

  private maxDrawArea: Dimension = {
    w: 9999,
    h: 9999
  };

  protected scrollRect: ScrollRect = {
    innerL: 0,
    innerR: 0,
    outerL: 0,
    outerR: 0,
    innerT: 0,
    outerT: 0,
    innerB: 0,
    outerB: 0
  };

  @Prop() protected hideHScroll!: boolean;

  @Prop() protected hideVScroll!: boolean;

  protected setMaxDrawArea(w: number, h: number) {
    this.maxDrawArea.w = w;
    this.maxDrawArea.h = h;
  }

  protected forceResizeEvent() {
    const el = this.$el,
      compStyles = window.getComputedStyle(el),
      boundingRect = el.getBoundingClientRect(),
      borderXOffset =
        parseFloat(compStyles.getPropertyValue("border-left-width")) +
        parseFloat(compStyles.getPropertyValue("border-right-width")),
      borderYOffset =
        parseFloat(compStyles.getPropertyValue("border-top-width")) +
        parseFloat(compStyles.getPropertyValue("border-bottom-width"));

    this.doResize(this.$el, {
      x: boundingRect.left,
      y: boundingRect.top,
      width: boundingRect.width - borderXOffset,
      height: boundingRect.height - borderYOffset
    } as DOMRect);
  }

  protected doResize(el: Element, rect: DOMRect) {
    const hScrollOffset = this.hideHScroll ? 0 : SCROLLBAR_WIDTH,
      vScrollOffset = this.hideVScroll ? 0 : SCROLLBAR_WIDTH,
      w = Math.floor(rect.width) - vScrollOffset,
      h = Math.floor(rect.height) - hScrollOffset;

    if (rect.width > this.maxDrawArea.w) {
      this.canvas.width = this.maxDrawArea.w;
      this.canvas.height = h * (this.canvas.width / this.canvas.clientWidth);
    } else {
      this.canvas.width = Math.floor(w);
      this.canvas.height = Math.floor(h);
    }

    this.drawArea.w = this.canvas.width;
    this.drawArea.h = this.canvas.height;

    this.containerArea = {
      w: this.canvas.clientWidth,
      h: h
    };

    this.scrollRect.innerR = this.scrollRect.innerL + this.drawArea.w;
    this.scrollRect.innerB = this.scrollRect.innerT + this.drawArea.h;

    this.clipViewport();
    this.onResize();
  }

  public mounted() {
    this.canvas = this.$el.getElementsByTagName(
      "canvas"
    )[0] as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    resizeHandler.add(this.$el, this.doResize.bind(this));

    this.$nextTick(() => {
      this.doResize.call(
        this,
        this.$el,
        this.$el.getBoundingClientRect() as DOMRect
      );
      /// this.$forceUpdate();
    });
  }

  // Because superclassing doesn't work properly, we are using an afterMount property
  protected afterMount() {}

  protected onResize() {}

  protected clipViewport() {
    this.scrollRect.innerL = clampBetween(
      this.scrollRect.innerL,
      this.scrollRect.outerL,
      this.scrollRect.outerR
    );
    this.scrollRect.innerR = clampBetween(
      this.scrollRect.innerR,
      this.scrollRect.outerL,
      this.scrollRect.outerR
    );
    this.scrollRect.innerT = clampBetween(
      this.scrollRect.innerT,
      this.scrollRect.outerT,
      this.scrollRect.outerB
    );
    this.scrollRect.innerB = clampBetween(
      this.scrollRect.innerB,
      this.scrollRect.outerT,
      this.scrollRect.outerB
    );
  }

  protected setViewport(viewport: Rect) {
    this.scrollRect.outerL = viewport.l;
    this.scrollRect.outerR = viewport.r;
    this.scrollRect.outerT = viewport.t;
    this.scrollRect.outerB = viewport.b;

    this.clipViewport();
    this.forceResizeEvent();
  }

  protected scrollViewport(xVal: number, yVal: number) {
    if (xVal !== 0) {
      const len = this.scrollRect.innerR - this.scrollRect.innerL;

      this.scrollRect.innerL = clampBetween(
        this.scrollRect.innerL + xVal,
        this.scrollRect.outerL,
        this.scrollRect.outerR - len
      );
      this.scrollRect.innerR = this.scrollRect.innerL + this.drawArea.w;
    }

    if (yVal !== 0) {
      const len = this.scrollRect.innerB - this.scrollRect.innerT;

      this.scrollRect.innerT = clampBetween(
        this.scrollRect.innerT + yVal,
        this.scrollRect.outerT,
        this.scrollRect.outerB - len
      );
      this.scrollRect.innerB = this.scrollRect.innerT + this.drawArea.h;
    }

    this.onResize();
  }

  protected scrollViewportTo(xVal: number, yVal: number) {
    this.scrollRect.innerL = xVal;
    this.scrollRect.innerT = yVal;

    const xLen = this.scrollRect.innerR - this.scrollRect.innerL;
    const yLen = this.scrollRect.innerB - this.scrollRect.innerT;

    this.scrollRect.innerL = clampBetween(
      this.scrollRect.innerL,
      this.scrollRect.outerL,
      this.scrollRect.outerR - xLen
    );
    this.scrollRect.innerR = this.scrollRect.innerL + this.drawArea.w;

    this.scrollRect.innerT = clampBetween(
      this.scrollRect.innerT,
      this.scrollRect.outerT,
      this.scrollRect.outerB - yLen
    );
    this.scrollRect.innerB = this.scrollRect.innerT + this.drawArea.h;

    this.onResize();
  }

  protected updateScrollRect(rect: ScrollRect) {
    this.scrollRect = {
      ...rect
    };

    this.onResize();
  }
}
</script>

<style scoped="false">
canvas {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
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
