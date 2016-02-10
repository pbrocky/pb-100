/*
 * http://d.hatena.ne.jp/hir90/20080620/1213987444
 */
	String.prototype.repeat = function( num){
		var str = "" + this;
		var ans = '';
		if( num < 0) return 'error';
		while( num){
			if( num&1) ans += str;
			num = num>>1;
			str += str;
		}
		return ans;
	};
/*
 * http://serennz.sakura.ne.jp/sb/log/eid73.html
 */
	String.prototype.entitize = function(){
	  var str = "" + this;
	  str = str.split("&").join("&amp;")
	  			.split("<").join("&lt;")
				.split(">").join("&gt;")
				.split('"').join("&quot;");
	  str = str.charCodeAt(0) === 92   ? "&yen;" : str;
	  str = str.charCodeAt(0) === 9824 ? "&spades;" : str;
	  str = str.charCodeAt(0) === 9827 ? "&clubs;" : str;
	  str = str.charCodeAt(0) === 9829 ? "&hearts;" : str;
	  str = str.charCodeAt(0) === 9830 ? "&diams;" : str;
	  return str;
	};


/*
 * printer.font		= PB-100, PB-120
 * printer.printer = 0:random, 1:FP-12T or 2:FP-40T
 * printer.separate = 0:fit, 1~,
 * printer.desine	= 0:random, 1:printer, 2:PJ, 3:BasicMagazin, etc...
 * printer.init( _option)
 * printer.print( _elmOutput, _kind, _font, _printer, _separate, _desine, _hilight, _format, _count)
 * 
 * <code class="pb-100 FP-12T desine:printer separete:0" title="title here">	program
 * <var  class="pb-100 FP-12T desine:printer separete:2" title="title here">	database, var
 * <samp class="pb-100 FP-12T desine:printer separete:1" title="title here">	output
 * 
 */

