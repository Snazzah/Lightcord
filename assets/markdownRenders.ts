import Vue from 'vue';

export const MDAnchor = Vue.component('md-anchor', {
  props: {
    href: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
  },

  render(e) {
    const { href, title } = this;

    return e(
      'a',
      {
        attrs: {
          class: 'anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB',
          href,
          title,
          rel: 'noreferrer noopener',
          target: '_blank',
          role: 'button',
          tabindex: '0',
        },
      },
      this.$slots.default
    );
  },
});

export const MDBold = Vue.component('md-bold', {
  props: {
    content: {
      type: Array,
      required: true,
    },
  },

  render(e) {
    const { content } = this;

    return e('b', content as Vue.VNodeChildren);
  },
});

export const MDItalic = Vue.component('md-italic', {
  props: {
    content: {
      type: Array,
      required: true,
    },
  },

  render(e) {
    const { content } = this;

    return e('i', content as Vue.VNodeChildren);
  },
});
