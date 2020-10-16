<template>
  <div class="no-channel">
    <div class="wrapper">
      <svg-no-text-channels />
      <div class="text-wrapper">
        <h4 class="title">
          No Text Channels
        </h4>
        <div class="text">
          You find yourself in a strange place. You don't have access to any text channels, or there are none in this server.
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
  name: 'GuildPage',
  data () {
    return {
      app: this.$parent.$parent,
    };
  },
  mounted () {
    if (!this.guild()) this.$router.push('/app');
    const viewableChannels = Array.from(this.guild().channels.values())
      .filter(channel => channel.type === 0)
      .filter(channel => channelViewable(channel, this.$discord.client));
    console.log(this, viewableChannels);
    if (viewableChannels[0]) this.$router.replace(`/channels/${this.$route.params.guildID}/${viewableChannels[0].id}`);
  },
  methods: {
    guild () {
      return this.$discord.client ? this.$discord.client.guilds.get(this.$route.params.guildID) : null;
    },
  },
  head () {
    return this.guild() ? {
      title: this.guild().name,
    } : {};
  },
});
</script>
