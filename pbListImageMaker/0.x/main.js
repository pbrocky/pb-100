function moveTab(id){
	$('.focus').removeClass('focus');
	if(id=='preview' || id=='html'){text2pbfont();}
	$('#'+id).addClass('focus');
}
var editStarted = false;
function editStart(){
	editStarted = true;
	$('#listTextarea').onclic = null;
}

var linefeedCode = '';
function changeTextareaDemo( demo){
	if( !editStarted){
		switch( demo){
			case 'basic':
				$('#listTextarea').val( 
					'P0' +linefeedCode +
					'100 PRINT "GOTO PB-100"' +linefeedCode +
					'120 GOTO 100'
				);
				break;
			case 'databank':
				$('#listTextarea').val( 
					'1 090-0000-0000' +linefeedCode +
					'2 090-0000-0001' +linefeedCode +
					'3 090-0000-0002'
				);
				break;
			case 'value':
				$('#listTextarea').val(
					'$="1234567890-qwertyuiop"' +linefeedCode +
					'A$="KYOU"' +linefeedCode +
					'B$="KINOU"' +linefeedCode +
					'C=234.3'
				);
				break;
			case 'output':
				$('#listTextarea').val(
					'■------+---+' +linefeedCode +
					'■----+--+' +linefeedCode +
					'■--+-+' +linefeedCode +
					'■-++'
				);
		}		
	}
}

function setFontSet( className){
	$('#outputBody').removeClass();
	$('#outputBody').addClass( className);
}

function setPrinter( className){
	$('#outputPrinter').removeClass();
	$('#outputPrinter').addClass( className);
	
	$('#sheetCount').removeClass();
	$('#sheetCount').addClass( className);
	
	setSheetCount();
}

var separeteNum = 3;
var isFP40T = false;
function setSheetCount(){
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
	
	text2pbfont();
}

function setDesine( className){
	$('#outputDesine').removeClass();
	$('#selectMagazine').removeClass();
	
	$('#outputDesine').addClass( className);
	$('#selectMagazine').addClass( className);
	
	if( className == 'magazine'){
		var magazineStyle = checkSelect( document.outputSetting.selectMagazine);
		$('#outputDesine').addClass( magazineStyle);
		$('#selectMagazine').addClass( magazineStyle);
	}	
}
function setMagazin(){
	if( $('#outputDesine').hasClass('magazine')){
		setDesine( 'magazine')
	}
}
function checkSelect(s){
	return s[ s.selectedIndex].value;
}

var countSteps = true;
function changeCountSteps( v){
	if( v == 'enable'){
		countSteps = true;
	} else {
		countSteps = false;
	}
	text2pbfont();
}
/* ------------------------------------------
 Check and reWright PBDispaly-Header
------------------------------------------ */
	function init(){
		linefeedCode = $('#shadowTxtarea').val(); // 変数linefeedCodeに"\r\n"や"\n"が入る。ブラウザに依存。
		
		changeTextareaDemo( document.dataTypeSetting.dataType);
		
		var d = document.outputSetting;
		setFontSet( checkRadio( d.fontSet));
		setPrinter( checkRadio( d.printer));
		setDesine( checkRadio( d.desine));
		
		changeCountSteps( d.countSteps.value)
	}
	function checkRadio(f){
		for (var i = 0; i < f.length; i++) {
			if (f[i].checked) {
				break;
			}
		}
		return f[i].id;
	}
/* ------------------------------------------
 DOM Ready 
------------------------------------------ */
$(document).ready( init);


var chara_table = " +-*/↑!”#$>≧=≦<≠0123456789.π)(ェエABCDEFGHIJKLMNOPQRSTUVWXYZ++++++abcdefghijklmnopqrstuvwxyz  ?,;:○∑°△@×÷ス←ハダクμΩ↓→%￥□[&_'・]■＼";
var steps = 0;

