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
                  <rect color="black" x="19" y="19" width="16" height="16" rx="8" ry="8" />
                </mask>
                <foreignObject x="0" y="0" width="32" height="32" mask="url(#avatar-mask-userarea)">
                  <img :src="clientProps.avatar" class="avatar-image" aria-hidden="true">
                </foreignObject>
                <!-- Online Status -->
                <svg v-if="clientProps.status === 'online'" x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                  <mask id="status-mask-userarea">
                    <rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white" />
                    <rect x="12.5" y="10" width="0" height="0" rx="0" ry="0" fill="black" />
                    <polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style="transform-origin: 13.125px 10px;" />
                    <circle fill="black" cx="12.5" cy="10" r="0" />
                  </mask>
                  <rect fill="#43b581" width="25" height="15" mask="url(#status-mask-userarea)" />
                </svg>
                <!-- Idle Status -->
                <svg v-if="clientProps.status === 'idle'" x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                  <mask id="status-mask-userarea">
                    <rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white" />
                    <rect x="6.25" y="3.75" width="7.5" height="7.5" rx="3.75" ry="3.75" fill="black" />
                    <polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style="transform-origin: 13.125px 10px;" />
                    <circle fill="black" cx="12.5" cy="10" r="0" />
                  </mask>
                  <rect fill="#faa61a" width="25" height="15" mask="url(#status-mask-userarea)" />
                </svg>
                <!-- DnD Status -->
                <svg v-if="clientProps.status === 'dnd'" x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                  <mask id="status-mask-userarea">
                    <rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white" />
                    <rect x="8.75" y="8.75" width="7.5" height="2.5" rx="1.25" ry="1.25" fill="black" />
                    <polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style="transform-origin: 13.125px 10px;" />
                    <circle fill="black" cx="12.5" cy="10" r="0" />
                  </mask>
                  <rect fill="#f04747" width="25" height="15" mask="url(#status-mask-userarea)" />
                </svg>
                <!-- Offline Status -->
                <svg v-if="clientProps.status === 'offline'" x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                  <mask id="status-mask-userarea">
                    <rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white" />
                    <rect x="10" y="7.5" width="5" height="5" rx="2.5" ry="2.5" fill="black" />
                    <polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style="transform-origin: 13.125px 10px;" />
                    <circle fill="black" cx="12.5" cy="10" r="0" />
                  </mask>
                  <rect fill="#747f8d" width="25" height="15" mask="url(#status-mask-userarea)" />
                </svg>
              </svg>
            </div>
          </div>
          <div class="name-tag">
            <div class="username">{{ clientProps.username }}</div>
            <div class="subtext">#{{ clientProps.discriminator }}</div>
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
      uptime: 0,
    };
  },
  computed: {
    guilds () {
      ((_) => {})(this.uptime);

      if (this.$discord.client)
        return Array.from(this.$discord.client.guilds.values())
          .map(guild => ({ id: guild.id, name: guild.name, iconURL: guild.dynamicIconURL('png', 64) }));
      else return [];
    },
    channels () {
      ((_) => {})(this.uptime);

      const guild = this.selectedGuild ? this.$discord.client.guilds.get(this.selectedGuild) : null;
      const channels = guild ? Array.from(guild.channels.values()) : null;
      return !guild ? [
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
  },
  created () {
    setInterval(() => { this.uptime = this.$discord.client ? this.$discord.client.uptime : 0; }, 1000);
  },
  methods: {
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
