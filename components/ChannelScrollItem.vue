<template>
  <!-- Tabs -->
  <nuxt-link
    v-if="source.type === 'channel-tab'"
    class="channel channel-tab"
    :to="source.path"
  >
    <div class="avatar">
      <component :is="'svg-' + source.svg" />
    </div>
    <div class="content">
      <div class="name">
        {{ source.name }}
      </div>
    </div>
  </nuxt-link>
  <!-- Category channel -->
  <a
    v-else-if="source.type === 'channel' && source.channel.type === 4"
    class="guild-channel category-channel"
    :class="collapsed ? 'collapsed' : ''"
    @click="toggleCategory"
  >
    <div class="content">
      <svg-category-arrow />
      <h2 class="name">
        {{ source.channel.name }}
      </h2>
    </div>
    <div class="children" />
  </a>
  <!-- Other channels -->
  <a v-else-if="source.type === 'channel'" class="guild-channel">
    <div class="content">
      <svg-text-channel
        v-if="source.channel.type === 0"
        :nsfw="source.channel.nsfw"
        :locked="isLocked"
      />
      <svg-voice-channel v-if="source.channel.type === 2" :locked="isLocked" />
      <svg-news-channel v-if="source.channel.type === 5" :locked="isLocked" />
      <svg-store-channel v-if="source.channel.type === 6" :locked="isLocked" />
      <div class="name">
        {{ source.channel.name }}
      </div>
      <div class="children" />
    </div>
  </a>
</template>

<script>
import Vue from 'vue';
import SvgHome from '~/components/svg/Home.vue';
import SvgDiscord from '~/components/svg/Discord.vue';
import SvgSettings from '~/components/svg/Settings.vue';
import SvgOAuth2 from '~/components/svg/OAuth2.vue';

export default Vue.extend({
  components: { SvgHome, SvgDiscord, SvgSettings, SvgOAuth2 },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      app: this.$parent.$parent.$parent,
    };
  },
  computed: {
    collapsed() {
      if (!this.source.channel) return false;
      return this.app.collapsedCategoryChannels.includes(
        this.source.channel.id
      );
    },
    isLocked() {
      ((_) => {})(this.app.guildEventTicker);

      const guildID = this.source.channel.guild.id;
      const defaultPerm = this.source.channel.guild.roles
        .get(guildID)
        .permissions.has('readMessages');
      const permOverwrite = this.source.channel.permissionOverwrites.get(
        guildID
      );
      return permOverwrite &&
        !(permOverwrite.allow === 0 && permOverwrite.deny === 0)
        ? (permOverwrite.deny & (1 << 10)) === 1 << 10
        : !defaultPerm;
    },
  },
  methods: {
    toggleCategory() {
      if (!this.source.channel) return;
      const index = this.app.collapsedCategoryChannels.indexOf(
        this.source.channel.id
      );
      if (!this.app.collapsedCategoryChannels.includes(this.source.channel.id))
        this.app.collapsedCategoryChannels.push(this.source.channel.id);
      else this.app.collapsedCategoryChannels.splice(index, 1);
    },
  },
});
</script>
