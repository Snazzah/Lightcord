<template>
  <div class="app">
    <div class="main-layer">
      <div class="guilds-sidebar" :class="darkSidebar ? 'theme-dark' : ''">
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
          <tippy
            style="display: none"
            to="gsi-home"
            arrow
            placement="right"
            boundary="viewport"
          >
            <div class="guild-name">Home</div>
          </tippy>
        </div>
        <div v-if="unavailableCount" name="gsi-unavailable" class="list-item">
          <tippy
            style="display: none"
            to="gsi-unavailable"
            arrow
            placement="right"
            boundary="viewport"
          >
            <div class="guild-name">
              {{ unavailableCount }} guilds are unavailable.
            </div>
          </tippy>
          <div class="li-wrapper">
            <div class="child-wrapper">!</div>
          </div>
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
      <div class="channel-sidebar" :class="darkSidebar ? 'theme-dark' : ''">
        <div
          v-if="selectedGuild"
          class="guild-header"
          role="button"
          tabindex="0"
        >
          <header>
            <h1>{{ selectedGuildProto.name }}</h1>
            <svg width="18" height="18">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 0h18v18H0" />
                <path
                  stroke="currentColor"
                  d="M4.5 4.5l9 9"
                  stroke-linecap="round"
                />
                <path
                  stroke="currentColor"
                  d="M13.5 4.5l-9 9"
                  stroke-linecap="round"
                />
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
              <svg
                width="40"
                height="32"
                viewBox="0 0 40 32"
                class="mask"
                aria-hidden="true"
              >
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
                <foreignObject
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  mask="url(#avatar-mask-userarea)"
                >
                  <img
                    :src="clientProps.avatar"
                    class="avatar-image"
                    aria-hidden="true"
                  />
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

function channelSort(a, b) {
  if (a.type === 0 && b.type === 2) return -1;
  if (b.type === 0 && a.type === 2) return 1;
  if (a.position > b.position) return 1;
  if (a.position < b.position) return -1;
  return 0;
}

function channelViewable(channel, client) {
  if (client.user.id === channel.guild.ownerID) return true;
  const perms = channel.permissionsOf(client.user.id);
  return perms.has('readMessages');
}

