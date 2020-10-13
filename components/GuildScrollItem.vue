<template>
  <div
    :name="'gsi-' + source.id"
    class="list-item"
    :class="isCurrent ? 'selected' : ''"
    @click="switchTo"
  >
    <tippy style="display: none" :to="'gsi-' + source.id" arrow placement="right" boundary="viewport">
      <div class="guild-name">
        {{ source.name }}
      </div>
      <div class="mute-text">
        Shard {{ $discord.client.guildShardMap[source.id] === undefined ? 'N/A' : $discord.client.guildShardMap[source.id] }}
      </div>
    </tippy>
    <div class="pill">
      <span class="pill-item" />
    </div>
    <div class="li-wrapper">
      <img v-if="source.iconURL" :src="source.iconURL">
      <div v-else class="child-wrapper">
        {{
          source.name
            .replace(/'s /g, ' ')
            .replace(/\w+/g, e => e[0])
            .replace(/\s/g, '')
        }}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      app: this.$parent.$parent.$parent,
    };
  },
  computed: {
    isCurrent () {
      return this.app.selectedGuild === this.source.id;
    },
  },
  methods: {
    switchTo () {
      if (this.isCurrent) return;
      this.app.switchToGuild(this.source.id);
    },
  },
});
</script>
