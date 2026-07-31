const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

const PATCH_ID = 'maint-trad-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

var PAIRS = [
  ["Nettoyer filtres a air (eau tiede)", "Clean air filters (lukewarm water)"],
  ["Inspecter serpentin evaporateur", "Inspect evaporator coil"],
  ["Verifier bac et pompe condensats", "Check drain pan and condensate pump"],
  ["Mesurer T soufflage et reprise", "Measure supply and return temperature"],
  ["Controle vitesses ventilateur", "Check fan speeds"],
  ["Nettoyer serpentin condenseur (HP eau)", "Clean condenser coil (HP water)"],
  ["Verifier etat ventilateur ext.", "Check outdoor fan condition"],
  ["Inspecter raccordements tuyauteries", "Inspect pipe connections"],
  ["Mesurer pressions HP/BP", "Measure HP/LP pressures"],
  ["Verifier isolant liaisons frigo", "Check refrigerant line insulation"],
  ["Verifier tension alimentation", "Check supply voltage"],
  ["Mesurer courant absorption compresseur", "Measure compressor current draw"],
  ["Tester telecommande et modes", "Test remote control and modes"],
  ["Verifier cables et bornes", "Check cables and terminals"],
  ["UNITE INTERIEURE", "INDOOR UNIT"],
  ["UNITE EXTERIEURE", "OUTDOOR UNIT"],
  ["ELECTRIQUE", "ELECTRICAL"],
];

var pairsEnc = JSON.stringify(PAIRS).replace(/[\u0080-\uffff]/g, function(c){
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
});

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  var P=' + pairsEnc + ';\n' +
'  function fix(){\n' +
'    var lang=window.lang||"fr";\n' +
'    var pg=document.getElementById("pg-maint");\n' +
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
'  var obs=new MutationObserver(function(){fix();});\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setInterval(function(){\n' +
'      var cur=window.lang||"fr";\n' +
'      if(cur!==lastLang){lastLang=cur;fix();}\n' +
'    },400);\n' +
'    setTimeout(function(){\n' +
'      var pg=document.getElementById("pg-maint");\n' +
'      if(pg)obs.observe(pg,{childList:true,subtree:true});\n' +
'    },1000);\n' +
'    var btn=document.getElementById("mn-maint");\n' +
'    if(btn)btn.addEventListener("click",function(){setTimeout(fix,300);setTimeout(fix,800);});\n' +
'  });\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - maint-trad-v1 applique');