export default Vue.extend({
  layout: 'app',
  name: 'App',
  middleware({ $discord, redirect }) {
    if (!$discord.client) redirect('/');
  },
  data() {
    return {
      guildScrollItem: GuildScrollItem,
      channelScrollItem: ChannelScrollItem,
      selectedGuild: null,
      collapsedCategoryChannels: [],
      lastVisitedChannels: {},
      channelMessages: {},

      // Settings
      theme: 'dark',
      darkSidebar: false,

      // Tickers
      uptime: 0,
      guildEventTicker: 0,
    };
  },
  computed: {
    selectedGuildProto() {
      ((_) => {})(this.uptime);

      return this.selectedGuild && this.$discord.client
        ? this.$discord.client.guilds.get(this.selectedGuild) || null
        : null;
    },
    guilds() {
      ((_) => {})(this.guildEventTicker);
      if (!this.$discord.client) return [];

      return Array.from(this.$discord.client.guilds.values())
        .filter((guild) => !guild.unavailable)
        .map((guild) => ({
          type: 'guild',
          id: guild.id,
          name: guild.name,
          iconURL: guild.dynamicIconURL('png', 64),
        }));
    },
    unavailableCount() {
      ((_) => {})(this.guildEventTicker);

      if (!this.$discord.client) return 0;
      return this.$discord.client.unavailableGuilds.size;
    },
    channels() {
      ((_) => {})(this.guildEventTicker);

      const channels = this.selectedGuildProto
        ? Array.from(this.selectedGuildProto.channels.values()).filter((chn) =>
            channelViewable(chn, this.$discord.client)
          )
        : [];
      if (!this.selectedGuildProto)
        return [
          {
            id: '1',
            type: 'channel-tab',
            name: 'Client Information',
            svg: 'home',
            path: '/app',
          },
          {
            id: '2',
            type: 'channel-tab',
            name: 'OAuth2 Information',
            svg: 'o-auth2',
            path: '/app/oauth2',
          },
          {
            id: '3',
            type: 'channel-tab',
            name: 'Settings',
            svg: 'settings',
            path: '/app/settings',
          },
        ];
      else
        return [
          ...channels
            .filter((c) => !c.parentID && c.type !== 4)
            .sort(channelSort)
            .map((c) => ({
              id: c.id,
              type: 'channel',
              channel: c,
            })),
          ...channels
            .filter((c) => c.type === 4)
            .sort(channelSort)
            .map((category) => [
              {
                id: category.id,
                type: 'channel',
                channel: category,
              },
              ...(this.collapsedCategoryChannels.includes(category.id)
                ? []
                : Array.from(category.channels.values())
                    .sort(channelSort)
                    .filter((chn) => channelViewable(chn, this.$discord.client))
                    .map((c) => ({
                      id: c.id,
                      type: 'channel',
                      channel: c,
                    }))),
            ])
            .flat(),
        ];
    },
    inHome() {
      return !this.$route.path.startsWith('/channels');
    },
    clientProps() {
      ((_) => {})(this.uptime);

      return this.$discord.client
        ? {
            status: this.$discord.client.presence.status,
            username: this.$discord.client.user.username,
            discriminator: this.$discord.client.user.discriminator,
            avatar: this.$discord.client.user.dynamicAvatarURL('png', 64),
          }
        : {};
    },
  },
  mounted() {
    if (
      window.document.firstElementChild &&
      !window.document.firstElementChild.classList.contains('theme-dark')
    )
      window.document.firstElementChild.classList.add('theme-dark');

    if (!localStorage.getItem('LC-Settings')) {
      localStorage.setItem(
        'LC-Settings',
        JSON.stringify({ theme: 'dark', darkSidebar: false })
      );
    } else {
      const settings = JSON.parse(localStorage.getItem('LC-Settings'));
      this.theme = settings.theme || 'dark';
      this.darkSidebar = settings.darkSidebar || false;
    }

    this.updateTheme();
  },
  created() {
    if (!this.$discord.client) return;
    const self = this;
    function updateTicker(prop) {
      return () => {
        self[prop] = self.$discord.client ? self.$discord.client.uptime : 0;
      };
    }

    this.$discord.client.on('error', (err, id) => {
      console.warn(
        'An error occurred in Shard %s, going back to homepage',
        id,
        err
      );
      this.$discord.destroy();
      this.$router.push('/');
    });

    // deepscan-disable-next-line VUE_MISSING_CLEANUP_IN_LIFECYCLE
    setInterval(updateTicker('uptime'), 1000);

    this.$discord.client.on('guildCreate', updateTicker('guildEventTicker'));
    this.$discord.client.on('guildDelete', updateTicker('guildEventTicker'));
    this.$discord.client.on('guildUpdate', updateTicker('guildEventTicker'));
    this.$discord.client.on(
      'guildRoleCreate',
      updateTicker('guildEventTicker')
    );
    this.$discord.client.on(
      'guildRoleDelete',
      updateTicker('guildEventTicker')
    );
    this.$discord.client.on(
      'guildRoleUpdate',
      updateTicker('guildEventTicker')
    );
    this.$discord.client.on('channelCreate', updateTicker('guildEventTicker'));
    this.$discord.client.on('channelDelete', updateTicker('guildEventTicker'));
    this.$discord.client.on('channelUpdate', updateTicker('guildEventTicker'));
  },
  methods: {
    updateTheme() {
      localStorage.setItem(
        'LC-Settings',
        JSON.stringify({ theme: this.theme, darkSidebar: this.darkSidebar })
      );
      const htmlElement = window.document.firstElementChild;
      Array.from(htmlElement.classList.values()).map((className) =>
        htmlElement.classList.remove(className)
      );
      htmlElement.classList.add(`theme-${this.theme}`);
    },
    switchToGuild(id) {
      if (!this.$discord.client.guilds.has(id)) return;
      this.selectedGuild = id;
      if (this.lastVisitedChannels[id])
        return this.$router.push(
          `/channels/${id}/${this.lastVisitedChannels[id]}`
        );
      const firstChannel = Array.from(
        this.$discord.client.guilds.get(id).channels.values()
      )
        .sort(channelSort)
        .filter((channel) => channel.type === 0 || channel.type === 5)
        .filter((chn) => channelViewable(chn, this.$discord.client))[0];
      if (firstChannel) this.lastVisitedChannels[id] = firstChannel.id;
      this.$router.push(
        firstChannel ? `/channels/${id}/${firstChannel.id}` : `/channels/${id}`
      );
    },
    switchToChannel(id) {
      if (
        !this.selectedGuild ||
        !this.$discord.client.guilds.has(this.selectedGuild) ||
        !this.selectedGuildProto.channels.has(id)
      )
        return;
      this.lastVisitedChannels[this.selectedGuild] = id;
      this.$router.push(`/channels/${this.selectedGuild}/${id}`);
    },
    switchToHome() {
      if (!this.selectedGuild) return;
      this.selectedGuild = null;
      this.$router.push('/app');
    },
  },
});
</script>

<style lang="scss">
@import '~/styles/app.scss';
</style>
