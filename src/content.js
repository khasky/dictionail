var cssWrapperClass = 'dictio-nail';
var cssWraperId = 'dn-words-container';

var settings;
var words;
var iElapsedSec;
var bWait, bVisible;
var timer;

function getNextWord() {
	chrome.runtime.sendMessage({ action: 'get_word' }, function(resp) {
		if (resp && resp.data) {
			words = JSON.parse(resp.data);
		}
	});
}

function hideIt() {
	var container = $('#' + cssWraperId);
	container.removeClass('visible');
	bVisible = false;
}

function displayIt() {
	if (!words) {
		console.log('cannot display because of an empty dictionary');
	} else {
		var content = '';
	
		for (var i = 0; i < words.length; i++) {
			content += '<span style="background: ' + settings.backgroundColor + ';">' + words[i] + '</span>';
		}
		
		var container = $('#' + cssWraperId);
		
		if (!container[0]) {
			$('body').append('<div class="' + cssWrapperClass + '" id="' + cssWraperId + '">' + content + '</div>');
			container = $('#' + cssWraperId);
		} else {
			container.removeClass('visible');
			container.html(content);
		}
		
		var bodyWidth = $(window).width();
		var bodyHeight = $(window).height();
		var randX = Math.floor((Math.random() * (bodyWidth - container.width())));
		var randY = Math.floor((Math.random() * (bodyHeight - container.height())));
		
		container.css({
			'left': randX + 'px',
			'top': randY + 'px',
			'font-size': parseInt(settings.fontSize) + 'px',
			'color': settings.fontColor,
			'opacity': parseInt(settings.opacity) / 100
		});
		
		container.addClass('visible');
	}
	
	bVisible = true;
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}

function setupTimer() {
	timer = setInterval(function() {
		if (bVisible) {
			if (iElapsedSec == -1) {
				iElapsedSec = random(parseInt(settings.minHideDelay), parseInt(settings.maxHideDelay));
			} else {
				iElapsedSec--;
				
				if (iElapsedSec == 0) {
					hideIt();
					bWait = false;
				}
			}
		}
		else {
			if (!bWait) {
				iElapsedSec = random(parseInt(settings.minShowDelay), parseInt(settings.maxShowDelay));
				bWait = true;
			}
			else {
				iElapsedSec--;
				
				if (iElapsedSec == 0) {
					getNextWord();
					displayIt();
					iElapsedSec = -1;
				}
			}
		}
	}, 1000);	
}

function resetTimer () {
	clearInterval(timer);
}

function reloadSettings () {
	chrome.runtime.sendMessage({ action: 'get_settings' }, function(resp) {
		if (resp && resp.data) {
			settings = JSON.parse(resp.data);
		}
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === 'reload') {
		reloadSettings();
		hideIt();
		resetTimer();
		setupTimer();
	}
});

resetTimer();
reloadSettings();

$(function () {
	setupTimer();
	
	$(document).on('click', '#' + cssWraperId, function() {
		hideIt();
	});
});