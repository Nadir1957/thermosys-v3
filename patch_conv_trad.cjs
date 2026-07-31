const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

const PATCH_ID = 'conv-trad-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

var PAIRS = [
  ["Saisir dans n\u2019importe quel champ", "Enter value in any field"],
  ["Saisir dans n'importe quel champ", "Enter value in any field"],
];

var pairsEnc = JSON.stringify(PAIRS).replace(/[\u0080-\uffff]/g, function(c){
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
});

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  var P=' + pairsEnc + ';\n' +
'  function fix(){\n' +
'    var lang=window.lang||"fr";\n' +
'    var pg=document.getElementById("pg-convert");\n' +
'    if(!pg)return;\n' +
'    var w=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT,null,false),ns=[],n;\n' +
'    while(n=w.nextNode())ns.push(n);\n' +
'    ns.forEach(function(nd){\n' +
'      var t=nd.textContent;\n' +
'      if(lang==="en"){\n' +
'        P.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});\n' +
'      } else {\n' +
'        P.forEach(function(p){if(t.indexOf(p[1])!==-1)t=t.split(p[1]).join(p[0]);});\n' +
'      }\n' +
'      if(t!==nd.textContent)nd.textContent=t;\n' +
'    });\n' +
'  }\n' +
'  var lastLang=null;\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setInterval(function(){\n' +
'      var cur=window.lang||"fr";\n' +
'      if(cur!==lastLang){lastLang=cur;fix();}\n' +
'    },400);\n' +
'    [500,1000,2000].forEach(function(t){setTimeout(fix,t);});\n' +
'    var btn=document.getElementById("mn-convert");\n' +
'    if(btn)btn.addEventListener("click",function(){setTimeout(fix,300);setTimeout(fix,800);});\n' +
'  });\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - conv-trad-v1 applique');
