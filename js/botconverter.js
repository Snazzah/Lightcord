DiscordClientConverter = function(bot){
	bot.apiCall = function(method, url, sync, headers) {
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest()
			var data = {}
			xhr.addEventListener('readystatechange', function () {
				if (xhr.readyState == 4) return resolve(JSON.parse(this.responseText))
			})
			xhr.onerror = function (e) {
				return reject(e)
			}
			xhr.open(method, url, sync)
			var botheader = ''
			if (bot.user.email === null) botheader = 'Bot '
			xhr.setRequestHeader('Authorization', botheader + (headers.authorization || bot.token))
			if (headers.body) data = JSON.stringify(headers.body)
			if (!headers.contentType) xhr.setRequestHeader("Content-Type", "application/json")
			if (headers.contentType === 'multipart/form-data') xhr.send(headers.formdata)
			else xhr.send(data)
		})
	}
	bot.createDMchannel = function(id) {
		return bot.apiCall('POST', 'https://discordapp.com/api/users/@me/channels', true, {authorization: bot.token, body: {"recipient_id": id}})
	}
	bot.uploadFile = function(channel, file) {
		return bot.apiCall('POST', 'https://discordapp.com/api/channels/' + channel + '/messages', true, {authorization: bot.token, contentType: 'multipart/form-data', formdata: file})
	}
}