<template>
  <Card title="Recent Updates">
    <h4>August 28, 2019</h4>
    <ul>
      <li>I have implemented auto-tiling for all the non-water tiles.  This was a challenge, and I will someday document all that
          I had to do.  But this is a huge step.  I'm working on water tiling next, which will be a fun challenge! :)</li>
    </ul>
    <h4>July 22, 2019</h4>

    <ul>
      <li>Created this revamped home screen.  Now including updates.</li>
    </ul>
  </Card>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import Card from '@/components/ui/Card.vue';
import { namespace } from 'vuex-class';


@Component({
  components: {
    Card,
  },
})
export default class UpdateList extends Vue {

}

</script>

<style scoped>
  h4 {
    margin-bottom: 0.01em;
  }

  ul {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  li {
    list-style-type: disc;
  }

</style>
