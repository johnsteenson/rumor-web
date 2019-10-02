<template>
  <Toolbar>
    <ToolbarGroup :items="items" :pressed="toolId" @changed="changed" />
  </Toolbar>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import Toolbar from "@/components/ui/Toolbar.vue";
import ToolbarGroup, { ToolbarItem } from "@/components/ui/ToolbarGroup.vue";

const world = namespace("world");

@Component({
  components: {
    Toolbar,
    ToolbarGroup
  }
})
export default class TileToolbar extends Vue {
  public items: ToolbarItem[] = [
    {
      id: 0,
      label: "Pencil",
      icon: "brush-icon"
    },
    {
      id: 1,
      label: "Fill",
      icon: "format-color-fill-icon"
    }
  ];

  @world.Action("setTool") setTool!: Function;
  @world.State("tool") toolId!: number;

  public changed(id: number) {
    console.log(`Select ${id}`);
    this.setTool(id);
  }
}
</script>

<style scoped>
.toolbar {
  width: 90%;
  border: #ddd 1px solid;
  padding: 10px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
  margin: 10px 15px;
}
</style>
