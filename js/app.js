var emojiData = [];
var bot = new Discord.Client({
	autoReconnect: true,
	bot: true,
	userAgent: {
		url: 'https://github.com/SnazzyPine25/Lightcord',
		version: '1.0.2'
	},
});
DiscordClientConverter(bot);
var converter = new showdown.Converter();
converter.setOption('headerLevelStart', '10');
converter.setOption('strikethrough', true);
var avatarHashes = [
	"6debd47ed13483642cf09e832ed0bc1b",
	"322c936a8c8be1b803cd94861bdfa868",
	"dd4dbc0016779df1378e7812eabaa04d",
	"0e291f67c9274a1abdddeb3fd919cbaa",
	"1cbd08c76f8af6dddce02c5138971129"
];
var fuseOptions = {
	shouldSort: true,
	threshold: 0.2,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: ["searchname"]
};
var activeChannel = 'dm';
var activeGuild = 'dm';
var quickSwitcherOn = true;
// Emojis
try {
	var emojiRequest = new XMLHttpRequest();
	emojiRequest.open("GET", "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json");
	emojiRequest.send( null );
	emojiRequest.onload = function () {
		emojiData = JSON.parse(emojiRequest.responseText);
		console.log('%c[Emoji] %cCollected Emoji Data', 'color:purple; font-weight: bold;', 'color:#000;')
	}
} catch(e){
	console.warn('%c[Emoji] %cWas not able to get emoji data', 'color:purple; font-weight: bold;', 'color:#000;')
}
// Tooltips
let currentTooltip = {
  t: null,
  e: null
};
window.onmouseover = function(me){
  let tt = document.createElement("tooltip");
  let source = me.target;
  if($(source).attr("tooltip-left")){
    tt.innerText = currentTooltip.t = $(source).attr("tooltip-left");
    tt.className = "from-left";
    tt.style = `top: ${source.getBoundingClientRect().top+(source.getBoundingClientRect().height/2)-10}px; left: ${source.getBoundingClientRect().width+source.getBoundingClientRect().left}px;`
    currentTooltip.e = tt;
    document.body.appendChild(tt);
  }
  if($(source).attr("tooltip-bottom")){
    tt.innerText = currentTooltip.t = $(source).attr("tooltip-bottom");
    tt.className = "from-bottom";
    tt.style = `top: ${source.getBoundingClientRect().top-32}px; left: ${source.getBoundingClientRect().left-17.5}px;`
    currentTooltip.e = tt;
    document.body.appendChild(tt);
  }
}
window.onmouseout = function(me){
  let source = me.target;
  if($(source).attr("tooltip-left") && $(source).attr("tooltip-left") === currentTooltip.t 
  	|| $(source).attr("tooltip-bottom") && $(source).attr("tooltip-bottom") === currentTooltip.t){
    currentTooltip.e.parentNode.removeChild(currentTooltip.e);
    currentTooltip = {
      t: null,
      e: null
    };
  }
}
// App
let App = {
	queuedFiles: [],
	shifting: false,
	disableUploading: false,
	start: function(token){
		displayHandler.showLoadingScreen();
		if($(".landing .error")[0].outerHTML.includes("none") && token.trim() === ''){
			$('.landing .error').fadeIn(500).delay(10000).fadeOut(500);
			displayHandler.hideLoadingScreen();
			return;
		}
		bot.login(token.trim()).catch(e=>{
			console.error(`%c[Discord] %cFailed to login!`, 'color:#7289DA; font-weight: bold;', 'color:#000;', e);
			displayHandler.hideLoadingScreen();
			$(".landing .error")[0].innerText = "Invalid Token!";
			if($(".landing .error")[0].outerHTML.includes("none")){
				$('.landing .error').fadeIn(500).delay(10000).fadeOut(500);
			}
		});
		bot.once('ready', () => {
			console.log('%c[Discord] %cConnected!', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			localStorage.token = bot.token;
			if (!localStorage.theme) localStorage.theme = 'dark'
			$('body').attr('class', 'theme-' + localStorage.theme)
			$('.landing').remove();
			$('footer').remove();
			$('.app').remove();

			document.body.innerHTML += "<div class='flex-vertical flex-spacer'><section class='flex-horizontal flex-spacer'><div class='guilds'><div class='guild'><a draggable='false' style='background-color: rgb(46, 49, 54);' onclick='App.switchTo.DMs()' class='avatar' tooltip-left='Direct Messages'>DM</a></div><div class='guild-seperator'></div></div><div class='flex-vertical channels-wrap'><div class='flex-vertical flex-spacer'><div class='guild-header'><header><span>Loading...</span></header></div><div class='channels'></div><div class='account'></div></div></div><div class='chat flex-vertical flex-spacer'><div class='title-wrap'><div class='title'><span class='channel'>Loading...</span></div><span class='topic'>Loading...</span></div><div class='messages-container'></div><form id='message'><div class='textarea'><div class='textarea-inner'><div class='channel-textarea-upload'><div class='file-input' style='position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; opacity: 0; cursor: pointer;'></div></div><textarea id='textarea' rows='1' placeholder='Chat using Botcord...' style='height: auto; overflow: hidden;'></textarea></div></div></form></div></section></div><input id='file-input' name='file' multiple type='file' style='position:absolute;width:0px;height:0px;visibility:hidden;'/>";
			var avatar = 'https://cdn.discordapp.com/avatars/' + bot.user.id + '/' + bot.user.avatar + '.png'
			if (bot.user.avatar === null) avatar = 'https://discordapp.com/assets/' + avatarHashes[bot.user.discriminator % avatarHashes.length] + '.png'
			var bottag = '';
			if (bot.user.bot) bottag = '<span class="bot-tag">BOT</span>';
			$('.account').append('<div class="avatar-small" style="background: url(\'' + avatar + '\');background-size: 30px 30px;"></div><div class="account-details"><div class="username">' + bot.user.username + bottag + '</div><div class="discriminator">#' + bot.user.discriminator + '</div></div><div class="leave">-></div>')

			App.switchTo.DMs();
			if (!bot.user.bot){
				bot.guilds.forEach(guild=>{
					guildVar = '<div class="guild" data-guild="' + guild.id + '"><a draggable="false" onclick="App.switchTo.guild(\'' + guild.id + '\')" style="background-color: rgb(46, 49, 54);" class="avatar" tooltip-left="' + guild.name + '">' + guild.name.match(/\b\w/g).join('') + '</a></div>';
					if (guild.icon) guildVar = '<div class="guild" data-guild="' + guild.id + '"><a draggable="false" onclick="App.switchTo.guild(\'' + guild.id + '\')" style="background: url(\'https://cdn.discordapp.com/icons/' + guild.id + '/' + guild.icon + '.webp\');background-size: 50px 50px;" class="avatar-small" tooltip-left="' + guild.name + '"></a></div>';
					$('.guilds').append(guildVar);
				});
			}else{
				$('.guilds').remove();
			}
			document.onkeydown = function (e) {
				var code = (e.keyCode ? e.keyCode : e.which)
				if (code === 188 && e.ctrlKey) {
					console.log('%c[Lightcord] %cQuickswitcher key combo triggered', 'color:#59A1EA; font-weight: bold;', 'color:#000;');
					quickSwitcherOn = true;
					App.deploy.clearModal();
					App.deploy.quickSwitcher();
				}
				if(code === 27 && quickSwitcherOn){
					quickSwitcherOn = false;
					App.deploy.clearModal();
				}
				App.shifting = e.shiftKey;
				if(e.shiftKey) $(".upload-modal-block h1").text("Insta Upload Mode!");
			};
			document.onkeyup = function (e) {
				App.shifting = e.shiftKey;
				if(!e.shiftKey) $(".upload-modal-block h1").text("Drag & Drop");
			};/*
			document.ondragenter = function (e) {
				$('.upload-modal').attr('style', '');
			};
			document.ondragleave = function (e) {
				$('.upload-modal').attr('style', 'display: none;');
			};*/

			displayHandler.hideLoadingScreen();

			// FileDrop
			window.fd.logging = false;
			var zone = new FileDrop(document.body, {zoneClass: 'with-filedrop', inputClass: '', dropEffect: 'move'});
			zone.event('send', function (files) {
				let instaupload = App.shifting;
				console.debug('%c[FileDrop] %cRetrieved files.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', files);
				if(App.disableUploading) return;
				files.each((file,n) => {
					console.debug('%c[FileDrop] %cData for file ' + file.name + '.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', file);
					file.readDataURL(url=>{
						console.debug('%c[FileDrop] %cSending file to queue ' + file.name + '.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', {file:file.nativeFile,url:url,name:file.name,type:file.type,size:file.size});
						App.queuedFiles.push({file:file.nativeFile,url:url,name:file.name,type:file.type,size:file.size});
						if(files.reverse()[0] === file) App.filePrompt.dropped(instaupload);
					},err=>{
						console.debug('%c[FileDrop] %cFailed to get Data URL for file ' + file.name + '.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', err);
						if(files.reverse()[0] === file) App.filePrompt.dropped(instaupload);
					})
				})
			});
			zone.event('dragEnter',()=>{
				$('.upload-modal').attr('style', '');
			});
			zone.event('dragLeave',()=>{
				$('.upload-modal').attr('style', 'display: none;');
			});
		});
		bot.on('message', (message) => {
			console.debug('%c[Discord] %cCaught event: message', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			App.payloadManager.messageCreate(message);
		});
		bot.on('messageDelete', (message) => {
			console.debug('%c[Discord] %cCaught event: messageDelete', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			App.payloadManager.messageDelete(message);
		});
		bot.on('guildCreate', (guild) => {
			console.debug('%c[Discord] %cCaught event: guildCreate', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			if (bot.user.bot) return;
			var guildVar = '<div class="guild" data-guild="' + guild.id + '"><a draggable="false" onclick="App.switchTo.guild(\'' + guild.id + '\')" style="background-color: rgb(46, 49, 54);" class="avatar" tooltip-left="' + guild.name + '">' + guild.name.match(/\b\w/g).join('') + '</a></div>';
			if (guild.icon) guildVar = '<div class="guild" data-guild="' + guild.id + '"><a draggable="false" onclick="App.switchTo.guild(\'' + guild.id + '\')" style="background: url(\'https://cdn.discordapp.com/icons/' + guild.id + '/' + guild.icon + '.webp\');background-size: 50px 50px;" class="avatar-small" tooltip-left="' + guild.name + '"></a></div>';
			$('.guilds').append(guildVar);
		});
		bot.on('guildDelete', (guild) => {
			console.debug('%c[Discord] %cCaught event: guildDelete', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			if(activeGuild === guild.id) App.switchTo.friends();
			if (bot.user.bot) return;
			$('.guild [data-guild*="' + guild.id + '"]').delete();
		});
		bot.on('presenceUpdate', (oldmember, newmember) => {
			console.debug('%c[Discord] %cCaught event: presenceUpdate', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			if(activeGuild === 'dm' && bot.channels.filter(c=>c.type==="dm").map(dm=>dm.recipient.id===oldmember.user.id).includes(true)) App.switchTo.DMs(true);
		});
		window.onclose = ()=>{
			console.debug('%c[Discord] %cDisconnecting...', 'color:#7289DA; font-weight: bold;', 'color:#000;');
			bot.destroy();
		}
	},
	payloadManager: {
		messageCreate: function(msg){
			if(msg.channel.id !== activeChannel) return;
			var avatar = 'https://cdn.discordapp.com/avatars/' + msg.author.id + '/' + msg.author.avatar + '.png'
			var bot = ''
			if (msg.author.avatar === null) avatar = 'https://discordapp.com/assets/' + avatarHashes[msg.author.discriminator % avatarHashes.length] + '.png'
			if (msg.author.bot) bot = '<span class="bot-tag">Bot</span>'
			var member = msg.guild ? msg.guild.members.get(msg.author.id) : null;
			var username = '<span class="username" ' + (member && member.colorRole ? 'style="color: ' + member.colorRole.hexColor + ';"' : '') + ' onclick="App.switchTo.dmChannel(\'' + msg.author.id + '\')">' + msg.author.username.replace(/</ig, '&lt;').replace(/>/ig, '&gt;') + '</span>' + bot
			if (msg.guild) {
				var name = msg.author.username
				var realName = ''
				if (member) {
					if (member.nickname) {
						username = '<span class="username" ' + (member.colorRole ? 'style="color: ' + member.colorRole.hexColor + ';"' : '') + ' onclick="App.switchTo.dmChannel(\'' + msg.author.id + '\')">' + member.nickname.replace(/</ig, '&lt;').replace(/>/ig, '&gt;') + '</span>' + bot
						name = member.nickname
						realName = '<span class="timestamp">' + msg.author.username.replace(/</ig, '&lt;').replace(/>/ig, '&gt;') + '#' + msg.author.discriminator + '</span>'
					}
				}
			}
			if (msg.type === 6) {
				var color = 'style="color:#ffffff;"'
				if (msg.guild) {
					if (msg.guild.members.get(msg.author.id).colorRole) {
						console.log(msg.guild.members.get(msg.author.id).colorRole.hexColor);
						color = 'style="color:' + msg.guild.members.get(msg.author.id).colorRole.hexColor  + ';"';
					}
				}
				msg.content = '<p><span class="username" ' + color + '>' + name + '</span> pinned a message to this channel. <strong>See all the pins.</strong> <span data-timestamp="' + msg.createdTimestamp + '" class="timestamp">' + moment(msg.createdTimestamp).calendar() + '</span><p>'
				var parsedMsg = $('<div class="msg-group" style="padding: 15px 0;">').append('<div class="message"><div class="comment" data-uid="' + msg.author.id + '" style="margin-left: 20px;"><div class="message-text"><span data-id="' + msg.id + '" class="markup">' + msg.content + '</span></div></div></div></div>')
				return $('.messages-container').append(parsedMsg)
			} else var parsedMsg = $('<div class="msg-group">').append('<div class="message"><div class="avatar-large" tooltip-bottom="View Profile" style="background-image: url(\'' + avatar + '\');"></div><div class="comment" data-uid="' + msg.author.id + '"><h2><span class="username-wrap">' + username + '</strong></span><span data-timestamp="' + msg.createdTimestamp + '" class="timestamp">' + moment(msg.createdTimestamp).calendar() + '</span></h2><div class="message-text"><span data-id="' + msg.id + '" class="markup">' + converter.makeHtml(App.payloadManager.messageEmbed(msg)) + '</span></div></div></div></div>')
			var d = $(document.querySelector('[data-uid="' + msg.author.id + '"]')).parents()
			if (d[2] !== undefined) {
				var day = moment(msg.createdTimestamp).format('hh-DDMMYY').split('-')
				var lastTimestamp = moment(parseInt(d[2].lastChild.firstChild.lastChild.firstChild.lastChild.dataset.timestamp)).format('hh-DDMMYY').split('-')
				if (d[2].lastChild.firstChild.lastChild.dataset.uid === msg.author.id && day[0] === lastTimestamp[0] && day[1] === lastTimestamp[1]) {
					$(d[2].lastChild.firstChild.lastChild.lastChild).append('<span data-id="' + msg.id + '" class="markup">' + converter.makeHtml(App.payloadManager.messageEmbed(msg)) + '</span>')
					return $('.messages-container').scrollTop($('.messages-container').scrollTop() + $('.chat').children()[1].lastChild.lastChild.lastChild.clientHeight + 10)
				} else return $('.messages-container').append(parsedMsg)
			}
			if (d[2] === undefined) {
				$('.messages-container').append(parsedMsg)
				return $('.messages-container').scrollTop($('.messages-container').scrollTop() + $('.chat').children()[1].lastChild.clientHeight)
			}
		},
		messageEmbed: function(msg) {
			var edit = ''
			var attachEnd = ''
			if (msg.embeds[0] || msg.attachments[0]) attachEnd = '<div class="accessory">'
			function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
				var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];
				ratio = Math.min(ratio[0], ratio[1]);
				return { width:srcWidth*ratio, height:srcHeight*ratio };
			}
			if (msg.editedTimestamp !== null) edit = '<span class="edited">(edited)</span>'
			if (msg.embeds[0] !== undefined) {
				if (msg.embeds[0].thumbnail) {
					var dimensions = calculateAspectRatioFit(msg.embeds[0].thumbnail.width, msg.embeds[0].thumbnail.height, 400, 600)
					if (msg.embeds[0].thumbnail.width < 400) msg.embeds[0].thumbnail.width = Math.round(msg.embeds[0].thumbnail.width / 1.035)
					else msg.embeds[0].thumbnail.width = dimensions.width
				}
				var provider = ''
				if (msg.embeds[0].provider) provider = '<div class="embed-provider">' + msg.embeds[0].provider.name + '</div>'
				if (msg.embeds[0].type === 'image') attachEnd = attachEnd + '<div class="embed"><img src="' + msg.embeds[0].thumbnail.proxyURL + '" href="' + msg.embeds[0].thumbnail.url + '"></div>'
				if (msg.embeds[0].type === 'video') attachEnd = attachEnd + '<div class="embed"><img src="' + msg.embeds[0].thumbnail.proxyURL + '" href="' + msg.embeds[0].thumbnail.url + '" width="' + msg.embeds[0].thumbnail.width +  '" height="' + msg.embeds[0].thumbnail.height +  '"></div>'
				if (msg.embeds[0].type === 'link') {
					if (msg.embeds[0].description)attachEnd = attachEnd + '<div class="embed"><div class="embed-description">' + msg.embeds[0].description + '</div></div>'
				}
				if (msg.embeds[0].type === 'article') {
					if (msg.embeds[0].description) attachEnd = attachEnd + '<div class="embed">' + provider + '<div class="embed-description">' + msg.embeds[0].description + '</div></div>'
				}
				if (msg.embeds[0].type === 'rich') {
					var embData = [];
					if (msg.embeds[0].author) {
						embData.push('<div>')
						if (msg.embeds[0].author.icon_url) embData.push('<img class="embed-author-icon" src="' + msg.embeds[0].author.icon_url + '"/>')
						if (msg.embeds[0].author.name) embData.push('<a class="embed-author" target="_blank" rel="noreferrer">' + msg.embeds[0].author.name + '</a>')
							embData.push('</div>')
					}
					if (msg.embeds[0].title) embData.push('<div><a class="embed-title" target="_blank" rel="noreferrer">' + App.payloadManager.parseTwemoji(msg.embeds[0].title) + '</a></div>')
					if (msg.embeds[0].description) embData.push('<div class="embed-description markup">'+ App.payloadManager.parseTwemoji(converter.makeHtml(msg.embeds[0].description.replace(/>/ig, '&gt;').replace(/</ig, '&lt;').replace(/-/ig, '&#45;').replace(/\+/ig, '&#45;'))) + '</div>')
					if (msg.embeds[0].fields) embData.push('<div class="embed-fields">')
					for (var i in msg.embeds[0].fields) {
						var inline = ''
						if (msg.embeds[0].fields[i].inline) inline = '-inline'
						embData.push('<div class="embed-field embed-field' + inline + '"><div class="embed-field-name">' + App.payloadManager.parseTwemoji(msg.embeds[0].fields[i].name) + '</div><div class="embed-field-value markup">' + msg.embeds[0].fields[i].value.replace(/\-/ig, '&#45;').replace(/\+/ig, '&#45;').replace(/</, '&lt;').replace(/>/, '&gt;').replace(/\n+/ig, '<br>').replace(/https?:\/\/[\S]*/ig, function (m, r) {return m.replace(m, '<a href="' + m + '">' + m + '</a>')}).replace(/[\s\S]+/, function (m) {return twemoji.parse(m)}) + '</div></div>')
					}
					if (msg.embeds[0].fields) embData.push('</div>')
					if (msg.embeds[0].footer) {
						embData.push('<div>')
						if (msg.embeds[0].footer.icon_url) embData.push('<img class="embed-footer-icon" src="' + msg.embeds[0].footer.icon_url + '"/>')
						if (msg.embeds[0].footer.text) embData.push('<span class="embed-footer">' + msg.embeds[0].footer.text.replace(/\n+/ig, '<br>') + '</span>')
						embData.push('</div>')
					}
					attachEnd = attachEnd + '<div class="embed" style="border-left-color: #' + msg.embeds[0].color.toString(16) + '">' + embData.join('') + '</div>'
				}
			}
			if (msg.attachments.array()[0] !== undefined) {
				if (msg.attachments.array()[0].width) {
					var dimensions = calculateAspectRatioFit(msg.attachments.array()[0].width, msg.attachments.array()[0].height, 400, 600)
					var width = dimensions.width
					if (msg.attachments.array()[0].width < 400) width = Math.round(msg.attachments.array()[0].width / 1.035)
					attachEnd += '<img src="' + msg.attachments.array()[0].proxyURL + '" href="' + msg.attachments.array()[0].url + '" alt="' + msg.attachments.array()[0].filename + '" width="' + width + '" height="auto"/>'
				} else {
					function humanFileSize (size) {
					if (size === 0) return '0 bytes'
						var i = Math.floor( Math.log(size) / Math.log(1024) );
						return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['bytes', 'kB', 'MB', 'GB', 'TB'][i];
					}
					attachEnd += '<div class="attachment"><div class="icon icon-file document"></div><a href="' + msg.attachments.array()[0].url + '" target="_blank" rel="noreferrer">' + msg.attachments.array()[0].filename + '</a><div class="metadata">' + humanFileSize(msg.attachments.array()[0].size) + '</div></div>'
				}
			}
			var regex = new RegExp(/&lt;@!?(\d+)&gt;/ig)
			var ghCodeblock = new RegExp(/```[\s\S]*```/g).exec(msg.content)
			var codeblock = new RegExp(/`[\s\S]*`/g).exec(msg.content)
			var i = 0
			var j = 0
			return App.payloadManager.parseEmoji(msg.content).replace(/#/g, '&#35;').replace(/-/g, '&#45;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\[/ig, '&#91;').replace(/\(/ig, '&#40;').replace(/\./ig, '&#46;').replace(/\+/ig, '&#43;').replace(regex, function (m, r) {
				m = m.replace(/&gt;/ig, '>').replace(/&lt;/ig, '<')
				if (msg.type !== 6 && msg.mentions[i] === undefined && r !== 0 && m.startsWith('<@')) {
					i++
					if (msg.mentions[i] === undefined) {
						if (bot.users.has(m.substr(2, m.length - 3))) m = m.replace(m, '<span class="mention">@' + bot.users.get(m.substr(2, m.length - 3)).username + '</span>')
						else m = m.replace(m, '<span class="mention">' + m + '</span>')
					}
					if (msg.mentions[i] !== undefined) {
						if (msg.type === 6) m = m.replace(m, msg.mentions[i].username)
						if (msg.type !== 6) m = m.replace(m, '<span class="mention">@' + msg.mentions[i].username + '</span>')
					}
				}
				if (msg.type === 6 && msg.mentions[i] !== undefined) m = m.replace(m, '<span class="username">' + msg.mentions[i].username + '</span>')
				if (msg.type !== 6 && msg.mentions[i] !== undefined) m = m.replace(m, '<span class="mention">@' + msg.mentions[i].username + '</span>')
				return m
			}).replace(/@everyone/ig, '<span class="mention">@everyone</span>').replace(/@here/ig, '<span class="mention">@here</span>').replace(/https?:\/\/[\S]*/ig, function (m, r) {
				return m.replace(m, '<a href="' + m + '">' + m + '</a>')
			}).replace(/&lt;&#35;(\d+)&gt;/g, function (m, r) {
				var channel = '&#35;deleted-channel'
				if (bot.channels.get(r) !== undefined) channel = '<span class="mention">&#35;' + bot.channels.get(r).name + '</span>'
				m = m.replace(m, channel)
				return m
			}).replace(/(?:\\)?(?:&lt;){1,2}:[0-9a-z--_]+:(\d+)&gt;(?:\d+)?(?:&gt;)?/ig, function (m, r) {
				if (m.includes('\\')) return m.replace(m, m.substr(1))
				return m.replace(m, '<img class="emoji" src="https://cdn.discordapp.com/emojis/' + r + '.png"/>')
			}).replace(/[\s\S]+/ig, function (m, r) {
				return twemoji.parse(m, {
					folder: 'svg',
					ext: '.svg'
				})
			}).replace(/`[\s\S]*`/g, codeblock).replace(/```[\s\S]*```/g, function (m) {
				return ghCodeblock[0].replace(/```([\S]+)/g, '```$1\n').replace(/([\s\S]+)```/g, '$1\n```')
			}) + edit + attachEnd;
		},
		messageDelete: function(msg){
			if(msg.channel.id !== activeChannel) return;
			var d = $(document.querySelector('[data-id="' + msg.id + '"]'))
			if (d[0] && msg.channel_id === activeChannel) {
				if (d.parents()[0].childNodes.length === 1) {
					d.parents()[3].remove()
				} else d[0].remove()
			}
		},
		messageUpdate: function(msg){
			if(msg.channel.id !== activeChannel) return;
			var d = $(document.querySelector('[data-id="' + msg.id + '"]'))
			if (d[0]) {
				d[0].innerHTML = converter.makeHtml(App.payloadManager.messageEmbed(msg))
			}
		},
		parseEmoji: function(content){
			if(content.match(/:(\w+):/g)){
				content.match(/:(\w+):/g).map(pe => {
					emojiData.map(e => {
						if(e.aliases.includes(pe.replace(/:/g, ""))){
							content = content.replace(pe, e.emoji);
						}
					})
				})
			}
			return content;
		},
		parseTwemoji: function(content){
			return twemoji.parse(App.payloadManager.parseEmoji(content), {
				folder: 'svg',
				ext: '.svg'
			})
		},
		handleCommand: function(input, channel) {
			if (!input.startsWith('/') && input !== '') return bot.channels.get(channel).sendMessage(input)
			var command = input.trim().split(' ')[0]
			var suffix = input.trim().substr(command.length + 1)
			if (command === '/ping') {
				var time = Date.now()
				$('.messages-container').append($('<div class="msg-group" style="margin:0;background: rgba(0, 255, 45, 0.11)">').append('<div class="message" style="padding-left:20px;"><div class="avatar-large" style="background-image: url(\'https://discordapp.com/assets/f78426a064bc9dd24847519259bc42af.png\');"></div><div class="comment" data-uid="0"><h2><span class="username-wrap"><strong class="username">System</strong></span><span data-timestamp="' + Date.now() + '" class="timestamp">' + moment(Date.now()).calendar() + '</span></h2><div class="message-text"><span data-id="' + time + '" class="markup"><p>Ping!</p></span></div></div></div></div>'))
				bot.apiCall('GET', 'https://discordapp.com/api/users/@me', true, {authorization: bot.token}).then(() => {
					$(document.querySelector('[data-id="' + time + '"]'))[0].innerHTML = '<p>Ping! Time taken ' + Math.floor(Date.now() - time) + 'ms.<span class="edited">(edited)</span></p>'
				})
			}
			if (command === '/eval') {
				var time = Date.now()
				$('.messages-container').append($('<div class="msg-group" style="margin:0;background: rgba(0, 255, 45, 0.11)">').append('<div class="message" style="padding-left:20px;"><div class="avatar-large" style="background-image: url(\'https://discordapp.com/assets/f78426a064bc9dd24847519259bc42af.png\');"></div><div class="comment" data-uid="0"><h2><span class="username-wrap"><strong class="username">System</strong></span><span data-timestamp="' + Date.now() + '" class="timestamp">' + moment(Date.now()).calendar() + '</span></h2><div class="message-text"><span data-id="' + time + '" class="markup"><p>**Evaluating**</p></span></div></div></div></div>'))
				try {
					var evald = eval(suffix)
					if (typeof evald !== 'object') {
					$(document.querySelector('[data-id="' + time + '"]'))[0].innerHTML = '<p><strong>Result:</strong>\n' + evald + '<span class="edited">(edited)</span></p>'
					}
				} catch (e) {
					$(document.querySelector('[data-id="' + time + '"]'))[0].innerHTML = '<p><strong>Result:</strong>\n' + e + '<span class="edited">(edited)</span></p>'
				}
			}
			if (command === '/tableflip') {
				bot.channels.get(channel).sendMessage(suffix + ' (╯°□°）╯︵ ┻━┻')
			}
			if (command === '/unflip') {
				bot.channels.get(channel).sendMessage(suffix + ' ┬─┬﻿ ノ( ゜-゜ノ)')
			}
			if (command === '/theme') {
				var themes = ['dark', 'light']
				var val = themes.indexOf(localStorage.theme)
				if (themes.indexOf(localStorage.theme) > -1) {
					if (val !== themes.length - 1) localStorage.theme = themes[val + 1]
					else localStorage.theme = themes[0]
					$('body').attr('class', 'theme-' + localStorage.theme)
					$('.messages-container').append($('<div class="msg-group" style="margin:0;background: rgba(0, 255, 45, 0.11)">').append('<div class="message" style="padding-left:20px;"><div class="avatar-large" style="background-image: url(\'https://discordapp.com/assets/f78426a064bc9dd24847519259bc42af.png\');"></div><div class="comment" data-uid="0"><h2><span class="username-wrap"><strong class="username">System</strong></span><span data-timestamp="' + Date.now() + '" class="timestamp">' + moment(Date.now()).calendar() + '</span></h2><div class="message-text"><span data-id="' + time + '" class="markup"><p>Changed theme to <strong>' + localStorage.theme + '</strong></p></span></div></div></div></div>'))
				}
			}
		},
		deleteDmChannel: function(cid, id){
			let user = bot.users.get(id);
			user.deleteDM().then((r) => {
				App.switchTo.DMs(true);
				if(activeChannel === cid) App.switchTo.DMs();
			});
		}
	},
	switchTo: {
		friends: function(){
			activeChannel = 'dm';
			activeGuild = 'dm';
			if(!$(".friends")[0]) $(".chat")[0].outerHTML = `<div class="friends flex-vertical flex-spacer"></div>`;
			if (bot.user.bot){
				$('.friends').addClass("bot");
			}
		},
		chatMode: function(){
			if(activeChannel === 'dm') $(".friends")[0].outerHTML = `<div class="chat flex-vertical flex-spacer"><div class="title-wrap"><div class="title"><span class="channel">Loading...</span></div><span class="topic">Loading...</span></div><div class="messages-container app-scroller"></div><form id="message"><div class="textarea"><div class="textarea-inner"><div class="channel-textarea-upload"><div class="file-input" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; opacity: 0; cursor: pointer;"></div></div><textarea id="textarea" rows="1" placeholder="Chat using Lightcord..." style="height: auto; overflow: hidden;"></textarea></div></div></form></div>`;
			activeChannel = '0';
			$("#textarea").keypress(function (e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				if (code === 13 && !e.shiftKey) {
					App.payloadManager.handleCommand($('#textarea').val(), activeChannel);
					$(".messages-container")[0].scrollTop = $(".messages-container")[0].scrollHeight;
					$('#textarea').val('');
				}
			})
			$('.file-input').click(function() {
				if(App.disableUploading) return;
				$('#file-input').click();
			})
			document.getElementById('file-input').addEventListener("change", function() {
				if(App.disableUploading) return;
				let filelist = document.getElementById('file-input').files;
				let files = [];
				Object.keys(filelist).map(i=>files.push(filelist[i]))
				console.debug('%c[FileDrop] %cRetrieved files.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', filelist, files);
				let next = (file)=>{
					if(files.length === 0){
						App.filePrompt.dropped();
						return;
					}
					console.debug('%c[FileDrop] %cData for file ' + file.name + '.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', file);
					let reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onloadend = ()=>{
						console.debug('%c[FileDrop] %cSending file to queue ' + file.name + '.', 'color:#c4e8f7; font-weight: bold;', 'color:#000;', {file:file.nativeFile,url:reader.result,name:file.name,type:file.type,size:file.size});
						App.queuedFiles.push({file:file,url:reader.result,name:file.name,type:file.type,size:file.size});
						files.shift();
						next(files[0]);
					}
				}
				next(files[0]);
			})
		},
		guild: function(id){
			App.switchTo.chatMode();
			var guild = bot.guilds.get(id);
			$('.messages-container').empty();
			$('.title-wrap').empty();
			$('.channels').empty();
			$('.guild-header').empty();
			$('.guild-header').append('<header><span>' + guild.name + '</span></header>');
			activeGuild = guild.id;
			var guildChannels = [];
			guild.channels.forEach((channel) => {
				if (channel.id === guild.id) {
					guildChannels.push(channel);
				} else if (guild.members.get(bot.user.id).hasPermission['ADMINISTRATOR']) {
					guildChannels.push(channel);
				} else {
					if (channel.permissionsFor(bot.user.id).hasPermission('READ_MESSAGES')) {
						guildChannels.push(channel);
					}
				}
			})
			guildChannels = guildChannels.sort(function (a, b) {return a.position - b.position})
			for (var i in guildChannels) {
				if (guildChannels[i].id === guild.id) App.switchTo.channel(guild.id, guildChannels[i].name)
				if (guildChannels[i].type === 'text') $('.channels').append('<div class="channel" data-channel="' + guildChannels[i].id + '"><a draggable="false" onclick="App.switchTo.channel(\'' + guildChannels[i].id + '\', \'' + guildChannels[i].name + '\')" class="channel">' + guildChannels[i].name + '</a></div></div>')
			}
		},
		channel: function(id, name){
			bot.channels.get(id).fetchMessages().then((msgs) => {
				if ($(document.querySelector('[data-channel="' + activeChannel + '"]'))[0]) $(document.querySelector('[data-channel="' + activeChannel + '"]'))[0].className = 'channel'
				App.switchTo.chatMode();
				activeChannel = id;
				if (bot.channels.get(id).type !== "dm") document.getElementById('textarea').placeholder = 'Message #' + name + '...'
				else document.getElementById('textarea').placeholder = 'Message @' + name + '...'
				if ($(document.querySelector('[data-channel="' + id + '"]'))[0]) $(document.querySelector('[data-channel="' + id + '"]'))[0].className = 'channel selected'
				$('.title-wrap').empty()
				$('title').text(`${bot.channels.get(id).type === "dm" ? "@" : "#"}${name} - Lightcord`)
				$('.title-wrap').append(`<div class="title"><span class="channel${bot.channels.get(id).type === "dm" ? " dm" : ""}">${name}</span></div>`)
				$('.messages-container').empty()
				var msg2 = msgs.array();
				msg2.reverse();
				for (var msg in msg2) {
					App.payloadManager.messageCreate(msg2[msg]);
				}
				$(".messages-container")[0].scrollTop = $(".messages-container")[0].scrollHeight;
			});
		},
		DMs: function(channelsonly){
			var dms = bot.channels;
			if(!channelsonly) $('.title-wrap').empty()
			if(!channelsonly) $(".messages-container").empty();
			$(".channels").empty();
			if(!channelsonly) $('.guild-header').empty()
			if(!channelsonly) $('.guild-header').append('<header><span>Direct Messages</span></header>')
			if(!channelsonly) activeGuild = 'dm'
			if(!channelsonly) activeChannel = 'dm'
			if(!channelsonly) App.switchTo.friends();
			var d = []
			dms.forEach((dm) => d.push(dm));
			d = d.sort(function (a, b) {return parseInt(a.last_message_id) - parseInt(b.last_message_id)}).reverse()
			for (var i in d) {
				if (d[i].type === 'dm') {
					var status = 'offline'
					var game = ''
					if (bot.users.has(d[i].recipient.id)) {
						status = d[i].recipient.presence.status
						if (d[i].recipient.presence.game !== null) game = '<div class="channel-activity"><span>Playing<strong>' + d[i].recipient.presence.game.name + '</strong></span></div>'
					}
					if (status === null || status === undefined) status = 'offline'
					var avatar = 'https://cdn.discordapp.com/avatars/' + d[i].recipient.id + '/' + d[i].recipient.avatar + '.png'
					if (d[i].recipient.avatar === null) avatar = 'https://discordapp.com/assets/' + avatarHashes[d[i].recipient.id % avatarHashes.length] + '.png'
					$('.channels').append('<div class="channel dm"><a data-dmuid="' + d[i].recipient.id + '" onclick="App.switchTo.channel(\'' + d[i].id + '\', \'' + d[i].recipient.username.replace(/</ig, '&lt;').replace(/>/ig, '&gt;') + '\')" draggable="false"><div style="background-image: url(\'' + avatar + '\')" class="avatar-small-dm"><div class="status ' + status + '"></div></div><div class="dm-user ' + (game !== '' ? '' : 'no-status') +'">' + d[i].recipient.username + game + '</div></a><button class="close" onclick="App.payloadManager.deleteDmChannel(\'' + d[i].id + '\', \'' + d[i].recipient.id + '\')"></button></div>')
				}
			}
		},
		dmChannel: function(id){
			App.switchTo.DMs()
			let user = bot.users.get(id);
			var dms = bot.channels.filter(c=>c.type==="dm");
			if (!dms.has(id)) {
				user.createDM().then((r) => {/*
					var privateChannelData = {
						id: r.id,
						last_message_id: r.last_message_id,
						recipients: [r.recipient],
						type: 1
					}
					bot.channels.set(r.id, new Discord.DMChannel(bot, privateChannelData));*/
					App.switchTo.DMs();
					App.switchTo.channel(r.id, r.recipient.username);
				});
			} else {
				App.switchTo.DMs();
				App.switchTo.channel(id, bot.users.get(id).username);
			}
		}
	},
	deploy: {
		clearModal: function(){displayHandler.hideModal();$('.modal-inner').empty();},
		quickSwitcher: function(){
			let dom = `<div class="quickswitcher-container"><div class="quickswitcher"><input type="text" class="big-input" oninput="App.quickSwitcher.parseSearch()" placeholder="Where would you like to go today?" value=""><div class="quickswitcher-scroller app-scroller empty"><div class="quickswitcher-empty-state-note">Can’t seem to find what you’re looking for? Maybe you want to go to Direct Messages.</div><div class="result" data-id="144614724112220161" onclick="App.deploy.clearModal();App.switchTo.DMs()"><div class="icon" style="background-size: 75%;background-position: 50%;background-repeat: no-repeat;background-image: url(&quot;https://discordapp.com/assets/89576a4bb71f927eb20e8aef987b499b.svg&quot;); border-radius: 50%; background-color: #222"></div><span>Direct Messages</span></div></div></div></div>`
			$('.modal-inner').append(dom);
			displayHandler.showModal();
			$(".quickswitcher .big-input")[0].focus();
		},
		filePrompt: function(){
			let dom = `<div class="upload-container"><div class="upload-outline"><div class="upload-block"><div class="upload-header"><div class="description"><div class="filename"></div><div class="filesize"></div></div></div><input class="upload-input" placeholder="Insert a comment... (Optional)"></div></div><div class="upload-footer"><button class="button" onclick="App.filePrompt.cancel()"><span>Cancel</span></button><button class="button-primary" onclick="App.filePrompt.upload()"><span>Upload</span></button></div></div>`
			$('.modal-inner').append(dom);
			displayHandler.showModal();
			$(".upload-input")[0].focus();
			$(".upload-input").keypress(function (e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				if (code === 13 && !e.shiftKey) App.filePrompt.upload();
			});
		}
	},
	filePrompt: {
		currentFile: null,
		dropped: function(instaupload){
			$('.upload-modal').attr('style', 'display: none;');
			if(activeChannel === 'dm') return;
			if(instaupload){
				console.log('%c[Lightcord] %cInsta-uploading files...', 'color:#59A1EA; font-weight: bold;', 'color:#000;');
				App.deploy.clearModal();
				let next = ()=>{
					if(App.queuedFiles.length === 0) return;
					App.queuedFiles.shift();
					App.filePrompt.instaUpload(App.queuedFiles[0], next);
				}
				next(App.queuedFiles[0]);
			}else{
				App.filePrompt.currentFile = App.queuedFiles[0];
				App.queuedFiles.shift();
				if($('.modal-inner')[0].innerHTML.trim() === '') App.deploy.filePrompt();
				App.filePrompt.update();
			}
		},
		cancel: function(){
			if(App.queuedFiles[0]){
				App.filePrompt.currentFile = App.queuedFiles[0];
				App.queuedFiles.shift();
				App.filePrompt.update();
			}else{
				App.filePrompt.currentFile = null;
				App.deploy.clearModal();
			}
		},
		cancelAll: function(){
			App.queuedFiles = [];
			App.filePrompt.currentFile = null;
			App.deploy.clearModal();
		},
		update: function(){
			function humanFileSize (size) {
				if (size === 0) return '0 bytes'
				var i = Math.floor( Math.log(size) / Math.log(1024) );
				return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['bytes', 'kB', 'MB', 'GB', 'TB'][i];
			}
			let call = App.queuedFiles.length !== 0 ? '<button class="button cancel-all" onclick="App.filePrompt.cancelAll()"><span>Cancel All</span></button>' : '';
			let footbuttons = '<button class="button" onclick="App.filePrompt.cancel()"><span>Cancel</span></button><button class="button button-primary" onclick="App.filePrompt.upload()"><span>Upload</span></button>'
			$('.upload-header .image').remove();
			$('.upload-footer')[0].innerHTML = call+footbuttons;
			$('.upload-header .filename')[0].innerHTML = App.filePrompt.currentFile.name;
			$('.upload-header .filesize')[0].innerHTML = humanFileSize(App.filePrompt.currentFile.size);
			$('.upload-header')[0].innerHTML = (App.filePrompt.currentFile.type.split("/")[0] === "image" ? '<img src="'+App.filePrompt.currentFile.url+'" class="icon image">' : '<div class="file image"></div>') + $('.upload-header')[0].innerHTML;
		},
		upload: function(){
			function b642buffer(base64) {
				var binary_string =  window.atob(base64);
				var len = binary_string.length;
				var bytes = new Uint8Array( len );
				for (var i = 0; i < len; i++){
					bytes[i] = binary_string.charCodeAt(i);
				}
				return bytes.buffer;
			}
			let abuf = b642buffer(App.filePrompt.currentFile.url.split(",")[1]);
			bot.channels.get(activeChannel).sendFile(abuf, App.filePrompt.currentFile.name, $(".upload-input")[0].value).then(()=>$(".messages-container")[0].scrollTop = $(".messages-container")[0].scrollHeight);
			App.filePrompt.cancel();
		},
		instaUpload: function(file, next){
			function b642buffer(base64) {
				var binary_string =  window.atob(base64);
				var len = binary_string.length;
				var bytes = new Uint8Array( len );
				for (var i = 0; i < len; i++){
					bytes[i] = binary_string.charCodeAt(i);
				}
				return bytes.buffer;
			}
			let abuf = b642buffer(file.url.split(",")[1]);
			bot.channels.get(activeChannel).sendFile(abuf, file.name, "").then(()=>{
				$(".messages-container")[0].scrollTop = $(".messages-container")[0].scrollHeight
				next();
			});
		},
		nextInQueue: function(){
			function b642buffer(base64) {
				var binary_string =  window.atob(base64);
				var len = binary_string.length;
				var bytes = new Uint8Array( len );
				for (var i = 0; i < len; i++){
					bytes[i] = binary_string.charCodeAt(i);
				}
				return bytes.buffer;
			}
			let abuf = b642buffer(App.filePrompt.currentFile.url.split(",")[1]);
			bot.channels.get(activeChannel).sendFile(abuf);
		}
	},
	quickSwitcher: {
		parseSearch: function(){
			$(".quickswitcher-scroller").empty();
			$(".quickswitcher-scroller").append("<br>");
			$(".quickswitcher-scroller").removeClass("empty");
			let array = [];
			bot.guilds.array().map(c=>{v=c; v.searchname = v.name; array.push(v)})
			bot.channels.array().map(c=>{v=c; v.searchname = "#"+v.name; array.push(v)})
			bot.users.array().map(c=>{v=c; v.searchname = v.username+"#"+v.discriminator; array.push(v)})
			let results = new Fuse(array, fuseOptions).search($(".quickswitcher .big-input")[0].value.trim());
			if(results.length === 0){
				$(".quickswitcher-scroller").addClass("empty");
				$(".quickswitcher-scroller").append('<div class="quickswitcher-empty-state-note">Can’t seem to find what you’re looking for? Maybe you want to go to Direct Messages.</div><div class="result" data-id="dms" onclick="App.deploy.clearModal();App.switchTo.DMs()"><div class="icon" style="background-size: 75%;background-position: 50%;background-repeat: no-repeat;background-image: url(&quot;https://discordapp.com/assets/89576a4bb71f927eb20e8aef987b499b.svg&quot;); border-radius: 50%; background-color: #222"></div><span>Direct Messages</span></div>');
				return;
			}
			let found = {
				guilds: [],
				channels: [],
				users: []
			};
			results.map(res=>{
				if(results.indexOf(res) > 200) return;
				try{
					if(res.region){
						//$(".quickswitcher-scroller").append(`<div class="result" data-id="${res.id}" onclick="App.deploy.clearModal();App.switchTo.guild('${res.id}')"><div class="icon" style="background-image: url(&quot;https://cdn.discordapp.com/icons/${res.id}/${res.icon}.png&quot;);"></div><span>${res.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span></div>`);
						found.guilds.push(`<div class="result" data-id="${res.id}" onclick="App.deploy.clearModal();App.switchTo.guild('${res.id}')"><div class="icon" style="background-image: url(&quot;https://cdn.discordapp.com/icons/${res.id}/${res.icon}.png&quot;);"></div><span>${res.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span></div>`);
					}else if(res.bot !== undefined){
						let avatar_url = res.avatar ? (res.avatar.startsWith("a_") ? `https://cdn.discordapp.com/avatars/${res.id}/${res.avatar}.gif?size=1024` : `https://cdn.discordapp.com/avatars/${res.id}/${res.avatar}.png?size=1024`) : `https://discordapp.com/assets/${avatarHashes[res.discriminator % avatarHashes.length]}.png`;
						found.users.push(`<div class="result" data-id="${res.id}" onclick="App.deploy.clearModal();App.switchTo.chatMode();App.switchTo.dmChannel('${res.id}')"><div class="icon" style="background-image: url(&quot;${avatar_url}&quot;); border-radius: 50%;"></div><span>${res.username.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span><span class="discriminator">#${res.discriminator}</span></div>`);
					}else{
						if(res.type === "dm") return;
						found.channels.push(`<div class="result" data-id="${res.id}" onclick="App.deploy.clearModal();App.switchTo.chatMode();App.switchTo.guild('${res.guild.id}');App.switchTo.channel('${res.id}', '${res.name}')"><div class="icon hashtag"></div><span>${res.name}</span><span class="discriminator">${res.guild.name}</span></div>`);
					}
				}catch(e){
					console.log('%c[Lightcord] %cCouldn\'t parse object in Quickswitcher!', 'color:#59A1EA; font-weight: bold;', 'color:#000;', e, res);
				}
			});

			if(found.guilds.length !== 0){
				$(".quickswitcher-scroller").append(`<h1>Guilds</h1>`);
				found.guilds.map(v=>$(".quickswitcher-scroller").append(v));
			}

			if(found.channels.length !== 0){
				$(".quickswitcher-scroller").append(`<h1>Channels</h1>`);
				found.channels.map(v=>$(".quickswitcher-scroller").append(v));
			}

			if(found.users.length !== 0){
				$(".quickswitcher-scroller").append(`<h1>Users</h1>`);
				found.users.map(v=>$(".quickswitcher-scroller").append(v));
			}
		}
	}
}