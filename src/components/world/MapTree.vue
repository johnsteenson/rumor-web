<template>
  <div class="map-tree-container">
    <TreeView :treeRoot="treeRoot" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

import TreeView from "@/components/ui/TreeView.vue";
import { TreeItem } from "../../lib/ui/tree";

const world = namespace("world");

@Component({
  components: {
    TreeView
  }
})
export default class MapTree extends Vue {
  private treeRoot: TreeItem[] = [];

  public mounted() {
    const tree = [
      {
        id: "-1",
        label: "Sucmo Super RPG",
        disableSelect: true,
        icon: "folder",
        children: [
          {
            id: "1",
            label: "Lameia",
            icon: "file",
            children: [
              {
                id: "3",
                label: "AOL Capitol"
              },
              {
                id: "231",
                label: "Omegaria"
              },
              {
                id: "642",
                label: "Luluxia"
              }
            ]
          },
          {
            id: "2",
            label: "SaGa Frontier World",
            children: [
              {
                id: "4",
                label: "Koorong",
                children: [
                  {
                    id: "5",
                    label: "Port"
                  }
                ]
              },
              {
                id: "6",
                label: "Mosperiburg"
              },
              {
                id: "7",
                label: "Magic Kingdom",
                children: [
                  {
                    id: "666",
                    label: "Hell"
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    this.$set(this, "treeRoot", tree);
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
