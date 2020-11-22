<template>
  <div class="radio-group">
    <div
      v-for="item in items"
      :key="item.key"
      class="item"
      :class="value === item.key ? 'checked' : ''"
      @click="setValue(item.key)"
    >
      <label class="checkbox-wrapper">
        <input type="checkbox" />
        <div class="checkbox">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17Z"
            />
          </svg>
        </div>
        <div class="label">
          <div class="info">
            <div class="title">{{ item.title }}</div>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    items: {
      type: Array,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
  },
  methods: {
    setValue(newValue: string) {
      this.$emit('input', newValue);
    },
  },
});
</script>
