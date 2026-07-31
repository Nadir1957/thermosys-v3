// Patch consolide - Session 14 juillet 2026
// Regroupe fix1.cjs a fix18.cjs (F-GAS bidirectionnel + SCOP/COP bidirectionnel complet)
// Genere automatiquement le 15 juillet 2026

// ===== fix1.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = ']t2025-dynamic-trad">';
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve - deja corrige ou texte different');
} else {
  h = h.replace(marker, ']\n</script>\n<script id="rt2025-dynamic-trad">');
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Bug1 corrige');
}
}

// ===== fix2.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const before = h.length;
h = h.replace(/<script id="protect-v1">[\s\S]*?<\/script>\s*/, '');
fs.writeFileSync('dist/index.html', h, 'utf8');
console.log('Protection retiree. Taille avant/apres:', before, h.length);
}

// ===== fix3.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "'Interdiction HFC dans nouvelles installations clim.': 'HFC ban in new AC installations'\n  };";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "'Interdiction HFC dans nouvelles installations clim.': 'HFC ban in new AC installations',\n    'Mesure': 'Measure',\n    'R\u00e9frig\u00e9rants naturels uniquement': 'Natural refrigerants only'\n  };";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix3 applique - Mesure et Refrigerants naturels ajoutes');
}
}

// ===== fix4.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "'R\u00e9frig\u00e9rants naturels uniquement': 'Natural refrigerants only'";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = marker + ",\n    'Refrigerants naturels uniquement': 'Natural refrigerants only'";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix4 applique');
}
}

// ===== fix5.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = 'function toFR(){\n  if(isEN()||busy)return;\n  busy=true;\n  var pg=document.getElementById("pg-rt2025");\n  if(pg&&snap)pg.innerHTML=snap;updateDatePlaceholder("fr");\n  setTimeout(function(){busy=false;},200);\n}';
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = 'function toFR(){\n  if(isEN()||busy)return;\n  busy=true;\n  var pg=document.getElementById("pg-rt2025");\n  if(pg&&snap)pg.innerHTML=snap;\n  var pf=document.getElementById("pg-fluides");\n  if(pf)applyD(pf,false);\n  var ps=document.getElementById("pg-scop");\n  if(ps)applyD(ps,false);\n  var pv=document.getElementById("pg-vannes");\n  if(pv)applyD(pv,false);\n  var pc2=document.getElementById("pg-convert");\n  if(pc2)applyD(pc2,false);\n  updateDatePlaceholder("fr");\n  setTimeout(function(){busy=false;},200);\n}';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix5 applique');
}
}

// ===== fix6.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "  function translateEl(el) {\n    if (!el) return;\n    el.querySelectorAll('td, th').forEach(function(cell) {\n      var txt = cell.textContent.trim();\n      if (DICT[txt]) cell.textContent = DICT[txt];\n    });\n  }\n\n  function applyAll() {\n    if ((window.lang || 'fr') !== 'en') return;\n    translateEl(document.getElementById('refTable'));\n    translateEl(document.getElementById('oilTable'));\n    var fgas = document.getElementById('fgasContent');\n    if (fgas) translateEl(fgas);\n  }";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "  var DICT_REV = {};\n  for (var k in DICT) { if (!(DICT[k] in DICT_REV)) DICT_REV[DICT[k]] = k; }\n\n  function translateEl(el, dict) {\n    if (!el) return;\n    el.querySelectorAll('td, th').forEach(function(cell) {\n      var txt = cell.textContent.trim();\n      if (dict[txt]) cell.textContent = dict[txt];\n    });\n  }\n\n  function applyAll() {\n    var l = window.lang || 'fr';\n    var dict = l === 'en' ? DICT : DICT_REV;\n    translateEl(document.getElementById('refTable'), dict);\n    translateEl(document.getElementById('oilTable'), dict);\n    var fgas = document.getElementById('fgasContent');\n    if (fgas) translateEl(fgas, dict);\n  }";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix6 applique - traduction bidirectionnelle activee');
}
}

