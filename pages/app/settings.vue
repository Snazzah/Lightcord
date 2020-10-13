<template>
  <div class="content-column">
    <h2>Lightcord v2.0.0</h2>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'app',
  data () {
    return {
      uptime: 0,
    };
  },
  head: {
    title: 'Client Settings',
  },
});
</script>
