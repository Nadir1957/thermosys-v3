const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

const PATCH_ID = 'flu-trad-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

// PAIRS: [EN_original, FR_translation]
var PAIRS = [
  ["Refrigerant", "R\u00e9frig\u00e9rant"],
  ["Usage", "Utilisation"],
  ["Banned new 2022 (EU)", "Interdit neuf 2022 (UE)"],
  ["Banned new \u2014 GWP > 2500", "Interdit neuf \u2014 GWP > 2500"],
  ["F-Gas compliant 2030+", "Conforme F-Gas 2030+"],
  ["VRF, splits, scroll chillers", "VRF, splits, chillers scroll"],
  ["Residential splits, heat pumps", "Splits r\u00e9sidentiels, PAC"],
  ["Centrifugal chillers (legacy)", "Chillers centrifuges (ancien)"],
  ["Chillers, industrial heat pumps", "Chillers, PAC industrielles"],
  ["Automotive, residential heat pumps", "Automobile, PAC r\u00e9sidentielles"],
  ["Residential HP, cold room", "PAC r\u00e9sidentielle, chambre froide"],
  ["Industry, food processing", "Industrie, agroalimentaire"],
  ["Transcritical, cascade", "Transcritique, cascade"],
  ["Next-gen VRF", "VRF nouvelle g\u00e9n\u00e9ration"],
  ["R22 retrofit (legacy)", "Reconversion R22 (ancien)"],
  ["Commercial cooling (legacy)", "Froid commercial (ancien)"],
  ["Commercial supermarket cooling", "Froid commercial supermarch\u00e9"],
  ["Recommended R410A drop-in", "Substitut direct R410A recommand\u00e9"],
  ["R404A/R507A retrofit", "Reconversion R404A/R507A"],
  ["Natural \u2014 toxic", "Naturel \u2014 toxique"],
  ["Natural \u2014 GWP=1", "Naturel \u2014 GWP=1"],
  ["Natural \u2014 GWP=3", "Naturel \u2014 GWP=3"],
  ["Phase-out 2025+", "\u00c9limination 2025+"],
  ["Phase-out 2027", "\u00c9limination 2027"],
  ["Phase-out 2030", "\u00c9limination 2030"],
  ["Phase-out", "\u00c9limination"],
  ["Drop-in", "Substitut direct"],
  ["HFC GWP > 2500 ban \u2014 hermetic equipment", "Interdiction HFC GWP > 2500 \u2014 \u00e9quipements herm\u00e9tiques"],
  ["R410A banned if charge < 3 kg", "R410A interdit si charge < 3 kg"],
  ["R410A banned residential", "R410A interdit r\u00e9sidentiel"],
  ["HFC ban in new AC installations", "Interdiction HFC dans nouvelles installations clim."],
  ["R32 only authorized splits", "R32 seul autoris\u00e9 splits"],
  ["Net-zero \u2014 total high GWP HFC phase-out", "Net-z\u00e9ro \u2014 \u00e9limination totale HFC fort GWP"],
  ["Natural refrigerants only", "R\u00e9frig\u00e9rants naturels uniquement"],
  ["\u00c9limination 2027 residential", "\u00c9limination 2027 r\u00e9sidentiel"],
];

var pairsEnc = JSON.stringify(PAIRS).replace(/[\u0080-\uffff]/g, function(c){
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
});

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  var P=' + pairsEnc + ';\n' +
'  function fix(){\n' +
'    var lang=window.lang||"fr";\n' +
'    var pg=document.getElementById("pg-fluides");\n' +
'    if(!pg)return;\n' +
'    var w=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT,null,false),ns=[],n;\n' +
'    while(n=w.nextNode())ns.push(n);\n' +
'    ns.forEach(function(nd){\n' +
'      var t=nd.textContent;\n' +
'      if(lang==="en"){\n' +
'        P.forEach(function(p){if(t.indexOf(p[1])!==-1)t=t.split(p[1]).join(p[0]);});\n' +
'      } else {\n' +
'        P.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});\n' +
'      }\n' +
'      if(t!==nd.textContent)nd.textContent=t;\n' +
'    });\n' +
'  }\n' +
'  var lastLang=null;\n' +
'  var obs=new MutationObserver(function(){fix();});\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setInterval(function(){\n' +
'      var cur=window.lang||"fr";\n' +
'      if(cur!==lastLang){lastLang=cur;fix();}\n' +
'      fix();\n' +
'    },400);\n' +
'    setTimeout(function(){\n' +
'      var pg=document.getElementById("pg-fluides");\n' +
'      if(pg)obs.observe(pg,{childList:true,subtree:true});\n' +
'    },1000);\n' +
'    var btn=document.getElementById("mn-fluides");\n' +
'    if(btn)btn.addEventListener("click",function(){setTimeout(fix,300);setTimeout(fix,800);});\n' +
'  });\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - flu-trad-v1 applique - ' + PAIRS.length + ' paires');
