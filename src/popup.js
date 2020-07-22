var settings, popup = chrome.extension.connect({ name: 'popup' });

popup.onMessage.addListener(function(request) {
	if (request.action === 'get_settings') {
		settings = JSON.parse(request.data);
		
		if (settings) {
			document.getElementById('min-show-delay').value = parseInt(settings.minShowDelay);
			document.getElementById('max-show-delay').value = parseInt(settings.maxShowDelay);
			document.getElementById('min-hide-delay').value = parseInt(settings.minHideDelay);
			document.getElementById('max-hide-delay').value = parseInt(settings.maxHideDelay);
			document.getElementById('font-size').value = parseInt(settings.fontSize);
			document.getElementById('opacity').value = parseInt(settings.opacity);
		}
	}
});

document.addEventListener('DOMContentLoaded', function() {
	if (!popup)
		return;
	
	document.getElementById('save').addEventListener('click', function(e) {
		e.preventDefault();
		
		var object = {
			minShowDelay: document.getElementById('min-show-delay').value,
			maxShowDelay: document.getElementById('max-show-delay').value,
			minHideDelay: document.getElementById('min-hide-delay').value,
			maxHideDelay: document.getElementById('max-hide-delay').value,
			fontSize: document.getElementById('font-size').value,
			opacity: document.getElementById('opacity').value,
		};
		
		object = JSON.stringify(object);
		
		popup.postMessage({ action: 'change_settings', data: object });
		
		window.close();
	});
});

if (popup) {
	popup.postMessage({ action: 'get_settings' });
}