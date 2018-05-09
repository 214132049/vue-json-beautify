let SINGLE_TAB = "  ";
let ImgCollapsed = "data:image/gif;base64,R0lGODlhHAALAMQAAP////7++/z8/Pb29fb18PHx7e/w6/Hw6e3s5unp4+jm2ODg3t3a0dnVy9bQxtLMv8zJurDC1L+9sMK4p32buDMzMwAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEHABcALAAAAAAcAAsAAAVU4CWOZGmeV0StLBWhsEgBdA1QMUwJvMUTuNyJMihaBodFUFiiECxQKGMpqlSq14uVRCkUEJbEokHVZrdmrqLRsDgekDLzQoFIJni8nKlqrV5zgYIhADs=";
let ImgExpanded = "data:image/gif;base64,R0lGODlhHAALAMQAAP////7++/z8/Pb29fb18PHx7e/w6/Hw6e3s5unp4+Dg3t3a0djY0dnVy9fTxNbQxtLMv8zJurDC1L+9sMK4p32buAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEHABcALAAAAAAcAAsAAAVL4CWOZGmel1StbCWhsFgBdA1UMVwJQd8TuNypMigWD4qgsFQhWJ7PhXI5qhQKCERC0ZhSLxUFo+FwQCJeagUyobjd6aWqtXp979QQADs=";
let QuoteKeys = true; // 引号
let IsCollapsible = true; // 显示控制
let TabSize = 1; // 显示控制 
let _dateObj = new Date();
let _regexpObj = new RegExp();
let el = ''

function $id(id) { return document.getElementById(id); }
function IsArray(obj) {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.length === 'number' &&
    !(obj.propertyIsEnumerable('length'));
}

function Process(el, binding){
  el = el
  QuoteKeys = binding.modifiers.quotekeys || binding.modifiers.q || true; // 引号
  IsCollapsible = binding.modifiers.iscollapsible || binding.modifiers.c || true; // 显示控制
  TabSize = binding.arg || TabSize
  TabSize = TabSize > 4 ? 4 : TabSize
  SetTab();
  var json = binding.value;
  var html = "";
  try{
    if(json == ""){ json = "\"\"";return;}
    var obj = eval("["+json+"]");
    html = ProcessObject(obj[0], 0, false, false, false);
    el.innerHTML = "<PRE class='CodeContainer'>"+html+"</PRE>";
  }catch(e){
    console.log("JSON数据格式不正确:\n"+e.message);
    el.innerHTML = "";
  }
}

function ProcessObject(obj, indent, addComma, isArray, isPropertyContent){
  var html = "";
  var comma = (addComma) ? "<span class='Comma'>,</span> " : ""; 
  var type = typeof obj;
  var clpsHtml ="";
  if(IsArray(obj)){
    if(obj.length == 0){
      html += GetRow(indent, "<span class='ArrayBrace'>[ ]</span>"+comma, isPropertyContent);
    }else{
      clpsHtml = IsCollapsible ? "<span><img src=\""+ImgExpanded+"\" onClick=\"ExpImgClicked(this)\" /></span><span class='collapsible'>" : "";
      html += GetRow(indent, "<span class='ArrayBrace'>[</span>"+clpsHtml, isPropertyContent);
      for(var i = 0; i < obj.length; i++){
        html += ProcessObject(obj[i], indent + 1, i < (obj.length - 1), true, false);
      }
      clpsHtml = IsCollapsible ? "</span>" : "";
      html += GetRow(indent, clpsHtml+"<span class='ArrayBrace'>]</span>"+comma);
    }
  }else if(type == 'object'){
    if (obj == null){
      html += FormatLiteral("null", "", comma, indent, isArray, "Null");
    }else if (obj.constructor == _dateObj.constructor) { 
      html += FormatLiteral("new Date(" + obj.getTime() + ") /*" + obj.toLocaleString()+"*/", "", comma, indent, isArray, "Date"); 
    }else if (obj.constructor == _regexpObj.constructor) {
      html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp"); 
    }else{
      var numProps = 0;
      for(var prop in obj) numProps++;
      if(numProps == 0){
        html += GetRow(indent, "<span class='ObjectBrace'>{ }</span>"+comma, isPropertyContent);
      }else{
        clpsHtml = IsCollapsible ? "<span><img src=\""+ImgExpanded+"\" onClick=\"ExpImgClicked(this)\" /></span><span class='collapsible'>" : "";
        html += GetRow(indent, "<span class='ObjectBrace'>{</span>"+clpsHtml, isPropertyContent);
        var j = 0;
        for(var prop in obj){
          var quote = QuoteKeys ? "\"" : "";
          html += GetRow(indent + 1, "<span class='PropertyName'>"+quote+prop+quote+"</span>: "+ProcessObject(obj[prop], indent + 1, ++j < numProps, false, true));
        }
        clpsHtml = IsCollapsible ? "</span>" : "";
        html += GetRow(indent, clpsHtml+"<span class='ObjectBrace'>}</span>"+comma);
      }
    }
  }else if(type == 'number'){
    html += FormatLiteral(obj, "", comma, indent, isArray, "Number");
  }else if(type == 'boolean'){
    html += FormatLiteral(obj, "", comma, indent, isArray, "Boolean");
  }else if(type == 'function'){
    if (obj.constructor == _regexpObj.constructor) {
      html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp"); 
    }else{
      obj = FormatFunction(indent, obj);
      html += FormatLiteral(obj, "", comma, indent, isArray, "Function");
    }
  }else if(type == 'undefined'){
    html += FormatLiteral("undefined", "", comma, indent, isArray, "Null");
  }else{
    html += FormatLiteral(obj.toString().split("\\").join("\\\\").split('"').join('\\"'), "\"", comma, indent, isArray, "String");
  }
  return html;

}

