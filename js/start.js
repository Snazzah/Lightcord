let displayHandler = {
	showLoadingScreen: function(){
		$(".loading").fadeIn(500);
	},
	hideLoadingScreen: function(){
		$(".loading").fadeOut(500);
	},
	showModal: function(){
		$(".modal").fadeIn(200);
	},
	hideModal: function(){
		$(".modal").fadeOut(200);
	},
	preloadAsset: function(url){
		let img = new Image();
		img.src = url;
	}
}

const assets = [
	"https://discordapp.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff",
	"https://discordapp.com/assets/e8acd7d9bf6207f99350ca9f9e23b168.woff",
	"https://discordapp.com/assets/3bdef1251a424500c1b3a78dea9b7e57.woff",
	"https://discordapp.com/assets/be0060dafb7a0e31d2a1ca17c0708636.woff",
	"https://discordapp.com/assets/8e12fb4f14d9c4592eb8ec9f22337b04.woff",
	"https://discordapp.com/assets/8e12fb4f14d9c4592eb8ec9f22337b04.woff",
	"https://discordapp.com/assets/9f358f466473586417baee7bacfba5ca.svg",
	"https://discordapp.com/assets/985ea67d2edab4424c62009886f12e44.svg",
	"https://discordapp.com/assets/0b298968e0a756e25677771fd6b58b34.svg",
	"https://discordapp.com/assets/0900c33038a1b28283644e5870de552f.svg",
	"https://discordapp.com/assets/c7d26cb2902f21277d32ad03e7a21139.gif",
	"https://discordapp.com/assets/79518c57724241fa0a4272cafc687de8.svg"
];

assets.map(v=>displayHandler.preloadAsset(v))

window.onload = ()=>{
	$("#djs-version")[0].innerText = Discord.version;
	displayHandler.hideLoadingScreen();
	$(".landing input").keypress(function (e) {
		var code = (e.keyCode ? e.keyCode : e.which)
		if (code === 13) {
			App.start($(".landing input")[0].value);
		}
	});
}

if(localStorage.token && localStorage.token !== '' && localStorage.token !== undefined){
	$(".landing .continue-session").fadeIn(500).click(()=>App.start(localStorage.token));
}