var pbCodeMakeuper = ( function( window, document, undefined ){
	var NS_CLASSNAME = 'pb-printer-';
	
	var FONT_AUTO      = 0,
		FONT_PB_100    = 1,
		FONT_PB_120    = 2,
		PRINTER_RANDOM = 0,
		PRINTER_FP_12T = 1,
		PRINTER_FP_40T = 2,
		SEPARATE_FIT   = 0,
		DESIGN_RANDOM  = 0,
		DESIGN_PRINT   = 1,
		DESIGN_PJ      = 2;
	
	var PB_100 = 'PB-100',
		PB_120 = 'PB-120',
		FP_12T = 'FP-12T',
		FP_40T = 'FP-40T';
	
	var SHEET_WIDTH_FP12T = 190,
		SHEET_WIDTH_FP40T = 330;
	
	var CODE = 'code',
		VAR  = 'var',
		SAMP = 'samp';
		
	var DATABASE = 'DATABASE';
	
	var NUM_DESINE = 2,
		PRINTER    = 'PRINTER',
		PJ         = 'PJ';
	
	var REG_SEPARATE = /.*separate:(\d).*/i,
		REG_DESINE   = /.*desine:(\w*).*/i;
		
	var KIND_IS_CODE     = 0,
		KIND_IS_VAR      = 1,
		KIND_IS_DATABASE = 2,
		KIND_IS_SAMP     = 3;
	
	var defauldFont     = FONT_AUTO,
		defaultPrinter  = PRINTER_FP_40T,
		defaultDesign   = DESIGN_PRINT,
		defaultSeparate = SEPARATE_FIT;
		defaultHilight  = false;
		defaultFormat   = true;
		defaultCount    = false;
	
	var body            = document.getElementsByTagName( 'body' )[ 0 ],
		rootElement     = ( document.compatMode || '' ) !== 'CSS1Compat' ? document.body : document.documentElement;
	
	var ELM_PRINTER_ORIGN = ( function(){
			var elmOuter  = document.createElement( 'div' ),
				elmInner  = elmOuter.cloneNode(false),
				elmHeader = elmOuter.cloneNode(false),
				elmBody   = elmOuter.cloneNode(false),
				elmFooter = elmOuter.cloneNode(false);
			elmOuter.appendChild( elmInner );
			elmInner.appendChild( elmHeader, elmBody, elmFooter );
			elmInner.appendChild( elmBody );
			elmInner.appendChild( elmFooter );
			elmOuter.className	= NS_CLASSNAME + 'outer';
			elmInner.className	= NS_CLASSNAME + 'inner';
			elmHeader.className	= NS_CLASSNAME + 'header';
			elmBody.className	= NS_CLASSNAME + 'body';
			elmFooter.className	= NS_CLASSNAME + 'footer';
			return elmOuter;
		})(),
		ORIGN_SPACER_ELM = document.createElement( 'div' ),
		ORIGIN_LINE_ELM  = document.createElement( 'div' ),
		ORIGIN_SHEET_ELM = document.createElement( 'div' ),
		ELM_DETECT_WIDTH = ( function(){
			var ret   = document.createElement( 'div'),
				style = ret.style;
			//style.width = 'auto';
			style.height     = style.padding = style.margin = '0px';
			style.display    = 'block';
			style.visibility = 'hidden';
			return ret;
		})();
	
	ORIGN_SPACER_ELM.appendChild( document.createTextNode( ' ' ) );// for ie
	ORIGN_SPACER_ELM.className = NS_CLASSNAME + 'spacer';
	ORIGIN_LINE_ELM.className  = NS_CLASSNAME + 'printline';
	ORIGIN_SHEET_ELM.className = NS_CLASSNAME + 'sheet';

	var TAB_CODE = '\t',
		HEX      = '0123456789ABCDEF',
		LINEFEEDS_PRE = ( function(){
			var pre = document.createElement( 'pre' );
			pre.appendChild( document.createTextNode( '\r,\n,\n\r,\r\n' ) );
			return pre.firstChild.data.split( ' ' ).join( '' ).split( ',' );
		})();
	
	/*
	 * original
	 *   http://d.hatena.ne.jp/uupaa/20090720/1248097177
	 */
	var ResizeAgentClass = function( listener, opt_elmCheck ){
		var	_globalLock = 0,
			_size       = { w: 0, h: 0 };
			_ie         = !!document.uniqueID,
			_quirks     = (document.compatMode || "") !== "CSS1Compat",
			_ieroot     = _quirks ? "body" : "documentElement";
			_root       = opt_elmCheck ? opt_elmCheck : ( _ie ? document[_ieroot] : window );

		function getInnerSize() {
			return {
				w: _root.innerWidth  || _root.clientWidth,
				h: _root.innerHeight || _root.clientHeight
			};
		};

		function loop() {
			if( !_globalLock++ ){
				var size = getInnerSize();
				if( _size.w !== size.w || _size.h !== size.h ){ // resized
					_size = size; // update
					listener.onResize( _size );
				};
				setTimeout( unlock, 0 ); // delay unlock
			};
			setTimeout( loop, 500 );
		};
		function unlock(){
			_globalLock = 0;
		};
		loop();
	};

	var PrinterClass = function( elmReplaceTarget, lineArray, kind, font, printer, separate, desine, hilight, format, count ){
		this.LIST           = pbListFactory.create();
		this.LIST.setList( lineArray );
		
		this.elmOuter       = ELM_PRINTER_ORIGN.cloneNode( true );
		this.elmInner       = getElementsByClassName( this.elmOuter, NS_CLASSNAME + 'inner',  'div' )[ 0 ];
		this.elmHeader      = getElementsByClassName( this.elmOuter, NS_CLASSNAME + 'header', 'div' )[ 0 ];
		this.elmBody        = getElementsByClassName( this.elmOuter, NS_CLASSNAME + 'body',   'div' )[ 0 ];
		this.elmReplace     = elmReplaceTarget;
			// elmFooter     = getElementsByClassName( elmOuter, NS_CLASSNAME + 'footer', 'div' )[ 0 ],
		this.printElmArray  = [];
		this.targetStyle    = elmReplaceTarget.style.cssText;
		
		var elmParent     = elmReplaceTarget.parentNode,
			elmDetectW    = ELM_DETECT_WIDTH.cloneNode( true );
			
		this.elmHeader.innerHTML = elmReplaceTarget.title || '';
		this.elmBody.className  += ' ' + ( font === FONT_PB_100 ? PB_100 : PB_120 );
		
		desine = desine === DESIGN_RANDOM ? Math.floor( Math.random() * NUM_DESINE + 1 ) : desine;
		if( desine === DESIGN_PRINT ){
			this.elmOuter.className += ' desine_print';
		} else {
			this.elmOuter.className += ' magazine_pj';
		};
		this.printer  = printer === PRINTER_RANDOM ? Math.floor( Math.random() * 2 ) : printer;
		this.separate = separate;
		this.hilight  = hilight;
		this.format   = format;
		this.count    = count;
		
		elmParent.insertBefore( elmDetectW, elmReplaceTarget );
		elmParent.insertBefore( this.elmOuter, elmReplaceTarget );
		new ResizeAgentClass( this, elmDetectW );
	};
	PrinterClass.prototype.onResize = function( size ){
		var _stageW = size.w,
			_sheetW,
			_printer, _separate;
		
		if( SHEET_WIDTH_FP12T > _stageW ){
			this.elmOuter.style.display   = 'none';
			this.elmReplace.style.cssText = this.targetStyle;
		} else {
			this.elmOuter.style.display   = '';
			this.elmReplace.style.display = 'none';
		};
		_printer = SHEET_WIDTH_FP40T > _stageW ? PRINTER_FP_12T : this.printer;
		_sheetW = _printer === PRINTER_FP_12T ? SHEET_WIDTH_FP12T : SHEET_WIDTH_FP40T;
		_separate = ( this.separate === SEPARATE_FIT || _sheetW * this.separate > _stageW ) ? Math.floor( _stageW /_sheetW) : this.separate;
		
		this.elmInner.className = NS_CLASSNAME + 'inner ' + ( _printer === PRINTER_FP_12T ? FP_12T : FP_40T );
		
		if( this.currentPrinter === _printer ){
			if( this.currentSeparate === _separate ){
				return;
			};
			while( this.elmBody.firstChild ){
				this.elmBody.removeChild( this.elmBody.firstChild );
			};
			this.currentSeparate = _separate;
			this.output();
			return;
		};
		this.currentPrinter !== undefined && removeAllChildren( this.elmBody );
		
		var printDataArray     = [],
			formattedLineArray = [],
			_lineData,
			_lineNumber,
			_lineString,
			_hilightMap,
			_numTab = _printer === PRINTER_FP_12T ? 4 : 5,
			_steps  = 0,
			_isBasicLine,
			i, j, k,
			l, m, n;
		/*
		 * Build String Data
		 */
		for( i = 0, l = this.LIST.numLine(); i<l; ++i ){
			_lineData    = this.LIST.getLineAt( i );
			_lineNumber  = _lineData.getLineNumber();
			_lineString  = _lineData.getFormattedLine();
			_hilightMap  = _lineData.getHilightMap();
			_steps      += _lineData.getSteps();
			_isBasicLine = false;
			if( 0 < _lineNumber && _lineNumber < 10000 ){ // Max Line Number PB-100 < 1000, PB-120 < 10000
				_lineNumber = '' + _lineNumber;
				_lineString = [
					' '.repeat( _numTab - _lineNumber.length),// insert space before line-number.
					_lineNumber, ' ', // insert space after line-number.
					_lineString
				].join( '');
				
				_hilightMap = '0'.repeat( _lineString.length - _hilightMap.length ) + _hilightMap;
				_isBasicLine = true;	
			};
			
			printDataArray.push( {
				isProgramArea:	_lineNumber === 0,
				lineString:		_lineString,
				hilightMap:		_hilightMap,
				isProgramLine:	_isBasicLine,
				tooltip:		_lineData.getSteps() + 'steps , ' + _lineData.getFormattedLine()
			});

			formattedLineArray.push( _lineString );
		};

		var _numMaxChar = _printer === PRINTER_FP_12T ? 20 : 40,
			_numCharWithIndent = _printer === PRINTER_FP_12T ? 15 : 34,
			_insertTab,
			_lStr, _hlStr, _class,
			_printData,
			_elmPrintLine;

		if( this.count === true ){
			_steps += 'steps';
			printDataArray.push(
				{
					isProgramArea:	true,
					lineString:		'-'.repeat( _numMaxChar ),
					hilightMap:		'0'.repeat( _numMaxChar ),
					isProgramLine:	false
				},
				{
					isProgramArea:	false,
					lineString:		' '.repeat( _numMaxChar - _steps.length ) +_steps,
					hilightMap:		'0'.repeat( _numMaxChar ),
					isProgramLine:	false
				}
			);
		};
		/*
		 * Build Element
		 */			
		this.printElmArray.splice( 0, this.printElmArray.length );
		
		for( i = 0, l = printDataArray.length; i<l; ++i ){
			_printData   = printDataArray[ i ];
			_lineString  = _printData.lineString;
			_hilightMap  = _printData.hilightMap;
			_isBasicLine = _printData.isProgramLine;
			m            = _lineString.length;
			
			if( _printData.isProgramArea === true && i > 0 ){
				this.printElmArray.push( ORIGN_SPACER_ELM.cloneNode( true));
			};
			
			for( j = 0; j < m; ){//印字行数分のループ
				_insertTab = _isBasicLine === true && j > 0 ? 1 : 0;
				_lStr = ( _insertTab === 1 ) ?
						TAB_CODE + _lineString.substr( j, _numCharWithIndent ) :
						_lineString.substr( j, _numMaxChar);
				
				_hlStr = ( _insertTab === 1 ) ?
						'0' + _hilightMap.substr( j, _numCharWithIndent ) :
						_hilightMap.substr( j, _numMaxChar );
				
				_elmPrintLine = ORIGIN_LINE_ELM.cloneNode( true );
				
				for( k = 0, n = _lStr.length; k < n; k++ ){
					_class = _hlStr.charAt( k );
					_class = _class !== '0' && this.hilight === true ? ( NS_CLASSNAME + 'hilight-' + _class ) : null;
					_elmPrintLine.appendChild( createPBCharElm( _lStr.charAt( k ), _class ) );//一文字格納
				};
				//_elmPrintLine.appendChild( document.createElement( 'br'));
				_elmPrintLine.title = _printData.tooltip;
				j += _lStr.length - _insertTab;
				this.printElmArray.push( _elmPrintLine );//一行格納
			};
		};
		
		this.currentPrinter  = _printer;
		this.currentSeparate = _separate;
		this.output();
	};
		
	PrinterClass.prototype.output = function(){
		var _numLine       = this.printElmArray.length,
			_workCopyArray = [],
			_row           = Math.floor( _numLine / this.currentSeparate ) + ( _numLine % this.currentSeparate  === 0 ? 0 : 1 ),
			_sheetIndex    = 0,
			_elmSheet, i, l;
		
		for( i = 0; i < _numLine; ++i ){
			_workCopyArray.push( this.printElmArray[ i ] );
		};
		for( i = 0, l = _row * this.currentSeparate; i < l; i++ ){
			if( _row * _sheetIndex === i ){
				_elmSheet = ORIGIN_SHEET_ELM.cloneNode( true ); // new sheet
				if( i === 0 ){
					_elmSheet.className += ' ' + NS_CLASSNAME + 'first';
				};
				if( _workCopyArray.length === 0 ){
					break;
				};								
				this.elmBody.appendChild( _elmSheet );
				_sheetIndex++;
				
				while( _workCopyArray[ 0 ] && _workCopyArray[ 0 ].className === ORIGN_SPACER_ELM.className ){// 頭がspacerにならないようにする
					_workCopyArray.shift();
				};
			};
			_elmSheet.appendChild( _workCopyArray.shift() || ORIGN_SPACER_ELM.cloneNode( true ) );
		};
		this.currentSeparate = _sheetIndex;
		this.elmInner.style.width = ( ( this.currentPrinter === PRINTER_FP_12T ? SHEET_WIDTH_FP12T : SHEET_WIDTH_FP40T ) * this.currentSeparate ) + 'px';
	};
	/*
	 * Create PB Chara SPAN
	 */
	function createPBCharElm( chr, _className ){
		var ret   = document.createElement( 'span' ),
			chars = pbListFactory.charTable;
		ret.appendChild( document.createTextNode( chr.entitize() ) );
		
		if( chr === TAB_CODE ){
			ret.className = NS_CLASSNAME + 'tab';
		} else {
			for( var i = 0, l = chars.length; i < l; i++ ){
				if( chars[ i ] === chr ){
					ret.className = 'chr' + HEX.charAt( i / 16 ) + HEX.charAt( i % 16 );
					break;
				};
			};
			if( i === l ) ret.className = NS_CLASSNAME + 'none';
		};
		if( _className ) ret.className += ' ' + _className;
		return ret;
	};

	function getElementsByClassName( _elm, _className, opt_tagName ){
		var _all = !opt_tagName || opt_tagName === '*',
			_nodes = _all === true ? ( _elm.all || _elm.getElementsByTagName( '*' )) : _elm.getElementsByTagName( opt_tagName ),
			_node, _classes, ret = [];
		for( var i=0, l = _nodes.length; i<l; ++i ){
			_node = _nodes[ i ];
			if( _node.nodeType === 1 ){
				_classes = _node.className.split( ' ' );
				for( var j = 0, m = _classes.length; j<m; ++j ){
					if( _classes[ j ] === _className ){
						ret.push( _node );
						break;
					};
				};
			};
		};
		return ret;
	};
	function removeAllChildren( elm ){
		if( elm.nodeType !== 1 ) return;
		var child;
		while( child = elm.firstChild ){
			removeAllChildren( child );
			elm.removeChild( child );
		};
	};
	/*
	function removeAllChildren( _elm ){
		while( _elm.firstChild ){
			remove( _elm.firstChild );
		};
		function remove( _node ){
			while( _node.firstChild ){
				remove( _node.firstChild );
			};
			_node.parentNode && _node.parentNode.removeChild( _node );
		};
	}; */

	
	return {
		init: function( _option ){
			_option = _option || {};
			
			defauldFont		= _option.font     !== undefined ? _option.font : defauldFont;
			defaultPrinter	= _option.printer  !== undefined ? _option.printer : defaultPrinter;
			defaultDesign	= _option.design   !== undefined ? _option.design : defaultDesign;
			defaultSeparate = _option.separate !== undefined ? _option.separate : defaultSeparate;
			defaultHilight	= _option.hilight  !== undefined ? _option.hilight : defaultHilight;
			defaultFormat	= _option.format   !== undefined ? _option.format : defaultFormat;
			defaultCount	= _option.count    !== undefined ? _option.count : defaultCount;
			rootElement		= _option.root || rootElement;
		},
		print: function( opt_targetElmOrNode, _option ){
			_option = _option || {};
			
			var _targetElementArray = [],
				_kind, _font,
				_printer, _separate,
				_desine, _hilight,
				_format, _count,
				i, l, _elm, _elmTarget,
				_nodes, _className, _tagName, programText;
			
			if( opt_targetElmOrNode ){//instanceof HTMLElement){
				_targetElementArray.push( opt_targetElmOrNode );
			} else
			if( opt_targetElmOrNode && typeof opt_targetElmOrNode.length === 'number'){
				for( i=0, l = opt_targetElmOrNode.length; i<l; ++i){
					_elm = opt_targetElmOrNode[ i];
					_elm.nodeType === 0 && _targetElementArray.push( _elm);
				}
			} else {
				_nodes = rootElement.all || rootElement.getElementsByTagName( '*'); // document.body.all is for ie5.5.

				for( i=0, l = _nodes.length; i<l; ++i){
					_elm = _nodes[ i];
					if( _elm && _elm.nodeType === 1){
						_className = _elm.className.toUpperCase();
						_className.indexOf( PB_100) !== -1 && _targetElementArray.push( _elm);
						_className.indexOf( PB_120) !== -1 && _targetElementArray.push( _elm);
						
					}
				}
				_nodes = null;
			}
			
			l = _targetElementArray.length;
			if( l === 0 ) return;
			
			for( i=0; i<l; ++i ){
				_elm = _elmTarget = _targetElementArray.shift();
				if( !_elm.parentNode ) continue;
				while( _elmTarget && 'body,div,p,blockquote,address,li,dd,th,td,form,fieldset,section,article,aside,hgroup,header,footer'.indexOf( _elmTarget.parentNode.tagName.toLowerCase() ) === -1 ){
					_elmTarget = _elmTarget.parentNode;
				}
				if( !_elmTarget ) continue;
				if( _elmTarget.parentNode.tagName === 'pre' ){
					_elmTarget = _elmTarget.parentNode;
				};
				_tagName = _elm.tagName;
				_className = _elm.className.toUpperCase();
				_kind = getRightValue( _option.kind, getKind( _tagName), KIND_IS_CODE );
				_font = getRightValue( _option.font, getFont( _className), defauldFont );
				_printer = getRightValue( _option.printer, getPrinter( _className), defaultPrinter );
				_separate = getRightValue( _option.separate, getSeparate( _className), defaultSeparate );
				_desine = getRightValue( _option.desine, getDesign( _className), defaultDesign);
				_hilight = getRightValue( _option.hilight, _className.indexOf( 'HILIGHT' ) !== -1 || defaultHilight );
				_format = getRightValue( _option.format, _className.indexOf( 'FORMAT' )!==-1 || defaultFormat );
				_count = getRightValue( _option.count, _className.indexOf( 'COUNT' )!==-1 || defaultCount );
				
				programText = ( function( elm ){
					var _innerText = '';
					
					getText( elm );
					
					function getText( node ){
						var _children, _tag, _text, i, l;
						if( node.nodeType === 3 ){
							_innerText += node.data || '';
							return;
						};
						
						if( node.nodeType !== 1 ) return;
						
						_tag  = node.tagName.toUpperCase();
						if( _tag === 'DEL' ) return;
						
						if( _tag === 'BR' ){
							_innerText += LINEFEEDS_PRE[ 0 ];
							return;
						};
						
						_text = node.firstChild;
						if( _tag === 'SUB' && _text && _text.nodeType === 3 ){
							_innerText +=	_text.data === 'E-' ? pbListFactory.CHAR_FPN_LE :
											_text.data === 'E'  ? pbListFactory.CHAR_FPN_E  : String( _text.data );
							return;
						};
						
						_children  = node.childNodes;
						for( i = 0, l = _children.length; i<l; ++i ){
							getText( _children[ i ] );
						};
					};
					
					return _innerText;
				})( _elmTarget );
				
				// alert( LINEFEEDS_PRE.length );
				for( var j = LINEFEEDS_PRE.length; j > 1; ){
					programText = programText.split( LINEFEEDS_PRE[ --j ] ).join( LINEFEEDS_PRE[ 0 ] );
				};
				//for( var i=0, l=LINEFEEDS_PRE.length, ary = []; i < l; ++i ){
				//	ary.push( LINEFEEDS_PRE[ i ].charCodeAt( 0 ) + ', ' + LINEFEEDS_PRE[ i ].charCodeAt( 1 ) );
				//};
				// alert( ary.join( ' | ' ) );
				
				//for( var i=0, l=programText.length, ary = []; i < l; ++i ){
				//	ary.push( programText.charAt( i ) + ':' + programText.charCodeAt( i ) );
				//};
				
				new PrinterClass( _elmTarget, programText.split( LINEFEEDS_PRE[ 0 ] ),_kind, _font, _printer, _separate, _desine, _hilight, _format, _count );
			}
			
			function getRightValue(){
				var l = arguments.length,
					_argument;
				for( var i=0; i<l; ++i){
					_argument = arguments[ i];
					if( typeof _argument === 'number' || typeof _argument === 'boolean') return _argument;
				}
			}
			function getKind( _tagName, _className){
				_tagName = _tagName.toLowerCase();
				if( _tagName === CODE) return KIND_IS_CODE;
				if( _tagName === SAMP) return KIND_IS_SAMP;
				if( _tagName === VAR){
					return _className.indexOf( DATABASE) !== -1 ? KIND_IS_DATABASE : KIND_IS_VAR;
				}
			}
			function getPrinter( _className){
				if( _className.indexOf( FP_12T) !== -1) return PRINTER_FP_12T;
				if( _className.indexOf( FP_40T) !== -1) return PRINTER_FP_40T;
			}
			function getFont( _className){
				if( _className.indexOf( PB_100) !== -1) return FONT_PB_100;
				if( _className.indexOf( PB_120) !== -1) return FONT_PB_120;
			}
			function getSeparate( _className){
				if( _className.match( REG_SEPARATE)){
					return parseInt( _className.replace( REG_SEPARATE, '$1'));
				}
			}
			function getDesign( _className){
				if( _className.match( REG_DESINE)){
					var _design = _className.replace( REG_DESINE, '$1');
					if( _design === PRINTER) return DESIGN_PRINTER;
					if( _design === PJ) return DESIGN_PJ;
				}
			}
		},
		KIND: {
			PROGRAM:	KIND_IS_CODE,
			VER:		KIND_IS_VAR,
			DATABANK:	KIND_IS_DATABASE,
			OUTPUT:		KIND_IS_SAMP
		},
		FONT: {
			AUTO:		FONT_AUTO,
			PB_100:		FONT_PB_100,
			PB_120:		FONT_PB_120
		},
		PRINTER: {
			RANDOM:		PRINTER_RANDOM,
			FP_12T:		PRINTER_FP_12T,
			FP_40T:		PRINTER_FP_40T
		},
		SEPARATE: {
			FIT:		SEPARATE_FIT
		},
		DESIGN: {
			RANDOM:		DESIGN_RANDOM,
			PRINT:		DESIGN_PRINT,
			PJ:			DESIGN_PJ
		}
	};
})( window, document );