function FormatLiteral(literal, quote, comma, indent, isArray, style){
  if(typeof literal == 'string')
    literal = literal.split("<").join("&lt;").split(">").join("&gt;");
  var str = "<span class='"+style+"'>"+quote+literal+quote+comma+"</span>";
  if(isArray) str = GetRow(indent, str);
  return str;
}

function FormatFunction(indent, obj){
  var tabs = "";
  for(var i = 0; i < indent; i++) tabs += TAB;
  var funcStrArray = obj.toString().split("\n");
  var str = "";
  for(var i = 0; i < funcStrArray.length; i++){
    str += ((i==0)?"":tabs) + funcStrArray[i] + "\n";
  }
  return str;
}

function GetRow(indent, data, isPropertyContent){
  var tabs = "";
  for(var i = 0; i < indent && !isPropertyContent; i++) tabs += TAB;
  if(data != null && data.length > 0 && data.charAt(data.length-1) != "\n")
    data = data+"\n";
  return tabs+data;                       
}

function ExpImgClicked(img){
  var container = img.parentNode.nextSibling;
  if(!container) return;
  var disp = "none";
  var src = ImgCollapsed;
  if(container.style.display == "none"){
    disp = "inline";
    src = ImgExpanded;
  }
  container.style.display = disp;
  img.src = src;
}

function SetTab(){
  TAB = MultiplyString(parseInt(TabSize, 10), SINGLE_TAB);
}

function MultiplyString(num, str){
  var sb =[];
  for(var i = 0; i < num; i++){
    sb.push(str);
  }
  return sb.join("");
}
// 级数 + 1  如二级 level:3
function CollapseLevel(level) {
  EnsureIsPopulated();
  TraverseChildren(el, function (element, depth) {
    if (element.className == 'collapsible') {
      if (depth >= level) {
        MakeContentVisible(element, false);
      } else {
        MakeContentVisible(element, true);
      }
    }
  }, 0);
}

function EnsureIsPopulated() {
  if (!el.innerHTML && !!$id("RawJson").value) Process();
}

function TraverseChildren(element, func, depth) {
  for (var i = 0; i < element.childNodes.length; i++) {
    TraverseChildren(element.childNodes[i], func, depth + 1);
  }
  func(element, depth);
}

function MakeContentVisible(element, visible) {
  var img = element.previousSibling.firstChild;
  if (!!img.tagName && img.tagName.toLowerCase() == "img") {
    element.style.display = visible ? 'inline' : 'none';
    element.previousSibling.firstChild.src = visible ? ImgExpanded : ImgCollapsed;
  }
}

function TabSizeChanged() {
  Process();
}

// 叠起
function CollapseAllClicked() {
  EnsureIsPopulated();
  TraverseChildren(el, function (element) {
    if (element.className == 'collapsible') {
      MakeContentVisible(element, false);
    }
  }, 0);
}
// 展开
function ExpandAllClicked() {
  EnsureIsPopulated();
  TraverseChildren(el, function (element) {
    if (element.className == 'collapsible') {
      MakeContentVisible(element, true);
    }
  }, 0);
}

module.exports = Process;