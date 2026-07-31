const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');
const PATCH_ID = 'protect-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  document.addEventListener("contextmenu",function(e){e.preventDefault();return false;});\n' +
'  document.addEventListener("selectstart",function(e){e.preventDefault();return false;});\n' +
'  document.addEventListener("copy",function(e){e.preventDefault();return false;});\n' +
'  document.addEventListener("keydown",function(e){\n' +
'    if((e.ctrlKey||e.metaKey)&&(e.key==="c"||e.key==="u"||e.key==="s"||e.key==="a")){\n' +
'      e.preventDefault();return false;\n' +
'    }\n' +
'  });\n' +
'  var style=document.createElement("style");\n' +
'  style.textContent="*{-webkit-user-select:none!important;-moz-user-select:none!important;user-select:none!important;}";\n' +
'  document.head.appendChild(style);\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - protect-v1 applique');
