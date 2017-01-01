/**
 *  PB List Image Maker main.js
 * 
 *  version 0.3.0
 * 
 * -- Tested browser --
 * 
 * -- history --
 *  ver 0.3.0
 *    code hilight.
 * 
 *  ver 0.2.1
 *    fixed. >> c += printLine.replace( TAB_CODE, '').length;
 *    rewright to class-style.
 * 
 * 
 */

	var pbListImageMaker = ( function(){
		var linefeedCode, TAB_CODE = '\t';
		
		var printElmArray = [];
		
		var numPartition  = 3;
		var isFP40T = false;
		var editStarted = false;
		var countSteps = document.outputSetting.countSteps;
		
		var list = new pbListFactory();
		var char_table = list.charTable;
		
		var jqTestarea;
		var outputBody;

		var HEX = '0123456789ABCDEF';
	/*
	 * spacer, line, sheet
	 */			
		var ORIGN_SPACER_ELM = document.createElement( 'div');
		ORIGN_SPACER_ELM.appendChild( document.createTextNode( ' '));// for ie
		ORIGN_SPACER_ELM.className = 'spacer';
		
		var ORIGIN_LINE_ELM = document.createElement( 'div');
		ORIGIN_LINE_ELM.className = 'printline';
		
		var ORIGIN_SHEET_ELM = document.createElement( 'div');
		ORIGIN_SHEET_ELM.className = 'sheet';

		
		return {
			init: function(){
				linefeedCode = $('#shadowTxtarea').remove().val(); // linefeedCode = "\r\n" || "\n", depend on UA.
				
				jqTestarea = $('#listTextarea');
				outputBody = $('#outputBody');
				pbListImageMaker.changeSample( document.dataTypeSetting.dataType);
				
				var d = document.outputSetting;
				pbListImageMaker.setting.setFontSet( checkRadio( d.fontSet));
				pbListImageMaker.setting.setPrinter( checkRadio( d.printer));
				pbListImageMaker.setting.setDesine( checkRadio( d.desine));
				
				pbListImageMaker.setting.changeCountSteps( d.countSteps.checked);
				
				function checkRadio(f){
					for (var i = 0; i < f.length; i++) {
						if (f[i].checked) {
							break;
						}
					}
					return f[i].id;
				}
				delete pbListImageMaker.init;
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
				jqTestarea.click( function(){ return false;});
			},
			changeSample: function( sample){
				if( !editStarted){
					switch( sample){
						case 'basic':
							jqTestarea.val( [
								'P0',
								'100 PRINT "GOTO PB-100"',
								'120 GOTO 100'						
							].join( linefeedCode));
							break;
						case 'databank':
							jqTestarea.val( [
								'1 090-0000-0000',
								'2 090-0000-0001',
								'3 090-0000-0002'						
							].join( linefeedCode));
							break;
						case 'value':
							jqTestarea.val( [
								'$="1234567890-qwertyuiop"',
								'A$="KYOU"',
								'B$="KINOU"',
								'C=234.3'						
							].join( linefeedCode));
							break;
						case 'output':
							jqTestarea.val( [
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
					outputBody.removeClass().addClass( className);
				},				
				setPrinter: function ( className){
					$('#outputPrinter').removeClass().addClass( className);
					$('#sheetCount').removeClass().addClass( className);
					
					pbListImageMaker.setting.setSheetCount();
				},
				setSheetCount: function(){
					var o = document.outputSetting,
						_isFP40T,
						changePrinter;
					if( $('#outputPrinter').hasClass( 'FP-12T')){
						numPartition  = o.sheetCountFP12.selectedIndex +1;
						_isFP40T = false;
					}
					if( $('#outputPrinter').hasClass( 'FP-40T')){
						numPartition  = o.sheetCountFP40.selectedIndex +1;
						_isFP40T = true;
					}
					$('#outputSheetCount').removeClass().addClass( 'separeteNum'+numPartition );
					changePrinter = isFP40T !== _isFP40T;
					isFP40T = _isFP40T;
					
					if( changePrinter === true){
						pbListImageMaker.text2pbfont();
					} else {
						pbListImageMaker.print();
					}
				},
				setDesine: function ( className){
					$('#outputDesine').removeClass().addClass( className);
					$('#selectMagazine').removeClass().addClass( className);
					
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
					countSteps = !!v;
					pbListImageMaker.text2pbfont();
				}			
			},
			text2pbfont: function(){
			/*
			 * Printer Controler
			 */	
				list.setList( jqTestarea.val().split( linefeedCode));//行に区切る line[]に格納
				
				var lineData,
					i, j, k,
					l = list.numLine(), m, n,
					isBasicLine,　steps = 0;
				var lineNumber, lineString, hilightString,
					printDataArray = [],
					formattedLineArray = [],
					printData,
					printLine, hilightLine,
					printLineElm,
					hilightClass;
				
				for( i=0; i<l; i++){
					lineData = list.getLineDataByIndex( i);
					lineNumber = lineData.getLineNumber();
					lineString = lineData.getFormattedLine();
					hilightString = lineData.getHilightMap();
					steps += lineData.getSteps();
					
					isBasicLine = false;
					if( 0 < lineNumber && lineNumber < 10000){ // Max Line Number PB-100 < 1000, PB-120 < 10000
						lineNumber = '' + lineNumber;
						lineString = [
							'    '.substr( 0, ( isFP40T === true ? 5 : 4) - lineNumber.length),// insert space before line-number.
							lineNumber,
							' ', // insert space after line-number.
							lineString
						].join( '');
						
						hilightString = '0'.repeat( lineString.length -hilightString.length) +hilightString;

						isBasicLine = true;	
					}
					
					printDataArray.push( {
						isProgramArea:	lineNumber === 0,
						lineString:		lineString,
						hilightString:	hilightString,
						isProgramLine:	isBasicLine
					});
					
					formattedLineArray.push( lineString);
				}

				//l > 0 && jqTestarea.val( formattedLineArray.join( linefeedCode));
				
				if( countSteps === true){
					l = isFP40T === false ? 20 : 40;
					steps += 'steps';
					printDataArray.push(
						{
							isProgramArea:	true,
							lineString:		'-'.repeat( l),
							hilightString:	'0'.repeat( l),
							isProgramLine:	false
						},
						{
							isProgramArea:	false,
							lineString:		' '.repeat( l - steps.length) +steps,
							hilightString:	'0'.repeat( l),
							isProgramLine:	false
						}
					);
				}
			/*
			 * Build Print Element
			 */
				printElmArray.splice( 0, printElmArray.length);
				
				var numMaxChr = isFP40T === false ? 20 : 40,
					numChrWhenIndent = isFP40T === false ? 15 : 34,
					insertTab;
				
				for( i=0, l=printDataArray.length; i<l; ++i){
					printData = printDataArray[ i];
					lineString = printData.lineString;
					hilightString = printData.hilightString;
					isBasicLine = printData.isProgramLine;
					m = lineString.length;
					
					if( printData.isProgramArea === true && i>0){
						printElmArray.push( ORIGN_SPACER_ELM.cloneNode( true));
					}
					
					for( j=0; j<m;){//印字行数分のループ
						insertTab = isBasicLine === true && j>0 ? 1 : 0;
						printLine = ( insertTab === 1) ?
										TAB_CODE + lineString.substr( j, numChrWhenIndent) :
										lineString.substr( j, numMaxChr);
						
						hilightLine = ( insertTab === 1) ?
										'0' + hilightString.substr( j, numChrWhenIndent) :
										hilightString.substr( j, numMaxChr);
						
						printLineElm = ORIGIN_LINE_ELM.cloneNode( true);
						
						for ( k=0, n=printLine.length; k<n; k++) {
							hilightClass = hilightLine.charAt( k);
							hilightClass = hilightClass !== '0' ? ( 'codeHilight' +hilightClass) : null;
							printLineElm.appendChild( createPBCharElm( printLine.charAt( k), hilightClass));//一文字格納
						}
						
						j += printLine.length -insertTab;
						printElmArray.push( printLineElm);//一行格納
						printLineElm = hilightLine = null;
					}
				}
				this.print();
			/*
			 * Create PB Chara SPAN
			 */
				function createPBCharElm( chr, hilight){
					var ret = document.createElement( 'span');
					ret.appendChild( document.createTextNode( chr.entitize()));
					
					var x = -1;
					for(var i=0; i<char_table.length; i++){
						if( char_table[ i] === chr){
							x = i;
							break;
						}
					}
					if ( x > -1) {
						ret.className = 'chr' +HEX.charAt( x /16) +HEX.charAt( x %16);
					} else if( chr === TAB_CODE){
						ret.className = 'tab';
					} else {
						ret.className = 'none';
					}
					if( hilight) ret.className += ' ' + hilight;
					
					return ret;
				}
			},
			print: function(){
				outputBody.html( '');
				
				var numLine = printElmArray.length,
					h = Math.floor( numLine /numPartition ) +( numLine %numPartition  === 0 ? 0 : 1),
					i,
					l = h * numPartition,
					sheetIndex = 0, sheetElm;

				for( i=0; i<l; i++){
					if ( h * sheetIndex === i){
						sheetElm = ORIGIN_SHEET_ELM.cloneNode( true); // new sheet
						if( i === 0){
							sheetElm.className += ' first';
						}			
						outputBody.append( sheetElm);
						sheetIndex++;
						
						while( printElmArray[i] && printElmArray[i].className === ORIGN_SPACER_ELM.className){// 頭がspacerにならないようにする
							printElmArray.splice( i, 1);
						}
					}
					sheetElm.appendChild( ( printElmArray[ i] || ORIGN_SPACER_ELM).cloneNode( true));
				}
				
			/*
			 * output
			 */
				$('#outputTop').text( $('#listTitle').val())
				$('#getHtml').val( outputBody.html());
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
	}

/* ------------------------------------------
 DOM Ready 
------------------------------------------ */
	$(document).ready( pbListImageMaker.init);
