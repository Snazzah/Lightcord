// IDs that should have the SYSTEM tag with their messages.
export const SYSTEM_USER_IDS = [
  // Community Updates
  '768235830069166151',
];

// IDs that shouldn't be fetched while caching uncached members.
export const UNCACHEABLE_IDS = [...SYSTEM_USER_IDS];

export const SUPPORTED_IFRAME_URLS = [
  'twitter.com',
  'player.twitch.tv',
  'www.youtube.com',
  // Reddit Embed URL
  // Facebook Embed URL
  // INstacram Embed URL
  'w.soundcloud.com',
];

/*
  Dont know what this is, but looks interesting.

  t.LINKING_WHITELIST = [{
        regex: /(?:^https?:\/\/)(?:www\.)?(youtube\.com|youtu\.be)(?:$|\/)/i,
        protocol: "youtube://"
    }, {
        regex: /(?:^https?:\/\/)(?:www\.)?(instagram\.com|instagr\.am)(?:$|\/)/i,
        protocol: "instagram://"
    }, {
        regex: /(?:^https?:\/\/)(?:www\.)?(twitch\.tv)(?:$|\/)/i,
        protocol: "twitch://"
    }, {
        regex: /(?:^https?:\/\/)(?:www\.)?(twitter\.com)(?:$|\/)/i,
        protocol: "twitter://"
    }, {
        regex: /(?:^discordconnect:\/\/)/i,
        protocol: "discordconnect://"
    }, {
        regex: /(?:^https?:\/\/)(?:open\.)?(spotify\.com)(?:$|\/)/i,
        protocol: "https://open.spotify.com"
    }];

    t.SlashCommands = [{
        name: "tableflip",
        commandPreview: "(╯°□°）╯︵ ┻━┻"
    }, {
        name: "unflip",
        commandPreview: "┬─┬ ノ( ゜-゜ノ)"
    }, {
        name: "shrug",
        commandPreview: "¯\\_(ツ)_/¯"
    }],

            n.handlePasteItem = function(e, t) {
                var r = n.props
                  , a = r.channel
                  , o = r.canPasteFiles
                  , i = r.shouldUploadLongMessages
                  , l = r.promptToUpload;
                if (null == l || !a.isPrivate() && !o || a.isPrivate() && a.isManaged())
                    return !1;
                var u = function(e, t) {
                    return l(e, a, !1, !0, t)
                };
                switch (t.type) {
                case "image/png":
                    e.preventDefault();
                    var s = t.getAsFile();
                    return null != s && (n.saveCurrentText(),
                    2 === e.clipboardData.items.length ? e.clipboardData.items[0].getAsString((function(e) {
                        u([(0,
                        p.makeFile)(s, n.extractFileName(e))])
                    }
                    )) : u([(0,
                    p.makeFile)(s)]),
                    !0);
                case "text/plain":
                    if (!0 === i) {
                        var d = e.clipboardData.getData("text/plain");
                        if (d.length > _.MAX_MESSAGE_LENGTH) {
                            e.preventDefault();
                            var f = new Blob([d],{
                                type: "text/plain"
                            });
                            return u([(0,
                            p.makeFile)(f, "message.txt")], !0),
                            !0
                        }
                    }
                    return !1
                }
                return !1
            }
*/

export const GIFT_CODE_HOST = 'discord.gift';
export const GUILD_TEMPLATE_HOST = 'discord.new';
export const INVITE_HOST = 'discord.gg';

const discordHostnameRegex = /(?:^|\.)(?:discordapp|discord)\.com$/i;

export function isDiscordHostname(hostname: string) {
  return hostname !== null && discordHostnameRegex.test(hostname);
}

interface FileClassType {
  reType?: RegExp;
  reName?: RegExp;
  class: string;
}

export const FILE_CLASSES: FileClassType[] = [
  {
    reType: /^image\/vnd.adobe.photoshop/,
    class: 'photoshop',
  },
  {
    reType: /^image\/svg\+xml/,
    class: 'webcode',
  },
  {
    reType: /^image\//,
    class: 'image',
  },
  {
    reType: /^video\//,
    class: 'video',
  },
  {
    reName: /\.pdf$/,
    class: 'acrobat',
  },
  {
    reName: /\.ae/,
    class: 'ae',
  },
  {
    reName: /\.sketch$/,
    class: 'sketch',
  },
  {
    reName: /\.ai$/,
    class: 'ai',
  },
  {
    reName: /\.(?:rar|zip|7z|tar|tar\.gz)$/,
    class: 'archive',
  },
  {
    reName: /\.(?:c\+\+|cpp|cc|c|h|hpp|mm|m|json|js|rb|rake|py|asm|fs|pyc|dtd|cgi|bat|rss|java|graphml|idb|lua|o|gml|prl|sls|conf|cmake|make|sln|vbe|cxx|wbf|vbs|r|wml|php|bash|applescript|fcgi|yaml|ex|exs|sh|ml|actionscript)$/,
    class: 'code',
  },
  {
    reName: /\.(?:txt|rtf|doc|docx|md|pages|ppt|pptx|pptm|key|log)$/,
    class: 'document',
  },
  {
    reName: /\.(?:xls|xlsx|numbers|csv)$/,
    class: 'spreadsheet',
  },
  {
    reName: /\.(?:html|xhtml|htm|js|xml|xls|xsd|css|styl)$/,
    class: 'webcode',
  },
  {
    reName: /\.(?:mp3|ogg|wav|flac)$/,
    class: 'audio',
  },
];

export function getFileClass(name: string, type?: string) {
  name = name ? name.toLowerCase() : '';
  const fileClass = FILE_CLASSES.find((n: FileClassType) => {
    return n.reType && type
      ? n.reType.test(type)
      : !(!n.reName || !name) && n.reName.test(name);
  });
  return fileClass ? fileClass.class : 'unknown';
}
