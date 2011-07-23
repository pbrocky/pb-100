/**
 *  PB List Image Maker main.js
 * 
 *  version 0.2.31
 * 
 * -- Tested browser --
 * 
 * -- history --
 * 
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
				
				var sheetIndex = 0;
				var numLine = 0;
				
				var _listElm = document.createElement( 'DIV');
				var sheetElm;
				
				var HEX = '0123456789ABCDEF';
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
			 * Printer Controler
			 */	
				list.setList( $('#listTextarea').val().split( linefeedCode));//行に区切る line[]に格納
				var formattedList = list.getFormattedList();
				var REG_PROGRAM_AREA = /^\[?P\d\]?/i;
				var i, j, k, l = formattedList.length, m, n, isBasicLine;
				var lineString, printLine, printLineElm;
				
				for (i=0; i<l; i++){
					lineString = formattedList[ i];
					
					if ( lineString.match( REG_PROGRAM_AREA) && i !== 0){//プログラムエリアの上に空き行（一番↑以外）
						_listElm.appendChild( ORIGN_SPACER_ELM.cloneNode( true));
						numLine++;
					}
					
					m = parseInt( lineString);
					isBasicLine = false;
					if ( 0 < m && m < 10000) { // Max Line Number PB-100 < 1000, PB-120 < 10000
						m = '' + m;
						lineString = [
							'    '.substr( 0, ( isFP40T ? 5 : 4) - m.length),// insert space before line-number.
							m,
							' ', // insert space after line-number.
							lineString.substr( m.length)
						].join( '');
						isBasicLine = true;	
					}
				
					m = lineString.length;
					for ( j = 0; j < m;){//印字行数分のループ
						printLine = ( isBasicLine === true && j > 0) ?
										TAB_CODE + lineString.substr( j, ( !isFP40T) ? 15 : 34) : //一行を15(34)文字づつに分けて、5(6)マス分のtabも追加
										lineString.substr( j, ( !isFP40T) ? 20 : 40);
						j += printLine.replace( TAB_CODE, '').length;
						
						printLineElm = ORIGIN_LINE_ELM.cloneNode( true);
						n = printLine.length;
						for ( k = 0; k < n; k++) {
							printLineElm.appendChild( createPBCharElm( printLine.charAt( k)));//一文字格納
						}
						_listElm.appendChild( printLineElm);//一行格納
						numLine++;
						printLineElm = null;
					}
				}
			
			//
			// Print
			//
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
						
						while( _listElm.childNodes[i] && _listElm.childNodes[i].className === ORIGN_SPACER_ELM.className){// 頭がspacerにならないようにする
							_listElm.removeChild( _listElm.childNodes[ i]);
							// numLine--;							
						}
					}
					sheetElm.appendChild( ( _listElm.childNodes[i] || ORIGN_SPACER_ELM).cloneNode( true));
				}
				
			/*
			 * output
			 */
				$('#outputTop').text( $('#listTitle').val())
				$('#getHtml').val( $('#outputBody').html());
			
			/*
			 * Create PB Chara SPAN
			 */
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
						ret.className = 'chr' +HEX.charAt( x /16) +HEX.charAt( x %16);
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
 * http://d.hatena.ne.jp/hir90/20080620/1213987444
 */
	String.prototype.repeat = function( str, num){
		var ans = '';
		if( num < 0) return 'error';
		while( num){
			if( num&1) ans += str;
			num = num>>1;
			str += str;
		}
		return ans;
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
 *  getCodeHilightMap:
 *  
 *  getIntermediateCode
 *  
 *  getTotalSteps:
 *    
 *  getBasicVersion:
 * 
 */

	var pbListFactory = function( _listArray){
		var listArray = _listArray || [];
		var updated = true;
		var formattedList, codeHilightMap;
		
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
		var CHARA_ALL = CHARA_TABLE.join( '');
		var CHARA_QUOT = CHARA_TABLE[ 7];

		var REG_REPLACE_OUTOFQUOT = [
			{ replace: /(>=|=>)/,		newString: CHARA_TABLE[ 11]},	// ≧
			{ replace: '==',			newString: CHARA_TABLE[ 12]},	// =
			{ replace: /(=<|<=)/,		newString: CHARA_TABLE[ 13]},	// ≦
			{ replace: /(<>|><|!=)/,	newString: CHARA_TABLE[ 15]}	// ≠
		]
		
		var TYPE_M__ = 1;
		var TYPE__P_ = 2;
		var TYPE_MP_ = 3;
		var TYPE___F = 4;
		
		var VER_1__ = 1;
		var VER__2a = 6;
		var VER___a = 4;
		var VER_12a = 7;
		
		
		// 中間コード、BASIC version, type(manual,program,function), description,hardwere(printer,caset-if),displayname
		
		var BASIC_TABLE = [
			{ regexp:	/(VAC)/gi,				newstring: '$1 ',	type: TYPE_MP_, l: 3},
			{ regexp:	/(CLEAR)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 5},
			{ regexp:	/(NEW)/gi,				newstring: '$1 ',	type: TYPE_M__, l: 3},
			{ regexp:	/(RUN)/gi,				newstring: '$1 ',	type: TYPE_M__, l: 3},
			{ regexp:	/(LIST)/gi,				newstring: '$1 ',	type: TYPE_M__, l: 3},
			{ regexp:	/(PASS)/gi,				newstring: '$1 ',	type: TYPE_M__, l: 3},
			{ regexp:	/(SAVE)/gi,				newstring: '$1 ',	type: TYPE_M__, l: 3},
			{ regexp:	/(LOAD)/gi,				newstring: '$1 ',	type: TYPE_M__, l: 3},
			{ regexp:	/(VER)([^IFY])/gi,		newstring: '$1 $2',	type: TYPE_M__, l: 3},
			{ regexp:	/(VERIFY)/gi,			newstring: '$1 ',	type: TYPE_M__, l: 6},
			{ regexp:	/(END)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 3},	
			{ regexp:	/(STOP)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(LET)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(REM)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 3},
			{ regexp:	/(INPUT)/gi,			newstring: '$1 ',	type: TYPE__P_, l: 5},
			{ regexp:	/(KEY)/gi,				newstring: '$1',	type: TYPE___F, l: 3},
			{ regexp:	/(KEY\$)/gi,			newstring: '$1',	type: TYPE___F, l: 3},
			{ regexp:	/(PRINT)/gi,			newstring: '$1 ',	type: TYPE__P_, l: 5},
			{ regexp:	/(CSR)/gi,				newstring: '$1',	type: TYPE__P_, l: 3},
			{ regexp:	/(GOTO)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(ON)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 2},
			{ regexp:	/([:; \d])(IF)/gi,		newstring: '$1$2 ',	type: TYPE__P_, l: 2},
			{ regexp:	/(THEN)/gi,				newstring: ' $1 ',	type: TYPE__P_, l: 4}, // then の後に命令は来ない(v1)
			{ regexp:	/(FOR[^:]*?)(TO)/gi,	newstring: '$1 $2 ',type: TYPE__P_, l: 2}, //stop goto restore
			{ regexp:	/(STEP)/gi,				newstring: ' $1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(NEXT)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(GOSUB)/gi,			newstring: '$1 ',	type: TYPE__P_, l: 5},
			{ regexp:	/(RETURN)/gi,			newstring: '$1 ',	type: TYPE__P_, l: 6},
			// on gosub
			{ regexp:	/(DATA)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(READ)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(RESTORE)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 7},
			{ regexp:	/([:; \d])(PUT)/gi,		newstring: '$1$2 ',	type: TYPE_MP_, l: 3}, //\d は行番号
			{ regexp:	/(GET)/gi,				newstring: '$1 ',	type: TYPE_MP_, l: 3},
			{ regexp:	/(BEEP)/gi,				newstring: '$1 ',	type: TYPE_MP_, l: 4},
			{ regexp:	/(DEFM)/gi,				newstring: '$1 ',	type: TYPE_M__, ver: VER_1__, l: 4},
			{ regexp:	/(DEFM)/gi,				newstring: '$1 ',	type: TYPE_MP_, ver: VER__2a, l: 4},
			{ regexp:	/(MODE)/gi,				newstring: '$1 ',	type: TYPE__P_, l: 4},
			{ regexp:	/(SET)/gi,				newstring: '$1 ',	type: TYPE_MP_, l: 3},
			{ regexp:	/(LEN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(MID\()/gi,			newstring: '$1',	type: TYPE___F, l: 3},
			{ regexp:	/(MID\$\()/gi,			newstring: '$1',	type: TYPE___F, l: 3},
			{ regexp:	/(VAL)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(STR\()/gi,			newstring: '$1 ',	type: TYPE___F, l: 4},
			{ regexp:	/(SIN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(COS)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(TAN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},			
			{ regexp:	/(ASN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(ACS)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(ATN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(LOG)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(LN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 2},
			{ regexp:	/(EXP)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(SQR)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(ABS)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},
			{ regexp:	/(SGN)/gi,				newstring: '$1 ',	type: TYPE___F, l: 3},			
			{ regexp:	/([^P][^R])(INT)/gi,	newstring: '$1$2 ',	type: TYPE___F, l: 3},			
			{ regexp:	/(FRAC)/gi,				newstring: '$1 ',	type: TYPE___F, l: 4},
			{ regexp:	/(RND\()/gi,			newstring: '$1 ',	type: TYPE___F, l: 4},
			{ regexp:	/(RAN#)/gi,				newstring: '$1',	type: TYPE___F, l: 4},
			{ regexp:	/(DEG\()/gi,			newstring: '$1 ',	type: TYPE___F, l: 4},
			{ regexp:	/(DMS\()/gi,			newstring: '$1 ',	type: TYPE___F, l: 4},			
			{ regexp:	/(NEW#)/gi,				newstring: '$1 ',	type: TYPE_MP_, l: 3},
			{ regexp:	/(LIST#)/gi,			newstring: '$1 ',	type: TYPE___F, l: 4},
			{ regexp:	/(SAVE#)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 4},
			{ regexp:	/(LOAD#)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 4},
			{ regexp:	/(READ#)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 4},
			{ regexp:	/(RESTORE#)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 4},
			{ regexp:	/(WRITE#)/gi,			newstring: '$1 ',	type: TYPE_MP_, l: 4}		

		];
		
		function formatList(){
			formattedList = [];
			var outOfQuot; // ダブルコーテーション外
			var lineString, newLineString, chr;
			var newLineSplitByQuot, _newLineSplitByQuot;
			var i, j, k, l = listArray.length, m, n = BASIC_TABLE.length, o = REG_REPLACE_OUTOFQUOT.length;
			var REG_SPACE_X2 = /  /;

			for( i = 0; i < l; i++) {
				lineString = listArray[ i];
				outOfQuot = true;
				newLineString = '';
				m = lineString.length;
				for( j = 0; j < m; j++) {
					chr = lineString.charAt( j);
					if( outOfQuot === true) { // ダブルコーテーション外の場合、不等号記号の置き換え、
						for( k=0; k < o; k++){
							if( lineString.substr( j, 2).match( REG_REPLACE_OUTOFQUOT[ k].replace)){
								chr = REG_REPLACE_OUTOFQUOT[ k].newString;
								j++;
								break;
							}
						}
						chr = (chr === ' ') ? '' : chr; //スペースの削除
					}
					chr = ( chr === '^') ? CHARA_TABLE[ 5] : chr;// ↑
					outOfQuot = ( chr === CHARA_QUOT) ? !outOfQuot : outOfQuot;// ダブルクォーテーションの処理
					
					newLineString += ( CHARA_ALL.indexOf( chr, 0) >= 0) ? chr : ''; // match( chr)
				}
			/*
			 * BASIC
			 */
				if( newLineString.length !== 0){
					newLineSplitByQuot = newLineString.split( CHARA_QUOT);
					m = newLineSplitByQuot.length;
					for (j = 0; j<m; j++) {
						if (j % 2 === 0) { // out of quot
							_newLineSplitByQuot = newLineSplitByQuot[ j];
							for ( k=0; k < n; k++) { // n = BASIC_TABLE.length
								_newLineSplitByQuot = _newLineSplitByQuot.replace( BASIC_TABLE[ k].regexp, BASIC_TABLE[ k].newstring);
							}
							newLineSplitByQuot[ j] = _newLineSplitByQuot.toUpperCase().replace( REG_SPACE_X2, '');
						}
					}
					formattedList.push( newLineSplitByQuot.join( CHARA_QUOT));					
				}
			}
			return formattedList;
		}
		
		function codeHilight(){
			codeHilightMap = [];
			var HL_NONE = '0';
			var HL_STRING = '1';
			var HL_COMMAND = '2';
			var HL_FUNCTION = '3';
			
			var outOfQuot; // ダブルコーテーション外
			var lineString, newLineString, basic, matchObj, index, strLen;
			var lineSplitByQuot, _lineSplitByQuot;
			var i, j, k, l = formattedList.length, m, n = BASIC_TABLE.length;
			
			for( i = 0; i < l; i++) {
				lineString = formattedList[ i];
				lineSplitByQuot = lineString.split( CHARA_QUOT);
				m = lineSplitByQuot.length;
				for( j=0; j<m; j++) {
					_lineSplitByQuot = lineSplitByQuot[ j];
					if (j % 2 === 0) { // out of quot
						newLineString = String.repeat( HL_NONE, _lineSplitByQuot.length);
						for ( k=0; k < n; k++) { // n = BASIC_TABLE.length
							basic = BASIC_TABLE[ k];
							
							_lineSplitByQuot.replace( basic.regexp, function( _all, m1, m2){
								index = matchObj.index;
								strLen = matchObj[ 0].length;

								_lineSplitByQuot = [
									_lineSplitByQuot.substr( 0, index),
									String.repeat( ( basic.type === TYPE___F) ? HL_FUNCTION : HL_COMMAND, strLen),
									_lineSplitByQuot.substr( index +strLen)
								].join( '');
								
								return ( m2) ? m1 +String.repeat( '|', m2.length) : String.repeat( '|', m1.length);
							});
						}
						lineSplitByQuot[ j] = newLineString;
					} else {
						lineSplitByQuot[ j] = String.repeat( HL_STRING, _lineSplitByQuot.length);
					}
					
				}
				codeHilightMap.push( lineSplitByQuot.join( HL_STRING));					
			}
			return codeHilightMap;
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
			},
			getCodeHilightMap: function(){
				
			}
		}
	}
	
	/*
	 * printer.output printer.clear, printer.hardwere, printer.FP-12T, printer.FP-40T, printer.partation, printer.init( _output, _partation, _hardwere, stepCount, colorHilight)
	 */

/* ------------------------------------------
 DOM Ready 
------------------------------------------ */
	$(document).ready( pbListImageMaker.init);
