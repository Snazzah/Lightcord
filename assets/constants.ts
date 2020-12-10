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

    t.SPOTIFY_HOSTNAMES = ["open.spotify.com", "www.spotify.com"];
    var Qn = "https://api.spotify.com/v1"
      , Jn = function(e) {
        return "?utm_source=discord&utm_medium=" + e
                    }
        WEB_OPEN: function(e, t, n) {
            return void 0 === n && (n = "desktop"),
            "https://open.spotify.com/" + encodeURIComponent(e) + "/" + encodeURIComponent(t) + Jn(n)
        },
        EMBED: function(e, t) {
            return void 0 === t && (t = "desktop"),
            "https://open.spotify.com/embed" + e + Jn(t)
        },


    function f(e) {
        var t = (0,
        s.getHostname)(e);
        switch (t) {
        case window.GLOBAL_ENV.CDN_HOST:
        case window.GLOBAL_ENV.INVITE_HOST:
        case window.GLOBAL_ENV.GIFT_CODE_HOST:
        case window.GLOBAL_ENV.GUILD_TEMPLATE_HOST:
        case location.hostname:
            return !0;
        default:
            return u.SPOTIFY_HOSTNAMES.includes(t) || a.default.isDiscordHostname(t) || l.has(t)
                }
            }
*/

export const GIFT_CODE_HOST = 'discord.gift';
export const GUILD_TEMPLATE_HOST = 'discord.new';
export const INVITE_HOST = 'discord.gg';

const discordHostnameRegex = /(?:^|\.)(?:discordapp|discord)\.com$/i;

export function isDiscordHostname(hostname: string) {
  return hostname !== null && discordHostnameRegex.test(hostname);
}
