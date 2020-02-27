<template>
  <div class="treeView">
    <TreeNode
      :items="treeRoot"
      :treeState="treeState"
      :selectedId="selectedId"
      @treeItemSelected="treeItemSelected"
    ></TreeNode>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import TreeNode from "@/components/ui/TreeNode.vue";
/* import SearchList from "@/components/common/SearchList.vue"; */

import { TreeItem, TreeState } from "@/lib/ui/tree";

/*
    <div>
      <search-list v-on:search="handleSearch" :results="searchResults"></search-list>
    </div>
    */

/*
function searchTree(nodes, results, term) {
  for (const node of nodes) {
    if (node.label.match(term)) {
      results.push({
        id: node.id,
        label: node.label
      });
    }

    if (node.children && node.children.length > 0) {
      searchTree(node.children, results, term);
    }
  }
}
*/

/*
      nodeMap: {
        selected: -1,
        expanded: {}
      },
      searchResults: []
*/
@Component({
  components: {
    TreeNode
  }
})
export default class TreeView extends Vue {
  @Prop() private treeRoot!: TreeItem;

  @Prop() private selectedId!: string;

  private searchResults: string[] = [];

  private treeState: TreeState = {
    selected: null,
    collapsed: {}
  };

  public handleSearch(term: string) {
    this.searchResults = [];

    const regex = new RegExp(term, "i");
    /* searchTree(this.tree, this.searchResults, regex); */
  }

  public treeItemSelected(item: TreeItem) {
    this.$emit("treeItemSelected", item);
  }
}
</script>

<style scoped>
input {
  margin: 4px 10px 4px 5px;
  width: 90%;
}

div.treeView {
  width: 100%;
  height: 100%;
}
</style>
