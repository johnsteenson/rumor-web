<template>
  <div class="map-base">
    <canvas width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  TileSize,
  Rect,
  Point,
  Dimension,
  ScrollRect
} from "@/types/primitives";

import {
  getLeftArrow,
  getRightArrow,
  getUpArrow,
  getDownArrow
} from "@/canvas/utils";

import * as resizeHandler from "@/lib/resizeHandler";

const SCROLLBAR_WIDTH = 16;
const SCROLLBAR_OFFSET = 8;

@Component
export default class CanvasBase extends Vue {
  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;

  protected drawArea: Dimension = {
    w: 0,
    h: 0
  };

  protected viewport: Rect = {
    l: 0,
    t: 0,
    r: 0,
    b: 0
  };

  protected viewportOrigin: Rect = {
    l: 0,
    t: 0,
    r: 0,
    b: 0
  };

  protected visibleViewport: Rect = {
    l: 0,
    t: 0,
    r: 0,
    b: 0
  };

  protected clickOrigin: Point = {
    x: 0,
    y: 0
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

  private draggingAxis: number = 0;

  private dragEventFunc!: (evt: MouseEvent) => void;

  private releaseEventFunc!: (evt: MouseEvent) => void;

  private handleDragEvent = (instance: CanvasBase, event: MouseEvent) => {
    event.stopImmediatePropagation();
    const boundingRect = instance.canvas.getBoundingClientRect(),
      xPos = event.clientX - boundingRect.left,
      yPos = event.clientY - boundingRect.top;

    if (instance.draggingAxis === 1) {
      const scrollProjection = this.toViewportCoor(
        1,
        event.clientX - instance.clickOrigin.x
      );
      instance.scrollXTo(instance.viewportOrigin.l + scrollProjection);
    }

    if (instance.draggingAxis === 2) {
      const scrollProjection = this.toViewportCoor(
        2,
        event.clientY - instance.clickOrigin.y
      );
      instance.scrollYTo(instance.viewportOrigin.t + scrollProjection);
    }

    instance.onResize();
  };

  private handleReleaseEvent = (instance: CanvasBase) => {
    instance.draggingAxis = 0;

    window.removeEventListener("mousemove", instance.dragEventFunc, true);
    window.removeEventListener("mouseup", instance.releaseEventFunc, true);
  };

  private toViewportCoor(axis: number, val: number): number {
    switch (axis) {
      case 1:
        return (
          (val / (this.drawArea.w - SCROLLBAR_WIDTH * 2)) * this.viewport.r
        );
      case 2:
        return (
          (val / (this.drawArea.h - SCROLLBAR_WIDTH * 2)) * this.viewport.b
        );
      default:
        return 0;
    }
  }

  private toScrollbarCoor(axis: number, val: number): number {
    switch (axis) {
      case 1:
        return (
          (val / this.viewport.r) * (this.canvas.width - SCROLLBAR_WIDTH * 2)
        );
      case 2:
        return (
          (val / this.viewport.b) * (this.canvas.height - SCROLLBAR_WIDTH * 2)
        );
      default:
        return 0;
    }
  }

  public mounted() {
    this.canvas = this.$el.getElementsByTagName(
      "canvas"
    )[0] as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    resizeHandler.add(this.$el, (el: Element, rect: DOMRect) => {
      this.canvas.width = Math.floor(rect.width);
      this.canvas.height = Math.floor(rect.height);

      this.drawArea.w = this.canvas.width - SCROLLBAR_WIDTH;
      this.drawArea.h = this.canvas.height - SCROLLBAR_WIDTH;

      this.visibleViewport.r = this.visibleViewport.l + this.drawArea.w;
      this.visibleViewport.b = this.visibleViewport.t + this.drawArea.h;

      this.clipViewport();
      this.onResize();
    });

    this.$nextTick(() => {
      this.$forceUpdate();
    });
  }

  // Because superclassing doesn't work properly, we are using an afterMount property
  protected afterMount() {}

  protected onResize() {}

  protected clipViewport() {
    if (this.visibleViewport.l < 0) {
      this.visibleViewport.l = 0;
      this.visibleViewport.r = this.drawArea.w;
    } else if (this.visibleViewport.r > this.viewport.r) {
      this.visibleViewport.l = this.viewport.r - this.drawArea.w;
      this.visibleViewport.r = this.viewport.r;
    }
    if (this.visibleViewport.t < 0) {
      this.visibleViewport.t = 0;
      this.visibleViewport.b = this.drawArea.h;
    } else if (this.visibleViewport.b > this.viewport.b) {
      this.visibleViewport.t = this.viewport.b - this.drawArea.h;
      this.visibleViewport.b = this.viewport.b;
    }

    this.scrollRect.innerL = this.toScrollbarCoor(1, this.visibleViewport.l);
    this.scrollRect.innerR = this.toScrollbarCoor(1, this.visibleViewport.r);
    this.scrollRect.innerT = this.toScrollbarCoor(2, this.visibleViewport.t);
    this.scrollRect.innerB = this.toScrollbarCoor(2, this.visibleViewport.b);
  }

  protected setViewport(viewport: Rect) {
    this.viewport = viewport;

    this.clipViewport();
    this.onResize();
  }

  protected scrollXTo(val: number) {
    this.visibleViewport.l = val;
    this.visibleViewport.r = val + this.drawArea.w;
    this.clipViewport();
  }

  protected scrollYTo(val: number) {
    this.visibleViewport.t = val;
    this.visibleViewport.b = val + this.drawArea.h;
    this.clipViewport();
  }

  public clickScrollbars(x: number, y: number): boolean {
    const boundingRect = this.canvas.getBoundingClientRect(),
      mouseX = x - boundingRect.left,
      mouseY = y - boundingRect.top,
      self = this,
      xInScroll = mouseX >= this.drawArea.w,
      yInScroll = mouseY >= this.drawArea.h;

    if (xInScroll === yInScroll) {
      return false;
    }

    this.clickOrigin.x = x;
    this.clickOrigin.y = y;
    Object.assign(this.viewportOrigin, this.visibleViewport);

    this.dragEventFunc = (evt: MouseEvent) => {
      self.handleDragEvent(self, evt);
    };

    this.releaseEventFunc = (evt: MouseEvent): void => {
      self.handleReleaseEvent(self);
    };

    window.addEventListener("mousemove", this.dragEventFunc, true);
    window.addEventListener("mouseup", this.releaseEventFunc, true);

    if (mouseY >= this.drawArea.h) {
      if (mouseX < SCROLLBAR_WIDTH) {
        this.scrollXTo(this.visibleViewport.l - 16);
        return true;
      } else if (mouseX > this.canvas.width - SCROLLBAR_WIDTH * 2) {
        this.scrollXTo(this.visibleViewport.l + 16);
        return true;
      }
      this.draggingAxis = 1;

      if (mouseX < this.scrollRect.innerL || mouseX > this.scrollRect.innerR) {
        const warpCoor = this.toViewportCoor(
          1,
          mouseX - this.scrollRect.outerR / 2
        );
        this.viewportOrigin.l = warpCoor;
        this.scrollXTo(warpCoor);
      }
    }

    if (mouseX >= this.drawArea.w) {
      if (mouseY < SCROLLBAR_WIDTH) {
        this.scrollYTo(this.visibleViewport.t - 16);
        return true;
      } else if (mouseY > this.canvas.height - SCROLLBAR_WIDTH * 2) {
        this.scrollYTo(this.visibleViewport.t + 16);
        return true;
      }
      this.draggingAxis = 2;

      if (mouseY < this.scrollRect.innerT || mouseY > this.scrollRect.innerB) {
        const warpCoor = this.toViewportCoor(
          2,
          mouseY - this.scrollRect.outerB / 2
        );
        this.viewportOrigin.t = warpCoor;
        this.scrollYTo(warpCoor);
      }
    }

    return true;
  }

  public releaseScrollbars(): boolean {
    if (this.draggingAxis) {
      this.draggingAxis = 0;
      return true;
    }

    return false;
  }

  public drawScrollbars() {
    this.scrollRect.outerR = this.toScrollbarCoor(1, this.drawArea.w);
    this.scrollRect.outerB = this.toScrollbarCoor(2, this.drawArea.h);

    this.context.beginPath();
    this.context.fillStyle = "#f0f0f0";
    this.context.rect(
      0,
      this.canvas.height - SCROLLBAR_WIDTH,
      this.canvas.width,
      SCROLLBAR_WIDTH
    );
    this.context.rect(
      this.canvas.width - SCROLLBAR_WIDTH,
      0,
      SCROLLBAR_WIDTH,
      this.canvas.height
    );
    this.context.fill();

    this.context.beginPath();
    this.context.fillStyle = "#b0b0b0";
    this.context.rect(
      this.scrollRect.innerL + SCROLLBAR_WIDTH,
      this.canvas.height - SCROLLBAR_WIDTH,
      this.scrollRect.outerR,
      SCROLLBAR_WIDTH
    );
    this.context.fill();

    this.context.rect(
      this.canvas.width - SCROLLBAR_WIDTH,
      this.scrollRect.innerT + SCROLLBAR_WIDTH,
      SCROLLBAR_WIDTH,
      this.scrollRect.outerB
    );
    this.context.fill();

    this.context.drawImage(
      getLeftArrow(),
      0,
      this.canvas.height - SCROLLBAR_WIDTH
    );

    this.context.drawImage(
      getRightArrow(),
      this.canvas.width - SCROLLBAR_WIDTH * 2,
      this.canvas.height - SCROLLBAR_WIDTH
    );

    this.context.drawImage(
      getUpArrow(),
      this.canvas.width - SCROLLBAR_WIDTH,
      0
    );

    this.context.drawImage(
      getDownArrow(),
      this.canvas.width - SCROLLBAR_WIDTH,
      this.canvas.height - SCROLLBAR_WIDTH * 2
    );
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
