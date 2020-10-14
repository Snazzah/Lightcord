<template>
  <div class="content-column">
    <h2 class="header">
      Client Settings
    </h2>
    <h5 class="option-header">
      Theme
    </h5>
    <opt-radio-group
      v-model="theme"
      :items="[{
        key: 'dark',
        title: 'Dark'
      }, {
        key: 'light',
        title: 'Light'
      }]"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'app',
  computed: {
    theme: {
      get () {
        return this.$parent.$parent.theme;
      },
      set (value) {
        this.$parent.$parent.theme = value;
        localStorage.setItem('LC-Theme', value);
        this.$parent.$parent.updateTheme();
        return value;
      },
    },
  },
  head: {
    title: 'Client Settings',
  },
});
</script>
