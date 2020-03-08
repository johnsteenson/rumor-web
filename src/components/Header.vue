<template>
  <div id="header">
    <div>
      <h1>
        Rumor
        <span v-if="isOffline">(Offline Mode)</span>
      </h1>
    </div>
    <div class="spacer"></div>
    <div class="header-section">
      <account-icon />
      {{signedInUser}}
    </div>
    <div class="header-end"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

import AccountIcon from "vue-material-design-icons/Account.vue";

const project = namespace("project");

@Component({
  components: {
    AccountIcon
  }
})
export default class Header extends Vue {
  @project.State("offline") isOffline!: boolean;

  @project.State("signedInUser") signedInUser!: string;
}
</script>

<style scoped>
#header {
  width: 100%;
  color: #fff;
  background-color: #444444;
  height: 1.2rem;
  margin-bottom: 2px;
  display: flex;
}

div.landing {
  display: flex;
}

div.spacer {
  flex-grow: 1;
}

div.header-section {
  font-size: 0.9rem;
}

div.header-end {
  margin-right: 10px;
}

#header h1 {
  font-size: 1.1rem;
  margin: 0 0 0 0.3rem;
}
</style>
