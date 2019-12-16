<template>
  <div class="toolbar-group">
    <ToolbarButton
      v-for="item in items"
      :item="item"
      :type="type"
      :pressed="pressed == item.id"
      :key="item.id"
      @selected="selected"
    ></ToolbarButton>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import ToolbarButton from "./ToolbarButton.vue";

export interface ToolbarItem {
  id: number;
  label: String;
  icon: String;
}

@Component({
  components: {
    ToolbarButton
  }
})
export default class ToolbarGroup extends Vue {
  @Prop() items!: ToolbarItem[];
  @Prop() callback!: Function;
  @Prop() pressed!: number;
  @Prop() type!: string;

  public selected(item: ToolbarItem) {
    this.$emit("changed", item.id);
  }
}
</script>

<style scoped>
</style>
