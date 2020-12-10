<template>
  <!-- audio -->
  <div
    v-if="/\.(mp3|m4a|ogg|wav|flac)$/i.test(source.filename)"
    class="audio-wrapper embed-wrapper"
  >
    <div class="audio-metadata">
      <div class="metadata-content">
        <a
          class="metadata-name"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
        >
          Logi_-_Humming_the_Bassline_Scratchin_Remix.mp3
        </a>
        <div class="metadata-size">7.63 MB</div>
      </div>
      <a
        class="metadata-download"
        :href="source.url"
        rel="noreferrer noopener"
        target="_blank"
      >
        <svg-download-button />
      </a>
    </div>
    <!-- normally there would be a custom audio player here, but... -->
    <video controls="" height="50">
      <source :src="source.url" />
    </video>
  </div>
  <!-- file -->
  <div v-else-if="!hasWidthAndHeight" class="attachment normal embed-wrapper">
    <img
      class="icon"
      :src="`/img/fileicons/${fileClass}.svg`"
      :alt="'Attachment file type: ' + fileClass"
      :title="fileClass"
    />
    <div class="attachment-inner">
      <div class="filename-link-wrapper">
        <a
          class="filename-link"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
        >
          {{ source.filename }}
        </a>
      </div>
      <div class="metadata">{{ filesize }}</div>
    </div>
    <a
      class="download-wrapper"
      :href="source.url"
      rel="noreferrer noopener"
      target="_blank"
    >
      <svg-download-button />
    </a>
  </div>
  <!-- video -->
  <div
    v-else-if="/\.(mp4|webm|mov)$/i.test(source.filename)"
    class="image-wrapper embed-wrapper"
    :style="sizeToStyle(...calcRatio())"
  >
    <div
      class="video-wrapper"
      :class="videoPlaying ? 'playing' : ''"
      data-fullscreen="false"
      :style="sizeToStyle(...calcRatio())"
    >
      <div class="video-metadata">
        <div class="metadata-content">
          <div class="metadata-name">{{ source.filename }}</div>
          <div class="metadata-size">{{ filesize }}</div>
        </div>
        <a
          aria-label="Download"
          class="metadata-download"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
        >
          <svg-download-button />
        </a>
      </div>
      <video
        ref="video"
        controls=""
        :width="calcRatio()[0]"
        :height="calcRatio()[1]"
        :poster="proxyURL(source.proxy_url, ...calcRatio(500, 400), 'jpeg')"
        preload="metadata"
        :src="source.url"
      />
    </div>
  </div>
  <!-- gif -->
  <a
    v-else-if="source.filename.endsWith('.gif')"
    class="image-wrapper embed-wrapper"
    tabindex="0"
    :href="source.url"
    rel="noreferrer noopener"
    target="_blank"
    role="button"
    :style="sizeToStyle(...calcRatio())"
    @mouseover="gifPlaying = true"
    @mouseout="gifPlaying = false"
  >
    <div class="image-accessory">
      <div v-if="!gifPlaying" class="gif-tag" />
    </div>
    <img
      v-if="!gifPlaying"
      alt=""
      :src="source.proxy_url + '?format=png'"
      :style="sizeToStyle(...calcRatio())"
    />
    <img
      v-else
      alt=""
      :src="source.proxy_url"
      :style="sizeToStyle(...calcRatio())"
    />
  </a>
  <!-- picture -->
  <a
    v-else
    class="image-wrapper embed-wrapper"
    tabindex="0"
    :href="source.url"
    rel="noreferrer noopener"
    target="_blank"
    role="button"
    :style="sizeToStyle(...calcRatio())"
  >
    <img
      alt=""
      :src="proxyURL(source.proxy_url, ...calcRatio(500, 400))"
      :style="sizeToStyle(...calcRatio())"
    />
  </a>
</template>

<script>
import Vue from 'vue';
import { getRatio, filesize } from '~/assets/util';
import { getFileClass } from '~/assets/constants';

export default Vue.extend({
  name: 'MessageAttachment',
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      videoTicker: 0,
      gifPlaying: false,
    };
  },
  computed: {
    hasWidthAndHeight() {
      return !!this.source.width && !!this.source.height;
    },
    filesize() {
      return filesize(this.source.size);
    },
    fileClass() {
      return getFileClass(this.source.filename);
    },
    videoPlaying() {
      ((_) => {})(this.videoTicker);

      return this.$refs.video ? !this.$refs.video.paused : false;
    },
  },
  mounted() {
    if (this.$refs.video) {
      this.$refs.video.onplay = () => (this.videoTicker = Date.now());
      this.$refs.video.onpause = () => (this.videoTicker = Date.now());
    }
  },
  methods: {
    proxyURL(url, w, h, format = null) {
      return (
        url +
        (format
          ? `?format=${format}&width=${w}&height=${h}`
          : `?width=${w}&height=${h}`)
      );
    },
    sizeToStyle(width, height) {
      return `width: ${width}px; height: ${height}px;`;
    },
    calcRatio(maxWidth = 400, maxHeight = 300) {
      const ratio = getRatio(
        this.source.width,
        this.source.height,
        maxWidth,
        maxHeight
      );
      return [
        Math.round(ratio * this.source.width),
        Math.round(ratio * this.source.height),
      ];
    },
  },
});
</script>
