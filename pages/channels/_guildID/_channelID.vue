<template>
  <div v-if="channel().type !== 0" class="no-channel">
    <div class="wrapper">
      <svg-no-text-channels />
      <div class="text-wrapper">
        <h4 class="title">
          Invalid Channel Type
        </h4>
        <div class="text">
          Cannot view a channel with the type {{ channel().type }}
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="canViewChannel" class="no-channel">
    <div class="wrapper">
      <svg-no-text-channels />
      <div class="text-wrapper">
        <h4 class="title">
          hello
        </h4>
        <div class="text">
          You can see this channel, but not right now
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-channel">
    <div class="wrapper">
      <svg-no-text-channels />
      <div class="text-wrapper">
        <h4 class="title">
          Permission denied
        </h4>
        <div class="text">
          You can't view the messages of this channel.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

function channelViewable (channel, client) {
  if (client.user.id === channel.guild.ownerID) return true;
  const perms = channel.permissionsOf(client.user.id);
  return perms.has('readMessages');
}

export default Vue.extend({
  layout: 'app',
  name: 'ChannelPage',
  data () {
    return {
      app: this.$parent.$parent,
    };
  },
  mounted () {
    if (!this.guild()) this.$router.replace('/app');
    if (!this.channel()) this.$router.replace(`/channels/${this.$route.params.guildID}`);
  },
  computed: {
    canViewChannel () {
      ((_) => {})(this.app.guildEventTicker);

      const channel = this.channel();
      const client = this.$discord.client;
      if (client.user.id === channel.guild.ownerID) return true;
      const perms = channel.permissionsOf(client.user.id);
      return perms.has('readMessages');
    },
  },
  methods: {
    guild () {
      return this.$discord.client ? this.$discord.client.guilds.get(this.$route.params.guildID) : null;
    },
    channel () {
      return this.guild() ? this.guild().channels.get(this.$route.params.channelID) : null;
    },
  },
  head () {
    return this.channel() ? {
      title: '#' + this.channel().name,
    } : {};
  },
});
</script>