/* ------------------------------------------
 Text to PB Font
------------------------------------------ */
function text2pbfont(){
	var te = $('#listTextarea').val();
	$('#outputBody').html("");
	
	steps = 0; // Stepの初期化
	
	var originLine = te.split( linefeedCode);//行に区切る line[]に格納
	var line = [];
	
	for (var i=0; i<originLine.length; i++){
		var fixedLine = fixChar( originLine[ i]);//	キャラテーブルに存在する文字だけを残して、改行コードなどは削除
		if ( fixedLine.length > 0) {
			line.push( fixBASIC( fixedLine));//	BASICテーブルを参照してスペースなどの置換
		}
	}
	
	var objlist = document.createElement("DIV");
	var lcount = 0;
	
	for (var i=0; i<line.length; i++){
		var str = line[i];
			
		//プログラムエリアの上に空き行（一番↑以外）
		if ( str.match(/^[(P{\d})|(<P{\d}>)|(\[P{\d}\])]/i) && i != 0){
			var objline = document.createElement( 'DIV');
			objline.appendChild( document.createTextNode( ' '));// IEで要
			objline.className = 'spacer';
			objlist.appendChild( objline);
			lcount++;
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
			
			var objline = document.createElement( 'DIV');
			objline.className = 'printline';
			
			//テキストをSPANとクラス指定に置き換え
			for (var k = 0; k < pline.length; k++) {
				objline.appendChild( createPBCharElm( pline.charAt(k)));//一文字格納
			}
			lcount++;
			objlist.appendChild( objline);//一行格納
			//objlist.appendChild(document.createElement("BR"));//改行
		}
	}

//------------------------------------------
//	行の分解
//------------------------------------------
	var h = Math.floor( lcount /separeteNum);
	if (h *separeteNum < lcount){ h++;}
	var p = 0;
	var outputBody = $('#outputBody');
	for (var i = 0; i < h * separeteNum; i++){
		if (h * p == i){
			var objSheet = document.createElement( 'DIV');
			objSheet.className = 'sheet';
			if( i == 0){
				objSheet.className += ' first';
			}			
			outputBody.append( objSheet);
			
			if( i < lcount){
				if( objlist.childNodes[i].className == 'spacer'){ // 頭がspacerにならないようにする
					objlist.removeChild( objlist.childNodes[i]);
					lcount--;
				}				
			}

			p++;
		}
		if (i < lcount){
			var copy = objlist.childNodes[i].cloneNode( true);
			objSheet.appendChild( copy);		
		}else{
			var objline = document.createElement( 'DIV');
			objline.appendChild( document.createTextNode( ' '));
			objline.className = 'spacer';
			objSheet.appendChild( objline);
		}
	}
	$('#outputTop').text( $('#listTitle').val())
	$('#getHtml').val( $('#outputBody').html());
}

function fixChar( line){
	var ret = '';
	var outOfQuot = true; // ダブルコーテーション外
	
	for (var i=0; i<line.length; i++){
		var chr = line.charAt(i);
		
		if ( outOfQuot == true){// ダブルコーテーション外の場合、不等号記号の置き換え、スペースの削除
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
			if(chr==' '){chr='';}
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
		if (chara_table.indexOf( chr, 0) >= 0) {
			ret += chr;
		}
	}
	return ret;
}

function fixBASIC( line){
	//if( !line.match(/^[(P{\d})|(<P{\d}>)|(\[P{\d}\])]/i)){
		var ret = "";
		
		var basic_table_0 = basicTable();
		var basic_table_1 = basicTable2();
		var space = [ '', ' '];
		
		//行番号の前にスペース
		var no = parseInt( line);
		if (no > 0){
			if( !isFP40T){
				line = "   ".substr( 0, 4 -( '' +no).length) + line;
				line = line.substr( 0, 4)+' '+line.substr( 4);//後ろにもひとつ			
			} else {
				line = "    ".substr( 0, 5 -( '' +no).length) + line;
				line = line.substr( 0, 5)+' '+line.substr( 5);//後ろにもひとつ
			}
		}
	
		steps += 3; // 3steps spends for a Line.
		originLength = line.length;
		var str = line.split('”');
		
		for(var i=0; i<str.length; i++){
			if ( i % 2 == 0){ // ”の外
				
				for (var j in basic_table_0){
					str[i] = str[i].replace( new RegExp( basic_table_0[j].r, 'g'), function( str, m1){
						steps++;
						originLength -= basic_table_0[j].l;
						return space[ basic_table_0[j].i[ 0]] +m1 +space[ basic_table_0[j].i[ 1]];
					});
				}
				for (var j in basic_table_1){
					str[i] = str[i].replace( new RegExp( basic_table_1[j].r, 'g'), function( str, m1, m2){
						steps++;
						originLength -= basic_table_1[j].l;
						return space[ basic_table_1[j].i[ 0]] +m1 +space[ basic_table_1[j].i[ 1]] +m2 +space[ basic_table_1[j].i[ 2]];
					});
				}
				
				while( str[i].indexOf( '  ', 4) > 0){// スペースx2を詰める
					var p = str[i].indexOf( '  ', 4);
					str[i] = str[i].substr( 0, p) +str[i].substr( p +1);
				}
				if( originLength > 0){
				}
			} else { // ”の中
				str[i] = '”' +str[i] +'”';
			}
			ret += str[i];
		}
		if( originLength > 0){
			//steps += originLength;
		}		
		return ret;		
	//} else {
	//	return line;
	//}
}

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
		
	} else if( chr == '\t'){
		if ( !isFP40T) {
			ret.className = 'tab5';
		} else {
			ret.className = 'tab6';
		}
	} else {
		ret.className = 'none';
	}
	
	return ret;
}

