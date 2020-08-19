<template>
  <div class="main-layer">
    <div class="guilds-sidebar">
      <div class="scroller">
      </div>
    </div>
    <div class="channel-sidebar">
      <div class="scroller">
      </div>
    </div>
    <div class="layer-content">
      <div class="scroller">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'app',
  computed: {
    dtoken () {
      if (this.$discord.client)
        return this.$discord.client.token;
      else
        return '[none]';
    },
  },
});
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