// ===== fix7.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const markerFn = "  function translateEl(el) {\n    if (!el || !isEn() || isTranslating) return;\n    try {\n      var txt = el.textContent;\n      var changed = false;\n      DICT.forEach(function(p) {\n        if (txt.indexOf(p[0]) !== -1) { txt = txt.split(p[0]).join(p[1]); changed = true; }\n      });\n      if (changed) {\n        isTranslating = true;\n        el.textContent = txt;\n        setTimeout(function(){ isTranslating = false; }, 150);\n      }\n    } catch(e) { isTranslating = false; }\n  }";

const markerPoll = "        if (cur === 'en') {\n          ['scopResult','depResult','costResult','roiResult'].forEach(function(id) {\n            translateEl(document.getElementById(id));\n          });\n        }";

if (h.indexOf(markerFn) === -1 || h.indexOf(markerPoll) === -1) {
  console.log('Marqueur non trouve - fn:', h.indexOf(markerFn), 'poll:', h.indexOf(markerPoll));
} else {
  const replacementFn = "  function translateEl(el) {\n    if (!el || isTranslating) return;\n    try {\n      var fwd = isEn();\n      var txt = el.textContent;\n      var changed = false;\n      DICT.forEach(function(p) {\n        var s = fwd ? p[0] : p[1];\n        var d = fwd ? p[1] : p[0];\n        if (s && txt.indexOf(s) !== -1) { txt = txt.split(s).join(d); changed = true; }\n      });\n      if (changed) {\n        isTranslating = true;\n        el.textContent = txt;\n        setTimeout(function(){ isTranslating = false; }, 150);\n      }\n    } catch(e) { isTranslating = false; }\n  }";
  const replacementPoll = "        ['scopResult','depResult','costResult','roiResult'].forEach(function(id) {\n          translateEl(document.getElementById(id));\n        });";
  h = h.replace(markerFn, replacementFn);
  h = h.replace(markerPoll, replacementPoll);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix7 applique - SCOP bidirectionnel active');
}
}

// ===== fix8.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const marker = "  function translateRoiResult() {\n    var el = document.getElementById('roiResult');\n    if (!el || !isEn()) return;\n    var txt = el.textContent;\n    var changed = false;\n    Object.keys(DICT).forEach(function(fr) {\n      if (txt.indexOf(fr) !== -1) { txt = txt.split(fr).join(DICT[fr]); changed = true; }\n    });\n    if (changed) {\n      isTranslating = true;\n      el.textContent = txt;\n      setTimeout(function(){ isTranslating = false; }, 150);\n    }\n  }";

if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "  var ROI_PAIRS = [\n    ['RENTABILITE PAC','HEAT PUMP ROI'],\n    ['Cout energie PAC/an','HP energy cost/year'],\n    ['Cout energie gaz/an','Gas energy cost/year'],\n    ['Economie annuelle','Annual savings'],\n    ['Surcout installation','Extra install cost'],\n    ['Retour investissement','Payback period'],\n    ['Gain net 10 ans','Net gain 10 years'],\n    ['OK Investissement rentable','OK Profitable investment'],\n    ['Investissement non rentable','Not profitable'],\n    ['kWh/an','kWh/year']\n  ];\n\n  function translateRoiResult() {\n    var el = document.getElementById('roiResult');\n    if (!el) return;\n    var fwd = isEn();\n    var txt = el.textContent;\n    var changed = false;\n    ROI_PAIRS.forEach(function(p) {\n      var s = fwd ? p[0] : p[1];\n      var d = fwd ? p[1] : p[0];\n      if (txt.indexOf(s) !== -1) { txt = txt.split(s).join(d); changed = true; }\n    });\n    if (changed) {\n      isTranslating = true;\n      el.textContent = txt;\n      setTimeout(function(){ isTranslating = false; }, 150);\n    }\n  }";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix8 applique - ROI bidirectionnel avec bonnes paires');
}
}

