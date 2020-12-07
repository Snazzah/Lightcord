import SimpleMarkdown from 'simple-markdown';
import hljs from 'highlight.js';
import Vue from 'vue';
import { MDAnchor } from './markdownRenders';

interface CodeBlockNode {
  lang?: string;
  content?: string;
}

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
  inlineCode: VueInOutRule;
  text: VueInOutRule;
}

const blockRegex = function (regex: RegExp) {
  const match = function (source: string, state: { inline?: boolean }) {
    if (!state.inline) {
      return null;
    } else {
      return regex.exec(source);
    }
  };
  match.regex = regex;
  return match;
};

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
    match: blockRegex(/^\n?```([^\s`]*)(?:\n([\s\S]*?)|)\n?```/),
    parse(capture) {
      const onlyOneLine = !capture[2];
      const lang = hljs.getLanguage(capture[1]);
      const result: CodeBlockNode = {
        content: capture[2] || capture[1],
      };
      if (lang && !onlyOneLine) {
        result.lang = capture[1];
      }
      return result;
    },
    vue(node, _, { e }) {
      return e('pre', [
        node.lang
          ? e(
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
          : e(
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
    match: SimpleMarkdown.blockRegex(/^\n(>[^\n]+([^\n]+)*)+/),
    parse: SimpleMarkdown.defaultRules.blockQuote.parse,
    vue(node, output, state) {
      // @TODO change regex and actually use blockquotes
      return state.e('span', output(node.content, state));
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
    vue(node, output, { e }) {
      return e(
        MDAnchor,
        {
          props: {
            href: node.target,
            title: node.title,
          },
        },
        output(node.content, { e })
      );
    },
  },
  em: {
    ...SimpleMarkdown.defaultRules.em,
    vue(node, output, state) {
      return state.e('i', output(node.content, state));
    },
  },
  strong: {
    ...SimpleMarkdown.defaultRules.strong,
    vue(node, output, state) {
      return state.e('b', output(node.content, state));
    },
  },
  u: {
    ...SimpleMarkdown.defaultRules.u,
    vue(node, output, state) {
      return state.e('u', output(node.content, state));
    },
  },
  del: {
    ...SimpleMarkdown.defaultRules.del,
    vue(node, output, state) {
      return state.e('del', output(node.content, state));
    },
  },
  inlineCode: {
    ...SimpleMarkdown.defaultRules.inlineCode,
    match: SimpleMarkdown.inlineRegex(/^(`)([\s\S]*?[^`])\1(?!`)/),
    vue(node, _, { e }) {
      return e(
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
  text: {
    ...SimpleMarkdown.defaultRules.text,
    vue(node) {
      return node.content;
    },
  },
};

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

  render(e) {
    const { tag, content } = (this as unknown) as {
      tag: string;
      content: (createElement: Vue.CreateElement) => Vue.VNodeChildren;
    };

    const children = content(e);

    console.log(children, this.$slots);

    // @ts-ignore
    if (this.$slots.default) children.push(this.$slots.default);

    return e(
      tag,
      {
        attrs: {
          class: 'md-render',
        },
      },
      children
    );
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
    } else if (node.type === 'paragraph') {
      // Flatten paragraphs
      if (i !== 0) result.push({ type: 'text', content: '\n' });
      node.content.map((node: SimpleMarkdown.SingleASTNode) =>
        result.push(node)
      );
    } else if (Array.isArray(node.content)) {
      node.content = cleanUpNodes(node.content);
      result.push(node);
    } else result.push(node);
  }

  return result;
};

const createVueParser = (rules: VueRules) => {
  const parser = SimpleMarkdown.parserFor(rules);
  return (content: string) => {
    const parsedContent = cleanUpNodes(
      parser(content.trim(), { inline: false })
    );

    // SimpleMarkdown has a quirk where the last element will be a newline.
    parsedContent.pop();

    console.log({ content: parsedContent });
    return (createElement: Vue.CreateElement) =>
      vueFor(rules)(parsedContent, { e: createElement });
  };
};

// Use rules that are not dependent on the `link` rule
const defaultMessageRules: VueRules = Object.assign({}, defaultRules, {
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
      { e }: { e: Vue.CreateElement }
    ) {
      const url = new URL(node.content);
      return e(
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
delete defaultMessageRules.link;

export const defaultParser = createVueParser(defaultRules);
export const messageParser = createVueParser(defaultMessageRules);
