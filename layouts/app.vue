<template>
  <div class="app">
    <div class="main-layer">
      <div class="guilds-sidebar">
        <div
          class="list-item home-item"
          name="gsi-home"
          :class="inHome ? 'selected' : ''"
          @click="switchToHome"
        >
          <div class="pill">
            <span class="pill-item" />
          </div>
          <div class="li-wrapper">
            <div class="child-wrapper">
              <svg-discord />
            </div>
          </div>
          <tippy style="display: none" to="gsi-home" arrow placement="right" boundary="viewport">
            <div class="guild-name">
              Home
            </div>
          </tippy>
        </div>
        <div class="list-item">
          <div class="guild-sep" />
        </div>
        <v-scroller
          class="scroller"
          :data-key="'id'"
          :data-sources="guilds"
          :data-component="guildScrollItem"
        />
      </div>
      <div class="channel-sidebar">
        <div v-if="selectedGuild" class="guild-header" role="button" tabindex="0">
          <header>
            <h1>{{ selectedGuildProto.name }}</h1>
            <svg width="18" height="18">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 0h18v18H0" />
                <path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round" />
                <path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round" />
              </g>
            </svg>
          </header>
        </div>
        <v-scroller
          class="scroller"
          :data-key="'id'"
          :data-sources="channels"
          :data-component="channelScrollItem"
        />
        <div class="user-area">
          <div class="avatar">
            <div class="avatar-wrapper">
              <svg width="40" height="32" viewBox="0 0 40 32" class="mask" aria-hidden="true">
                <mask id="avatar-mask-userarea" width="32" height="32">
                  <circle cx="16" cy="16" r="16" fill="white" />
                  <rect
                    color="black"
                    x="19"
                    y="19"
                    width="16"
                    height="16"
                    rx="8"
                    ry="8"
                  />
                </mask>
                <foreignObject x="0" y="0" width="32" height="32" mask="url(#avatar-mask-userarea)">
                  <img :src="clientProps.avatar" class="avatar-image" aria-hidden="true">
                </foreignObject>
                <!-- Online Status -->
                <svg-userarea-offline v-if="clientProps.status === 'online'" />
                <!-- Idle Status -->
                <svg-userarea-idle v-if="clientProps.status === 'idle'" />
                <!-- DnD Status -->
                <svg-userarea-dnd v-if="clientProps.status === 'dnd'" />
                <!-- Offline Status -->
                <svg-userarea-offline v-if="clientProps.status === 'offline'" />
              </svg>
            </div>
          </div>
          <div class="name-tag">
            <div class="username">
              {{ clientProps.username }}
            </div>
            <div class="subtext">
              #{{ clientProps.discriminator }}
            </div>
          </div>
          <div class="button" />
        </div>
      </div>
      <div class="layer-content">
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import GuildScrollItem from '~/components/GuildScrollItem.vue';
import ChannelScrollItem from '~/components/ChannelScrollItem.vue';

function channelSort (a, b) {
  if (a.type === 0 && b.type === 2) return -1;
  if (b.type === 0 && a.type === 2) return 1;
  if (a.position > b.position) return 1;
  if (a.position < b.position) return -1;
  return 0;
}

export default Vue.extend({
  layout: 'app',
  middleware ({ $discord, redirect }) {
    if (!$discord.client) redirect('/');
  },
  data () {
    return {
      guildScrollItem: GuildScrollItem,
      channelScrollItem: ChannelScrollItem,
      selectedGuild: null,
      collapsedCategoryChannels: [],
      theme: 'dark',
      uptime: 0,
    };
  },
  computed: {
    selectedGuildProto () {
      ((_) => {})(this.uptime);

      return this.selectedGuild ? this.$discord.client.guilds.get(this.selectedGuild) : null;
    },
    guilds () {
      ((_) => {})(this.uptime);

      if (this.$discord.client)
        return Array.from(this.$discord.client.guilds.values())
          .map(guild => ({ id: guild.id, name: guild.name, iconURL: guild.dynamicIconURL('png', 64) }));
      else return [];
    },
    channels () {
      ((_) => {})(this.uptime);

      const channels = this.selectedGuildProto ? Array.from(this.selectedGuildProto.channels.values()) : null;
      return !this.selectedGuildProto ? [
        {
          id: '1',
          type: 'channel-tab',
          name: 'Client Info',
          svg: 'discord',
          path: '/app',
        },
        {
          id: '2',
          type: 'channel-tab',
          name: 'Settings',
          svg: 'settings',
          path: '/app/settings',
        },
      ] : [
        ...channels
          .filter(c => !c.parentID && c.type !== 4)
          .sort(channelSort)
          .map(c => ({
            id: c.id,
            type: 'channel',
            channel: c,
          })),
        ...channels
          .filter(c => c.type === 4)
          .sort(channelSort)
          .map(category => [
            {
              id: category.id,
              type: 'channel',
              channel: category,
            },
            ...(this.collapsedCategoryChannels.includes(category.id) ? []
              : Array.from(category.channels.values())
                .sort(channelSort)
                .map(c => ({
                  id: c.id,
                  type: 'channel',
                  channel: c,
                }))),
          ])
          .flat(),
      ];
    },
    inHome () {
      return !this.$route.path.startsWith('/channels');
    },
    clientProps () {
      ((_) => {})(this.uptime);

      return this.$discord.client ? {
        status: this.$discord.client.presence.status,
        username: this.$discord.client.user.username,
        discriminator: this.$discord.client.user.discriminator,
        avatar: this.$discord.client.user.dynamicAvatarURL('png', 64),
      } : {};
    },
  },
  mounted () {
    if (window.document.firstElementChild && !window.document.firstElementChild.classList.contains('theme-dark'))
      window.document.firstElementChild.classList.add('theme-dark');

    if (!localStorage.getItem('LC-Theme')) {
      localStorage.setItem('LC-Theme', 'dark');
    } else {
      this.theme = localStorage.getItem('LC-Theme');
    }
    this.updateTheme();
  },
  created () {
    setInterval(() => { this.uptime = this.$discord.client ? this.$discord.client.uptime : 0; }, 1000);
  },
  methods: {
    updateTheme () {
      localStorage.setItem('LC-Theme', this.theme);
      const htmlElement = window.document.firstElementChild;
      Array.from(htmlElement.classList.values()).map(className => htmlElement.classList.remove(className));
      htmlElement.classList.add(`theme-${this.theme}`);
    },
    switchToGuild (id) {
      if (!this.$discord.client.guilds.has(id)) return;
      this.selectedGuild = id;
    },
    switchToHome () {
      if (!this.selectedGuild) return;
      this.selectedGuild = null;
    },
  },
});
</script>

<style lang="scss">
@import "~/styles/app.scss";
</style>