// ===== fix9.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const marker = "\r\n\r\n// Traduction costResult EN\r\nsetInterval(function() {\r\n  var lbl = document.getElementById('langLbl');\r\n  if (!lbl) return;\r\n  var isEN = lbl.textContent.trim() === 'EN';\r\n  if (!isEN) return;\r\n  var el = document.getElementById('costResult');\r\n  if (!el) return;\r\n  var txt = el.textContent || '';\r\n  if (!txt || txt.length < 20) return;\r\n  if (txt.indexOf('RESULTS') >= 0) return;\r\n  if (txt.indexOf('RÉSULTATS') < 0 && txt.indexOf('Consommation') < 0) return;\r\n  var tr = [\r\n    ['RÉSULTATS','RESULTS'],\r\n    ['Consommation élec.','Electricity consumption'],\r\n    ['COÛT ANNUEL','ANNUAL COST'],\r\n    ['Coût mensuel moyen','Average monthly cost'],\r\n    ['Coût journalier','Daily cost'],\r\n    ['Coût horaire','Hourly cost'],\r\n    ['TARIF APPLIQUÉ','APPLIED RATE'],\r\n    ['Devise','Currency'],\r\n    ['Classe efficacité','Efficiency class'],\r\n    ['Très efficace','Very efficient'],\r\n    ['Peu efficace','Low efficiency'],\r\n    ['Efficace','Efficient'],\r\n    ['SOURCE TARIFAIRE','TARIFF SOURCE'],\r\n    ['RENTABILITE PAC','HEAT PUMP ROI'],\r\n    ['Cout energie PAC/an','HP energy cost/year'],\r\n    ['Cout energie gaz/an','Gas energy cost/year'],\r\n    ['Economie annuelle','Annual savings'],\r\n    ['Surcout installation','Extra install cost'],\r\n    ['Retour investissement','Payback period'],\r\n    ['Gain net 10 ans','Net gain 10 years'],\r\n    ['OK Investissement rentable','OK Profitable investment'],\r\n    ['Investissement non rentable','Not profitable'],\r\n    ['kWh/an','kWh/year'],\r\n    ['DA/jour','DA/day'],\r\n    ['kDA/mois','kDA/month'],\r\n    ['ans ','years ']\r\n  ];\r\n  tr.forEach(function(t) { txt = txt.split(t[0]).join(t[1]); });\r\n  el.textContent = txt;\r\n}, 800);\r\n\r\n";

if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "\r\n\r\n// Traduction costResult bidirectionnelle\r\nvar costTranslating = false;\r\nsetInterval(function() {\r\n  if (costTranslating) return;\r\n  var lbl = document.getElementById('langLbl');\r\n  if (!lbl) return;\r\n  var isEN = lbl.textContent.trim() === 'EN';\r\n  var el = document.getElementById('costResult');\r\n  if (!el) return;\r\n  var txt = el.textContent || '';\r\n  if (!txt || txt.length < 20) return;\r\n  var tr = [\r\n    ['RÉSULTATS','RESULTS'],\r\n    ['Consommation élec.','Electricity consumption'],\r\n    ['COÛT ANNUEL','ANNUAL COST'],\r\n    ['Coût mensuel moyen','Average monthly cost'],\r\n    ['Coût journalier','Daily cost'],\r\n    ['Coût horaire','Hourly cost'],\r\n    ['TARIF APPLIQUÉ','APPLIED RATE'],\r\n    ['Devise','Currency'],\r\n    ['Classe efficacité','Efficiency class'],\r\n    ['Très efficace','Very efficient'],\r\n    ['Peu efficace','Low efficiency'],\r\n    ['Efficace','Efficient'],\r\n    ['SOURCE TARIFAIRE','TARIFF SOURCE'],\r\n    ['Émissions CO₂/an','CO₂ Emissions/yr'],\r\n    ['kWh/an','kWh/year'],\r\n    ['DA/jour','DA/day'],\r\n    ['kDA/mois','kDA/month'],\r\n    ['ans ','years ']\r\n  ];\r\n  var changed = false;\r\n  tr.forEach(function(t) {\r\n    var s = isEN ? t[0] : t[1];\r\n    var d = isEN ? t[1] : t[0];\r\n    if (txt.indexOf(s) !== -1) { txt = txt.split(s).join(d); changed = true; }\r\n  });\r\n  if (changed) {\r\n    costTranslating = true;\r\n    el.textContent = txt;\r\n    setTimeout(function(){ costTranslating = false; }, 150);\r\n  }\r\n}, 800);\r\n\r\n";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix9 applique - costResult bidirectionnel');
}
}