function basicTable(){
	return [
		{ r:	'(FOR)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},// t:(com=0) or(func=1)
		{ r:	'(NEXT)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},// l = length
		{ r:	'(GOTO)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},// i = insert Spach[ front, end]
		{ r:	'(GOSUB)',	t:	0, l: 5, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(RETURN)',	t:	0, l: 6, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(PRINT)',	t:	0, l: 5, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(MODE)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(STOP)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(END)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(VAC)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(SET)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(GET)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(DEFM)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(SAVE)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(LOAD)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(RUN)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(CLEAR)',	t:	0, l: 5, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(BEEP)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(LET)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(ON)',		t:	0, l: 2, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(READ)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(RESTORE)',t:	0, l: 7, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(DATA)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(REM)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(NEW)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(PASS)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(FRAC)',	t:	1, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(SIN)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(COS)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(TAN)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(ASN)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(ACS)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(ATN)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(LOG)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(LN)',		t:	1, l: 2, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(EXP)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(SQR)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(ABS)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(LEN)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(VAL)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(CSR)',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 0] : [ 1, 0]},
		{ r:	'(INPUT)',	t:	0, l: 5, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(VERIFY)',	t:	0, l: 6, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(STEP)',	t:	0, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(THEN)',	t:	0, l: 4, i: ( !isFP40T) ? [ 1, 1] : [ 1, 1]},
		{ r:	'(KEY)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 0] : [ 0, 0]},
		{ r:	'(DEG.)',	t:	1, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(DMS.)',	t:	1, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(STR.)',	t:	1, l: 4, i: ( !isFP40T) ? [ 0, 1] : [ 1, 1]},
		{ r:	'(MID.)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 0] : [ 1, 1]},
		{ r:	'(RAN#)',	t:	1, l: 4, i: ( !isFP40T) ? [ 0, 0] : [ 1, 0]},
	]
}
function basicTable2(){
	return [
		{ r:	'(VER)([^IFY])',	t:	0, l: 3, i: ( !isFP40T) ? [ 0, 1, 0] : [ 1, 1, 0]},
		{ r:	'([^P][^R])(INT)',	t:	1, l: 3, i: ( !isFP40T) ? [ 0, 0, 1] : [ 0, 1, 1]},
		{ r:	'([:; ])(PUT)',		t:	0, l: 3, i: ( !isFP40T) ? [ 0, 0, 1] : [ 0, 1, 1]},
		{ r:	'([:; ])(IF)',		t:	0, l: 2, i: ( !isFP40T) ? [ 0, 0, 1] : [ 0, 1, 1]},
		{ r:	'(FOR[^:]*?)(TO)',	t:	0, l: 2, i: ( !isFP40T) ? [ 0, 1, 1] : [ 0, 1, 1]} //stop goto restore
	]
}
