<template>
  <div class="app">
    <Nuxt />
  </div>
</template>

<style lang="scss">
@import "~/styles/app.scss";
@import "vue2-animate/src/sass/vue2-animate.scss";

html, body, .app {
  font-family:
    Whitney,
    Roboto,
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-size: 16px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: $text-color;
  background-color: $main-background;
  padding: 0;
  margin: 0;
  font-feature-settings: 'ordn' on, 'liga' off;
}

.tippy-tooltip.discord-theme {
    background-color: #7289da;
    border: 5px solid #7289DA;
    font-size: 12px;
    padding: 0 2px;
    color: #fff;
}

.tippy-popper[x-placement^=top] .tippy-tooltip.discord-theme [x-arrow] {
    bottom: -12px;
    border-top: 7px solid #7289DA;
    transform: translateX(-5px);
}

.app {
  .main-layer {
    display: flex;
    -webkit-box-orient: horizontal;
    -moz-box-orient: horizontal;
    -o-box-orient: horizontal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    .guilds-sidebar {
      background-color: $guilds-background;
      display: flex;
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      -o-box-orient: vertical;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
      width: 72px;
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
      & > .scroller::-webkit-scrollbar {
        width: 0;
      }
    }
    .channel-sidebar {
      background-color: $sidebar-background;
      display: flex;
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      -o-box-orient: vertical;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
      width: 240px;
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
      & > .scroller::-webkit-scrollbar {
        width: 0;
      }
    }
    .layer-content {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: box;
      width: 100vh;
      height: 100vh;
      flex: 1;
      display: flex;
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      -o-box-orient: vertical;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
      &.chat {
        background-color: $chat-background;
      }
    }
  }

  .scroller {
    position: relative;
    overflow: hidden scroll;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    flex: 1;
  }
}

.messages-container::-webkit-scrollbar, .app-scroller::-webkit-scrollbar {
  width:15px;
}
.messages-container::-webkit-scrollbar-thumb, .app-scroller::-webkit-scrollbar-thumb {
  background-color: #1e2124;
  border-color: #36393e;
  -webkit-background-clip: padding;
  -moz-background-clip: padding;
  background-clip: padding-box;
  border: 3px solid #fff;
  -webkit-border-radius: 7px;
  border-radius: 7px;
  width:50px;
}
.messages-container::-webkit-scrollbar-track-piece, .app-scroller::-webkit-scrollbar-track-piece {
  background-color: #2e3136;
  border-color: #36393e;
}

</style>
