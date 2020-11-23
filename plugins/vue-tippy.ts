import Vue from 'vue';
import VueTippy, { TippyComponent } from 'vue-tippy';

Vue.use(VueTippy, {
  theme: 'discord-black',
  animation: 'perspective',
  arrow: true,
});
Vue.component('tippy', TippyComponent);
