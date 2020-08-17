<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">
        Lightcord
      </h1>
      <div class="links">
        <a
          href="https://github.com/Snazzah/Lightcord"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub
        </a>
        <nuxt-link
          to="/test"
          rel="noopener noreferrer"
          class="button--grey"
        >
          test
        </nuxt-link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
          @click="login"
        >
          login
        </a>
        <input ref="input" placeholder="token" @keyup.enter="login">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Eris from 'eris';

export default Vue.extend({
  data () {
    return {
      loading: false,
      error: undefined,
    } as {
      loading: boolean,
      error?: string
    };
  },
  methods: {
    async login () {
      if (this.$discord.client) {
        this.$discord.init({
          token: (this.$refs.input as HTMLInputElement).value,
          membersIntent: false,
          presenceIntent: false,
        });
        this.loading = true;
        const errorBind = (error: Error) => {
          if (this.$discord.client)
            this.$discord.client.eventNames()
              .map(eventName => (this.$discord.client as Eris.Client).removeAllListeners(eventName));
          console.error('err spawning shards', error);
          delete this.$discord.client;
          this.loading = false;
        };
        try {
          await this.$discord.client.connect();
          this.$discord.client
            .once('ready', () => {
              if (this.$discord.client)
                this.$discord.client.options.autoreconnect = true;
              alert('logged in');
              this.loading = false;
            })
            .once('error', errorBind);
        } catch (e) {
          console.error('err logging in', e);
          this.$discord.client.removeListener('error', errorBind);
          this.loading = false;
        }
      }
    },
  },
});
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
