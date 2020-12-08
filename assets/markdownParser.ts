import SimpleMarkdown from 'simple-markdown';
import hljs from 'highlight.js';
import Vue from 'vue';
import {
  translateSurrogatesToInlineEmoji,
  convertNameToSurrogate,
  EMOJI_NAME_AND_DIVERSITY_RE,
} from './markdownEmoji';
import {
  MDAnchor,
  MDCustomEmoji,
  MDEmoji,
  MDSpoiler,
  MDMention,
  MDRoleMention,
  MDChannelMention,
} from './markdownElements';

// #region typings
type VueOutput = SimpleMarkdown.Output<Vue.VNodeChildren | string>;
type VueNodeOutput = SimpleMarkdown.NodeOutput<Vue.VNodeChildren | string>;
interface VueOutputRule {
  readonly vue: VueNodeOutput | null;
}
interface VueArrayRule extends SimpleMarkdown.ArrayRule {
  readonly react?: SimpleMarkdown.ArrayNodeOutput<SimpleMarkdown.ReactElements>;
  readonly html?: SimpleMarkdown.ArrayNodeOutput<string>;
  readonly vue: SimpleMarkdown.ArrayNodeOutput<Vue.VNodeChildren | string>;
  readonly [other: string]: SimpleMarkdown.ArrayNodeOutput<any> | undefined;
}
interface NonNullVueOutputRule extends VueOutputRule {
  readonly vue: VueNodeOutput;
}
type VueInOutRule = SimpleMarkdown.SingleNodeParserRule & NonNullVueOutputRule;
type VueInRule = SimpleMarkdown.SingleNodeParserRule & VueOutputRule;
interface DefaultVueArrayRule extends SimpleMarkdown.ArrayRule {
  readonly react: SimpleMarkdown.ArrayNodeOutput<SimpleMarkdown.ReactElements>;
  readonly html: SimpleMarkdown.ArrayNodeOutput<string>;
  readonly vue: SimpleMarkdown.ArrayNodeOutput<Vue.VNodeChildren | string>;
}

interface VueRules {
  readonly Array?: VueArrayRule;
  [type: string]:
    | (SimpleMarkdown.ParserRule & VueOutputRule)
    | VueArrayRule
    | undefined;
}

interface DefaultRules extends VueRules {
  Array: DefaultVueArrayRule;
  newline: VueInRule;
  codeBlock: VueInOutRule;
  blockQuote: VueInOutRule;
  paragraph: VueInOutRule;
  escape: VueInRule;
  autolink: VueInRule;
  link: VueInOutRule;
  url: VueInRule;
  em: VueInOutRule;
  strong: VueInOutRule;
  u: VueInOutRule;
  del: VueInOutRule;
  spoiler: VueInOutRule;
  emoji: VueInOutRule;
  customEmoji: VueInOutRule;
  inlineCode: VueInOutRule;
  emoticon: VueInRule;
  mention: VueInOutRule;
  roleMention: VueInOutRule;
  channelMention: VueInOutRule;
  text: VueInOutRule;
}
// #endregion

