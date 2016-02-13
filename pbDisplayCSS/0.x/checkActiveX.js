(function(b, c, e, s){
  b = document.body;
  if(!b) return setTimeout(arguments.callee, 50);
  c = b.className || '';
  e = document.createElement('div');
  b.appendChild(e);
  e.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;line-height:1px;filter:dropshadow() progid:DXImageTransform.Microsoft.Shadow();';
  b.className += ( c ? ' ' : c ) + ( e.offsetHeight > 1 ? 'pbDisplay-ActiveX-enabled' : '' );
  e.removeAttribute( 'style' ); // before removeChild(e) for ie5
  b.removeChild(e);
})();