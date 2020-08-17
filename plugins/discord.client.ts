import Eris from 'eris';
import { Plugin } from '@nuxt/types';

const LOG_PREFIX = ['%c[Discord]', 'color:#7289DA; font-weight: bold;'];

interface DiscordPlugin {
  client?: Eris.Client,
  init(opts: LoadArgumentsOpts): void
}

interface LoadArgumentsOpts {
  token: string,
  membersIntent: boolean,
  presenceIntent: boolean
}

// Inject into nuxt (this.$discord)
declare module 'vue/types/vue' {
  interface Vue {
    $discord: DiscordPlugin
  }
}

// Inject into context (context.$discord)
declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $discord: DiscordPlugin
  }
  interface Context {
    $discord: DiscordPlugin
  }
}

const discordPlugin: Plugin = (context, inject) => {
  const Discord: DiscordPlugin = {
    client: undefined,
    init (opts: LoadArgumentsOpts) {
      const options = {
        autoreconnect: false, // This sets to true after connecting
        allowedMentions: {
          everyone: true,
          roles: true,
          users: true,
        },
        maxShards: 'auto',
        messageLimit: 0,
        // Commented out intents are not supported
        intents: [
          'guilds',
          // 'guildBans',
          // 'guildEmojis',
          // 'guildIntegrations',
          // 'guildWebhooks',
          // 'guildInvites',
          // 'guildVoiceStates',
          'guildMessages',
          // 'guildMessageReactions',
          // 'guildMessageTyping',
          'directMessages',
          // 'directMessageReactions',
          // 'directMessageTyping'
        ],
      };

      if (opts.membersIntent)
        options.intents.push('guildMembers');
      if (opts.presenceIntent)
        options.intents.push('guildPresences');

      this.client = new Eris.Client(opts.token, options as Eris.ClientOptions);
      console.info(...LOG_PREFIX, 'Initialized client', this.client);

      // Events
      this.client.on('ready', () => console.info(...LOG_PREFIX, 'All shards ready.'));
      this.client.on('disconnect', () => console.warn(...LOG_PREFIX, 'All shards Disconnected.'));
      this.client.on('reconnecting', () => console.warn(...LOG_PREFIX, 'Reconnecting client.'));
      this.client.on('debug', message => console.debug(...LOG_PREFIX, message));

      // Shard Events
      this.client.on('connect', id => console.info(...LOG_PREFIX, `Shard ${id} connected.`));
      this.client.on('error', (error, id) => console.error(...LOG_PREFIX, `Error in shard ${id}`, error));
      this.client.on('hello', (_, id) => console.info(...LOG_PREFIX, `Shard ${id} recieved hello.`));
      this.client.on('warn', (message, id) => console.warn(...LOG_PREFIX, `Warning in Shard ${id}`, message));
      this.client.on('shardReady', id => console.info(...LOG_PREFIX, `Shard ${id} ready.`));
      this.client.on('shardResume', id => console.warn(...LOG_PREFIX, `Shard ${id} resumed.`));
      this.client.on('shardDisconnect', (error, id) => console.warn(...LOG_PREFIX, `Shard ${id} disconnected`, error));
    },
  };
  inject('discord', Discord);
  context.$discord = Discord;
};

export default discordPlugin;
