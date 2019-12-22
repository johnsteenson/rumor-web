<template>
  <Toolbar>
    <div class="toolbar-contents">
      <div class>
        <ToolbarGroup type="button" :items="items" :pressed="toolId" @changed="changeTool" />
      </div>

      <div class>
        <ToolbarGroup type="tab" :items="layerItems" :pressed="layerId" @changed="changeLayer" />
      </div>
    </div>
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

  public layerItems: ToolbarItem[] = [
    {
      id: 0,
      label: "Layer 1",
      icon: "numeric-1-box-multiple"
    },
    {
      id: 1,
      label: "Layer 2",
      icon: "numeric-2-box-multiple"
    }
  ];

  @world.Action("setTool") setTool!: Function;
  @world.Action("setLayer") setLayer!: Function;
  @world.State("tool") toolId!: number;
  @world.State("curLayer") layerId!: number;

  public changeTool(id: number) {
    this.setTool(id);
  }

  public changeLayer(id: number) {
    this.setLayer(id);
  }
}
</script>

<style scoped>
.toolbar-contents {
  display: flex;
  justify-content: space-between;
  width: 95%;
  /* border: #ddd 1px solid; */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16); */
}
</style>
