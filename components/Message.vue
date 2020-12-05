<template>
  <!-- <span>{{ source.content }}</span> -->
  <div class="message cozy group-start" role="listitem">
    <div class="message-contents">
      <img
        :src="source.author.dynamicAvatarURL('jpg', 128)"
        aria-hidden="true"
        class="avatar"
        alt=" "
      />
      <h2 class="header">
        <span class="header-text">
          <!-- eslint-disable -->
          <span
            class="username"
            aria-expanded="false"
            role="button"
            tabindex="0"
            :style="source.member ? `color: #${colorRole.color.toString(16)}` : ''"
          >{{ source.member && source.member.nick ? source.member.nick : source.author.username }}</span><span v-if="source.author.system" class="bot-tag regular">
            <span class="text">SYSTEM</span>
          </span><span v-else-if="source.author.bot" class="bot-tag regular">
            <svg-verified-bot-tick v-if="verifiedBot" v-tippy content="Verified Bot" />
            <span class="text">BOT</span>
          </span>
        </span><span v-tippy="{ delay: [1000, 0] }" :content="fullTimestamp" class="timestamp"><span :aria-label="timestamp">{{ timestamp }}</span></span>
      </h2>
      <div class="markup message-content">{{ source.content }}</div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';

export default Vue.extend({
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
    // color: rgb(25, 184, 184)
    colorRole() {
      return this.source.member
        ? this.source.chanel.guild.roles
            .filter((r) => this.source.member.roles.has(r))
            .find((role) => role.color !== 0)
        : null;
    },
    verifiedBot() {
      return this.source.author.bot
        ? (this.source.author.publicFlags & (1 << 16)) === 1 << 16
        : false;
    },
    timestamp() {
      return moment(this.source.createdAt).calendar();
    },
    fullTimestamp() {
      return moment(this.source.createdAt).format('LLLL');
    },
  },
});
</script>
