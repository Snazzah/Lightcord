import Vue from 'vue';
import VueTippy, { TippyComponent } from 'vue-tippy';

Vue.use(VueTippy, {
  theme: 'discord-black',
  animation: 'perspective',
});
Vue.component('tippy', TippyComponent);