/*
 * PB List Class
 * 
 * - example -
 *  listArray = [ '10 VAC', '20 A=10:PRINT "COUNT=";A;']
 * 
 * ----------------------------------------------------------------
 * ListData
 * - getTotalSteps:
 * - getBasicVersion:
 * 
 * ----------------------------------------------------------------
 * LineData
 * - getLineNumber:
 *     -1 : invalid BASIC line.
 *      0 : line is programe area
 *      1~: line number (pb-100: ~1000, PB-120: ~10000)
 * 
 * - getFormattedLine:
 *     Insert(delete) Space looks like Output by FP-12T & FP-40T.
 *     no line number.
 * 
 * - getHilightMap:
 *     example:
 *       hilightMap    = '22222022200011111111110'
 *      (formattedLine = 'PRINT CSR 2;"HELLO,PB";')
 *     means:
 *       '0' : none
 *       '1' : "String"
 *       '2' : command
 *       '3' : function
 * 
 * - getIntermediateCode
 * 
 * - getSteps:
 *     total steps in this line.
 *
 * - getBasicVersion:
 * 
 */

var pbListFactory = ( function(){

	var CHAR_TABLE = [
		' ',	'+',	'-',	'*',	'/',	'↑',	'!',	'"',	'#',	'$',	'>',	'≧',	'=',	'≦',	'<',	'≠',
		'0',	'1',	'2',	'3',	'4',	'5',	'6',	'7',	'8',	'9',	'.',	String.fromCharCode(960),
																										')',	'(',	'ｴ',	'ｪ',
		'A',	'B',	'C',	'D',	'E',	'F',	'G',	'H',	'I',	'J',	'K',	'L',	'M',	'N',	'O',	'P',
		'Q',	'R',	'S',	'T',	'U',	'V',	'W',	'X',	'Y',	'Z',	'',		'',		'',		'',		'',		'',
		'a',	'b',	'c',	'd',	'e',	'f',	'g',	'h',	'i',	'j',	'k',	'l',	'm',	'n',	'o',	'p',
		'q',	'r',	's',	't',	'u',	'v',	'w',	'x',	'y',	'z',	'',		'',		'?',	',',	';',	':',
		'○',	'∑',	'°',	'△',	'@',	'×',	'÷',
			String.fromCharCode(9824),	'←',	String.fromCharCode(9829),	String.fromCharCode(9830),	String.fromCharCode(9827), String.fromCharCode(956),
																												'Ω',	'↓',	'→',
		'%',	String.fromCharCode(165),
						'□',	'[',	'&',	'_',	"'",	'・',	']',	'■',	'＼'	
	];
	var CHAR_ALL    = CHAR_TABLE.join( '');
	var CHAR_QUOT   = CHAR_TABLE[ 7 ];
	var CHAR_CORON  = CHAR_TABLE[ 95 ];	//:
	var CHAR_FPN_LE = CHAR_TABLE[ 30 ];
	var CHAR_FPN_E  = CHAR_TABLE[ 31 ];
	var CHAR_YEN    = CHAR_TABLE[ 113 ];
	var CHAR_NEMO   = '|'; // nemo, don't exist in pb chara table.

	var REG_REPLACE_OUTOFQUOT = [
		{ replace: /(>=|=>)/,		newString: CHAR_TABLE[ 11]},	// ≧
		{ replace: '==',			newString: CHAR_TABLE[ 12]},	// =
		{ replace: /(=<|<=)/,		newString: CHAR_TABLE[ 13]},	// ≦
		{ replace: /(<>|><|!=)/,	newString: CHAR_TABLE[ 15]}		// ≠
	];
	var REG_PROGRAM_AREA = /^\[?P(\d)\]?/i;
	
	var TYPE___F = 1; // function
	var TYPE__P_ = 2; // program
	var TYPE_M__ = 4; // manual
	var TYPE_MP_ = 6;
	
	var VER_1__ = 1;
	var VER__2a = 6;
	var VER___a = 4;
	var VER_12a = 7;
	
	var HL_NONE     = '0';
	var HL_STRING   = '1';
	var HL_COMMAND  = '2';
	var HL_FUNCTION = '3';
	var HL_COMMENT  = '4';
	
	// 中間コード、 
	
	var BASIC_CSR = { match: 'CSR',	newstring: 'CSR ',		type: TYPE__P_, ver: VER_12a};
	var BASIC_IF = {
			match: 'IF', newstring: 'IF ', type: TYPE__P_, ver: VER_12a,
			must: [
				{ match: 'THEN', newstring: ' THEN ',type: TYPE__P_, ver: VER_12a } // then の後に命令は来ない(v1)
			]
		};
	
	var BASIC_TABLE = [
		{ match: 'VAC',				newstring: 'VAC ',		type: TYPE_MP_, ver: VER_12a},
		{ match: 'CLEAR',			newstring: 'CLEAR ',	type: TYPE_MP_, ver: VER__2a},
		{ match: 'NEW',				newstring: 'NEW ',		type: TYPE_M__, ver: VER__2a},
		{ match: 'RUN',				newstring: 'RUN ',		type: TYPE_M__, ver: VER_12a},
		{ match: 'LIST',			newstring: 'LIST ',		type: TYPE_M__, ver: VER_12a},
		{ match: 'PASS',			newstring: 'PASS ',		type: TYPE_M__, ver: VER_12a},
		{ match: 'SAVE',			newstring: 'SAVE ',		type: TYPE_M__, ver: VER_12a},
		{ match: 'LOAD',			newstring: 'LOAD ',		type: TYPE_M__, ver: VER_12a},
		{ match: 'VERIFY',			newstring: 'VERIFY ',	type: TYPE_M__, ver: VER__2a},
		{ match: 'VER',				newstring: 'VER ',		type: TYPE_M__, ver: VER_12a},
		{ match: 'END',				newstring: 'END ',		type: TYPE__P_, ver: VER_12a},	
		{ match: 'STOP',			newstring: 'STOP ',		type: TYPE__P_, ver: VER_12a},
		{ match: 'LET',				newstring: 'LET ',		type: TYPE__P_, ver: VER__2a},
		{ match: 'REM',				newstring: 'REM ',		type: TYPE__P_, ver: VER__2a},
		{ match: 'INPUT',			newstring: 'INPUT ',	type: TYPE__P_, ver: VER_12a,
			option: [ BASIC_CSR ]
		},
		{ match: 'PRINT',			newstring: 'PRINT ',	type: TYPE__P_, ver: VER_12a,
			option: [ BASIC_CSR ]
		},
		{ match: 'ON',				newstring: 'ON ',		type: TYPE__P_, ver: VER__2a,
			must: [
				{ match: 'GOTO',		newstring: 'GOTO ',	type: TYPE__P_, ver: VER__2a},
				{ match: 'GOSUB',		newstring: 'GOSUB ',type: TYPE__P_, ver: VER__2a}
			]
		},
		{ match:	'FOR',				newstring: 'FOR ',	type: TYPE__P_, ver: VER_12a,
			must: [
				{ match: 'TO',			newstring: ' TO ',	type: TYPE__P_, ver: VER_12a,
					option: [
						{ match: 'STEP',newstring: ' STEP ',type: TYPE__P_, ver: VER_12a}
					]
				}
			]
		},
		{ match: 'NEXT',			newstring: 'NEXT ',		type: TYPE__P_, ver: VER_12a},
		{ match: 'GOTO',			newstring: 'GOTO ',		type: TYPE__P_, ver: VER_12a},
		{ match: 'GOSUB',			newstring: 'GOSUB ',	type: TYPE__P_, ver: VER_12a},
		{ match: 'RETURN',			newstring: 'RETURN ',	type: TYPE__P_, ver: VER_12a},
		{ match: 'DATA',			newstring: 'DATA ',		type: TYPE__P_, ver: VER__2a},
		{ match: 'READ',			newstring: 'READ ',		type: TYPE__P_, ver: VER__2a},
		{ match: 'RESTORE',			newstring: 'RESTORE ',	type: TYPE_MP_, ver: VER__2a},
		{ match: 'PUT',				newstring: 'PUT ',		type: TYPE_MP_, ver: VER_12a},
		{ match: 'GET',				newstring: 'GET ',		type: TYPE_MP_, ver: VER_12a},
		{ match: 'BEEP',			newstring: 'BEEP ',		type: TYPE_MP_, ver: VER__2a},
		{ match: 'DEFM',			newstring: 'DEFM ',		type: TYPE_M__, ver: VER_1__},
		{ match: 'DEFM',			newstring: 'DEFM ',		type: TYPE_MP_, ver: VER__2a},
		{ match: 'MODE',			newstring: 'MODE ',		type: TYPE__P_, ver: VER_12a},
		{ match: 'SET',				newstring: 'SET ',		type: TYPE_MP_, ver: VER__2a},
		{ match: 'SET',				newstring: 'SET ',		type: TYPE_M__, ver: VER_1__},
		{ match: 'KEY$',			newstring: 'KEY$',		type: TYPE___F, ver: VER__2a},
		{ match: 'KEY',				newstring: 'KEY',		type: TYPE___F, ver: VER_12a},
		{ match: 'LEN(',			newstring: 'LEN(',		type: TYPE___F, ver: VER_12a},
		{ match: 'MID$(',			newstring: 'MID$(',		type: TYPE___F, ver: VER__2a},
		{ match: 'MID(',			newstring: 'MID(',		type: TYPE___F, ver: VER_12a},
		{ match: 'VAL',				newstring: 'VAL ',		type: TYPE___F, ver: VER_12a},
		{ match: 'STR(',			newstring: 'STR(',		type: TYPE___F, ver: VER__2a},
		{ match: 'SIN',				newstring: 'SIN ',		type: TYPE___F, ver: VER_12a},
		{ match: 'COS',				newstring: 'COS ',		type: TYPE___F, ver: VER_12a},
		{ match: 'TAN',				newstring: 'TAN ',		type: TYPE___F, ver: VER_12a},			
		{ match: 'ASN',				newstring: 'ASN ',		type: TYPE___F, ver: VER_12a},
		{ match: 'ACS',				newstring: 'ACS ',		type: TYPE___F, ver: VER_12a},
		{ match: 'ATN',				newstring: 'ATN ',		type: TYPE___F, ver: VER_12a},
		{ match: 'LOG',				newstring: 'LOG ',		type: TYPE___F, ver: VER_12a},
		{ match: 'LN',				newstring: 'LN ',		type: TYPE___F, ver: VER_12a},
		{ match: 'EXP',				newstring: 'EXP ',		type: TYPE___F, ver: VER_12a},
		{ match: 'SQR',				newstring: 'SQR ',		type: TYPE___F, ver: VER_12a},
		{ match: 'ABS',				newstring: 'ABS ',		type: TYPE___F, ver: VER_12a},
		{ match: 'SGN',				newstring: 'SGN ',		type: TYPE___F, ver: VER_12a},			
		{ match: 'INT',				newstring: 'INT ',		type: TYPE___F, ver: VER_12a},
		{ match: 'FRAC',			newstring: 'FRAC ',		type: TYPE___F, ver: VER_12a},
		{ match: 'RND(',			newstring: 'RND(',		type: TYPE___F, ver: VER_12a},
		{ match: 'RAN#',			newstring: 'RAN#',		type: TYPE___F, ver: VER_12a},
		{ match: 'DEG(',			newstring: 'DEG(',		type: TYPE___F, ver: VER___a},
		{ match: 'DMS(',			newstring: 'DMS(',		type: TYPE___F, ver: VER___a},
		{ match: 'NEW#',			newstring: 'NEW# ',		type: TYPE_MP_, ver: VER___a},
		{ match: 'LIST#',			newstring: 'LIST# ',	type: TYPE_MP_, ver: VER___a},
		{ match: 'SAVE#',			newstring: 'SAVE# ',	type: TYPE_MP_, ver: VER___a},
		{ match: 'LOAD#',			newstring: 'LOAD# ',	type: TYPE_MP_, ver: VER___a},
		{ match: 'READ#',			newstring: 'READ# ',	type: TYPE_MP_, ver: VER___a},
		{ match: 'RESTORE#',		newstring: 'RESTORE# ',	type: TYPE_MP_, ver: VER___a},
		{ match: 'WRITE#',			newstring: 'WRITE# ',	type: TYPE_MP_, ver: VER___a}
	];
	
	var COMMAND_ARRAY  = [];
	var FUNCTION_ARRAY = [];
	( function(){
		var _basic, _type,
			i, j,
			l = BASIC_TABLE.length,
			n,
			_length;
		
		for( i=0; i<l; ++i ){
			_basic  = BASIC_TABLE[ i];
			_type   = _basic.type;
			_length = _basic.match.length;
			if( ( _type >> 1 ) & 1 ){
				for( j=0, n=COMMAND_ARRAY.length; j<n; ++j ){
					if( COMMAND_ARRAY[ j ].match.length <= _length ) break;
				}
				COMMAND_ARRAY.splice( j, 0, _basic );
			} else
			if( _type === TYPE___F ){
				for( j = 0, n = FUNCTION_ARRAY.length; j < n; ++j ){
					if( FUNCTION_ARRAY[ j ].match.length <= _length) break;
				}
				FUNCTION_ARRAY.splice( j, 0, _basic );
			}
		}
		COMMAND_ARRAY.unshift( BASIC_IF );
	})();
	
	function readLine( data, _line ){
		if( typeof _line !== 'string') return false;
		
		data.steps = 0;
		if( _line.match( REG_PROGRAM_AREA ) ){
			data.lineNumber    = 0;
			data.formattedLine = _line.replace( REG_PROGRAM_AREA, 'P$1' );
			data.hilightMap    = HL_NONE + HL_NONE;
			return true;
		};

		var m, p;
		try {
			m = data.lineNumber = parseInt( _line );
			//if( m <= 0 || 10000 <= m) return false;
			//if( m !== _line.substr( 0, m.length)) return false;
			
			if( 0 < m && m < 10000 ){
				m = '' + m;
				p = _line.indexOf( m ) + m.length;
				if( m === _line.substr( 0, p )) _line = _line.substr( p );
			}
		} catch( error ){
			// return false;
		};
		
		_line = _line.split('&amp;').join('&')
			.split('￥').join( CHAR_YEN )
  			.split('^E-').join( CHAR_FPN_LE ).split('^e-').join( CHAR_FPN_LE )
			.split('^E').join( CHAR_FPN_E ).split('^e').join( CHAR_FPN_E )
  			.split('&lt;').join('<')
			.split('&gt;').join('>')
			.split('&quot;').join('"')
			.split( String.fromCharCode( 160 )).join(' ')  // &nbsp;
			.split( String.fromCharCode( 8195 )).join(' ') // &ensp;
			.split( String.fromCharCode( 8194 )).join(' ');// &emsp;
		
		var _isString   = false,
			_newLine    = '',
			_workCopy   = '',
			_hilightMap = '',
			i, j,
			l = _line.length,
			m = REG_REPLACE_OUTOFQUOT.length,
			_chr;
		for( i=0; i < l; ++i) {
			_chr = _line.charAt( i);
			if( _isString === false ) { // ダブルコーテーション外の場合、不等号記号の置き換え、
				for( j=0; j<m; j++){
					if( _line.substr( i, 2).match( REG_REPLACE_OUTOFQUOT[ j ].replace )){
						_chr = REG_REPLACE_OUTOFQUOT[ j ].newString;
						++i;
						break;
					};
				};
				_chr = _chr === ' ' ? '' : _chr;	// delete space
				_chr = _chr === '　' ? '' : _chr;	// 全角 space
			};
			if( _chr === '^' ) _chr = CHAR_TABLE[ 5 ];	// ↑
			
			if( CHAR_ALL.indexOf( _chr) === -1 ){
				 _chr = '';	// match( chr)
			};
			_newLine += _chr;
			if( _chr === CHAR_QUOT || _isString === true ){
				_workCopy   += _chr !== '' ? CHAR_NEMO : '';
				_hilightMap += HL_STRING;
			} else {
				_workCopy   += _chr;
				_hilightMap += _chr !== '' ? HL_NONE : '';
			};
			
			if( _chr === CHAR_QUOT ) _isString = !_isString;	// ダブルクォーテーションの処理
		};

		if( _newLine.length === 0 ) return false;

		// _workCopy を もとに : で分割 _workCopy は | "String" を | で潰しているため、string内の : を拾わない.
		var _statementDataArray = [],
			_newLineArray = [],
			_hilightArray = [],
			_statement;
		
		while( _workCopy.indexOf( CHAR_CORON) !== -1){
			i = _workCopy.indexOf( CHAR_CORON);
			_statementDataArray.push( new StatementClass( _workCopy.substr( 0, i), _newLine.substr( 0, i), _hilightMap.substr( 0, i)));
			_workCopy = _workCopy.substr( i +1);
			_newLine = _newLine.substr( i +1);
			_hilightMap = _hilightMap.substr( i +1);
		};
		_statementDataArray.push( new StatementClass( _workCopy, _newLine, _hilightMap ));
		
		while( _statementDataArray.length > 0){
			_statement = _statementDataArray.shift();
			checkCommand( _statement, 0);
			checkFunction( _statement);
			_newLineArray.push( _statement.statement);
			_hilightArray.push( _statement.hilight);
			data.steps += _statement.steps + 1;
		};
		data.formattedLine = _newLineArray.join( CHAR_CORON );
		data.hilightMap    = _hilightArray.join( HL_NONE );
		data.steps        += 3 - 1;
		return true;
	};
	
	function checkCommand( _statement, _startIndex, _commandArray ){
		_commandArray   = _commandArray || COMMAND_ARRAY;
		var _string     = _statement.copy,
			_hasCommand = false,
			_error      = false,
			_command, _match, _indexOf, _next,
			_semicoronAfterIF, _must, _option, _result, i, l;
			
		for( i=0, l=_commandArray.length; i<l; ++i ){
			_command = _commandArray[ i ];
			_match   = _command.match;
			_indexOf = _string.indexOf( _match, _startIndex );
			if( _indexOf !== -1){
				_next   = _indexOf + _match.length;
				statementOperation( _statement, _indexOf, _next, _command.newstring, HL_COMMAND );
				_must   = _command.must;
				_option = _command.option;
				_semicoronAfterIF = _statement.copy.indexOf( ';', _indexOf );
				if( _match === 'IF' && _indexOf === _startIndex && _semicoronAfterIF !== -1 ){
					statementOperation( _statement, _semicoronAfterIF, _semicoronAfterIF +1, ';', HL_COMMAND );
					_error = checkCommand( _statement, _semicoronAfterIF +1 ).error;
				} else
				if( _match === 'THEN' ){
					_error = checkCommand( _statement, _next ).hasCommand === false;
				} else
				if( _must){
					_result = checkCommand( _statement, _next, _must );
					_error  = _result.hasCommand === false || _result.error === true;
				} else
				if( _match === 'CSR' ){
					checkCommand( _statement, _next, _commandArray );
				} else
				if( _option ){
					checkCommand( _statement, _next, _option );
				};
				_hasCommand = true;
				break;
			};
		};
		return {
			hasCommand:		_hasCommand,
			error:			_error
		};
	};
	function checkFunction( _statement ){
		var l = FUNCTION_ARRAY.length,
			_function, _match, _length, _indexOf;
		for( i=0; i<l; ++i){
			_function = FUNCTION_ARRAY[ i];
			_match    = _function.match;
			_length   = _match.length;
			_indexOf  = 0;
			while( _statement.copy.indexOf( _match ) !== -1 ){
				_indexOf = _statement.copy.indexOf( _match, _indexOf );
				_indexOf !== -1 && statementOperation( _statement, _indexOf, _indexOf + _length, _function.newstring, HL_FUNCTION );
				_indexOf += _length;
			};
		};
	};
	function statementOperation( _statement, _startIndex, _endIndex, _insertString, _hilightString){
		var l = _insertString.length;
		_statement.copy		 = stringOperation( _statement.copy,	_startIndex, _endIndex, CHAR_NEMO.repeat( l ));
		_statement.statement = stringOperation( _statement.statement, _startIndex, _endIndex, _insertString );
		_statement.hilight	 = stringOperation( _statement.hilight,	_startIndex, _endIndex, _hilightString.repeat( l ));
		_statement.steps	 = _statement.steps - ( _endIndex - _startIndex - 1 );
	};
	function stringOperation( _string, _startIndex, _endIndex, _insertString){
		return [
			_string.substr( 0, _startIndex ),
			_string.substr( _endIndex )
		].join( _insertString);
	};
	
	function readList( listArray, LINE_DATA_ARRAY, _newlistArray ){
		var updated = false;
		if( listArray && _newlistArray && listArray.length && _newlistArray.length ){ // 一致のテスト
			if( listArray.length === _newlistArray.length ){
				var l = listArray.length;
				for( var i = 0; i < l; i++ ){
					if( listArray[ i ] !== _newlistArray[ i ] ){
						listArray = _newlistArray;
						updated   = true;
						break;
					};
				};
			} else {
				listArray = _newlistArray;
				updated   = true;
			};
		} else {
			listArray = _newlistArray;
			updated   = true;
		};
		if( updated === true ){
			var i, l = listArray.length,
				_lineData;
			LINE_DATA_ARRAY.splice( 0, LINE_DATA_ARRAY.length );
			for( i = 0; i < l; i++) {
				_lineData = new LineDataClass();
				_lineData.init( listArray[ i ] ) === true && LINE_DATA_ARRAY.push( _lineData );
			};
		};		
	};

/*
 * ListClass
 */
	var ListClass = function(){
		var listArray       = [];
		var LINE_DATA_ARRAY = [];
		this.setList = function( _newlistArray ){
			readList( listArray, LINE_DATA_ARRAY, _newlistArray );
		};
		this.numLine = function(){
			return LINE_DATA_ARRAY.length;
		};
		this.getLineAt = function( _index ){
			return LINE_DATA_ARRAY[ _index ] || null;
		};
	};
	
/*
 * LineDataClass
 */
	var LineDataClass = function(){
		var data    = {};
		this.init = function( _line ){
			return readLine( data, _line );
		};
		this.getLineNumber = function(){
			return data.lineNumber;
		};
		this.getFormattedLine = function(){
			return data.formattedLine;
		};
		this.getHilightMap = function(){
			return data.hilightMap;
		};
		this.getSteps = function(){
			return data.steps;
		};
	};
	
/*
 * StatementClass
 */
	var StatementClass = function( _copy, _statement, _hilight ){
		this.copy      = _copy;
		this.statement = _statement;
		this.hilight   = _hilight;
		this.steps     = _statement.length;
	};
	
	return {
		create: function(){
			return new ListClass();
		},
		charTable: CHAR_TABLE,
		CHAR_FPN_LE: CHAR_FPN_LE,
		CHAR_FPN_E: CHAR_FPN_E
	};
})();


pbCodeMakeuper.print();