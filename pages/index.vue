<template>
  <div class="start-page">
    <div class="hero">
      <transition appear name="fade">
        <img src="~/assets/lightcord.png" draggable="false">
      </transition>
      <transition appear name="fadeRight">
        <div class="hero-text">
          <div class="hero-title">
            <h1>Lightcord</h1>
            <small>v2.0.0</small>
          </div>
          <h3>placeholder</h3>
          <div class="buttons">
            <a
              href="https://github.com/Snazzah/Lightcord"
              target="_blank"
            >GitHub</a>
          </div>
        </div>
      </transition>
    </div>
    <div class="login" :class="loading ? 'loading' : ''">
      <div v-if="error" class="error-login">
        {{ error }}
      </div>
      <div class="input-wrapper">
        <input ref="input" placeholder="Bot Token..." type="password" @keyup.enter="login">
        <svg
          v-tippy="{ arrow: true, placement: 'left', theme: 'lightcord' }"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          focusable="false"
          style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1024 1024"
          content="Login (enter)"
          @click="login"
        >
          <path
            d="M864 170h-60c-4.4 0-8 3.6-8 8v518H310v-73c0-6.7-7.8-10.5-13-6.3l-141.9 112a8 8 0 0 0 0 12.6l141.9 112c5.3 4.2 13 .4 13-6.3v-75h498c35.3 0 64-28.7 64-64V178c0-4.4-3.6-8-8-8z"
          />
        </svg>
      </div>
      <div v-if="lastSession" class="session-continue" @click="continueSession">
        <span><i>Continue as</i> <b>{{ lastSession.username }}</b>#{{ lastSession.discriminator }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          focusable="false"
          style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M521.7 82c-152.5-.4-286.7 78.5-363.4 197.7c-3.4 5.3.4 12.3 6.7 12.3h70.3c4.8 0 9.3-2.1 12.3-5.8c7-8.5 14.5-16.7 22.4-24.5c32.6-32.5 70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8c47.9 0 94.3 9.3 137.9 27.8c42.2 17.8 80.1 43.4 112.7 75.9c32.6 32.5 58.1 70.4 76 112.5C865.7 417.8 875 464.1 875 512c0 47.9-9.4 94.2-27.8 137.8c-17.8 42.1-43.4 80-76 112.5s-70.5 58.1-112.7 75.9A352.8 352.8 0 0 1 520.6 866c-47.9 0-94.3-9.4-137.9-27.8A353.84 353.84 0 0 1 270 762.3c-7.9-7.9-15.3-16.1-22.4-24.5c-3-3.7-7.6-5.8-12.3-5.8H165c-6.3 0-10.2 7-6.7 12.3C234.9 863.2 368.5 942 520.6 942c236.2 0 428-190.1 430.4-425.6C953.4 277.1 761.3 82.6 521.7 82zM395.02 624v-76h-314c-4.4 0-8-3.6-8-8v-56c0-4.4 3.6-8 8-8h314v-76c0-6.7 7.8-10.5 13-6.3l141.9 112a8 8 0 0 1 0 12.6l-141.9 112c-5.2 4.1-13 .4-13-6.3z"
          />
        </svg>
      </div>
      <span v-if="lastSession" class="session-remove" @click="removeSession">Remove last session</span>
    </div>
    <div class="markdown">
      Lightcord is a webapp for Discord bots, allowing you to interact with Discord servers as the bot.
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface DiscordHTTPError extends Error {
  code: number
}

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Invalid token!',
  USER_ACCOUNT: 'Do not use user tokens in Lightcord!',
};

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
  computed: {
    lastSession () {
      if (process.server) return;
      const sessionString = window.localStorage.getItem('LC-LastSession');
      return sessionString ? JSON.parse(sessionString) : null;
    },
  },
  methods: {
    async login () {
      this.$discord.init({
        token: (this.$refs.input as HTMLInputElement).value,
        membersIntent: false,
        presenceIntent: false,
      });
      if (this.$discord.client) {
        this.setLoginState(true);
        const errorBind = (error: Error) => {
          console.error('err spawning shards', error);
          this.$discord.destroy();
          this.setLoginState(false, false, error);
        };
        try {
          this.$discord.client
            .once('ready', () => {
              if (this.$discord.client) {
                if (!this.$discord.client.bot) {
                  this.$discord.destroy();
                  this.setLoginState(false, true, new Error(ERROR_MESSAGES.USER_ACCOUNT));
                } else {
                  console.info('ready');
                  this.$discord.client.options.autoreconnect = true;
                  this.setLastSession();
                  this.$router.push('app');
                  this.setLoginState(false, true);
                }
              }
            })
            .once('error', errorBind);
          await this.$discord.client.connect();
        } catch (e) {
          this.$discord.destroy();
          console.error('err logging in', e);
          this.setLoginState(false, true, e);
        }
      }
    },
    setLoginState (loading: boolean, clearInput: boolean = false, error?: Error) {
      this.loading = loading;
      this.error = error ? this.translateError(error) : '';
      if (loading)
        (this.$refs.input as HTMLInputElement).blur();
      else
        (this.$refs.input as HTMLInputElement).focus();
      if (this.error === ERROR_MESSAGES.UNAUTHORIZED &&
        this.lastSession &&
        this.lastSession.token === (this.$refs.input as HTMLInputElement).value &&
        process.browser)
        window.localStorage.removeItem('LC-LastSession');
      if (clearInput)
        (this.$refs.input as HTMLInputElement).value = '';
    },
    translateError (error: Error) {
      if (error.name === 'DiscordHTTPError') {
        const httpError = error as DiscordHTTPError;
        if (httpError.code === 401)
          return ERROR_MESSAGES.UNAUTHORIZED;
      } else if (error.message === ERROR_MESSAGES.USER_ACCOUNT)
        return error.message;
      else return error.toString();
    },
    setLastSession () {
      if (this.$discord.client) {
        window.localStorage.setItem('LC-LastSession', JSON.stringify({
          token: this.$discord.client.token,
          id: this.$discord.client.user.id,
          username: this.$discord.client.user.username,
          discriminator: this.$discord.client.user.discriminator,
          path: '/',
        }));
      }
    },
    continueSession () {
      (this.$refs.input as HTMLInputElement).value = this.lastSession.token;
      this.login();
    },
    removeSession () {
      if (confirm('Are you sure you want to remove the last session?')) {
        window.localStorage.removeItem('LC-LastSession');
        window.location.reload(false);
      }
    },
  },
});
</script>

