import SimpleMarkdown from 'simple-markdown';
import hljs from 'highlight.js';

interface CodeBlockNode {
  lang?: string;
  content?: string;
}
interface HtmlRules {
  readonly Array?: SimpleMarkdown.HtmlArrayRule;
  [type: string]:
    | (SimpleMarkdown.ParserRule & SimpleMarkdown.HtmlOutputRule)
    | SimpleMarkdown.HtmlArrayRule
    | undefined;
}
type DefaultInOutRule = SimpleMarkdown.SingleNodeParserRule &
  SimpleMarkdown.NonNullHtmlOutputRule;
type DefaultInRule = SimpleMarkdown.SingleNodeParserRule &
  SimpleMarkdown.HtmlOutputRule;
interface DefaultRules extends HtmlRules {
  Array: SimpleMarkdown.DefaultArrayRule;
  codeBlock: DefaultInOutRule;
  blockQuote: DefaultInOutRule;
  // newline: TextInOutRule;
  paragraph: DefaultInOutRule;
  escape: DefaultInRule;
  autolink: DefaultInRule;
  link: DefaultInOutRule;
  url: DefaultInRule;
  em: DefaultInOutRule;
  strong: DefaultInOutRule;
  u: DefaultInOutRule;
  del: DefaultInOutRule;
  inlineCode: DefaultInOutRule;
  text: DefaultInOutRule;
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
  Array: SimpleMarkdown.defaultRules.Array,
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
    html: (node) =>
      `<pre><code class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9 hljs ${
        node.lang || ''
      }">${
        node.lang
          ? hljs.highlight(node.lang, node.content as string).value
          : node.content
      }</code></pre>`,
  },
  blockQuote: {
    order: SimpleMarkdown.defaultRules.blockQuote.order,
    match: SimpleMarkdown.blockRegex(/^\n(>[^\n]+([^\n]+)*)+/),
    parse: SimpleMarkdown.defaultRules.blockQuote.parse,
    html: (node, output, state) =>
      `<div class="blockquoteContainer-U5TVEi"><div class="blockquoteDivider-2hH8H6"></div><blockquote>${output(
        node.content,
        state
      ).trim()}</blockquote></div>`,
  },
  paragraph: {
    order: SimpleMarkdown.defaultRules.paragraph.order,
    match: SimpleMarkdown.blockRegex(/^((?:[^\n]|\n(?! *\n))+)\n/),
    parse: SimpleMarkdown.defaultRules.paragraph.parse,
    // html: SimpleMarkdown.defaultRules.paragraph.html,
    html: (node, output, state) => output(node.content, state) + '\n',
  },
  escape: SimpleMarkdown.defaultRules.escape,
  // newline: SimpleMarkdown.defaultRules.newline,
  autolink: SimpleMarkdown.defaultRules.autolink,
  url: {
    order: SimpleMarkdown.defaultRules.url.order,
    match: SimpleMarkdown.defaultRules.url.match,
    parse: SimpleMarkdown.defaultRules.url.parse,
    html: null,
  },
  link: SimpleMarkdown.defaultRules.link,
  em: SimpleMarkdown.defaultRules.em,
  strong: SimpleMarkdown.defaultRules.strong,
  u: SimpleMarkdown.defaultRules.u,
  del: SimpleMarkdown.defaultRules.del,
  inlineCode: {
    ...SimpleMarkdown.defaultRules.inlineCode,
    match: SimpleMarkdown.inlineRegex(/^(`)([\s\S]*?[^`])\1(?!`)/),
    html(node) {
      return SimpleMarkdown.htmlTag(
        'code',
        SimpleMarkdown.sanitizeText(node.content),
        { class: 'inline' }
      );
    },
  },
  text: SimpleMarkdown.defaultRules.text,
};

const createParser = (rules: HtmlRules) => {
  const parser = SimpleMarkdown.parserFor(rules);
  return (content: string) => {
    const parse = function (source: string) {
      const blockSource = source + '\n\n';
      return parser(blockSource, { inline: false });
    };
    // @ts-ignore
    const htmlOutput = SimpleMarkdown.htmlFor(
      // @ts-ignore
      SimpleMarkdown.ruleOutput(rules, 'html')
    );
    return htmlOutput(parse(content.trim())).trim();
    // return parse(content);
  };
};

// Use rules that are not dependent on the `link` rule
const defaultMessageRules: HtmlRules = Object.assign({}, defaultRules, {
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
    html(node: SimpleMarkdown.SingleASTNode) {
      const url = new URL(node.content);
      return `<a class="anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB" title="${url.toString()}" href="${url.toString()}" rel="noreferrer noopener" target="_blank" role="button" tabindex="0">${url.toString()}</a>`;
    },
  },
});
delete defaultMessageRules.link;

export const defaultParser = createParser(defaultRules);
export const messageParser = createParser(defaultMessageRules);
