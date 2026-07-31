const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

const PATCH_ID = 'log-trad-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

var PAIRS = [
  ["Langue basc\u00fcl\u00e9e: FR", "Language switched: FR"],
  ["Langue basc\u00fcl\u00e9e: EN", "Language switched: EN"],
  ["Langue bascu\u00e9e: FR", "Language switched: FR"],
  ["Langue bascu\u00e9e: EN", "Language switched: EN"],
  ["Langue bascul\u00e9e: FR", "Language switched: FR"],
  ["Langue bascul\u00e9e: EN", "Language switched: EN"],
  ["Navigation \u2192 ", "Navigation \u2192 "],
  ["Navigation → HISTORIQUE", "Navigation → HISTORY"],
  ["Navigation → DEVIS", "Navigation → QUOTE"],
  ["Navigation → ACCUEIL", "Navigation → HOME"],
  ["Navigation → CATALOGUE", "Navigation → CATALOG"],
  ["Navigation → FLUIDES", "Navigation → FLUIDS"],
  ["Navigation → CODES", "Navigation → CODES"],
  ["Navigation → NORMES", "Navigation → STANDARDS"],
  ["Navigation → VANNES", "Navigation → VALVES"],
  ["Navigation → HYDRO.", "Navigation → HYD."],
  ["Navigation → CHARGE", "Navigation → COOLING LOAD"],
  ["Navigation → MAINT.", "Navigation → MAINT."],
  ["Navigation → D\u00c9SENFUMAGE", "Navigation → SMOKE EXTRACTION"],
  ["Navigation → CONV.", "Navigation → CONV."],
  ["Navigation → LOTO", "Navigation → LOTO"],
  ["Navigation → RE2020", "Navigation → RE2020"],
  ["Navigation → OBD", "Navigation → OBD"],
  ["Navigation → OCR-IA", "Navigation → OCR-AI"],
  ["Calcul effectu\u00e9", "Calculation done"],
  ["Export PDF", "Export PDF"],
];

var pairsEnc = JSON.stringify(PAIRS).replace(/[\u0080-\uffff]/g, function(c){
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
});

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  var P=' + pairsEnc + ';\n' +
'  function fix(){\n' +
'    var lang=window.lang||"fr";\n' +
'    var pg=document.getElementById("histLog");\n' +
'    if(!pg)return;\n' +
'    var w=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT,null,false),ns=[],n;\n' +
'    while(n=w.nextNode())ns.push(n);\n' +
'    ns.forEach(function(nd){\n' +
'      var t=nd.textContent;\n' +
'      if(lang==="en"){\n' +
'        P.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});\n' +
'      }\n' +
'      if(t!==nd.textContent)nd.textContent=t;\n' +
'    });\n' +
'  }\n' +
'  var obs=new MutationObserver(function(){fix();});\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setTimeout(function(){\n' +
'      var pg=document.getElementById("histLog");\n' +
'      if(pg)obs.observe(pg,{childList:true,subtree:true});\n' +
'    },1000);\n' +
'    setInterval(fix,500);\n' +
'  });\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - log-trad-v1 applique');
