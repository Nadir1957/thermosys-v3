const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');
const PATCH_ID = 'hyd-trad-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
}

var PAIRS = [
  ["\u00d8 th\u00e9orique:", "\u00d8 theoretical:"],
  ["Vitesse r\u00e9elle", "Actual velocity"],
  ["Calculer PDC", "Calculate PDC"],
  ["Calculer vase", "Calculate vessel"],
  ["P hydraulique:", "Hydraulic power:"],
  ["P \u00e9lectrique:", "Electric power:"],
  ["Moteur recommand\u00e9:", "Recommended motor:"],
  ["NPSH estim\u00e9:", "Estimated NPSH:"],
  ["P gonflage:", "Inflation pressure:"],
  ["P soupape:", "Relief valve:"],
  ["VOLUME VASE:", "VESSEL VOLUME:"],
  ["Normalis\u00e9:", "Normalized:"],
  ["\u00d8 min:", "Min \u00d8:"],
  ["DN s\u00e9lectionn\u00e9:", "Selected DN:"],
  ["Vol. min (temps s\u00e9jour", "Min vol. (residence time"],
  ["H min = 3\u00d7\u00d8:", "H min = 3\u00d7\u00d8:"],
  ["D\u00e9bit/circuit:", "Flow/circuit:"],
  ["\u00d8 corps:", "Body \u00d8:"],
  ["Longueur min:", "Min length:"],
  ["Espacement piquages:", "Connection spacing:"],
  ["R\u00e9sultat d\u00e9bit", "Flow result"],
  ["R\u00e9sultat PDC", "PDC result"],
  ["R\u00e9sultat pompe", "Pump result"],
  ["R\u00e9sultat vase", "Vessel result"],
  ["R\u00e9sultat s\u00e9parateur", "Separator result"],
  ["R\u00e9sultat collecteur", "Manifold result"],
  ["Saisir les donn\u00e9es et calculer", "Enter data and calculate"],
  ["Renseigner les donn\u00e9es et g\u00e9n\u00e9rer", "Enter data and generate"],
  ["Appara\u00eetront apr\u00e8s calcul", "Will appear after calculation"],
  ["GUIDE PR\u00c9R\u00c9GLAGE HYDRAULIQUE \u2014 EN 14336 / EN ISO 4064", "HYDRAULIC PRE-SETTING GUIDE \u2014 EN 14336 / EN ISO 4064"],
  ["Calculateur \u0394P/D\u00e9bit", "\u0394P/Flow calculator"],
  ["Paliers de R\u00e9glage", "Setting levels"],
  ["Confort \u00e9t\u00e9 (DH)", "Summer comfort (DH)"],
  ["DONN\u00c9ES CIRCUIT", "CIRCUIT DATA"],
  ["Puissance (kW) :", "Power (kW):"],
  ["\u0394T nominal (\u00b0C) :", "Nominal \u0394T (\u00b0C):"],
  ["Longueur \u00e9quiv. (m) :", "Equiv. length (m):"],
  ["Fluide :", "Fluid:"],
  ["Eau (1000 kg/m\u00b3)", "Water (1000 kg/m\u00b3)"],
  ["R\u00e9gime :", "Regime:"],
  ["R\u00e9gime:", "Regime:"],
  ["Haute T\u00b0 80/60\u00b0C", "High temp 80/60\u00b0C"],
  ["Moyenne T\u00b0 60/40\u00b0C", "Medium temp 60/40\u00b0C"],
  ["Basse T\u00b0 45/35\u00b0C (PAC)", "Low temp 45/35\u00b0C (HP)"],
  ["Froid 7/12\u00b0C (chiller)", "Cold 7/12\u00b0C (chiller)"],
  ["Froid 14/18\u00b0C (poutres)", "Cold 14/18\u00b0C (beams)"],
  ["Vanne \u00e9quilibrage :", "Balancing valve:"],
  ["G\u00e9n\u00e9rique (Kvs manuel)", "Generic (manual Kvs)"],
  ["Calculer \u0394P & Pr\u00e9r\u00e9glage", "Calculate \u0394P & Pre-setting"],
  ["\u0394P & Pr\u00e9r\u00e9glage", "\u0394P & Pre-setting"],
  ["Marque :", "Brand:"],
  ["R\u00c9SULTATS", "RESULTS"],
  ["D\u00e9bit Q", "Flow Q"],
  ["Vitesse:", "Velocity:"],
  ["Kv requis", "Required Kv"],
  ["\u0394P vanne", "Valve \u0394P"],
  ["Autorit\u00e9 N", "Authority N"],
  ["Bonne r\u00e9gulation", "Good regulation"],
  ["Palier recommand\u00e9: PALIER", "Recommended setting: SETTING"],
  ["Kv palier", "Setting Kv"],
  ["Palier\t", "Setting\t"],
  ["Vanne\t", "Valve\t"],
  ["Vitesse\t", "Velocity\t"],
  ["Ouv.%", "Open.%"],
  ["G\u00c9N\u00c9RATEUR TABLE PALIERS", "SETTING TABLE GENERATOR"],
  ["D\u00e9bit nominal (m\u00b3/h) :", "Nominal flow (m\u00b3/h):"],
  ["\u0394P disponible (kPa) :", "Available \u0394P (kPa):"],
  ["Kvs vanne (m\u00b3/h) :", "Valve Kvs (m\u00b3/h):"],
  ["G\u00e9n\u00e9rer paliers", "Generate settings"],
  ["PALIERS DE R\u00c9F\u00c9RENCE CONSTRUCTEUR", "MANUFACTURER REFERENCE SETTINGS"],
  ["Branches terminales", "Terminal branches"],
  ["Colonnes montantes", "Rising columns"],
  ["Antennes", "Branches"],
  ["Collecteur g\u00e9n\u00e9ral", "Main collector"],
  ["TABLE PALIERS CALCUL\u00c9E", "CALCULATED SETTINGS TABLE"],
  ["Autorit\u00e9", "Authority"],
  ["Cible", "Target"],
  ["Heures inconf\u00f4rt / jour :", "Discomfort hours/day:"],
  ["CALCULATEUR DEGR\u00c9S-HEURES \u2014 EN 15251", "DEGREE-HOURS CALCULATOR \u2014 EN 15251"],
  ["T\u00b0 ext. max (\u00b0C) :", "Max outdoor temp (\u00b0C):"],
  ["T\u00b0 int. constat\u00e9e (\u00b0C) :", "Indoor temp (\u00b0C):"],
  ["T\u00b0 confort max (\u00b0C) :", "Max comfort temp (\u00b0C):"],
  ["Jours saison chaude :", "Hot season days:"],
  ["Cat\u00e9gorie EN 15251 :", "EN 15251 Category:"],
  ["Cat. I \u2014 H\u00f4pital/cr\u00e8che (\u2264100 DH)", "Cat. I \u2014 Hospital/nursery (\u2264100 DH)"],
  ["Cat. II \u2014 R\u00e9sidentiel neuf (\u2264300 DH)", "Cat. II \u2014 New residential (\u2264300 DH)"],
  ["Cat. III \u2014 Existant r\u00e9nov\u00e9 (\u2264600 DH)", "Cat. III \u2014 Renovated existing (\u2264600 DH)"],
  ["Calculer DH & Confort", "Calculate DH & Comfort"],
  ["R\u00c9SULTATS CONFORT \u00c9T\u00c9", "SUMMER COMFORT RESULTS"],
  ["RESULTS CONFORT \u00c9T\u00c9", "SUMMER COMFORT RESULTS"],
  ["T\u00b0 ext\u00e9rieure max :", "Max outdoor temp:"],
  ["T\u00b0 int\u00e9rieure", "Indoor temp"],
  ["T\u00b0 limite confort", "Comfort limit temp"],
  ["8h/j \u00d7 90 jours", "8h/d \u00d7 90 days"],
  ["DH calcul\u00e9", "Calculated DH"],
  ["DH limite cat.", "Category DH limit"],
  ["NON CONFORME \u2014 D\u00e9passement:", "NON-COMPLIANT \u2014 Exceedance:"],
  ["DH surchauffe s\u00e8v.", "Severe overheating DH"],
  ["DH surchauffe s\u00e9v.", "Severe overheating DH"],
  ["Puissance clim. estim\u00e9e", "Estimated cooling power"],
  ["Consommation \u00e9lec/an", "Annual elec. consumption"],
  ["Surf. conditionn\u00e9e", "Conditioned area"],
  ["SEUILS EN 15251", "EN 15251 THRESHOLDS"],
  ["Usage", "Use"],
  ["H\u00f4pital, cr\u00e8che", "Hospital, nursery"],
  ["Logement neuf, bureaux", "New housing, offices"],
  ["B\u00e2timent existant", "Existing building"],
  ["Rafra\u00eechissement requis", "Cooling required"],
  ["RECOMMANDATIONS", "RECOMMENDATIONS"],
  ["Climatisation obligatoire \u2014 puissance min:", "Air conditioning required \u2014 min power:"],
  ["Brasseurs d'air : r\u00e9duction ressentie -2 \u00e0 -4\u00b0C (co\u00fbt : ~25W/pi\u00e8ce)", "Air circulators: perceived reduction -2 to -4\u00b0C (cost: ~25W/room)"],
  ["Protection solaire ext\u00e9rieure : r\u00e9duction gains -40% (stores/volets)", "External solar protection: gain reduction -40% (shutters/blinds)"],
  ["V\u00e9g\u00e9talisation fa\u00e7ade sud : r\u00e9duction T_fa\u00e7ade -8\u00b0C", "South facade greening: T_facade reduction -8\u00b0C"],
  ["volet bioclimatique obligatoire pour Ic construction", "bioclimatic shutter mandatory for Ic construction"],
];

