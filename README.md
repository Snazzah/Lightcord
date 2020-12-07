# Lightcord V2
###### Based on Botcord by [Cernodile](https://github.com/Cernodile)
Lightcord is a visual representation of OAuth applications in Discord, helps you see how healthy your bot is doing.

## Help Wanted!
Feel free to PR to **this** branch (`v2`) as I try to map out what needs to be done. You can contact me in my [discord server](https://snaz.in/discord).

- [x] Login
- App client
  - [x] Base
  - [ ] Settings
    - [x] Index stats page
    - [x] Change theme
    - [ ] Change status
    - [ ] Event log page
  - Guilds
    - [x] Scroller rendering
    - [ ] Header shows boost status
    - [ ] Header banner
    - [ ] Header dropdown
    - [ ] Settings modal
  - Channels
    - [x] Scroller rendering
    - [x] No text channels fallback
    - [x] Collapsable Category Channels
    - Text channels
      - [x] Base text channel
      - [x] Message rendering
      - [x] Embed rendering
      - [ ] Show typing
      - [ ] Proper message scrolling

## Resources Used
- [eris](http://github.com/abalabahaha/eris) <small>used for the Discord API</small>
- [Nuxt](http://nuxtjs.org) <small>used for rendering pages</small>
- [Simple Markdown](https://github.com/Khan/simple-markdown) <small>used for markdown conversion</small>
- [Moment](http://momentjs.com) <small>used for timestamp conversion</small>
- [Tippy.js](https://github.com/atomiks/tippyjs) and [VueTippy](https://github.com/KABBOUCHI/vue-tippy) <small>used for tooltips</small>
- [hightlight.js](http://hightlightjs.com) <small>used for highlighting codeblocks</small>
- [FileDrop](http://filedropjs.org) <small>used for the Drag & Drop feature (planned)</small>
- [Twemoji](https://github.com/twitter/twemoji) <small>used for emoji conversion (planned)</small>
- [Fuse.js](http://fusejs.io) <small>used for searching (QuickSwitcher) (planned)</small>

### Note
Make sure `opusscript` (`yarn add eris --no-optional`) is not installed when building or else the build will not work.

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