// ===== fix10.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "['kWh/an','kWh/year']\n  ];\n\n  function translateRoiResult()";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "['kWh/an','kWh/year'],\n    ['Long amortissement','Long payback']\n  ];\n\n  function translateRoiResult()";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix10 applique');
}
}

// ===== fix11.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const startMarker = '<script id="rt2025-dynamic-trad">';
const start = h.indexOf(startMarker);
if (start === -1) {
  console.log('Script non trouve');
} else {
  const end = h.indexOf('</script>', start);
  if (end === -1) {
    console.log('Fin de script non trouvee');
  } else {
    const scriptContent = h.slice(start, end);
    if (scriptContent.indexOf('})();') !== -1) {
      console.log('Script trouve mais SAIN (contient })();) - AUCUNE suppression, deja correct');
    } else {
      const removed = h.slice(start, end + 9);
      fs.writeFileSync('removed_rt2025_script_backup.txt', removed, 'utf8');
      h = h.slice(0, start) + h.slice(end + 9);
      fs.writeFileSync('dist/index.html', h, 'utf8');
      console.log('Fix11 applique - script CASSE (sans fermeture) retire, sauvegarde dans removed_rt2025_script_backup.txt');
    }
  }
}
}

// ===== fix12.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = '["H\u00e6\u00efti","Haiti"],null];';
const marker2 = '["Ha\u00efti","Haiti"],null];';
let found = false;
if (h.indexOf(marker2) !== -1) {
  h = h.replace(marker2, '["Ha\u00efti","Haiti"]];');
  found = true;
} else if (h.indexOf(marker) !== -1) {
  h = h.replace(marker, '["H\u00e6\u00efti","Haiti"]];');
  found = true;
}
if (!found) {
  console.log('Marqueur non trouve - tentative regex generique');
  const before = h.length;
  h = h.replace(/,null\]\;\nvar busy=false/, '];\nvar busy=false');
  const after = h.length;
  if (before !== after) {
    console.log('Corrige via regex generique');
    fs.writeFileSync('dist/index.html', h, 'utf8');
  } else {
    console.log('Echec - aucune correction appliquee');
  }
} else {
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix12 applique - entree null retiree du tableau D');
}
}

// ===== fix13.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const markerEN = '  var ps=document.getElementById("pg-scop");\n  if(ps)applyD(ps,true);\n';
const markerFR = '  var ps=document.getElementById("pg-scop");\n  if(ps)applyD(ps,false);\n';

let count = 0;
if (h.indexOf(markerEN) !== -1) { h = h.replace(markerEN, ''); count++; }
if (h.indexOf(markerFR) !== -1) { h = h.replace(markerFR, ''); count++; }

if (count === 0) {
  console.log('Aucun marqueur trouve');
} else {
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix13 applique - pg-scop retire de applyD (' + count + ' occurrences)');
}
}

// ===== fix14.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "['Long amortissement','Long payback']\n  ];";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "['Long amortissement','Long payback'],\n    [' ans', ' years']\n  ];";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix14 applique - regle generique ans/years ajoutee');
}
}

// ===== fix15.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const marker = 'function applyD(root,fwd){\n  if(!root)return;\n  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),nodes=[],n;\n  while(n=w.nextNode())nodes.push(n);\n  nodes.forEach(function(nd){\n    var o=nd.textContent,t=o;\n    D.forEach(function(p){var s=fwd?p[0]:p[1],d=fwd?p[1]:p[0];if(t.indexOf(s)!==-1)t=t.split(s).join(d);});\n    if(t!==o)nd.textContent=t;\n  });\n}';

