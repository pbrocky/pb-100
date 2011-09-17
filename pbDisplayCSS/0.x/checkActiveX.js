(function(){
	var	b = document.body || (function(){document.write('&lt;body&gt;');return document.body;})(),
		x = (function(){
			try {var t = new ActiveXObject('DXImageTransform.Microsoft.gradient');}catch(e){}
			return t ? 'pbDisplay-ActiveX-enabled' : null;
		})();
	if( x && !b.className.match(x)) b.className += ( b.className.length === 0 ? '' : ' ') +x;
})();