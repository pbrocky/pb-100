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

	var pbListFactory = function(){
		var listArray = [];
		var LINE_DATA_ARRAY = [];
		
		var CHAR_TABLE = [
			' ',	'+',	'-',	'*',	'/',	'↑',	'!',	'"',	'#',	'$',	'>',	'≧',	'=',	'≦',	'<',	'≠',
			'0',	'1',	'2',	'3',	'4',	'5',	'6',	'7',	'8',	'9',	'.',	'π',	')',	'(',	'Ｅ',	'ｅ',
			'A',	'B',	'C',	'D',	'E',	'F',	'G',	'H',	'I',	'J',	'K',	'L',	'M',	'N',	'O',	'P',
			'Q',	'R',	'S',	'T',	'U',	'V',	'W',	'X',	'Y',	'Z',	'',		'',		'',		'',		'',		'',
			'a',	'b',	'c',	'd',	'e',	'f',	'g',	'h',	'i',	'j',	'k',	'l',	'm',	'n',	'o',	'p',
			'q',	'r',	's',	't',	'u',	'v',	'w',	'x',	'y',	'z',	'',		'',		'?',	',',	';',	':',
			'○',	'∑',	'°',	'△',	'@',	'×',	'÷',
				String.fromCharCode(9824),	'←',	String.fromCharCode(9829),	String.fromCharCode(9830),	String.fromCharCode(9827),
																											'μ',	'Ω',	'↓',	'→',
			'%',	'￥',	'□',	'[',	'&',	'_',	"'",	'・',	']',	'■',	'＼'	
		];
		var CHAR_ALL = CHAR_TABLE.join( '');
		var CHAR_QUOT = CHAR_TABLE[ 7];
		var CHAR_CORON = CHAR_TABLE[ 95];	//:
		var CHAR_EX    = CHAR_TABLE[ 30];
		var CHAR_EXM   = CHAR_TABLE[ 31];
		var CHAR_NEMO = '|'; // nemo, don't exist in pb chara table.

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
		
		var HL_NONE = '0';
		var HL_STRING = '1';
		var HL_COMMAND = '2';
		var HL_FUNCTION = '3';
		
		// 中間コード、 
		
		var BASIC_CSR = { match: 'CSR',	newstring: 'CSR ',		type: TYPE__P_, ver: VER_12a};
		
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
				option: [ BASIC_CSR]
			},
			{ match: 'PRINT',			newstring: 'PRINT ',	type: TYPE__P_, ver: VER_12a,
				option: [ BASIC_CSR]
			},
			{ match: 'ON',				newstring: 'ON ',		type: TYPE__P_, ver: VER__2a,
				must: [
					{ match: 'GOTO',		newstring: 'GOTO ',	type: TYPE__P_, ver: VER__2a},
					{ match: 'GOSUB',		newstring: 'GOSUB ',type: TYPE__P_, ver: VER__2a}
				]
			},
			{ match: 'IF',					newstring: 'IF ',	type: TYPE__P_, ver: VER_12a,
				must: [
					{ match: 'THEN',		newstring: ' THEN ',type: TYPE__P_, ver: VER_12a} // then の後に命令は来ない(v1)
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
		
		var COMMAND_ARRAY = [];
		var FUNCTION_ARRAY = [];
		var _basic, _type,
			i, j,
			l = BASIC_TABLE.length,
			n,
			_length;
		
		for( i=0; i<l; ++i){
			_basic = BASIC_TABLE[ i];
			_type = _basic.type;
			_length = _basic.match.length;
			if( ( _type>>1)&1){
				for( j=0, n=COMMAND_ARRAY.length; j<n; ++j){
					if( COMMAND_ARRAY[ j].match.length >= _length) break;
				}
				COMMAND_ARRAY.splice( j, 0, _basic);
			} else
			if( _type === TYPE___F){
				for( j=0, n=FUNCTION_ARRAY.length; j<n; ++j){
					if( FUNCTION_ARRAY[ j].match.length >= _length) break;
				}
				FUNCTION_ARRAY.splice( j, 0, _basic);
			}
		}
		_basic = null;
		
	/*
	 * LineDataClass
	 */
		var LineDataClass = function(){
			var lineNumber = -1,
				formattedLine = '',
				hilightMap = '',
				steps = 0,
				warning = [];
				errror = [];
			
			return {
				init: function( _line){
					if( typeof _line !== 'string') return false;
					
					if( _line.match( REG_PROGRAM_AREA)){
						lineNumber = steps = 0;
						formattedLine = _line.replace( REG_PROGRAM_AREA, 'P$1');
						return true;
					}
					
					var m;
					try {
						m = lineNumber = parseInt( _line);
						if( m <= 0 || 10000 <= m) return false;
						m = '' +m;
						if( m !== _line.substr( 0, m.length)) return false;
						_line = _line.substr( m.length);
					} catch( error){
						return false;
					}
					
					_line = _line.split('&amp;').join('&')
			  			.split('^E-').join(CHAR_EX).split('^e-').join(CHAR_EX)
						.split('^E').join(CHAR_EXM).split('^e').join(CHAR_EXM)
			  			.split('&lt;').join('<')
						.split('&gt;').join('>')
						.split('&quot;').join('"');
					
					var _isString = false,
						_newLine = '',
						_workCopy = '',
						_hilightMap = '',
						i, j,
						l = _line.length,
						m = REG_REPLACE_OUTOFQUOT.length,
						_chr;
					for( i=0; i < l; ++i) {
						_chr = _line.charAt( i);
						if( _isString === false) { // ダブルコーテーション外の場合、不等号記号の置き換え、
							for( j=0; j<m; j++){
								if( _line.substr( i, 2).match( REG_REPLACE_OUTOFQUOT[ j].replace)){
									_chr = REG_REPLACE_OUTOFQUOT[ j].newString;
									++i;
									break;
								}
							}
							_chr = _chr === ' ' ? '' : _chr;	// delete space
							_chr = _chr === '　' ? '' : _chr;	// 全角 space
						}
						if( _chr === '^') _chr = CHAR_TABLE[ 5];	// ↑
						
						if( CHAR_ALL.indexOf( _chr) === -1) _chr = '';	// match( chr)
						_newLine += _chr;
						if( _chr === CHAR_QUOT || _isString === true){
							_workCopy += _chr !== '' ? CHAR_NEMO : '';
							_hilightMap += HL_STRING;
						} else {
							_workCopy += _chr;
							_hilightMap += _chr !== '' ? HL_NONE : '';
						}
						
						if( _chr === CHAR_QUOT) _isString = !_isString;	// ダブルクォーテーションの処理
					}
					
					if( _newLine.length === 0) return true;
					
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
					}
					_statementDataArray.push( new StatementClass( _workCopy, _newLine, _hilightMap));
					
					while( _statementDataArray.length > 0){
						_statement = _statementDataArray.shift();
						checkCommand( _statement, 0);
						checkFunction( _statement);
						_newLineArray.push( _statement.statement);
						_hilightArray.push( _statement.hilight);
						steps += _statement.steps +1;
					}
					formattedLine = _newLineArray.join( CHAR_CORON);
					hilightMap = _hilightArray.join( HL_NONE);
					steps += 3 -1;
					
					delete this.init;
					
					return true;
				},
				getLineNumber: function(){
					return lineNumber;
				},
				getFormattedLine: function(){
					return formattedLine;
				},
				getHilightMap: function(){
					return hilightMap;
				},
				getSteps: function(){
					return steps;
				}
			}
		}
		var StatementClass = function( _copy, _statement, _hilight){
			return {
				copy:		_copy,
				statement:	_statement,
				hilight:	_hilight,
				steps:		_statement.length
			}
		}
		
		function checkCommand( _statement, _startIndex, _commandArray){
			_commandArray = _commandArray || COMMAND_ARRAY;
			var _string = _statement.copy,
				_hasCommand = false,
				_error = false,
				_command, _match, _indexOf, _next,
				_semicoronAfterIF, _must, _option, _result, i, l;
				
			for( i=0, l=_commandArray.length; i<l; ++i){
				_command = _commandArray[ i];
				_match = _command.match;
				_indexOf = _string.indexOf( _match, _startIndex);
				if( _indexOf !== -1){
					_next = _indexOf + _match.length;
					_semicoronAfterIF = _string.indexOf( ';', _indexOf);
					_must = _command.must;
					_option = _command.option;
					statementOperation( _statement, _indexOf, _next, _command.newstring, HL_COMMAND);
					if( _match === 'IF' && _semicoronAfterIF !== -1){
						statementOperation( _statement, _semicoronAfterIF +1, _semicoronAfterIF +2, ';', HL_COMMAND);
						_error = checkCommand( _statement, _semicoronAfterIF +2).error;
					} else
					if( _match === 'THEN'){
						_error = checkCommand( _statement, _next).hasCommand === false;
					} else
					if( _must){
						_result = checkCommand( _statement, _next, _must);
						_error = _result.hasCommand === false || _result.error === true;
					} else
					if( _match === 'CSR'){
						checkCommand( _statement, _next, _commandArray);
					} else
					if( _option){
						checkCommand( _statement, _next, _option);
					}
					_hasCommand = true;
					break;
				}
			}
			return {
				hasCommand:		_hasCommand,
				error:			_error
			};
		}
		function checkFunction( _statement){
			var l = FUNCTION_ARRAY.length,
				_function, _match, _length, _indexOf;
			for( i=0; i<l; ++i){
				_function = FUNCTION_ARRAY[ i];
				_match = _function.match;
				_length = _match.length;
				_indexOf = 0;
				while( _statement.copy.indexOf( _match) !== -1){
					_indexOf = _statement.copy.indexOf( _match, _indexOf);
					_indexOf !== -1 &&
						statementOperation( _statement, _indexOf, _indexOf + _length, _function.newstring, HL_FUNCTION);
					_indexOf += _length;
				}
			}
		}
		function statementOperation( _statement, _startIndex, _endIndex, _insertString, _hilightString){
			var l = _insertString.length;
			_statement.copy		= stringOperation( _statement.copy,	_startIndex, _endIndex, CHAR_NEMO.repeat( l));
			_statement.statement= stringOperation( _statement.statement, _startIndex, _endIndex, _insertString);
			_statement.hilight	= stringOperation( _statement.hilight,	_startIndex, _endIndex, _hilightString.repeat( l));
			_statement.steps	= _statement.steps - ( _endIndex -_startIndex -1);
		}
		function stringOperation( _string, _startIndex, _endIndex, _insertString){
			return [
				_string.substr( 0, _startIndex),
				_string.substr( _endIndex)
			].join( _insertString);
		}
		
		return {
			setList: function( _newlistArray){
				var updated = false;
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
				if( updated === true){
					var i, l = listArray.length,
						_lineData;
					LINE_DATA_ARRAY.splice( 0, LINE_DATA_ARRAY.length);
					for( i = 0; i < l; i++) {
						_lineData = new LineDataClass();
						_lineData.init( listArray[ i]);
						LINE_DATA_ARRAY.push( _lineData);
					}
					updated = true;
				}
			},
			charTable: CHAR_TABLE,
			numLine: function(){
				return LINE_DATA_ARRAY.length;
			},
			getLineDataByIndex: function( _index){
				if( 0 <= _index && _index < LINE_DATA_ARRAY.length){
					return LINE_DATA_ARRAY[ _index];
				}
				return null;
			}
		}
	}