import Vue from 'vue';
import Eris from 'eris';
import { getEmojiURL } from './markdownEmoji';

export const MDAnchor = Vue.component('md-anchor', {
  props: {
    href: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
  },

  render(h) {
    const { href, title } = this;

    return h(
      'a',
      {
        attrs: {
          class: 'anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB',
          href,
          title,
          rel: 'noreferrer noopener',
          target: '_blank',
          role: 'button',
          tabindex: '0',
        },
      },
      this.$slots.default
    );
  },
});

export const MDCustomEmoji = Vue.component('md-custom-emoji', {
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    animated: {
      type: Boolean,
      default: false,
    },
    jumboable: {
      type: Boolean,
      default: false,
    },
  },

  render(h) {
    const { id, name, animated, jumboable } = this;

    return h(
      'span',
      {
        directives: [
          {
            name: 'tippy',
            value: {
              content: `:${name}:`,
              delay: [500, 0],
            },
          },
        ],
        attrs: {
          class: 'emoji-container',
          role: 'button',
          tabindex: '0',
        },
      },
      [
        h('img', {
          attrs: {
            'aria-label': `:${name}:`,
            src: `https://cdn.discordapp.com/emojis/${id}.${
              animated ? 'gif' : 'png'
            }?v=1`,
            alt: `:${name}:`,
            draggable: 'false',
            class: `emoji ${jumboable ? 'jumboable' : ''}`,
          },
        }),
      ]
    );
  },
});

export const MDEmoji = Vue.component('md-emoji', {
  props: {
    name: {
      type: String,
      required: true,
    },
    surrogate: {
      type: String,
      required: true,
    },
    jumboable: {
      type: Boolean,
      default: false,
    },
  },

  render(h) {
    const { name, surrogate, jumboable } = this;

    return h(
      'span',
      {
        directives: [
          {
            name: 'tippy',
            value: {
              content: `:${name}:`,
              delay: [500, 0],
            },
          },
        ],
        attrs: {
          class: 'emoji-container',
          role: 'button',
          tabindex: '0',
        },
      },
      [
        h('img', {
          attrs: {
            'aria-label': `:${name}:`,
            src: getEmojiURL(surrogate),
            alt: `:${name}:`,
            draggable: 'false',
            class: `emoji ${jumboable ? 'jumboable' : ''}`,
          },
        }),
      ]
    );
  },
});

export const MDSpoiler = Vue.component('md-spoiler', {
  data() {
    return {
      hidden: true,
    };
  },

  methods: {
    click() {
      // @ts-ignore
      this.hidden = false;
    },
  },

  render(h) {
    // @ts-ignore
    const hidden = this.hidden;

    return h(
      'span',
      {
        attrs: hidden
          ? {
              class: 'spoiler-text hidden',
              'aria-label': 'Spoiler',
              'aria-expanded': false,
              role: 'button',
              tabindex: 0,
            }
          : {
              class: 'spoiler-text',
              'aria-expanded': true,
              role: 'presentation',
              tabindex: -1,
            },
        on: hidden
          ? {
              // @ts-ignore
              click: this.click,
            }
          : {},
      },
      [
        h(
          'span',
          {
            attrs: {
              class: 'inline-content',
              'aria-hidden': hidden,
            },
          },
          this.$slots.default
        ),
      ]
    );
  },
});

export const MDMention = Vue.component('md-mention', {
  props: {
    id: {
      type: String,
      required: true,
    },
    match: {
      type: String,
      required: true,
    },
    channelPage: {
      type: Object,
      default: null,
    },
  },

  computed: {
    userFound() {
      return (
        (this.channelPage &&
          (this.channelPage as any).members &&
          this.channelPage.members.has(this.id)) ||
        this.$discord.client?.users.has(this.id)
      );
    },
    userName() {
      const channelPage = this.channelPage as any;
      const member =
        channelPage && channelPage.members && channelPage.members.has(this.id)
          ? channelPage.members.get(this.id)
          : null;
      const user = (this.$discord as any).client?.users.get(this.id);
      return member
        ? member.nick || member.user.username
        : user
        ? user.username
        : null;
    },
  },

  render(h) {
    const { match, userFound, userName } = this as {
      match: string;
      userName: string;
      userFound: boolean;
    };

    return h(
      'span',
      {
        attrs: {
          class: userFound ? 'mention interactive' : 'mention',
          role: 'button',
          tabindex: Number(userFound) - 1,
        },
      },
      userFound ? '@' + userName : match
    );
  },
});

export const MDRoleMention = Vue.component('md-role-mention', {
  props: {
    id: {
      type: String,
      required: true,
    },
    channelPage: {
      type: Object,
      default: null,
    },
  },

  computed: {
    roleFound() {
      return (
        this.channelPage &&
        (this.channelPage as any).roles &&
        this.channelPage.roles.has(this.id)
      );
    },
    role() {
      return (
        (this.channelPage &&
          (this.channelPage as any).roles &&
          this.channelPage.roles.get(this.id)) ||
        null
      );
    },
  },

  render(h) {
    const { roleFound, role } = this as {
      role: Eris.Role;
      roleFound: boolean;
    };

    if (!roleFound) return h('span', '@deleted-role');

    const color = role.color.toString(16).padStart(6, '0');

    return h(
      'span',
      {
        style:
          role.color === 0
            ? {}
            : {
                color: '#' + color,
                backgroundColor: '#' + color + '1a',
              },
        attrs: {
          class: 'mention',
          role: 'button',
          tabindex: '-1',
        },
      },
      '@' + role.name
    );
  },
});

export const MDChannelMention = Vue.component('md-channel-mention', {
  props: {
    id: {
      type: String,
      required: true,
    },
    channelPage: {
      type: Object,
      default: null,
    },
  },

  computed: {
    channelFound() {
      return (
        this.channelPage &&
        (this.channelPage as any).channels &&
        this.channelPage.channels.has(this.id)
      );
    },
    channel() {
      return (
        (this.channelPage &&
          (this.channelPage as any).channels &&
          this.channelPage.channels.get(this.id)) ||
        null
      );
    },
    parentChannel() {
      const channel = this.channel as Eris.GuildChannel;
      return channel && channel.parentID
        ? this.channelPage.channels.get(channel.parentID)
        : null;
    },
  },

  render(h) {
    const { channelFound, channel, parentChannel } = this as {
      channel: Eris.GuildChannel;
      parentChannel: Eris.GuildChannel;
      channelFound: boolean;
    };

    if (!channelFound) return h('span', '#deleted-channel');

    return h(
      'span',
      {
        directives: parentChannel
          ? [
              {
                name: 'tippy',
                value: {
                  content: parentChannel.name,
                },
              },
            ]
          : [],
        attrs: {
          class: 'mention interactive',
          role: 'button',
          tabindex: '0',
        },
      },
      '#' + channel.name
    );
  },
});
