<template>
  <!-- spotify -->
  <iframe
    v-if="isSpotifyEmbed"
    class="embed-spotify embed-wrapper"
    :src="spotifyEmbedURL"
    frameborder="0"
    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
    :style="`width: 400px; height: ${isSpotifyTrack ? 80 : 300}px`"
  />
  <!-- image -->
  <div
    v-else-if="source.type === 'image'"
    class="embed markup"
    aria-hidden="false"
  >
    <a
      class="image-wrapper embed-wrapper embed-media embed-image no-margin"
      tabindex="0"
      :href="source.url"
      rel="noreferrer noopener"
      target="_blank"
      role="button"
      :style="sizeToStyle(...calcRatio(source.thumbnail))"
    >
      <img
        alt=""
        :src="
          proxyURL(
            source.thumbnail.proxy_url,
            ...calcRatio(source.thumbnail, 644, 644)
          )
        "
        :style="sizeToStyle(...calcRatio(source.thumbnail))"
      />
    </a>
  </div>
  <!-- video -->
  <div
    v-else-if="source.type === 'video' && !source.video.proxy_url"
    class="embed full markup"
    aria-hidden="false"
    :style="
      source.color
        ? `border-color: #${source.color.toString(16).padStart(6, '0')}`
        : ''
    "
  >
    <div class="grid">
      <message-suppress-embeds />
      <div v-if="source.provider" class="embed-provider">
        <a
          v-if="source.provider.url"
          class="embed-link"
          tabindex="0"
          :href="source.provider.url"
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {{ source.provider.name }}
        </a>
        <span v-else>{{ source.provider.name }}</span>
      </div>
      <div v-if="source.author" class="embed-author">
        <img
          v-if="source.author.icon_url"
          alt=""
          class="embed-author-icon"
          :src="proxyURL(source.author.proxy_icon_url, 128, 128)"
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
      <!-- #region title -->
      <div v-if="source.url && source.title" class="embed-title">
        <MDRender
          class="embed-title-link embed-link"
          tabindex="0"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
          role="button"
          tag="a"
          :content="limitedParser(source.title)"
        />
      </div>
      <MDRender
        v-else-if="source.title"
        tag="div"
        class="embed-title"
        :content="limitedParser(source.title)"
      />
      <!-- #endregion -->
      <!-- #region video -->
      <div
        v-if="!showVideo"
        class="embed-video embed-media"
        :style="sizeToStyle(...calcRatio(source.thumbnail))"
        @click.prevent="showVideo = true"
      >
        <a
          class="image-wrapper clickable embed-video-image-component"
          tabindex="0"
          href=""
          rel="noreferrer noopener"
          target="_blank"
          role="button"
          :style="sizeToStyle(...calcRatio(source.thumbnail))"
        >
          <img
            class="embed-video-image-component-inner"
            alt=""
            :src="source.thumbnail.proxy_url"
            :style="sizeToStyle(...calcRatio(source.thumbnail))"
          />
        </a>
        <div class="embed-video-actions">
          <div class="center-content">
            <div class="button-wrapper">
              <div
                class="icon-wrapper"
                tabindex="0"
                aria-label="Play"
                role="button"
              >
                <svg-play class="icon play" />
              </div>
              <a
                class="icon-wrapper"
                :href="source.url"
                rel="noreferrer noopener"
                target="_blank"
                role="button"
                tabindex="0"
                @click.stop=""
              >
                <svg-external-margins class="icon external-margins" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="embed-video embed-media"
        :style="sizeToStyle(...calcRatio(source.video))"
      >
        <iframe
          class="embed-iframe"
          frameborder="0"
          :src="embedIFrameURL"
          :width="calcRatio(source.video)[0]"
          :height="calcRatio(source.video)[1]"
          allowfullscreen=""
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
      <!-- #endregion -->
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
  <!-- raw video -->
  <div
    v-else-if="source.type === 'video'"
    class="embed markup"
    aria-hidden="false"
    :style="
      source.color
        ? `border-color: #${source.color.toString(16).padStart(6, '0')}`
        : ''
    "
  >
    <div
      class="embed-video embed-media"
      :style="sizeToStyle(...calcRatio(source.video))"
    >
      <video
        :width="calcRatio(source.video)[0]"
        :height="calcRatio(source.video)[1]"
        controls=""
      >
        <source :src="source.video.proxy_url" />
        Your browser does not support the video tag, how are you even using
        this?
      </video>
    </div>
  </div>
  <!-- rich -->
  <div
    v-else
    class="embed full markup"
    aria-hidden="false"
    :style="
      source.color
        ? `border-color: #${source.color.toString(16).padStart(6, '0')}`
        : ''
    "
  >
    <div class="grid">
      <message-suppress-embeds />
      <div v-if="source.provider" class="embed-provider">
        <a
          v-if="source.provider.url"
          class="embed-link"
          tabindex="0"
          :href="source.provider.url"
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {{ source.provider.name }}
        </a>
        <span v-else>{{ source.provider.name }}</span>
      </div>
      <div v-if="source.author" class="embed-author">
        <img
          v-if="source.author.icon_url"
          alt=""
          class="embed-author-icon"
          :src="proxyURL(source.author.proxy_icon_url, 128, 128)"
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
      <!-- #region title -->
      <div v-if="source.url && source.title" class="embed-title">
        <MDRender
          class="embed-title-link embed-link"
          tabindex="0"
          :href="source.url"
          rel="noreferrer noopener"
          target="_blank"
          role="button"
          tag="a"
          :content="limitedParser(source.title)"
        />
      </div>
      <MDRender
        v-else-if="source.title"
        tag="div"
        class="embed-title"
        :content="limitedParser(source.title)"
      />
      <!-- #endregion -->
      <MDRender
        v-if="source.description"
        tag="div"
        class="embed-description"
        :content="defaultParser(source.description)"
      />
      <a
        v-if="source.thumbnail && !source.video"
        class="image-wrapper embed-thumbnail"
        tabindex="0"
        :href="source.thumbnail.url"
        rel="noreferrer noopener"
        target="_blank"
        role="button"
        :style="sizeToStyle(...calcRatio(source.thumbnail, 80, 80))"
      >
        <img
          alt=""
          :src="
            proxyURL(
              source.thumbnail.proxy_url,
              ...calcRatio(source.thumbnail, 150, 150)
            )
          "
          :style="sizeToStyle(...calcRatio(source.thumbnail, 80, 80))"
        />
      </a>
      <!-- #region fields -->
      <div v-if="source.fields && source.fields.length" class="embed-fields">
        <div
          v-for="(field, i) of source.fields"
          :key="i"
          class="embed-field"
          :style="`grid-column: ${calculatedGridSizes[i]}`"
        >
          <MDRender
            tag="div"
            class="embed-field-name"
            :content="limitedParser(field.name)"
          />
          <MDRender
            tag="div"
            class="embed-field-value"
            :content="defaultParser(field.value)"
          />
        </div>
      </div>
      <!-- #endregion -->
      <a
        v-if="source.image"
        class="image-wrapper embed-wrapper embed-media embed-image"
        tabindex="0"
        :href="source.image.url"
        rel="noreferrer noopener"
        target="_blank"
        role="button"
        :style="sizeToStyle(...calcRatio(source.image))"
      >
        <img
          alt=""
          :src="
            proxyURL(
              source.image.proxy_url,
              ...calcRatio(source.image, 644, 644)
            )
          "
          :style="sizeToStyle(...calcRatio(source.image))"
        />
      </a>
      <!-- #region video -->
      <div
        v-if="source.video && !showVideo"
        class="embed-video embed-media"
        :style="sizeToStyle(...calcRatio(source.thumbnail))"
        @click.prevent="showVideo = true"
      >
        <a
          class="image-wrapper clickable embed-video-image-component"
          tabindex="0"
          href=""
          rel="noreferrer noopener"
          target="_blank"
          role="button"
          :style="sizeToStyle(...calcRatio(source.thumbnail))"
        >
          <img
            class="embed-video-image-component-inner"
            alt=""
            :src="source.thumbnail.proxy_url"
            :style="sizeToStyle(...calcRatio(source.thumbnail))"
          />
        </a>
        <div class="embed-video-actions">
          <div class="center-content">
            <div class="button-wrapper">
              <div
                class="icon-wrapper"
                tabindex="0"
                aria-label="Play"
                role="button"
              >
                <svg-play class="icon play" />
              </div>
              <a
                class="icon-wrapper"
                :href="source.url"
                rel="noreferrer noopener"
                target="_blank"
                role="button"
                tabindex="0"
                @click.stop=""
              >
                <svg-external-margins class="icon external-margins" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="source.video"
        class="embed-video embed-media"
        :style="sizeToStyle(...calcRatio(source.video))"
      >
        <iframe
          class="embed-iframe"
          frameborder="0"
          :src="embedIFrameURL"
          :width="calcRatio(source.video)[0]"
          :height="calcRatio(source.video)[1]"
          allowfullscreen=""
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
      <!-- #endregion -->
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
import {
  MDRender,
  defaultParser,
  limitedParser,
} from '~/assets/markdownParser';
import { SUPPORTED_IFRAME_URLS, getRatio } from '~/assets/constants';