if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = 'function applyD(root,fwd){\n  if(!root)return;\n  var EXCLUDE_IDS=["roiResult","costResult","depResult","scopResult"];\n  function isExcluded(nd){\n    var el=nd.parentElement;\n    while(el){\n      if(el.id && EXCLUDE_IDS.indexOf(el.id)!==-1)return true;\n      el=el.parentElement;\n    }\n    return false;\n  }\n  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),nodes=[],n;\n  while(n=w.nextNode())nodes.push(n);\n  nodes.forEach(function(nd){\n    if(isExcluded(nd))return;\n    var o=nd.textContent,t=o;\n    D.forEach(function(p){var s=fwd?p[0]:p[1],d=fwd?p[1]:p[0];if(t.indexOf(s)!==-1)t=t.split(s).join(d);});\n    if(t!==o)nd.textContent=t;\n  });\n}';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix15 applique - roiResult/costResult/depResult/scopResult exclus de applyD');
}
}

// ===== fix16.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const marker = 'function toFR(){\n  if(isEN()||busy)return;\n  busy=true;\n  var pg=document.getElementById("pg-rt2025");\n  if(pg&&snap)pg.innerHTML=snap;\n  var pf=document.getElementById("pg-fluides");';

if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = 'function toFR(){\n  if(isEN()||busy)return;\n  busy=true;\n  var PRESERVE_IDS=["roiResult","costResult","depResult","scopResult"];\n  var preserved={};\n  PRESERVE_IDS.forEach(function(id){\n    var el=document.getElementById(id);\n    if(el)preserved[id]=el.innerHTML;\n  });\n  var pg=document.getElementById("pg-rt2025");\n  if(pg&&snap)pg.innerHTML=snap;\n  PRESERVE_IDS.forEach(function(id){\n    if(preserved[id]!==undefined){\n      var el=document.getElementById(id);\n      if(el)el.innerHTML=preserved[id];\n    }\n  });\n  var pf=document.getElementById("pg-fluides");';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix16 applique - preservation roiResult/costResult/depResult/scopResult a travers snap restore');
}
}

// ===== fix17.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "[' ans', ' years']\n  ];";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "[' ans', ' years'],\n    ['RENTABILITE PAC','PAC PROFITABILITY'],\n    ['Cout energie PAC/an','PAC energy cost/yr'],\n    ['Cout energie gaz/an','Gas energy cost/yr'],\n    ['Economie annuelle','Annual saving'],\n    ['Retour investissement','Return on investment'],\n    [' ans',' yrs']\n  ];";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix17 applique - alias natifs ajoutes');
}
}

// ===== fix18.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = 'btn.id="scop-pdf-btn";\n    btn.className="btn bp";\n    btn.style.cssText="width:100%;margin-top:8px;";\n    btn.innerHTML="\\uD83D\\uDCC4 "+(window.lang==="en"?"Export PDF":"Exporter PDF");\n    btn.onclick=exportScopPDF;\n    res.parentNode.insertBefore(btn,res.nextSibling);';
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = 'btn.id="scop-pdf-btn";\n    btn.className="btn bp";\n    btn.style.cssText="width:100%;margin-top:8px;";\n    btn.innerHTML="\\uD83D\\uDCC4 "+(window.lang==="en"?"Export PDF":"Exporter PDF");\n    btn.onclick=exportScopPDF;\n    res.parentNode.insertBefore(btn,res.nextSibling);\n    setInterval(function(){btn.innerHTML="\\uD83D\\uDCC4 "+(window.lang==="en"?"Export PDF":"Exporter PDF");},1000);';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix18 applique - rafraichissement bouton PDF SCOP ajoute');
}
}

// ===== fix21.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = "['Resultat SCOP', 'SCOP Result'],\n    ['Verification RE2020', 'RE2020 Check'],\n    ['Resultat cout', 'Cost result'],\n    ['kWh/an', 'kWh/yr']\n  ];";
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = "['Resultat SCOP', 'SCOP Result'],\n    ['Verification RE2020', 'RE2020 Check'],\n    ['Resultat cout', 'Cost result'],\n    ['kWh/an', 'kWh/yr'],\n    ['R\u00e9sidentiel individuel', 'Individual residential'],\n    ['kWhEP/m\u00b2/an', 'kWhEP/m\u00b2/yr']\n  ];";
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix21 applique - paires manquantes ajoutees au DICT depResult');
}
}

