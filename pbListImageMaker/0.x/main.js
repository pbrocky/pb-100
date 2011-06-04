/**
 *  PB List Image Maker main.js
 * 
 *  version 0.2.3
 * 
 * -- Tested browser --
 * 
 * -- history --
 *  v0.2.1
 *    fixed. >> c += printLine.replace( TAB_CODE, '').length;
 *    rewright to class-style.
 * 
 * 
 */

	var pbListImageMaker = ( function(){
		var linefeedCode, TAB_CODE = '\t';
		
		var steps = 0;
		var numPartition  = 3;
		var isFP40T = false;
		var editStarted = false;
		var countSteps = true;
		
		var list;
		var chara_table;
		
		return {
			init: function(){
				list = pbListFactory.apply( {}, []);
				chara_table = list.getCharaTable;
				
				linefeedCode = $('#shadowTxtarea').val(); // linefeedCode = "\r\n" || "\n", depend on UA.
				
				pbListImageMaker.changeSample( document.dataTypeSetting.dataType);
				
				var d = document.outputSetting;
				pbListImageMaker.setting.setFontSet( checkRadio( d.fontSet));
				pbListImageMaker.setting.setPrinter( checkRadio( d.printer));
				pbListImageMaker.setting.setDesine( checkRadio( d.desine));
				
				pbListImageMaker.setting.changeCountSteps( d.countSteps.value);
				
				function checkRadio(f){
					for (var i = 0; i < f.length; i++) {
						if (f[i].checked) {
							break;
						}
					}
					return f[i].id;
				}			
			},
			tab: function( id){
				$( '.focus').removeClass( 'focus');
				if( id === 'preview' || id === 'html'){
					pbListImageMaker.text2pbfont();
				}
				$( '#'+id).addClass( 'focus');
			},
			editStart: function(){
				editStarted = true;
				$('#listTextarea').onclick = function(){};
			},
			changeSample: function( sample){
				if( !editStarted){
					switch( sample){
						case 'basic':
							$('#listTextarea').val( [
								'P0',
								'100 PRINT "GOTO PB-100"',
								'120 GOTO 100'						
							].join( linefeedCode));
							break;
						case 'databank':
							$('#listTextarea').val( [
								'1 090-0000-0000',
								'2 090-0000-0001',
								'3 090-0000-0002'						
							].join( linefeedCode));
							break;
						case 'value':
							$('#listTextarea').val( [
								'$="1234567890-qwertyuiop"',
								'A$="KYOU"',
								'B$="KINOU"',
								'C=234.3'						
							].join( linefeedCode));
							break;
						case 'output':
							$('#listTextarea').val( [
								'■------+---+',
								'■----+--+',
								'■--+-+',
								'■-++'						
							].join( linefeedCode));
					}		
				}
			},
			setting: {
				setFontSet: function ( className){
					$('#outputBody').removeClass();
					$('#outputBody').addClass( className);
				},				
				setPrinter: function ( className){
					$('#outputPrinter').removeClass();
					$('#outputPrinter').addClass( className);
					
					$('#sheetCount').removeClass();
					$('#sheetCount').addClass( className);
					
					pbListImageMaker.setting.setSheetCount();
				},
				setSheetCount: function (){
					var o = document.outputSetting;
					if( $('#outputPrinter').hasClass( 'FP-12T')){
						numPartition  = o.sheetCountFP12.selectedIndex +1;
						isFP40T = false;
					}
					if( $('#outputPrinter').hasClass( 'FP-40T')){
						numPartition  = o.sheetCountFP40.selectedIndex +1;
						isFP40T = true;
					}
					$('#outputSheetCount').removeClass();
					$('#outputSheetCount').addClass( 'separeteNum'+numPartition );
					
					pbListImageMaker.text2pbfont();
				},
				setDesine: function ( className){
					$('#outputDesine').removeClass();
					$('#selectMagazine').removeClass();
					
					$('#outputDesine').addClass( className);
					$('#selectMagazine').addClass( className);
					
					if( className === 'magazine'){
						var magazineStyle = checkSelect( document.outputSetting.selectMagazine);
						$('#outputDesine').addClass( magazineStyle);
						$('#selectMagazine').addClass( magazineStyle);
					}
					
					function checkSelect(s){
						return s[ s.selectedIndex].value;
					}						
				},
				setMagazin: function (){
					if( $('#outputDesine').hasClass('magazine')){
						pbListImageMaker.setting.setDesine( 'magazine');
					}
				},
				changeCountSteps: function ( v){
					if( v == 'enable'){
						countSteps = true;
					} else {
						countSteps = false;
					}
					pbListImageMaker.text2pbfont();
				}			
			},
			text2pbfont: function(){
				var outputBody = $('#outputBody');
				outputBody.html( '');
				
				var sheetIndex = steps = 0; // Stepの初期化
				var numLine = 0;
				
				var _listElm = document.createElement( 'DIV');
				var printLineElm, sheetElm;
	
			/*
			 * spacer, line, sheet
			 */			
				var ORIGN_SPACER_ELM = document.createElement( 'DIV');
				ORIGN_SPACER_ELM.appendChild( document.createTextNode( ' '));// for ie
				ORIGN_SPACER_ELM.className = 'spacer';
				
				var ORIGIN_LINE_ELM = document.createElement( 'DIV');
				ORIGIN_LINE_ELM.className = 'printline';
				
				var ORIGIN_SHEET_ELM = document.createElement( 'DIV');
				ORIGIN_SHEET_ELM.className = 'sheet';
				
			/*
			 * 
			 */	
				list.setList( $('#listTextarea').val().split( linefeedCode));//行に区切る line[]に格納
				var formattedList = list.getFormattedList();
				var REG_PROGRAM_AREA = /^\[?P\d\]?/i;
				var i,l = formattedList.length, m, n;
				var lineString, printLine;
				
				for (i=0; i<l; i++){
					lineString = formattedList[ i];
					
					//プログラムエリアの上に空き行（一番↑以外）
					if ( lineString.match( REG_PROGRAM_AREA) && i !== 0){
						_listElm.appendChild( ORIGN_SPACER_ELM.cloneNode( true));
						numLine++;
					}
					
					m = parseInt( lineString);
					if ( m > 0) {
						m = '' + m;
						lineString = [
							'    '.substr( 0, ( isFP40T ? 5 : 4) - m.length),// insert space before line-number.
							m,
							' ', // insert space after line-number.
							lineString.substr( m.length)
						].join( '');	
					}
				
					m = lineString.length;
					for (var c = 0; c < m;){//印字行数分のループ
						printLine = parseInt( lineString) > 0 ? // 行番号で始まる
									c === 0 ? 
										lineString.substr( 0, ( !isFP40T) ? 20 : 40) : //一行を20(40)文字づつに分ける
										TAB_CODE + lineString.substr( c, ( !isFP40T) ? 15 : 34) : //一行を20(40)文字づつに分けて、5(6)マス分のtabも追加
									lineString.substr( c, ( !isFP40T) ? 20 : 40)// 行番号で始まらない
						c += printLine.replace( TAB_CODE, '').length;
						
						printLineElm = ORIGIN_LINE_ELM.cloneNode( true);
						n = printLine.length;
						for (var j = 0; j < n; j++) {
							printLineElm.appendChild( createPBCharElm( printLine.charAt( j)));//一文字格納
						}
						_listElm.appendChild( printLineElm);//一行格納
						numLine++;
						printLineElm = null;
					}
				}
			
			//------------------------------------------
			//	行をシートに配置
			//------------------------------------------
				var h = Math.floor( numLine /numPartition ) +( numLine %numPartition  === 0 ? 0 : 1);
	
				l = h * numPartition ;
				for (i=0; i<l; i++){
					if ( h * sheetIndex === i){
						sheetElm = ORIGIN_SHEET_ELM.cloneNode( true); // new sheet
						if( i === 0){
							sheetElm.className += ' first';
						}			
						outputBody.append( sheetElm);
						sheetIndex++;
						
						if( i < numLine && _listElm.childNodes[i].className === ORIGN_SPACER_ELM.className){// 頭がspacerにならないようにする
							_listElm.removeChild( _listElm.childNodes[ i]);
							numLine--;	
						}							
					}
					printLineElm = _listElm.childNodes[i] || ORIGN_SPACER_ELM;
					sheetElm.appendChild( printLineElm.cloneNode( true));
				}
				
			/*
			 * output
			 */
				$('#outputTop').text( $('#listTitle').val())
				$('#getHtml').val( $('#outputBody').html());
				
				function createPBCharElm( chr){
					var ret = document.createElement( 'SPAN');
					ret.appendChild( document.createTextNode( chr.entitize()));
					
					var x = ( function(){
						for(var i=0; i<chara_table.length; i++){
							if( chara_table[ i] === chr){
								return i;
							}
						}
						return -1;
					})();
					if ( x > -1) {
						var h = '0123456789ABCDEF';
						ret.className = 'chr' +h.charAt( x /16) +h.charAt( x %16);
						
					} else if( chr === TAB_CODE){
						ret.className = ( isFP40T === false) ? 'tab5' : 'tab6';
					} else {
						ret.className = 'none';
					}
					
					return ret;
				}
			}
		}
	})();

