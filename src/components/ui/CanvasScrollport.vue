<template>
  <div class="canvas-container">
    <slot></slot>
    <canvas @pointerdown="clickVertical" class="vbar" width="16" height="16" v-if="!hideVScroll"></canvas>
    <canvas @pointerdown="clickHorizontal" class="hbar" width="16" height="16" v-if="!hideHScroll"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import { clampBetween } from "@/lib/utils";
import { namespace } from "vuex-class";
import { ScrollRect, Dimension, Point, Axis } from "@/types/geometry";

import {
  getLeftArrow,
  getRightArrow,
  getUpArrow,
  getDownArrow,
  getMouseCoor
} from "@/canvas/utils";

const SCROLLBAR_WIDTH = 16;
const SCROLLBAR_OFFSET = 8;

@Component
export default class CanvasScrollport extends Vue {
  private vCanvas!: HTMLCanvasElement;
  private hCanvas!: HTMLCanvasElement;

  private draggingAxis: Axis = Axis.HORIZONTAL;

  protected clickOrigin: number = 0;

  protected trackOrigin: number = 0;

  @Prop() scrollRect!: ScrollRect;

  @Prop() size!: Dimension;

  @Prop() hideVScroll!: boolean;

  @Prop() hideHScroll!: boolean;

  private dragEventFunc!: (evt: MouseEvent) => void;

  private releaseEventFunc!: (evt: MouseEvent) => void;

  private handleDragEvent = (instance: CanvasScrollport, event: MouseEvent) => {
    event.stopImmediatePropagation();
    event.preventDefault();

    const canvas =
        instance.draggingAxis == Axis.HORIZONTAL
          ? instance.hCanvas
          : instance.vCanvas,
      pt: Point = getMouseCoor(event, canvas);

    switch (instance.draggingAxis) {
      case Axis.HORIZONTAL:
        instance.scrollTo(
          instance.draggingAxis,
          instance.trackOrigin + (pt.x - instance.clickOrigin)
        );
        this.drawHorizontal();
        break;

      case Axis.VERTICAL:
        instance.scrollTo(
          instance.draggingAxis,
          instance.trackOrigin + (pt.y - instance.clickOrigin)
        );
        this.drawVertical();
        break;
    }
  };

  private handleReleaseEvent = (instance: CanvasScrollport) => {
    window.removeEventListener("pointermove", instance.dragEventFunc, true);
    window.removeEventListener("pointerup", instance.releaseEventFunc, true);
  };

  private toScrollbarCoor(axis: Axis, val: number): number {
    switch (axis) {
      case Axis.HORIZONTAL:
        return (
          (val / this.scrollRect.outerR) *
          (this.hCanvas.width - SCROLLBAR_WIDTH * 2)
        );
      case Axis.VERTICAL:
        return (
          (val / this.scrollRect.outerB) *
          (this.vCanvas.height - SCROLLBAR_WIDTH * 2)
        );
      default:
        return 0;
    }
  }

  private toViewportCoor(axis: Axis, val: number): number {
    switch (axis) {
      case Axis.HORIZONTAL:
        return (
          (val * this.scrollRect.outerR) /
          (this.hCanvas.width - SCROLLBAR_WIDTH * 2)
        );
      case Axis.VERTICAL:
        return (
          (val * this.scrollRect.outerB) /
          (this.vCanvas.height - SCROLLBAR_WIDTH * 2)
        );
      default:
        return 0;
    }
  }

  private scrollTo(axis: Axis, val: number) {
    const rect: ScrollRect = {
        ...this.scrollRect
      },
      viewportVal = this.toViewportCoor(axis, val);

    let len: number;

    switch (axis) {
      case Axis.HORIZONTAL:
        len = this.scrollRect.innerR - this.scrollRect.innerL;
        rect.innerL = clampBetween(
          viewportVal,
          0,
          this.scrollRect.outerR - len
        );
        rect.innerR = rect.innerL + len;
        break;

      case Axis.VERTICAL:
        len = this.scrollRect.innerB - this.scrollRect.innerT;
        rect.innerT = clampBetween(
          viewportVal,
          0,
          this.scrollRect.outerB - len
        );
        rect.innerB = rect.innerT + len;

        break;
    }
    this.updateScrollRect(rect);
  }

  @Emit("update")
  updateScrollRect(rect: ScrollRect) {
    return rect;
  }

  @Watch("scrollRect", { immediate: true, deep: true })
  onScrollPosChanged(scroll: ScrollRect) {
    this.$nextTick(() => {
      this.draw();
    });
  }