const defaultRules: DefaultRules = {
  Array: {
    ...SimpleMarkdown.defaultRules.Array,
    vue(arr, output, state) {
      const result = [];

      console.log('array FOUND', arr);

      // map output over the ast, except group any text
      // nodes together into a single string output.
      for (let i = 0; i < arr.length; i++) {
        let node = arr[i];
        if (node.type === 'text') {
          node = { type: 'text', content: node.content };
          for (; i + 1 < arr.length && arr[i + 1].type === 'text'; i++) {
            node.content += arr[i + 1].content;
          }
        }

        result.push(output(node, state));
      }

      return result;
    },
  },
  codeBlock: {
    order: SimpleMarkdown.defaultRules.codeBlock.order,
    match(source) {
      return /^```(([A-Za-z0-9-]+?)\n+)?\n*([^]+?)\n*```/.exec(source);
    },
    parse(capture) {
      return { lang: (capture[2] || '').trim(), content: capture[3] || '' };
    },
    vue(node, _, { h }) {
      return h('pre', [
        node.lang
          ? h(
              'code',
              {
                attrs: {
                  class:
                    'scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9 hljs ' +
                    node.lang,
                },
                domProps: {
                  innerHTML: hljs.highlight(node.lang, node.content as string)
                    .value,
                },
              },
              node.content
            )
          : h(
              'code',
              {
                attrs: {
                  class: 'scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9 hljs',
                },
              },
              node.content
            ),
      ]);
    },
  },
  blockQuote: {
    order: SimpleMarkdown.defaultRules.blockQuote.order,
    match(source, state) {
      const { prevCapture, inQuote, nested } = state;
      const regex = /^( *>>> +([\s\S]*))|^( *>(?!>>) +[^\n]*(\n *>(?!>>) +[^\n]*)*\n?)/;
      const lookbehindRegex = /^$|\n *$/;
      return !lookbehindRegex.test(prevCapture != null ? prevCapture[0] : '') ||
        inQuote ||
        nested
        ? null
        : regex.exec(source);
    },
    parse(capture, parse, state) {
      const tripleArrowRegex = /^ *>>> ?/;
      const singleArrowRegex = /^ *> ?/gm;
      const dirtyContent = capture[0];
      const usingTripleArrow = Boolean(tripleArrowRegex.exec(dirtyContent));
      const cleaningRegex = usingTripleArrow
        ? tripleArrowRegex
        : singleArrowRegex;
      const content = dirtyContent.replace(cleaningRegex, '');
      const inQuote = state.inQuote || false;
      const inline = state.inline || false;
      state.inQuote = true;
      if (!usingTripleArrow) state.inline = true;
      const parsedContent = parse(content, state);
      state.inQuote = inQuote;
      state.inline = inline;
      if (parsedContent.length === 0)
        parsedContent.push({
          type: 'text',
          content: ' ',
        });
      return {
        content: parsedContent,
        type: 'blockQuote',
      };
    },
    vue(node, output, state) {
      return state.h(
        'div',
        {
          attrs: {
            class: 'blockquote-container',
          },
        },
        [
          state.h('div', {
            attrs: {
              class: 'blockquote-divider',
            },
          }),
          state.h('blockquote', output(node.content, state)),
        ]
      );
    },
  },
  newline: {
    ...SimpleMarkdown.defaultRules.newline,
    vue() {
      return '\n';
    },
  },
  paragraph: {
    order: SimpleMarkdown.defaultRules.paragraph.order,
    match: SimpleMarkdown.blockRegex(/^((?:[^\n]|\n(?! *\n))+)\n/),
    parse: SimpleMarkdown.defaultRules.paragraph.parse,
    // @ts-ignore
    vue: (node, output, state) => [...output(node.content, state), '\n'],
  },
  escape: {
    ...SimpleMarkdown.defaultRules.escape,
    vue: null,
  },
  autolink: {
    ...SimpleMarkdown.defaultRules.autolink,
    match: SimpleMarkdown.inlineRegex(/^<(https?:\/\/[^ >]+)>/),
    vue: null,
  },
  url: {
    order: SimpleMarkdown.defaultRules.url.order,
    match: SimpleMarkdown.defaultRules.url.match,
    parse: SimpleMarkdown.defaultRules.url.parse,
    vue: null,
  },
  link: {
    ...SimpleMarkdown.defaultRules.link,
    vue(node, output, state) {
      return state.h(
        MDAnchor,
        {
          props: {
            href: node.target,
            title: node.title,
          },
        },
        output(node.content, state)
      );
    },
  },
  em: {
    ...SimpleMarkdown.defaultRules.em,
    vue(node, output, state) {
      return state.h('i', output(node.content, state));
    },
  },
  strong: {
    ...SimpleMarkdown.defaultRules.strong,
    vue(node, output, state) {
      return state.h('b', output(node.content, state));
    },
  },
  u: {
    ...SimpleMarkdown.defaultRules.u,
    vue(node, output, state) {
      return state.h('u', output(node.content, state));
    },
  },
  del: {
    ...SimpleMarkdown.defaultRules.del,
    vue(node, output, state) {
      return state.h('s', output(node.content, state));
    },
  },
  inlineCode: {
    ...SimpleMarkdown.defaultRules.inlineCode,
    match: SimpleMarkdown.inlineRegex(/^(`{1,2})([\s\S]*?[^`])\1(?!`)/),
    vue(node, _, { h }) {
      return h(
        'code',
        {
          attrs: {
            class: 'inline',
          },
        },
        node.content
      );
    },
  },
  emoji: {
    order: SimpleMarkdown.defaultRules.text.order,
    match(source) {
      const capture = EMOJI_NAME_AND_DIVERSITY_RE.exec(source);

      // Check if it is a valid emoji
      if (capture && !convertNameToSurrogate(capture[1])) return null;

      return capture;
    },
    parse(capture) {
      const name = capture[1];
      const surrogate = convertNameToSurrogate(name);
      return { name, surrogate };
    },
    vue(node, _, { h }) {
      return h(MDEmoji, {
        props: node,
      });
    },
  },
  customEmoji: {
    order: SimpleMarkdown.defaultRules.text.order,
    match: SimpleMarkdown.inlineRegex(/^<(a)?:(\w+):(\d+)>/),
    parse(capture) {
      return {
        animated: !!capture[1],
        name: capture[2],
        id: capture[3],
      };
    },
    vue(node, _, { h }) {
      return h(MDCustomEmoji, {
        props: node,
      });
    },
  },
  mention: {
    order: SimpleMarkdown.defaultRules.text.order,
    match: SimpleMarkdown.inlineRegex(/^<@!?(\d+)>/),
    parse(capture) {
      return { match: capture[0], id: capture[1] };
    },
    vue(node, _, { h, channelPage }) {
      return h(MDMention, {
        props: { ...node, channelPage },
      });
    },
  },
  roleMention: {
    order: SimpleMarkdown.defaultRules.text.order,
    match: SimpleMarkdown.inlineRegex(/^<@&(\d+)>/),
    parse(capture) {
      return { id: capture[1] };
    },
    vue(node, _, { h, channelPage }) {
      return h(MDRoleMention, {
        props: { ...node, channelPage },
      });
    },
  },
  channelMention: {
    order: SimpleMarkdown.defaultRules.text.order,
    match: SimpleMarkdown.inlineRegex(/^<#(\d+)>/),
    parse(capture) {
      return { id: capture[1] };
    },
    vue(node, _, { h, channelPage }) {
      return h(MDChannelMention, {
        props: { ...node, channelPage },
      });
    },
  },
  emoticon: {
    order: SimpleMarkdown.defaultRules.text.order,
    match(source) {
      return /^(¯\\_\(ツ\)_\/¯)/.exec(source);
    },
    parse(capture) {
      return { type: 'text', content: capture[1] };
    },
    vue: null,
  },
  spoiler: {
    order: SimpleMarkdown.defaultRules.text.order,
    match: SimpleMarkdown.inlineRegex(/^\|\|((?:\\[\s\S]|[^\\])+?)\|\|(?!\|)/),
    parse: SimpleMarkdown.defaultRules.em.parse,
    vue(node, output, state) {
      return state.h(MDSpoiler, output(node.content, state));
    },
  },
  text: {
    ...SimpleMarkdown.defaultRules.text,
    parse(capture, recurseParse, state) {
      return state.nested
        ? {
            content: capture[0],
          }
        : recurseParse(translateSurrogatesToInlineEmoji(capture[0]), {
            ...state,
            nested: true,
          });
    },
    vue(node) {
      return node.content;
    },
  },
};
/*

      , G = /^<@!?(\d+)>/
      , x = /^<@&(\d+)>/
      , V = /^<#(\d+)>/
      */
export const MDRender = Vue.component('md-render', {
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    content: {
      type: Function,
      required: true,
    },
  },

  render(h) {
    const { tag, content } = (this as unknown) as {
      tag: string;
      content: (createElement: Vue.CreateElement) => Vue.VNodeChildren;
    };

    const children = content(h);

    // @ts-ignore
    if (this.$slots.default) children.push(this.$slots.default);

    return h(tag, children);
  },
});

const vueFor = function (rules: VueRules) {
  // @ts-ignore
  const outputFunc = SimpleMarkdown.ruleOutput(rules, 'vue');
  const nestedOutput = (
    ast: SimpleMarkdown.SingleASTNode | SimpleMarkdown.SingleASTNode[],
    state?: any
  ): Vue.VNodeChildren => {
    state = state || {};
    if (Array.isArray(ast)) {
      return ast.map((node) => {
        return nestedOutput(node, state);
      });
    } else {
      return outputFunc(ast, nestedOutput, state);
    }
  };
  return nestedOutput;
};

const cleanUpNodes = (nodes: SimpleMarkdown.SingleASTNode[]) => {
  const result = [];

  // map output over the ast, except group any text
  // nodes together into a single string output.
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.type === 'text') {
      node = { type: 'text', content: node.content };
      for (; i + 1 < nodes.length && nodes[i + 1].type === 'text'; i++) {
        node.content += nodes[i + 1].content;
      }
      result.push(node);
    } else if (Array.isArray(node.content)) {
      node.content = cleanUpNodes(node.content);
      result.push(node);
    } else result.push(node);
  }

  return result;
};

const jumboify = (nodes: SimpleMarkdown.SingleASTNode[]) => {
  const nonEmojiNodes = nodes.some(
    (node) =>
      node.type !== 'emoji' &&
      node.type !== 'customEmoji' &&
      (typeof node.content !== 'string' || node.content.trim() !== '')
  );

  if (nonEmojiNodes) return nodes;

  const maximum = 27;
  let count = 0;

  nodes.forEach((node) => {
    if (node.type === 'emoji' || node.type === 'customEmoji') count += 1;
    if (count > maximum) return false;
  });

  if (count < maximum) nodes.forEach((node) => (node.jumboable = true));

  return nodes;
};

const createVueParser = (
  rules: VueRules,
  postParse = (nodes: SimpleMarkdown.SingleASTNode[]) => nodes
) => {
  const parser = SimpleMarkdown.parserFor(rules);
  return (content: string, state?: SimpleMarkdown.OptionalState) => {
    const parsedContent = postParse(
      cleanUpNodes(parser(content.trim(), { ...state, inline: true }))
    );

    return (createElement: Vue.CreateElement) =>
      vueFor(rules)(parsedContent, { h: createElement, ...state });
  };
};

// Use rules that are not dependent on the `link` rule
const messageRules: VueRules = Object.assign({}, defaultRules, {
  autolink: {
    ...SimpleMarkdown.defaultRules.autolink,
    parse(capture: SimpleMarkdown.Capture) {
      return {
        type: 'url',
        content: capture[1],
        target: capture[1],
      };
    },
  },
  url: {
    order: SimpleMarkdown.defaultRules.url.order,
    match: SimpleMarkdown.defaultRules.url.match,
    parse(capture: SimpleMarkdown.Capture) {
      return {
        content: capture[1],
      };
    },
    vue(
      node: SimpleMarkdown.SingleASTNode,
      _: unknown,
      { h }: { h: Vue.CreateElement }
    ) {
      const url = new URL(node.content);
      return h(
        MDAnchor,
        {
          props: {
            href: url.toString(),
            title: url.toString(),
          },
        },
        url.toString()
      );
    },
  },
});
delete messageRules.link;

const limitedRules = {
  Array: defaultRules.Array,
  paragraph: defaultRules.paragraph,
  newline: defaultRules.newline,
  em: defaultRules.em,
  strong: defaultRules.strong,
  u: defaultRules.u,
  del: defaultRules.del,
  inlineCode: defaultRules.inlineCode,
  text: defaultRules.text,
};

export const defaultParser = createVueParser(defaultRules, jumboify);
export const messageParser = createVueParser(messageRules, jumboify);
export const limitedParser = createVueParser(limitedRules);