/*
 * http://serennz.sakura.ne.jp/sb/log/eid73.html
 */
	String.prototype.entitize = function(){
	  var str = "" + this;
	  str = str.split("&").join("&amp;amp;")
	  			.split("<").join("&amp;lt;")
				.split(">").join("&amp;gt;")
				.split('"').join("&amp;quot;");
	  str = str.charCodeAt(0) === 92 ? "&amp;yen;" : str;
	  str = str.charCodeAt(0) === 9824 ? "&amp;spades;" : str;
	  str = str.charCodeAt(0) === 9827 ? "&amp;clubs;" : str;
	  str = str.charCodeAt(0) === 9829 ? "&amp;hearts;" : str;
	  str = str.charCodeAt(0) === 9830 ? "&amp;diams;" : str;
	  return str;
	}

/*
 * PB List Class
 * 
 * - example -
 *  listArray = [ '10 VAC', '20 A=10:PRINT A;']
 *  
 *  getFormattedList:
 *    Insert(delete) Space looks like Output by FP-12T(FP-40T). 
 * 
 */

	var pbListFactory = function( _listArray){
		var listArray = _listArray || [];
		var updated = true;
		var formattedList;
		
		var CHARA_TABLE = [
			' ',	'+',	'-',	'*',	'/',	'↑',	'!',	'"',	'#',	'$',	'>',	'≧',	'=',	'≦',	'<',	'≠',
			'0',	'1',	'2',	'3',	'4',	'5',	'6',	'7',	'8',	'9',	'.',	'π',	')',	'(',	'~E-',	'~E',
			'A',	'B',	'C',	'D',	'E',	'F',	'G',	'H',	'I',	'J',	'K',	'L',	'M',	'N',	'O',	'P',
			'Q',	'R',	'S',	'T',	'U',	'V',	'W',	'X',	'Y',	'Z',	'',		'',		'',		'',		'',		'',
			'a',	'b',	'c',	'd',	'e',	'f',	'g',	'h',	'i',	'j',	'k',	'l',	'm',	'n',	'o',	'p',
			'q',	'r',	's',	't',	'u',	'v',	'w',	'x',	'y',	'z',	'',		'',		'?',	',',	';',	':',
			'○',	'∑',	'°',	'△',	'@',	'×',	'÷',
				String.fromCharCode(9824),	'←',	String.fromCharCode(9829),	String.fromCharCode(9830),	String.fromCharCode(9827),
																											'μ',	'Ω',	'↓',	'→',
			'%',	'￥',	'□',	'[',	'&',	'_',	"'",	'・',	']',	'■',	'＼'	
		]
		var CHARA_STRING = CHARA_TABLE.join( '');
		var CHARA_QUOT = CHARA_TABLE[ 7];
		var BASIC_TABLE = [
			{ regexp:	/(FOR)/gi,		newstring: '$1 ',	t:	0, l: 3},// t:(command=0) or(function=1)
			{ regexp:	/(NEXT)/gi,		newstring: '$1 ',	t:	0, l: 4},// l = length
			{ regexp:	/(GOTO)/gi,		newstring: '$1 ',	t:	0, l: 4},// i = insert Space[ front, end]
			{ regexp:	/(GOSUB)/gi,	newstring: '$1 ',	t:	0, l: 5},
			{ regexp:	/(RETURN)/gi,	newstring: '$1 ',	t:	0, l: 6},
			{ regexp:	/(PRINT)/gi,	newstring: '$1 ',	t:	0, l: 5},
			{ regexp:	/(MODE)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(STOP)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(END)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(VAC)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(SET)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(GET)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(DEFM)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(SAVE)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(LOAD)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(RUN)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(CLEAR)/gi,	newstring: '$1 ',	t:	0, l: 5},
			{ regexp:	/(BEEP)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(LET)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(ON)/gi,		newstring: '$1 ',	t:	0, l: 2},
			{ regexp:	/(READ)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(RESTORE)/gi,	newstring: '$1 ',	t:	0, l: 7},
			{ regexp:	/(DATA)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(REM)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(NEW)/gi,		newstring: '$1 ',	t:	0, l: 3},
			{ regexp:	/(PASS)/gi,		newstring: '$1 ',	t:	0, l: 4},
			{ regexp:	/(FRAC)/gi,		newstring: '$1 ',	t:	1, l: 4},
			{ regexp:	/(SIN)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(COS)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(TAN)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(ASN)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(ACS)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(ATN)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(LOG)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(LN)/gi,		newstring: '$1 ',	t:	1, l: 2},
			{ regexp:	/(EXP)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(SQR)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(ABS)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(SGN)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(LEN)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(VAL)/gi,		newstring: '$1 ',	t:	1, l: 3},
			{ regexp:	/(CSR)/gi,		newstring: '$1',	t:	0, l: 3},
			{ regexp:	/(INPUT)/gi,	newstring: '$1 ',	t:	0, l: 5},
			{ regexp:	/(VERIFY)/gi,	newstring: '$1 ',	t:	0, l: 6},
			{ regexp:	/(STEP)/gi,		newstring: ' $1 ',	t:	0, l: 4},
			{ regexp:	/(THEN)/gi,		newstring: ' $1 ',	t:	0, l: 4},
			{ regexp:	/(KEY)/gi,		newstring: '$1',	t:	1, l: 3},
			{ regexp:	/(DEG\()/gi,	newstring: '$1 ',	t:	1, l: 4},
			{ regexp:	/(DMS\()/gi,	newstring: '$1 ',	t:	1, l: 4},
			{ regexp:	/(STR\()/gi,	newstring: '$1 ',	t:	1, l: 4},
			{ regexp:	/(MID\()/gi,	newstring: '$1',	t:	1, l: 3},
			{ regexp:	/(RAN#)/gi,		newstring: '$1',	t:	1, l: 4},
			{ regexp:	/(VER)([^IFY])/gi,		newstring: '$1 $2',		t:	0, l: 3},
			{ regexp:	/([^P][^R])(INT)/gi,	newstring: '$1$2 ',		t:	1, l: 3},
			{ regexp:	/([:; \d])(PUT)/gi,		newstring: '$1$2 ',		t:	0, l: 3}, //\d は行番号
			{ regexp:	/([:; \d])(IF)/gi,		newstring: '$1$2 ',		t:	0, l: 2},
			{ regexp:	/(FOR[^:]*?)(TO)/gi,	newstring: '$1 $2 ',	t:	0, l: 2} //stop goto restore
		];
		
		function formatList(){
			formattedList = [];
			var outOfQuot; // ダブルコーテーション外
			var lineString, newLineString, chr;
			var numLine, newLineSplitByQuot, _newLineSplitByQuot;
			var i, j, k, l = listArray.length, m, n = BASIC_TABLE.length;
			var REG_SPACE_X2 = /  /;
			
			for (i = 0; i < l; i++) {
				lineString = listArray[ i];
				outOfQuot = true;
				newLineString = '';
				m = lineString.length;
				for (var j = 0; j < m; j++) {
					chr = lineString.charAt( j);
					if (outOfQuot === true) { // ダブルコーテーション外の場合、不等号記号の置き換え、スペースの削除
						switch ( lineString.substr( j, 2)) {
							case '>=':
							case '=>':
								chr = CHARA_TABLE[ 11]; // ≧
								j++;
								break;
							case '<=':
							case '=<':
								chr = CHARA_TABLE[ 13]; // ≦
								j++;
								break;
							case '<>':
							case '><':
							case '!=':
								chr = CHARA_TABLE[ 15]; // ≠
								j++;
								break;
							case '==':
								chr = CHARA_TABLE[ 12]; // =
								j++;
								break;
						}
						chr = (chr === ' ') ? '' : chr;
					}
					switch ( chr) {// ダブルクォーテーションの処理
						case '”':
							chr = CHARA_QUOT;
						case CHARA_QUOT: // "
							outOfQuot = !outOfQuot;
							break;
						case '^':
							chr = CHARA_TABLE[ 5]; // ↑
							break;
					}
					newLineString += ( CHARA_STRING.indexOf( chr, 0) >= 0) ? chr : ''; // match( chr)
				}
			/*
			 * BASIC
			 */				
				newLineSplitByQuot = newLineString.split( CHARA_QUOT);
				m = newLineSplitByQuot.length;
				for (j = 0; j<m; j++) {
					if (j % 2 === 0) { // out of quot
						_newLineSplitByQuot = newLineSplitByQuot[ j];
						for ( k=0; k < n; k++) { // n = BASIC_TABLE.length
							_newLineSplitByQuot = _newLineSplitByQuot.replace( BASIC_TABLE[ k].regexp, BASIC_TABLE[ k].newstring);
						}
						newLineSplitByQuot[ j] = _newLineSplitByQuot.replace( REG_SPACE_X2, '');
					}
				}
				formattedList.push( newLineSplitByQuot.join( CHARA_QUOT));
			}
			return formattedList;
		}
		
		return {
			setList: function( _newlistArray){
				if( listArray && _newlistArray && listArray.length && _newlistArray.length) { // 一致のテスト
					if( listArray.length === _newlistArray.length){
						var l = listArray.length;
						for( var i=0; i<l; i++){
							if( listArray[ i] !== _newlistArray[ i]){
								listArray = _newlistArray;
								updated = true;
								break;
							}
						}
					} else {
						listArray = _newlistArray;
						updated = true;
					}
				} else {
					listArray = _newlistArray;
					updated = true;
				}
			},
			getCharaTable: CHARA_TABLE,
			getFormattedList: function(){
				return formatList();//( updated === false && formattedList) ? formattedList : 
			}
		}
	}

/* ------------------------------------------
 DOM Ready 
------------------------------------------ */
	$(document).ready( pbListImageMaker.init);