  @Watch("size", { immediate: true })
  onSizeChange(size: Dimension) {
    this.$nextTick(() => {
      if (!this.hideHScroll) {
        this.hCanvas.width = size.w + SCROLLBAR_WIDTH;
      }
      if (!this.hideVScroll) {
        this.vCanvas.height = size.h;
      }
      this.draw();
    });
  }

  public drawVertical() {
    if (!this.vCanvas) {
      return;
    }

    const context = this.vCanvas.getContext("2d") as CanvasRenderingContext2D,
      start = this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerT),
      end = this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerB);

    context.beginPath();
    context.fillStyle = "#f0f0f0";
    context.rect(0, 0, SCROLLBAR_WIDTH, this.size.h);
    context.fill();

    context.beginPath();
    context.fillStyle = "#b0b0b0";
    context.rect(0, start + SCROLLBAR_WIDTH, SCROLLBAR_WIDTH, end - start);
    context.fill();

    context.drawImage(getUpArrow(), 0, 0);

    context.drawImage(getDownArrow(), 0, this.size.h - SCROLLBAR_WIDTH);
  }

  public drawHorizontal() {
    if (!this.hCanvas) {
      return;
    }

    const context = this.hCanvas.getContext("2d") as CanvasRenderingContext2D,
      start = this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerL),
      end = this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerR);

    context.beginPath();
    context.fillStyle = "#f0f0f0";
    context.rect(0, 0, this.size.w, SCROLLBAR_WIDTH);
    context.fill();

    context.beginPath();
    context.rect(0, 0, this.hCanvas.width, SCROLLBAR_WIDTH);
    context.fill();

    context.beginPath();
    context.fillStyle = "#b0b0b0";
    context.rect(start + SCROLLBAR_WIDTH, 0, end - start, SCROLLBAR_WIDTH);
    context.fill();

    context.drawImage(getLeftArrow(), 0, 0);

    context.drawImage(getRightArrow(), this.size.w - SCROLLBAR_WIDTH, 0);
  }

  private handleClick(
    val: number,
    draggingAxis: Axis,
    start: number,
    end: number,
    scrollLen: number
  ) {
    const len = end - start,
      self = this;
    this.draggingAxis = draggingAxis;

    this.clickOrigin = val;
    this.trackOrigin = start;

    if (val < SCROLLBAR_WIDTH) {
      this.scrollTo(this.draggingAxis, start - SCROLLBAR_OFFSET);
    } else if (val > scrollLen) {
      this.scrollTo(this.draggingAxis, start + SCROLLBAR_OFFSET);
    } else {
      this.dragEventFunc = (evt: MouseEvent) => {
        self.handleDragEvent(self, evt);
      };

      this.releaseEventFunc = (evt: MouseEvent): void => {
        self.handleReleaseEvent(self);
      };

      window.addEventListener("pointerup", this.releaseEventFunc, true);
      window.addEventListener("pointermove", this.dragEventFunc, true);

      if (val < start || val > end) {
        this.trackOrigin = val - SCROLLBAR_OFFSET - len / 2;
        this.scrollTo(this.draggingAxis, Math.floor(this.trackOrigin));
      }
    }
  }

  public clickHorizontal(e: PointerEvent) {
    const pt: Point = getMouseCoor(e, this.hCanvas);

    this.handleClick(
      pt.x,
      Axis.HORIZONTAL,
      this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerL),
      this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerR),
      this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.outerR) +
        SCROLLBAR_WIDTH
    );
  }

  public clickVertical(e: PointerEvent) {
    const pt: Point = getMouseCoor(e, this.vCanvas);

    this.handleClick(
      pt.y,
      Axis.VERTICAL,
      this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerT),
      this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerB),
      this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.outerB) +
        SCROLLBAR_WIDTH
    );
  }

  public draw() {
    this.drawVertical();
    this.drawHorizontal();
  }

  public mounted() {
    this.vCanvas = this.$el.getElementsByClassName(
      "vbar"
    )[0] as HTMLCanvasElement;
    this.hCanvas = this.$el.getElementsByClassName(
      "hbar"
    )[0] as HTMLCanvasElement;

    this.onScrollPosChanged(this.scrollRect);
  }
}
</script>

<style scoped>
div.canvas-container {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  line-height: 0;
}

canvas.vbar {
  top: 0px;
  right: 0px;
}

canvas.hbar {
  left: 0;
  bottom: 0;
}
</style>
