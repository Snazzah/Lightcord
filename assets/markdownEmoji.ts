import Twemoji from 'twemoji';
import Emoji from './emoji.json';

interface CategoryList {
  [key: string]: Emoji[];
}

interface Emoji {
  names: string[];
  surrogates: string;
  unicodeVersion: number;
  hasDiversity?: boolean;
  hasMultiDiversity?: boolean;
  diversityChildren?: Emoji[];

  diversity?: string[];
  hasDiversityParent?: boolean;
  hasMultiDiversityParent?: boolean;
}

const DIVERSITY_SURROGATES = ['🏻', '🏼', '🏽', '🏾', '🏿'];
const DO_NOT_PARSE = ['™', '©', '®'];
const NAME_TO_EMOJI: { [key: string]: string } = {};
const EMOJI_TO_NAME: { [key: string]: string } = {};

Object.keys(Emoji as CategoryList).forEach((category) => {
  (Emoji as CategoryList)[category].forEach((emoji) => {
    EMOJI_TO_NAME[emoji.surrogates] = emoji.names[0] || '';

    emoji.names.forEach((name) => {
      NAME_TO_EMOJI[name] = emoji.surrogates;

      // List old-style joiners
      DIVERSITY_SURROGATES.forEach((d, i) => {
        NAME_TO_EMOJI[`${name}::skin-tone-${i + 1}`] = emoji.surrogates.concat(
          d
        );
      });
    });

    if (emoji.diversityChildren)
      emoji.diversityChildren.forEach((diverseChild) => {
        EMOJI_TO_NAME[diverseChild.surrogates] = diverseChild.names[0] || '';

        diverseChild.names.forEach((name) => {
          NAME_TO_EMOJI[name] = diverseChild.surrogates;
        });
      });
  });
});

export function getEmojiURL(surrogate: string) {
  if (DO_NOT_PARSE.includes(surrogate)) return '';

  try {
    return `https://twemoji.maxcdn.com/2/svg/${Twemoji.convert.toCodePoint(
      surrogate
    )}.svg`;
  } catch (error) {
    return '';
  }
}

export const EMOJI_NAME_AND_DIVERSITY_RE = /^:([^\s:]+?(?:::skin-tone-\d)?):/;

export function convertNameToSurrogate(name: string, fallback = '') {
  return name in NAME_TO_EMOJI ? NAME_TO_EMOJI[name] : fallback;
}

function convertSurrogateToName(
  surrogate: string,
  colons = true,
  fallback = ''
) {
  let emojiName = fallback;
  if (surrogate in EMOJI_TO_NAME) emojiName = EMOJI_TO_NAME[surrogate];
  return colons ? `:${emojiName}:` : emojiName;
}

const escape = (str: string) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

const emojiReplacer = (function () {
  const surrogates = Object.keys(EMOJI_TO_NAME)
    .sort((surrogate) => -surrogate.length)
    .map((surrogate) => escape(surrogate))
    .join('|');

  return new RegExp('(' + surrogates + ')', 'g');
})();

export function translateSurrogatesToInlineEmoji(source: string) {
  return source.replace(emojiReplacer, (_, match) =>
    convertSurrogateToName(match)
  );
}
