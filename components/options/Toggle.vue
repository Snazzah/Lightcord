<template>
  <div class="toggle-box" :class="value ? 'checked' : ''">
    <div class="label-row" @click="$emit('input', !value)">
      <label>{{ title }}</label>
      <div class="control">
        <div class="container" tabindex="-1">
          <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet">
            <rect
              fill="white"
              x="4"
              y="0"
              height="20"
              width="20"
              rx="10"
            />
          </svg>
          <input type="checkbox">
        </div>
      </div>
    </div>
    <div v-if="divider" class="note">
      {{ note }}
    </div>
    <div v-if="divider" class="divider" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    divider: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    setValue (newValue: string) {
      this.$emit('input', newValue);
    },
  },
});
</script>
