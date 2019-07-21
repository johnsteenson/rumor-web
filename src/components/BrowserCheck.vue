<template>
  <Modal title="Warning" :show="show" @closed="closed">
    {{message}}
  </Modal>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import Modal from '@/components/ui/Modal.vue'
import { namespace } from 'vuex-class';

const MOBILE_NOT_SUPPORTED = `This application currently does not support mobile devices,
but we are hoping to in the future.  You are welcome to continue but we don't guarantee
anything will work.  Thus, please use a desktop/laptop.`;

@Component({
  components: {
    Modal
  },
})
export default class BrowserCheck extends Vue {

  message: string = "";
  show: boolean = false;

  private created() {
    if(window.innerWidth < 640 || window.innerHeight < 480) {
      this.message = MOBILE_NOT_SUPPORTED;
      this.show = true;

    }

  }

  public closed() {
    this.show = false;
  }
}

</script>

<style scoped>

</style>
