
	var csr = 0;
//=======================================================
// move Corsol & enter Charactor
//=======================================================
	var moveCursor = function(x){
		if(x >= 0){ csr = x;}
		setLayerEditor();
		var csrc = 'CSR' + ['00','01','02','03','04','05','06','07','08','09','10','11'][csr];
		$("#cursor").attr('className', csrc);
		$("#setOvarlayContainer").attr('className', 'tooltip ' + csrc);
	}
	var enterChr = function(cc){ // フォントの記入
		if($('#setOverlay').hasClass('overlayOn') && !$('#layer1').hasClass('lock')){
			cn = $("#display_main>span>a>span:eq("+csr+"):first-child").attr('className');
			$("#display_main>span>a>span:eq("+csr+"):last-child").attr('className', cn).removeClass('layer0')
		}
		$("#display_main>span>a>span:eq("+csr+"):first-child").attr('className', 'layer0 ' + cc);					
		
		if (!$('#setOverlay').hasClass('overlayOn') && csr < 11) {
			csr++;
			moveCursor(csr);
		} else {
			setLayerEditor();
		}
	}
	
/* ------------------------------------------
 Edit( delete , insert , clear , cursor Left , cursor Right ) 
------------------------------------------ */
	var del = function(){
		for(var i=csr; i<15; i++){
			$("#display_main>span:eq("+i+")>a").empty();
			$("#display_main>span:eq("+i+")>a").attr('className', $("#display_main>span:eq("+(i+1)+")>a").attr('className'));
			$("#display_main>span:eq("+(i+1)+")>a").children().clone().appendTo("#display_main>span:eq("+i+")>a");
		}
		$("#display_main>span:last>a").removeClass();
		$("#display_main>span:last>a>span").removeClass()
		setLayerEditor();
	}
	var ins = function(){
		for(var i=15; i>csr; i--){
			$("#display_main>span:eq("+(i)+")>a").empty();
			$("#display_main>span:eq("+i+")>a").attr('className', $("#display_main>span:eq("+(i-1)+")>a").attr('className'));
			$("#display_main>span:eq("+(i-1)+")>a").children().clone().appendTo("#display_main>span:eq("+(i)+")>a");
		}
		$("#display_main>span:eq("+csr+")>a").removeClass();
		$("#display_main>span:eq("+csr+")>a>span").removeClass();
		setLayerEditor();
	}
	var reFresh = function(){
		$("#display_main>span>a").removeClass();
		$("#display_main>span>a>span").removeClass();
		moveCursor(0);
		setLayerEditor();
	}
	var right = function(){
		if(csr<11){csr++;moveCursor(csr);setLayerEditor();}
	}
	var left = function(){
		if(csr>0){csr--;moveCursor(csr);setLayerEditor();}
	}
/* ------------------------------------------
 Copy Charactors to 'setOverlay' 
------------------------------------------ */
	function setLayerEditor(){
		var cn = $("#display_main>span:eq("+csr+")>a").attr('className');
		if(cn){
			$('#opacity').text($('#setOpacity input:eq('+ (Number(cn.slice(2))-1) +')').val());
			$('#setOverlay').addClass('overlayOn');
			
			cn = $("#display_main>span:eq("+csr+")>a>span:first").attr('className');
			$('#layer0 input').attr('className', cn).removeClass('layer0');
			
			cn = $("#display_main>span:eq("+csr+")>a>span:last").attr('className');
			$('#layer1 input').attr('className', cn);
		} else {
			$('#setOverlay').removeClass('overlayOn');
		}
	}
	var swOverlay = function(){
		if($('#setOverlay').hasClass('overlayOn')){
			$('#setOverlay').removeClass('overlayOn');
			
			$("#display_main>span:eq("+csr+")>a").removeClass()
			$("#display_main>span:eq("+csr+")>a>span:last").removeClass()
			
			$('#layer1').removeClass('lock');
			
			setLayerEditor();
		} else {
			$('#setOverlay').addClass('overlayOn');
			$("#display_main>span:eq("+csr+")>a").removeClass().addClass('op5')
			setLayerEditor();
		}
	}
	var setOpacity = function(op){
		$("#display_main>span:eq("+csr+")>a").attr('className', 'op' + op);
		$("#display_main>span>a>span:eq("+csr+"):first-child").addClass('layer0');
		setLayerEditor();
	}
	var lockLayer = function(l){
		if(l==1 && $('#layer1').hasClass('lock')){
			$('#layer1').removeClass('lock');
		} else {
			if(l==0){
				$("#display_main>span:eq("+csr+")>a>span:last").attr('className', $('#layer0 input').attr('className'));
				$("#display_main>span:eq("+csr+")>a>span:first").attr('className', '');
			}
			$('#layer1').addClass('lock');
		}
		setLayerEditor();
	}
