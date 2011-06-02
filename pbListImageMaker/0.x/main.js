/**
 *  PB List Image Maker main.js
 * 
 *  version 0.11
 * 
 * 
 */

var pbListImageMaker = ( function(){
	var linefeedCode = '';
	var chara_table = " +-*/↑!”#$>≧=≦<≠0123456789.π)(ェエABCDEFGHIJKLMNOPQRSTUVWXYZ++++++abcdefghijklmnopqrstuvwxyz  ?,;:○∑°△@×÷ス←ハダクμΩ↓→%￥□[&_'・]■＼";
	var steps = 0;
	var separeteNum = 3;
	var isFP40T = false;
	var editStarted = false;
	var countSteps = true;

	var basicTable = [
		{ r:	'(FOR)',	t:	0, l: 3, i: [ 0, 1]},// t:(com=0) or(func=1)
		{ r:	'(NEXT)',	t:	0, l: 4, i: [ 0, 1]},// l = length
		{ r:	'(GOTO)',	t:	0, l: 4, i: [ 0, 1]},// i = insert Space[ front, end]
		{ r:	'(GOSUB)',	t:	0, l: 5, i: [ 0, 1]},
		{ r:	'(RETURN)',	t:	0, l: 6, i: [ 0, 1]},
		{ r:	'(PRINT)',	t:	0, l: 5, i: [ 0, 1]},
		{ r:	'(MODE)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(STOP)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(END)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(VAC)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(SET)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(GET)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(DEFM)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(SAVE)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(LOAD)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(RUN)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(CLEAR)',	t:	0, l: 5, i: [ 0, 1]},
		{ r:	'(BEEP)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(LET)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(ON)',		t:	0, l: 2, i: [ 0, 1]},
		{ r:	'(READ)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(RESTORE)',t:	0, l: 7, i: [ 0, 1]},
		{ r:	'(DATA)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(REM)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(NEW)',	t:	0, l: 3, i: [ 0, 1]},
		{ r:	'(PASS)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(FRAC)',	t:	1, l: 4, i: [ 0, 1]},
		{ r:	'(SIN)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(COS)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(TAN)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(ASN)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(ACS)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(ATN)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(LOG)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(LN)',		t:	1, l: 2, i: [ 0, 1]},
		{ r:	'(EXP)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(SQR)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(ABS)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(LEN)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(VAL)',	t:	1, l: 3, i: [ 0, 1]},
		{ r:	'(CSR)',	t:	0, l: 3, i: [ 0, 0]},
		{ r:	'(INPUT)',	t:	0, l: 5, i: [ 0, 1]},
		{ r:	'(VERIFY)',	t:	0, l: 6, i: [ 0, 1]},
		{ r:	'(STEP)',	t:	0, l: 4, i: [ 0, 1]},
		{ r:	'(THEN)',	t:	0, l: 4, i: [ 1, 1]},
		{ r:	'(KEY)',	t:	1, l: 3, i: [ 0, 0]},
		{ r:	'(DEG.)',	t:	1, l: 4, i: [ 0, 1]},
		{ r:	'(DMS.)',	t:	1, l: 4, i: [ 0, 1]},
		{ r:	'(STR.)',	t:	1, l: 4, i: [ 0, 1]},
		{ r:	'(MID.)',	t:	1, l: 3, i: [ 0, 0]},
		{ r:	'(RAN#)',	t:	1, l: 4, i: [ 0, 0]},
	];
	var basicTable2 = [
		{ r:	'(VER)([^IFY])',	t:	0, l: 3, i: [ 0, 1, 0]},
		{ r:	'([^P][^R])(INT)',	t:	1, l: 3, i: [ 0, 0, 1]},
		{ r:	'([:; ])(PUT)',		t:	0, l: 3, i: [ 0, 0, 1]},
		{ r:	'([:; ])(IF)',		t:	0, l: 2, i: [ 0, 0, 1]},
		{ r:	'(FOR[^:]*?)(TO)',	t:	0, l: 2, i: [ 0, 1, 1]} //stop goto restore
	];

	var cleanAsPocketBasic = function( line){
		/*
			var str = '' + this;
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
		*/
		
		var str = '';
		var outOfQuot = true; // ダブルコーテーション外
		var chr;
		for (var i=0; i<line.length; i++){
			chr = line.charAt(i);
			if ( outOfQuot === true){// ダブルコーテーション外の場合、不等号記号の置き換え、スペースの削除
				switch( chr + line.charAt( i +1)){
					case '>=':
					case '=>':
						chr = "≧";i++;break;
					case '<=':
					case '=<':
						chr = "≦";i++;break;
					case '<>':
					case '><':
					case '!=':
						chr = "≠";i++;break;
					case '==':
						chr = '=';i++;break;
				}
				chr = (chr === ' ') ? '' : chr;
			}
			switch(chr){// ダブルクォーテーションの処理
				case '"':
					chr = "”";
				case '”':
					outOfQuot = !outOfQuot;
					break;
				case '\\':
					chr = "￥";
					break;
				//case '(':chr = "（";break;
				case '^':
					chr = "↑";
					break;
			}			
			str += ( chara_table.indexOf( chr, 0) >= 0) ? chr : ''; // match( chr)
		}

	/*
	 * BASIC
	 */
		var SPACE = [ '', ' '];
		
		//行番号の前にスペース
		var no = parseInt( str);
		if (no > 0){
			str = '    '.substr( 0, ( isFP40T ? 5 : 4) -( '' +no).length) + str;
			str = str.substr( 0, ( isFP40T ? 5 : 4))+' '+str.substr( isFP40T ? 5 : 4);//後ろにもひとつ			
		}
	
		steps += 3; // 3steps spends for a Line.
		originLength = str.length;
		var _str = str.split('”');
		var pos;
		for(var i=0; i<_str.length; i++){
			if ( i % 2 === 0){ // out of quot
				for (var j in basicTable){
					_str[i] = _str[i].replace( new RegExp( basicTable[j].r, 'g'), function( _str, m1){
						steps++;
						originLength -= basicTable[j].l;
						return SPACE[ basicTable[j].i[ 0]] +m1 +SPACE[ basicTable[j].i[ 1]];
					});
				}
				for (var j in basicTable2){
					_str[i] = _str[i].replace( new RegExp( basicTable2[j].r, 'g'), function( _str, m1, m2){
						steps++;
						originLength -= basicTable2[j].l;
						return SPACE[ basicTable2[j].i[ 0]] +m1 +SPACE[ basicTable2[j].i[ 1]] +m2 +SPACE[ basicTable2[j].i[ 2]];
					});
				}
				
				while( _str[i].indexOf( '  ', 4) > 0){// スペースx2を詰める
					pos = _str[i].indexOf( '  ', 4);
					_str[i] = _str[i].substr( 0, p) +_str[i].substr( p +1);
				}
				if( originLength > 0){
				}
			}
		}
		if( originLength > 0){
			//steps += originLength;
		}		
		return _str.join( '”');	
	}

	
	return {
		init: function(){
			linefeedCode = $('#shadowTxtarea').val(); // 変数linefeedCodeに"\r\n"や"\n"が入る。ブラウザに依存。
			
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
					separeteNum = o.sheetCountFP12.selectedIndex +1;
					isFP40T = false;
				}
				if( $('#outputPrinter').hasClass( 'FP-40T')){
					separeteNum = o.sheetCountFP40.selectedIndex +1;
					isFP40T = true;
				}
				$('#outputSheetCount').removeClass();
				$('#outputSheetCount').addClass( 'separeteNum'+separeteNum);
				
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
			var te = $('#listTextarea').val();
			outputBody.html( '');
			
			var sheetIndex = steps = 0; // Stepの初期化
			var numLine = 0;
			
			var line = te.split( linefeedCode);//行に区切る line[]に格納
			
			var fixedLine;
			
			var objlist = document.createElement( 'DIV');
			var objline, objSheet;

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
			
			var REG_PROGRAM_AREA = /^[(P{\d})|(<P{\d}>)|(\[P{\d}\])]/i;

						
			var i,l = line.length;
			for (i=0; i<l; i++){
				/*
				fixedLine = fixChar( originLine[ i]);//	キャラテーブルに存在する文字だけを残して、改行コードなどは削除
				if ( fixedLine.length > 0) {
					line.push( fixBASIC( fixedLine));//	BASICテーブルを参照してスペースなどの置換
				}
				*/
				line[ i] = cleanAsPocketBasic( line[ i]);
			}
			
			l = line.length;
			for (i=0; i<l; i++){
				var str = line[i];
					
				//プログラムエリアの上に空き行（一番↑以外）
				if ( str.match( REG_PROGRAM_AREA) && i !== 0){
					objlist.appendChild( ORIGN_SPACER_ELM.cloneNode( true));
					numLine++;
					objline = null;
				}
				
				for (var c = 0; c < str.length;){//印字行数分のループ
					if( parseInt( str) > 0){ // 行番号で始まる
						if ( c == 0){//一行を20(40)文字づつに分けて、5マスの行揃えも追加
							var pline = str.substr( 0, ( !isFP40T)? 20 : 40);
						} else {
							var pline = "タ" + str.substr( c, ( !isFP40T)? 15 : 34);
						}				
					} else { // 行番号で始まらない
						var pline = str.substr( c, ( !isFP40T)? 20 : 40);
					}
					c += pline.length;
					
					objline = ORIGIN_LINE_ELM.cloneNode( true);
					
					//テキストをSPANとクラス指定に置き換え
					for (var k = 0; k < pline.length; k++) {
						objline.appendChild( createPBCharElm( pline.charAt(k)));//一文字格納
					}
					numLine++;
					objlist.appendChild( objline);//一行格納
				}
			}
		
		//------------------------------------------
		//	行の分解
		//------------------------------------------
			var h = Math.floor( numLine /separeteNum) +( numLine %separeteNum === 0 ? 0 : 1);

			l = h * separeteNum;
			for (i = 0; i<l; i++){
				objline = objlist.childNodes[i];
				
				if ( h * sheetIndex === i){
					objSheet = ORIGIN_SHEET_ELM.cloneNode( true);
					if( i === 0){
						objSheet.className += ' first';
					}			
					outputBody.append( objSheet);
					sheetIndex++;
					
					if( i < numLine && objline.className === 'spacer'){// 頭がspacerにならないようにする
						objlist.removeChild( objline);
						numLine--;			
					}
				}
				objSheet.appendChild(
					(i < numLine ? objline : ORIGN_SPACER_ELM).cloneNode( true)
				);
			}
			
		/*
		 * output
		 */
			$('#outputTop').text( $('#listTitle').val())
			$('#getHtml').val( $('#outputBody').html());
			
			function createPBCharElm( chr){
				var ret = document.createElement( 'SPAN');
				
				switch( chr){
					case "エ":
						var sub = document.createElement( 'SUB');
						sub.appendChild( document.createTextNode( 'E'));
						ret.appendChild( sub);
						break;
					case "ェ":
						var sub = document.createElement( 'SUB');
						sub.appendChild( document.createTextNode( 'E-'));
						ret.appendChild( sub);
						break;
					case "ス":
						ret.appendChild( document.createTextNode( String.fromCharCode(9824)));break;
					case "ハ":
						ret.appendChild( document.createTextNode( String.fromCharCode(9829)));break;
					case "ク":
						ret.appendChild( document.createTextNode( String.fromCharCode(9827)));break;
					case "ダ":
						ret.appendChild( document.createTextNode( String.fromCharCode(9830)));break;
					case "タ":
						chr = '\t';
					default:
						ret.appendChild( document.createTextNode( chr));					
				}
				
				var x = chara_table.indexOf( chr, 0);
				if ( x > 0) {
					var h = '0123456789ABCDEF';
					ret.className = 'chr' +h.charAt( x /16) +h.charAt( x %16);
					
				} else if( chr === '\t'){
					ret.className = ( isFP40T === false) ? 'tab5' : 'tab6';
				} else {
					ret.className = 'none';
				}
				
				return ret;
			}
		}
	}
})();

/* ------------------------------------------
 DOM Ready 
------------------------------------------ */
$(document).ready( pbListImageMaker.init);
