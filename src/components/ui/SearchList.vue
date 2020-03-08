<template>
  <div></div>
</template>

<script lang="ts">
export class SearchList {}
/*

    <input type="text" v-model="searchTerm" />
    <div class="search-popup" v-show="searchTerm.length > 0">
      <span v-show="results.length < 1">No results were found.</span>
      <ul>
        <li v-for="result in results" :key="result.id">{{result.label}}</li>
      </ul>
    </div>


export default {
  name: "search-list",
  props: {
    results: [Array]
    //  onSearch: [Function],
    //  onSelect: [Function]
  },

  data: () => {
    return {
      searchTerm: ""
    };
  },

  watch: {
    searchTerm: function(val) {
      this.$emit("search", val);
      // this.results = this.onSearch(val);
    }
  },

  methods: {
    select(item) {
      if (!item.children || item.children.length < 1) {
        return;
      }

      this.$set(this.nodeMap, item.id, !this.nodeMap[item.id]);
      this.$set(this.nodeMap, "selected", item.id);
    }
  }
};
*/
</script>

<style scoped>
input {
  height: 33px;
  width: 80%;
  text-align: left;
  margin: 2px 4px;
}

div {
  text-align: left;
}

div.search-popup {
  position: absolute;
  display: block;
  top: 33px;
  z-index: 100;
  width: 70%;

  padding: 2px 4px;

  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

ul {
  padding-left: 15px;
}

li {
  text-align: left;
  list-style-type: none;
}
</style>
