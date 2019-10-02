<template>
  <div
    :class="[pressed ? 'toolbar-button-pressed' : 'toolbar-button', 'toolbar-bg']"
    @click="selected"
  >
    <component :is="item.icon" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { ToolbarItem } from "./ToolbarGroup.vue";

import BrushIcon from "vue-material-design-icons/Brush.vue";
import FormatColorFillIcon from "vue-material-design-icons/FormatColorFill.vue";

@Component({
  components: {
    BrushIcon,
    FormatColorFillIcon
  }
})
export default class ToolbarButton extends Vue {
  @Prop() item!: ToolbarItem;
  @Prop() pressed!: boolean;

  public selected() {
    this.$emit("selected", this.item);
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
}

.toolbar-bg {
  background-color: #ccc;
}

.toolbar-bg:hover {
  background-color: #eee;
}

.toolbar-button-pressed {
  border-style: inset;
  border-width: 2px;
  display: inline;
  font-size: 1.4em;
  padding: 1px;
  margin: 0 2px;
}
</style>
