const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');
const PATCH_ID = 'fix-re2020-tab-buttons';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

var CARRIER_PAIRS = [
  ["\u00c9TAPE 1 \u2014 Pr\u00e9paration :", "STEP 1 \u2014 Preparation:"],
  ["Confirmer pompe en marche (amp\u00e8rem\u00e8tre ou bornier)", "Confirm pump is running (ammeter or terminal block)"],
  ["V\u00e9rifier manom\u00e8tre c\u00f4t\u00e9 aspiration pompe", "Check pressure gauge on pump suction side"],
  ["\u0394P \u00e9vaporateur nominal =", "Nominal evaporator \u0394P ="],
  ["Point EVWT (Temp. eau d\u00e9part) \u00b7 EWRT (Eau entr\u00e9e)", "Point EVWT (Supply water temp.) \u00b7 EWRT (Inlet water)"],
  ["Consigne d\u00e9bit min : param\u00e8tre", "Min flow setpoint: parameter"],
  ["(d\u00e9faut = 5 sec)", "(default = 5 sec)"],
  ["30 \u00e0 500 kW", "30 to 500 kW"],
  ["CTLPNT : consigne eau glac\u00e9e", "CTLPNT: chilled water setpoint"],
];

var pairsEnc = JSON.stringify(CARRIER_PAIRS).replace(/[\u0080-\uffff]/g, function(c){
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
});

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  var TABS={\n' +
'    "ret-audit":{fr:"\uD83D\uDD0D Audit Conformit\u00E9",en:"\uD83D\uDD0D Compliance Audit"},\n' +
'    "ret-hyd":{fr:"\uD83D\uDCA7 MES Hydraulique",en:"\uD83D\uDCA7 Hydraulic Commissioning"}\n' +
'  };\n' +
'  var CP=' + pairsEnc + ';\n' +
'  function getActiveTab(){var a=document.querySelector("#re-tabs .tab.active");return a?a.id:null;}\n' +
'  function restoreTab(id){\n' +
'    if(!id)return;\n' +
'    var tab=id.replace("ret-","");\n' +
'    if(typeof re2020Tab==="function")re2020Tab(tab);\n' +
'  }\n' +
'  function fixCarrier(){\n' +
'    var pg=document.getElementById("pg-rt2025");\n' +
'    if(!pg)return;\n' +
'    var w=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT,null,false),ns=[],n;\n' +
'    while(n=w.nextNode())ns.push(n);\n' +
'    ns.forEach(function(nd){\n' +
'      var t=nd.textContent;\n' +
'      CP.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});\n' +
'      if(t!==nd.textContent)nd.textContent=t;\n' +
'    });\n' +
'  }\n' +
'  function applyTabTrad(){var lblArea=document.getElementById("lbl-area");if(lblArea)lblArea.textContent=(window.lang==="en"?"Area (m²):":"Surface (m²):");\n' +
'    var isEn=(window.lang||document.documentElement.getAttribute("lang")||"fr")==="en";\n' +
'    Object.keys(TABS).forEach(function(id){\n' +
'      var el=document.getElementById(id);\n' +
'      if(el)el.innerHTML=isEn?TABS[id].en:TABS[id].fr;\n' +
'    });\n' +
'    if(isEn)fixCarrier();\n' +
'  }\n' +
'  function hookToggleLang(){\n' +
'    var orig=window.toggleLang;\n' +
'    if(!orig||orig._re2020Hook)return;\n' +
'    window.toggleLang=function(){\n' +
'      var savedTab=getActiveTab();\n' +
'      orig.apply(this,arguments);\n' +
'      setTimeout(function(){\n' +
'        applyTabTrad();\n' +
'        restoreTab(savedTab);\n' +
'      },400);\n' +
'    };\n' +
'    window.toggleLang._re2020Hook=true;\n' +
'  }\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setInterval(hookToggleLang,500);\n' +
'    setTimeout(applyTabTrad,800);\n' +
'    setTimeout(applyTabTrad,2000);\n' +
'    setTimeout(applyTabTrad,4000);\n' +
'  });\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - fix-re2020-tab-buttons applique');