/* ------------------------------------------
 popup
------------------------------------------ */
	var popUp = function(id){
		$('#toolbox .popupContainer').css('display', 'none');
		if(id=="getCode"){dumpHTML();}
		$('#' + id).css('display', 'block');
	}
	var closePopup = function(){
		$('#toolbox .popupContainer').css('display', 'none');
	}
/* ------------------------------------------
 Check and reWright PBDispaly-Header
------------------------------------------ */
	var setConditions = function(){
		var c = [];
		var d = document.conditions;
		
		c[0] = checkRadio(d.sf);
		c[1] = checkRadio(d.ext);
		c[2] = checkRadio(d.rw);
		c[3] = checkRadio(d.stop);
		if(c[2] == "rw_r"){
			$('#stop').removeClass('op5');
		} else {
			$('#stop').addClass('op5');
			c[3] = "st_n";
		}		
		c[4] = checkRadio(d.tr);
		c[5] = checkRadio(d.prt);
		c[6] = checkRadio(d.drg);
		
		var html;

		for(var i=0; i<c.length; i++){
			var v = $('#'+c[i]).val();
			if(v != "none"){
				html += "<span class='" + v + "'>" + $('#'+c[i]).attr('title') + "<\/span>\n";
			}
		}
		$('#display_head').html(html);
	}
	function checkRadio(f){
		for (var i = 0; i < f.length; i++) {
			if (f[i].checked) {
				break;
			}
		}
		return f[i].id;
	}
	var setType = function(type){
		$('#pbDisplayImageMaker').attr('className', type);
	}
/* ------------------------------------------
 dump HTML
------------------------------------------ */
	var dumpHTML = function(){
		var html="";
		var type = " " + checkRadio(document.type.type);
		if(type==" PB-100"){type="";}
		html += '&lt;style type="text/css"&gt;<br>' + 
				'&nbsp;&lt;!--<br>' + 
				'&nbsp;&nbsp;@import url(http://casio-pb-100.googlecode.com/svn/trunk/pbDisplayImageMaker/importCSS/1.x/pbDisplay0.1.0.css);<br>' +
				'&nbsp;--&gt;<br>' + 
				'&lt;\/style&gt;<br>' + 
				'&lt;div class="pbDisplay010-Container'+ type +'"&gt;<br>' + 
				'&nbsp;&lt;div class="pbDisplay010"&gt;<br>' + 
				'&nbsp;&nbsp;&lt;!-- display:condition --&gt;<br>';
		
		$("#display_head span").each(function(){
			var cls = $(this).attr('className');
			var txt = $(this).text();
			html += '&nbsp;&nbsp;&nbsp;&lt;span class="'+cls+'"&gt;'+txt+'&lt;\/span&gt;<br>';
		});		
				
		html += '&nbsp;&nbsp;&lt;!-- display:main --&gt;&lt;br&gt;<br>';
				
		$("#display_main>span>a").each(function(){
			var csr = $(this).parents().attr('class');
			var op = $(this).attr('className');
			
			var layer0op = "";
			var layer1op = "";
			if(op){
				layer0op = " op" + (10 - Number(op.slice(2)));
				layer1op = " "+ op;
			}
			var layer0class = $(this).children(':first').clone(true).removeClass('layer0').attr('className');
			var layer1class = $(this).children(':last').attr('className');
			if(layer0class){
				var layer0txt = $("#chr-set ."+layer0class+":eq(0)").attr('title').entitize();
				html += '&nbsp;&nbsp;&nbsp;&lt;span class="'+csr+' '+layer0class+layer0op+'"&gt;'+layer0txt+'&lt;\/span&gt;<br>'
			}
			if(layer1class){
				var layer1txt = $("#chr-set ."+layer1class+":eq(0)").attr('title').entitize();
				html += '&nbsp;&nbsp;&nbsp;&lt;span class="'+csr+' '+layer1class+layer1op+'"&gt;'+layer1txt+'&lt;\/span&gt;<br>'
			}
			
		});
		html += "&nbsp;&lt;\/div&gt;<br>&lt;\/div&gt;";
		$("#dumpHTML").html(html);
	}


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
/* ------------------------------------------
 IE6 :hover
------------------------------------------ */
var AddEventForIE6 = function(){
	if (typeof document.documentElement.style.maxHeight == "undefined") {
		$("#pbDisplayImageMaker").addClass('hoverEventIE6')
		//$("#pbDisplayImageMaker").hover(
		  //function () {
		  //  $(this).addClass('hoverEventIE6');
		  //},
		  //function () {
		  //  $(this).removeClass('hoverEventIE6');
		  //}
		//);
	}	
}

/* ------------------------------------------
 DOM Ready 
------------------------------------------ */
  $(document).ready(function(){
	reFresh();
	setConditions();
  });



