<template>
  <div class="map-tree-container">
    <TreeView :selectedId="selectedId" :treeRoot="treeRoot" @treeItemSelected="treeItemSelected" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { getServiceInterface } from "@/service/rumor";

import TreeView from "@/components/ui/TreeView.vue";
import { TreeItem } from "../../lib/ui/tree";
import { TileMapTree } from "../../types/map";

const world = namespace("world");

function mapToTreeItem(treeItems: TileMapTree[]): TreeItem[] {
  const items: TreeItem[] = [];

  for (const tree of treeItems) {
    const item: TreeItem = {
      id: tree.id,
      label: tree.title
    };

    if (tree.children) {
      item.children = mapToTreeItem(tree.children);
    }

    items.push(item);
  }

  return items;
}

@Component({
  components: {
    TreeView
  }
})
export default class MapTree extends Vue {
  private treeRoot: TreeItem[] = [];

  private selectedId: string = "1";

  public mounted() {
    getServiceInterface().onMapTreeUpdate((tileMapTree: TileMapTree) => {
      const tree = mapToTreeItem([tileMapTree]);

      this.$set(this, "treeRoot", tree);
    });

    getServiceInterface().getMapTree();
  }

  public treeItemSelected(treeItem: TreeItem) {
    this.selectedId = treeItem.id;

    getServiceInterface().getMap(this.selectedId);
  }
}
</script>

<style scoped>
.map-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
