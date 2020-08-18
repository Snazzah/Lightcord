<template>
  <div class="start-layout">
    <Nuxt />
  </div>
</template>

<style lang="scss">
@import "~/styles/start.scss";
@import "vue2-animate/src/sass/vue2-animate.scss";
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap');

html, body {
  font-family:
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
  color: $start-text;
  background-color: $start-background;
  padding: 0;
  margin: 0;
}

h1, h2, h3 {
  color: $start-header;
  font-feature-settings: 'ordn' on, 'liga' off;
}

.start-layout {
  margin: 20px;
}

input {
  font-family:
    Roboto,
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Helvetica Neue',
    Arial,
    sans-serif;
}
</style>
