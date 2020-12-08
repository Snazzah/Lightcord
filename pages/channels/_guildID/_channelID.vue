<template>
  <div v-if="channel().type !== 0 && channel().type !== 5" class="no-channel">
    <div class="wrapper">
      <svg-no-text-channels />
      <div class="text-wrapper">
        <h4 class="title">Invalid Channel Type</h4>
        <div class="text">
          Cannot view a channel with the type {{ channel().type }}
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="!canViewChannel" class="no-channel">
    <div class="wrapper">
      <svg-no-text-channels />
      <div class="text-wrapper">
        <h4 class="title">Permission denied</h4>
        <div class="text">You can't view the messages of this channel.</div>
      </div>
    </div>
  </div>
  <div v-else class="chat">
    <section class="title">
      <div class="children">
        <div class="icon-wrapper">
          <svg-text-channel
            v-if="channel().type === 0"
            :nsfw="channel().nsfw"
            :locked="isLocked"
          />
          <svg-voice-channel v-if="channel().type === 2" :locked="isLocked" />
          <svg-news-channel v-if="channel().type === 5" :locked="isLocked" />
          <svg-store-channel v-if="channel().type === 6" :locked="isLocked" />
        </div>
        <h3>{{ channel().name }}</h3>
      </div>
      <div class="toolbar">
        <div v-tippy class="icon-wrapper" content="Pinned Messages">
          <svg-channel-pin />
        </div>
      </div>
    </section>
    <div class="chat-content">
      <main class="chat-content-main">
        <div class="message-wrapper">
          <v-scroller
            ref="vsl"
            class="scroller large-scrollbar"
            :data-key="'id'"
            :data-sources="messages"
            :data-component="messageComponent"
            :estimate-size="50"
            :keeps="100"
          >
            <div slot="footer" class="header">
              <div v-show="loadingMessages" class="spinner" />
            </div>
          </v-scroller>
          <!-- https://tangbc.github.io/vue-virtual-scroll-list/#/chat-room -->
          <!-- <div class="scroller">
            <div class="scroller-content">
              <div class="scroller-inner">
                <i />
              </div>
            </div>
          </div> -->
        </div>
        <form>
          <div>
            <div v-if="canSendMessage" class="channel-text-area">
              <div class="scroll-container">
                <div class="inner-text-area">
                  <div class="text-area" />
                </div>
              </div>
            </div>
            <div v-else class="channel-text-area disabled">
              <div class="scroll-container">
                <div class="inner-text-area">
                  <div class="text-area">
                    <div class="placeholder">
                      You do not have permission to send messages in this
                      channel.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import lodash from 'lodash';
import Message from '~/components/Message.vue';
import { UNCACHEABLE_IDS } from '~/assets/constants';

export default Vue.extend({
  layout: 'app',
  name: 'ChannelPage',
  data() {
    return {
      canLoadMore: true,
      loadingMessages: true,
      messageComponent: Message,
      app: this.$parent.$parent,
      ticker: 0,
    };
  },
  computed: {
    canViewChannel() {
      ((_) => {})(this.app.guildEventTicker);

      const channel = this.channel();
      const client = this.$discord.client;
      if (client.user.id === channel.guild.ownerID) return true;
      const perms = channel.permissionsOf(client.user.id);
      return perms.has('readMessages');
    },
    canSendMessage() {
      ((_) => {})(this.app.guildEventTicker);

      const channel = this.channel();
      const client = this.$discord.client;
      if (client.user.id === channel.guild.ownerID) return true;
      const perms = channel.permissionsOf(client.user.id);
      return perms.has('sendMessages');
    },
    canSendFiles() {
      ((_) => {})(this.app.guildEventTicker);

      const channel = this.channel();
      const client = this.$discord.client;
      if (client.user.id === channel.guild.ownerID) return true;
      const perms = channel.permissionsOf(client.user.id);
      return perms.has('attachFiles');
    },
    isLocked() {
      ((_) => {})(this.app.guildEventTicker);

      const channel = this.channel();
      const guildID = channel.guild.id;
      const defaultPerm = channel.guild.roles
        .get(guildID)
        .permissions.has('readMessages');
      const permOverwrite = channel.permissionOverwrites.get(guildID);
      return permOverwrite &&
        !(permOverwrite.allow === 0 && permOverwrite.deny === 0)
        ? (permOverwrite.deny & (1 << 10)) === 1 << 10
        : !defaultPerm;
    },
    messages() {
      ((_) => {})(this.ticker);

      return this.app.channelMessages[this.$route.params.channelID] || [];
    },
    members() {
      ((_, __) => {})(this.app.guildEventTicker, this.ticker);

      return this.guild() ? this.guild().members : null;
    },
    roles() {
      ((_, __) => {})(this.app.guildEventTicker, this.ticker);

      return this.guild() ? this.guild().roles : null;
    },
    channels() {
      ((_, __) => {})(this.app.guildEventTicker, this.ticker);

      return this.guild() ? this.guild().channels : null;
    },
  },
  async mounted() {
    if (!this.guild() || this.guild().unavailable)
      return this.$router.replace('/app');
    if (!this.channel())
      return this.$router.replace(`/channels/${this.$route.params.guildID}`);

    if (!this.app.channelMessages[this.$route.params.channelID]) {
      let messages = await this.channel().getMessages();
      console.log('recieved messages', messages);

      const uncachedMembers = lodash
        .uniq(messages.map((m) => m.author.id))
        .filter(
          (id) => !this.guild().members.has(id) && !UNCACHEABLE_IDS.includes(id)
        );

      if (uncachedMembers.length) {
        console.log('Found uncached members', uncachedMembers);

        const members = await this.guild().fetchMembers({
          userIDs: uncachedMembers,
        });

        for (const member of members) {
          this.guild().members.add(member, this);
        }

        messages = messages.map((message) => {
          const member = members.find(
            (member) => message.author.id === member.id
          );
          if (message.member == null && member) message.member = member;
          return message;
        });
      }

      this.app.channelMessages[
        this.$route.params.channelID
      ] = messages.reverse();
      if (messages.length !== 50) this.canLoadMore = false;

      this.loadingMessages = false;
      this.ticker = Date.now();
    }
  },
  methods: {
    guild() {
      return this.$discord.client
        ? this.$discord.client.guilds.get(this.$route.params.guildID)
        : null;
    },
    channel() {
      return this.guild()
        ? this.guild().channels.get(this.$route.params.channelID)
        : null;
    },
    topHit() {
      console.log('top hit trigger');
    },
    setVirtualListToOffset(offset) {
      if (this.$refs.vsl) {
        this.$refs.vsl.scrollToOffset(offset);
      }
    },
    setVirtualListToBottom() {
      if (this.$refs.vsl) {
        this.$refs.vsl.scrollToBottom();
      }
    },
  },
  head() {
    return this.channel()
      ? {
          title: '#' + this.channel().name,
        }
      : {};
  },
});
</script>
