console = chrome.extension.getBackgroundPage().console;

var initialized = false;
var dictionary = [];
var settings;

function loadSettings() {
	chrome.storage.sync.get({
		minShowDelay: 1,
		maxShowDelay: 2,
		minHideDelay: 3,
		maxHideDelay: 4,
		fontSize: 15,
		fontColor: '#fefefe',
		backgroundColor: '#111111',
		opacity: 80
	}, function (resp) {
		settings = {
			minShowDelay: resp.minShowDelay,
			maxShowDelay: resp.maxShowDelay,
			minHideDelay: resp.minHideDelay,
			maxHideDelay: resp.maxHideDelay,
			fontSize: resp.fontSize,
			fontColor: resp.fontColor,
			backgroundColor: resp.backgroundColor,
			opacity: resp.opacity
		};
	});
}

function changeSettings(data) {
	settings = {
		minShowDelay: data.minShowDelay || settings.minShowDelay,
		maxShowDelay: data.maxShowDelay || settings.maxShowDelay,
		minHideDelay: data.minHideDelay || settings.minHideDelay,
		maxHideDelay: data.maxHideDelay || settings.maxHideDelay,
		fontSize: data.fontSize || settings.fontSize,
		fontColor: data.fontColor || settings.fontColor,
		backgroundColor: data.backgroundColor || settings.backgroundColor,
		opacity: data.opacity || settings.opacity		
	};
	
	chrome.storage.sync.set({
		minShowDelay: settings.minShowDelay,
		maxShowDelay: settings.maxShowDelay,
		minHideDelay: settings.minHideDelay,
		maxHideDelay: settings.maxHideDelay,
		fontSize: settings.fontSize,
		fontColor: settings.fontColor,
		backgroundColor: settings.backgroundColor,
		opacity: settings.opacity
	});
}

function loadDictionary() {
	if (initialized)
		return false;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('dictionary.txt'), true);
	
	xhr.onreadystatechange = function () {
		if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			var lines = xhr.responseText.split(/\n/);
			
			for (var i = 0; i < lines.length; i++) {
				var translations = lines[i].split(/\+/);
				
				for (var k = 0; k < translations.length; k++) {
					if (!translations[k] || !translations[k].length)
						translations.splice(translations.indexOf(translations[k]));
				}
				
				dictionary.push(translations);
			}
			
			initialized = true;
		}
	};
	
	xhr.send();	
	
	return true;
}

function reloadDictionary() {
	initialized = false;
	loadDictionary();
}

function getRandomWord() {
	if (!dictionary || !dictionary.length) {
		reloadDictionary();
		return null;
	}
	
	return dictionary[Math.floor(Math.random() * dictionary.length)];
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === 'get_settings') {
		sendResponse({ data: JSON.stringify(settings) });
	}
	else if (request.action === 'get_word') {
		sendResponse({ data: JSON.stringify(getRandomWord()) });
	}
});

chrome.extension.onConnect.addListener(function (popup) {
    popup.onMessage.addListener(function (request) {
		if (request.action === 'get_settings') {
			popup.postMessage({ action: 'get_settings', data: JSON.stringify(settings) });
		} else if (request.action === 'change_settings') {
			var data = JSON.parse(request.data);

			if (data) {
				changeSettings(data);
				chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, { action: 'reload' });
				});
			}
		}
    });
});

// Initialize
loadSettings();
loadDictionary();