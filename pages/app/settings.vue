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
    <opt-toggle
      v-model="darkSidebar"
      class="marginTop-20"
      :class="theme === 'dark' ? 'disabled' : ''"
      title="Dark Sidebar"
    />
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  layout: 'app',
  name: 'AppSettings',
  computed: {
    theme: {
      get () {
        return this.$parent.$parent.theme;
      },
      set (value) {
        this.$parent.$parent.theme = value;
        this.$parent.$parent.updateTheme();
        return value;
      },
    },
    darkSidebar: {
      get () {
        return this.$parent.$parent.darkSidebar;
      },
      set (value) {
        this.$parent.$parent.darkSidebar = value;
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