// ===== fix22.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = '<div style="font-size:9.5px;color:var(--tm)">ISO 14118:2018 \u00a75.3 \u2014 Energie emmagasinee</div>';
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = '<div style="font-size:9.5px;color:var(--tm)" data-fr="ISO 14118:2018 \u00a75.3 \u2014 \u00c9nergie emmagasin\u00e9e" data-en="ISO 14118:2018 \u00a75.3 \u2014 Stored energy">ISO 14118:2018 \u00a75.3 \u2014 \u00c9nergie emmagasin\u00e9e</div>';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix22 applique - data-fr/data-en ajoutes pour Energie emmagasinee');
}
}

// ===== fix23.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const markerFr = "'t_cat_diff':a0_0x2df16a(0x1135)},'en':{";
const markerEn = "'t_ocr_bar':a0_0x2df16a(0x18e)}};function";

let count = 0;
if (h.indexOf(markerFr) !== -1) {
  h = h.replace(markerFr, "'t_cat_diff':a0_0x2df16a(0x1135),'t_cod_title':'CODES ERREURS HVAC','cbALL':'Tous'},'en':{");
  count++;
} else {
  console.log('Marqueur FR non trouve');
}

if (h.indexOf(markerEn) !== -1) {
  h = h.replace(markerEn, "'t_ocr_bar':a0_0x2df16a(0x18e),'cbALL':'All'}};function");
  count++;
} else {
  console.log('Marqueur EN non trouve');
}

if (count === 2) {
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix23 applique - t_cod_title (FR) et cbALL (FR+EN) ajoutes');
} else {
  console.log('Echec partiel - aucune ecriture, count=' + count);
}
}

// ===== fix24.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');

const marker1 = '<div class="ph">QUICK SEARCH</div>';
const marker2 = '<input class="fi" id="codeSearch" placeholder="Code, brand or description..." oninput="filterCodes()" style="width:100%">';

let count = 0;
if (h.indexOf(marker1) !== -1) {
  h = h.replace(marker1, '<div class="ph" data-fr="RECHERCHE RAPIDE" data-en="QUICK SEARCH">QUICK SEARCH</div>');
  count++;
} else {
  console.log('Marqueur 1 non trouve');
}

if (h.indexOf(marker2) !== -1) {
  h = h.replace(marker2, '<input class="fi" id="codeSearch" placeholder="Code, brand or description..." data-fr="Code, marque ou description..." data-en="Code, brand or description..." oninput="filterCodes()" style="width:100%">');
  count++;
} else {
  console.log('Marqueur 2 non trouve');
}

if (count === 2) {
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix24 applique - QUICK SEARCH et placeholder ajoutes');
} else {
  console.log('Echec partiel - count=' + count);
}
}

// ===== fix25.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = '<th>Marque</th><th>Code</th><th id="err-fr-th">Description</th><th id="err-en-th">EN</th><th>Cause / Action</th><th id="err-urg-th">Priority</th>';
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = '<th data-fr="Marque" data-en="Brand">Marque</th><th>Code</th><th id="err-fr-th">Description</th><th id="err-en-th">EN</th><th data-fr="Cause / Action" data-en="Cause / Action">Cause / Action</th><th id="err-urg-th">Priority</th>';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix25 applique - Marque traduisible ajoute');
}
}

// ===== fix26.cjs =====
{
const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const marker = '["Fonctionnement normal.","Normal operation."],["NTC UC hors plage.","IDU NTC out of range."]];';
if (h.indexOf(marker) === -1) {
  console.log('Marqueur non trouve');
} else {
  const replacement = '["Fonctionnement normal.","Normal operation."],["NTC UC hors plage.","IDU NTC out of range."],["Condenseur encrass\u00e9, d\u00e9bit insuffisant.","Dirty condenser, insufficient airflow."],["Condenseur encrass\u00e9, ventilateur HS.","Dirty condenser, fan faulty."]];';
  h = h.replace(marker, replacement);
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('Fix26 applique - paires Hisense F1 et Gree E1 ajoutees');
}
}