<style lang="scss">
@import "~/styles/start.scss";

.hero {
  display: flex;
  justify-content: center;
  background: #373737;
  padding: 20px;
  border-radius: 15px;
  overflow: hidden;
  img {
    height: 200px;
    margin-right: 20px;
  }
  .hero-text {
    display: flex;
    align-self: center;
    flex-direction: column;
    .hero-title {
      display: flex;
      align-self: center;
      flex-direction: row;
      h1 {
        margin: 0;
        font-size: 72px;
        line-break: anywhere;
        font-style: italic;
        font-weight: bold;
      }
      small {
        align-self: center;
        margin: 20px;
        font-style: italic;
        font-weight: bold;
        font-size: 24px;
        line-height: 42px;
        color: rgba(255, 255, 255, 0.19);
      }
    }
    h3 {
      margin: 0;
      color: $start-text;
      max-width: 400px;
      font-weight: normal;
      font-size: 24px;
      margin-bottom: 10px;
    }
  }
  .buttons {
    padding: 10px 0;
    a {
      padding: 10px;
      background: #282828;
      border-radius: 10px;
      color: #C9C9C9;
      font-weight: 300;
      font-size: 24px;
      text-decoration: none;
      & + a {
        margin-left: 5px;
      }
    }
  }
}

.login {
  margin: 20px 0;
  transition: opacity .1s ease;
  &.loading {
    opacity: .5;
    transition: opacity .1s ease;
    pointer-events: none;
  }
  & > * + * {
    margin-top: 10px;
  }
  .error-login {
    background-color: #e74c3c;
    color: #fff;
    padding: 10px;
    border-radius: 10px;
  }
  .input-wrapper {
    background: #3B3D3F;
    border: 1px solid #8B8B8B;
    box-sizing: border-box;
    border-radius: 5px;
    display: flex;
    overflow: hidden;
    flex-direction: row;
    height: 60px;
    input {
      height: 50px;
      padding: 5px 10px;
      background: transparent;
      border: none;
      font-size: 36px;
      color: #C9C9C9;
      font-weight: 300;
      outline: none;
      flex-grow: 5;
      &::placeholder {
        color: #545454;
      }
    }
    svg {
      height: 60px;
      cursor: pointer;
      transition: fill .1s ease;
      fill: #ABABAB;
      order: 1;
      outline: none;
      &:hover {
        transition: fill .1s ease;
        fill: #fff;
      }
    }
  }
  .session-continue {
    background: $start-accent;
    box-sizing: border-box;
    border-radius: 5px;
    display: flex;
    overflow: hidden;
    flex-direction: row;
    height: 60px;
    cursor: pointer;
    transition: background .1s ease;
    &:hover {
      transition: background .1s ease;
      background: #a9eeff;
    }
    span {
      height: 50px;
      padding: 5px 10px;
      font-size: 36px;
      color: #000;
      flex-grow: 5;
      i {
        font-style: normal;
        font-weight: 300;
      }
    }
    svg {
      height: 60px;
      transition: fill .1s ease;
      fill: #000;
      order: 1;
      outline: none;
    }
  }
  .session-remove {
    color: $start-header;
    cursor: pointer;
    display: block;
    &:hover {
      text-decoration: underline;
    }
  }
}

.tippy-tooltip.lightcord-theme {
  background-color: #060606;
  .tippy-arrow {
    border-left-color: #060606;
  }
}
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
