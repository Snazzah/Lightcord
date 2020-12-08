<template>
  <div
    class="message cozy group-start"
    :class="mentioned ? 'mentioned' : ''"
    role="listitem"
  >
    <div class="message-contents" role="document">
      <img
        :src="source.author.dynamicAvatarURL('png', 128)"
        aria-hidden="true"
        class="avatar"
        alt=" "
      />
      <h2 class="header">
        <span class="header-text">
          <span
            class="username"
            aria-expanded="false"
            role="button"
            tabindex="0"
            :style="
              source.member && colorRole
                ? `color: #${colorRole.color.toString(16).padStart(6, '0')}`
                : ''
            "
          >
            {{
              source.member && source.member.nick
                ? source.member.nick
                : source.author.username
            }}
          </span>
          <span v-if="isFromSystemUser" class="bot-tag regular">
            <span class="text">SYSTEM</span>
          </span>
          <span v-else-if="source.author.bot" class="bot-tag regular">
            <svg-verified-bot-tick
              v-if="verifiedBot"
              v-tippy="{ content: 'Verified Bot' }"
            />
            <span class="text">BOT</span>
          </span>
        </span>
        <span
          v-tippy="{ delay: [1000, 0], content: fullTimestamp }"
          class="timestamp"
        >
          <span :aria-label="timestamp">{{ timestamp }}</span>
        </span>
      </h2>
      <div class="markup message-content">
        <MDRender v-if="source.content" :content="parsedMessage" /><time
          v-if="source.editedTimestamp"
          v-tippy="{ content: editedTimestamp }"
          :datetime="new Date(source.editedTimestamp).toISOString()"
          class="edited"
          role="note"
          :aria-label="editedTimestamp"
        >
          (edited)
        </time>
      </div>
      <div v-if="source.embeds.length" class="extras-container">
        <message-embed
          v-for="(embed, i) in source.embeds"
          :key="i"
          :source="embed"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
import { MDRender, messageParser } from '~/assets/markdownParser';
import { SYSTEM_USER_IDS } from '~/assets/constants';

export default Vue.extend({
  name: 'Message',
  components: { MDRender },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      app: window.LightcordApp,
      channelPage: this.$parent.$parent.$parent,
    };
  },
  computed: {
    colorRole() {
      return this.source.member
        ? this.source.channel.guild.roles
            .filter((r) => this.source.member.roles.includes(r.id))
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
    editedTimestamp() {
      return moment(this.source.editedTimestamp).format('LLLL');
    },
    parsedMessage() {
      return messageParser(this.source.content, {
        channelPage: this.channelPage,
      });
    },
    isFromSystemUser() {
      return SYSTEM_USER_IDS.includes(this.source.author.id);
    },
    mentioned() {
      return (
        this.source.mentionEveryone ||
        (this.source.roleMentions &&
          this.source.guildID &&
          this.source.channel.guild.members
            .get(this.$discord.client.user.id)
            .roles.filter((id) => this.source.roleMentions.includes(id))
            .length > 0) ||
        this.source.mentions
          .map((user) => user.id)
          .includes(this.$discord.client.user.id)
      );
    },
  },
});
</script>
