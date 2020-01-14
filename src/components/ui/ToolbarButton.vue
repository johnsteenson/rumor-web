<template>
  <div :class="[classSet, 'toolbar-bg']" @pointerdown="selected" @pointerup="released">
    <component :is="item.icon" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { ToolbarItem } from "./ToolbarGroup.vue";

// Icons from: https://materialdesignicons.com/
import BrushIcon from "vue-material-design-icons/Brush.vue";
import FormatColorFillIcon from "vue-material-design-icons/FormatColorFill.vue";
import Numeric1BoxMultiple from "vue-material-design-icons/Numeric1BoxMultiple.vue";
import Numeric2BoxMultiple from "vue-material-design-icons/Numeric2BoxMultiple.vue";
import ShapeRectanglePlus from "vue-material-design-icons/ShapeRectanglePlus.vue";
import Undo from "vue-material-design-icons/Undo.vue";

@Component({
  components: {
    BrushIcon,
    FormatColorFillIcon,
    Numeric1BoxMultiple,
    Numeric2BoxMultiple,
    ShapeRectanglePlus,
    Undo
  }
})
export default class ToolbarButton extends Vue {
  @Prop() item!: ToolbarItem;
  @Prop() pressed!: boolean;
  @Prop({ default: "button" }) type!: String;

  get classSet(): any {
    switch (this.type) {
      case "tab":
        return {
          "toolbar-tab": true,
          "toolbar-tab-pressed": this.pressed
        };
        break;

      default:
        return {
          "toolbar-button": true,
          "toolbar-button-pressed": this.pressed
        };
        break;
    }
  }

  public selected() {
    this.$emit("selected", this.item);
  }

  public released() {
    this.$emit("released", this.item);
  }
}
</script>

<style scoped>
.toolbar-button {
  border-style: outset;
  border-width: 2px;
  display: inline;
  font-size: 1.4em;
  padding: 1px;
  margin: 0 2px;
  color: initial;
}

.toolbar-button-pressed {
  border-style: inset !important;
}

.toolbar-tab {
  position: relative;
  top: 1px;
  border-width: 2px 2px 0 2px;
  border-style: hidden;
  border-radius: 25% 25% 0 0;
  display: inline;
  font-size: 1.4em;
  padding: 2px;
  margin: 0 2px;
}

.toolbar-tab-pressed {
  border-style: outset !important;
}

.toolbar-bg {
  background-color: #ccc;
}

.toolbar-bg:hover {
  background-color: #eee;
}
</style>