export default Vue.extend({
  name: 'MessageEmbed',
  components: { MDRender },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showVideo: false,
    };
  },
  computed: {
    timestamp() {
      return moment(this.source.timestamp).calendar();
    },
    videoURLHostname() {
      return this.source.video ? new URL(this.source.video.url).hostname : null;
    },
    calculatedGridSizes() {
      if (!this.source.fields) return [];

      const grid = [];

      for (const field of this.source.fields) {
        if (!field.inline) {
          grid.push(field);
          continue;
        }

        const lastField = grid[grid.length - 1];
        if (!lastField || !Array.isArray(lastField) || lastField.length >= 3)
          grid.push([field]);
        else grid[grid.length - 1].push(field);
      }

      const gridColumnMap = {
        1: ['1 / 13'],
        2: ['1 / 7', '7 / 13'],
        3: ['1 / 5', '5 / 9', '9 / 13'],
      };

      return grid
        .map((field) => {
          if (Array.isArray(field)) return gridColumnMap[field.length];
          else return gridColumnMap[1];
        })
        .flat();
    },
    embedIFrameURL() {
      const url = new URL(this.source.video.url);
      if (SUPPORTED_IFRAME_URLS.includes(url.hostname)) {
        if (url.searchParams.has('autoplay'))
          url.searchParams.delete('autoplay');
        url.searchParams.append('autoplay', '1');
        url.searchParams.append('auto_play', '1');
      }
      return url;
    },
    isSpotifyEmbed() {
      // t.SPOTIFY_HOSTNAMES = ["open.spotify.com", "www.spotify.com"]
      const allowedPaths = ['album', 'playlist', 'track'];
      if (this.source.type !== 'link' && !this.source.url) return false;
      const url = new URL(this.source.url);
      return (
        url.hostname === 'open.spotify.com' &&
        allowedPaths.includes(url.pathname.split('/')[1])
      );
    },
    isSpotifyTrack() {
      if (!this.isSpotifyEmbed) return false;
      const url = new URL(this.source.url);
      return url.pathname.split('/')[1] === 'track';
    },
    spotifyEmbedURL() {
      if (!this.isSpotifyEmbed) return null;
      const url = new URL(this.source.url);
      return (
        'https://open.spotify.com/embed' +
        url.pathname +
        '?utm_source=discord&utm_medium=desktop'
      );
    },
  },
  methods: {
    proxyURL(url, w, h) {
      return url + `?width=${w}&height=${h}`;
    },
    defaultParser(content) {
      return defaultParser(content);
    },
    limitedParser(content) {
      return limitedParser(content);
    },
    sizeToStyle(width, height) {
      return `width: ${width}px; height: ${height}px;`;
    },
    calcRatio(image, maxWidth = 400, maxHeight = 300) {
      const ratio = getRatio(image.width, image.height, maxWidth, maxHeight);
      return [
        Math.round(ratio * image.width),
        Math.round(ratio * image.height),
      ];
    },
  },
});
</script>
