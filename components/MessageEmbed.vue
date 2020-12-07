<template>
  <div v-if="source.type === 'image'" class="embed markup" aria-hidden="false">
    <a
      class="image-wrapper embed-wrapper embed-media embed-image no-margin"
      tabindex="0"
      :href="source.url"
      rel="noreferrer noopener"
      target="_blank"
      role="button"
      :style="`width: ${clampedSize[0]}px; height: ${clampedSize[1]}px`"
    >
      <img
        alt=""
        :src="
          proxyURL(source.thumbnail.proxy_url, clampedSize[0], clampedSize[1])
        "
        :style="`width: ${clampedSize[0]}px; height: ${clampedSize[1]}px`"
      />
    </a>
  </div>
  <div
    v-else
    class="embed full markup"
    aria-hidden="false"
    :style="source.color ? `border-color: #${source.color.toString(16)}` : ''"
  >
    <div class="grid">
      <div
        class="suppress-button"
        aria-label="Remove all embeds"
        role="button"
        tabindex="0"
      >
        <svg aria-hidden="false" width="16" height="16" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
          />
        </svg>
      </div>
      <div v-if="source.provider" class="embed-provider">
        <span>Snazzah</span>
      </div>
      <div v-if="source.author" class="embed-author">
        <img
          v-if="source.author.icon_url"
          alt=""
          class="embed-author-icon"
          :src="source.author.proxy_icon_url"
        /><a
          v-if="source.author.url && source.author.name"
          class="embed-author-name embed-link"
          tabindex="0"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {{ source.author.name }}
        </a>
        <span v-else-if="source.author.name" class="embed-author-name">{{
          source.author.name
        }}</span>
      </div>
      <div v-if="source.url && source.title" class="embed-title">
        <a
          class="embed-title-link embed-link"
          tabindex="0"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {{ source.title }}
        </a>
      </div>
      <div v-else-if="source.title" class="embed-title">{{ source.title }}</div>
      <MDRender
        v-if="source.description"
        class="embed-description"
        :content="parsedDescription"
      />
      <div v-if="source.footer" class="embed-footer">
        <img
          v-if="source.footer.icon_url"
          alt=""
          class="embed-footer-icon"
          :src="source.footer.proxy_icon_url"
        /><span v-if="source.timestamp" class="embed-footer-text">
          {{ source.footer.text }}
          <span class="embed-footer-separator">•</span>{{ timestamp }}
        </span>
        <span v-else class="embed-footer-text">{{ source.footer.text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
import { MDRender, defaultParser } from '~/assets/markdownParser';
import { clampSize } from '~/assets/constants';

export default Vue.extend({
  name: 'MessageEmbed',
  components: { MDRender },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  computed: {
    timestamp() {
      return this.source.timestamp
        ? moment(this.source.timestamp).calendar()
        : null;
    },
    parsedDescription() {
      return this.source.description
        ? defaultParser(this.source.description)
        : null;
    },
    clampedSize() {
      return this.source.type === 'image'
        ? clampSize(
            300,
            this.source.thumbnail.width,
            this.source.thumbnail.height
          )
        : [0, 0];
    },
  },
  methods: {
    proxyURL(url, w, h) {
      return url + `?width=${w}&height=${h}`;
    },
  },
});
</script>