var pairsEnc = JSON.stringify(PAIRS).replace(/[\u0080-\uffff]/g, function(c){
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
});

var PATCH = '<script id="' + PATCH_ID + '">\n' +
'(function(){\n' +
'  var P=' + pairsEnc + ';\n' +
'  var busy=false;\n' +
'  function fix(){\n' +
'    if(busy)return;\n' +
'    if((window.lang||"fr")==="fr"){var pg2=document.getElementById("pg-hydraulique");if(pg2){var w2=document.createTreeWalker(pg2,NodeFilter.SHOW_TEXT,null,false),ns2=[],n2;while(n2=w2.nextNode())ns2.push(n2);ns2.forEach(function(nd){var t=nd.textContent;P.forEach(function(p){if(t.indexOf(p[1])!==-1)t=t.split(p[1]).join(p[0]);});if(t!==nd.textContent)nd.textContent=t;});}return;}\n' +
'    var pg=document.getElementById("pg-hydraulique");\n' +
'    if(!pg)return;\n' +
'    busy=true;\n' +
'    var w=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT,null,false),ns=[],n;\n' +
'    while(n=w.nextNode())ns.push(n);\n' +
'    ns.forEach(function(nd){\n' +
'      var t=nd.textContent;\n' +
'      P.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});\n' +
'      if(t!==nd.textContent)nd.textContent=t;\n' +
'    });\n' +
'    pg.querySelectorAll("select option").forEach(function(o){\n' +
'      var t=o.textContent;\n' +
'      P.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});\n' +
'      if(t!==o.textContent)o.textContent=t;\n' +
'    });\n' +
'    busy=false;\n' +
'  }\n' +
'  var obsHyd=null;\n' +
'  function startObs(){\n' +
'    var pg=document.getElementById("pg-hydraulique");\n' +
'    if(!pg||obsHyd)return;\n' +
'    obsHyd=new MutationObserver(function(){\n' +
'      if((window.lang||"fr")==="fr"){var pg2=document.getElementById("pg-hydraulique");if(pg2){var w2=document.createTreeWalker(pg2,NodeFilter.SHOW_TEXT,null,false),ns2=[],n2;while(n2=w2.nextNode())ns2.push(n2);ns2.forEach(function(nd){var t=nd.textContent;P.forEach(function(p){if(t.indexOf(p[1])!==-1)t=t.split(p[1]).join(p[0]);});if(t!==nd.textContent)nd.textContent=t;});}return;}\n' +
'      obsHyd.disconnect();\n' +
'      fix();\n' +
'      obsHyd.observe(pg,{childList:true,subtree:true,characterData:true});\n' +
'    });\n' +
'    obsHyd.observe(pg,{childList:true,subtree:true,characterData:true});\n' +
'  }\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setTimeout(startObs,1000);\n' +
'    setTimeout(fix,500);\n' +
'    setTimeout(fix,1500);\n' +
'    setTimeout(fix,3000);\n' +
'    var btn=document.getElementById("mn-hydraulique");\n' +
'    if(btn)btn.addEventListener("click",function(){\n' +
'      setTimeout(startObs,300);\n' +
'      setTimeout(fix,300);\n' +
'      setTimeout(fix,800);\n' +
'    });\n' +
'  });\n' +
'})();\n' +
'</script>';

var idx = h.lastIndexOf('</body>');
if(idx === -1) idx = h.length;
h = h.slice(0, idx) + PATCH + '\n' + h.slice(idx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - hyd-trad-v1 applique');
