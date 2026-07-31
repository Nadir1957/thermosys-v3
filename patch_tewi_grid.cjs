const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch si présent
if(h.includes('tewi-grid-v1')) {
  var s=h.lastIndexOf('<script',h.indexOf('tewi-grid-v1'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

// Liste complète des pays avec facteurs CO2 IEA 2023 (kgCO2/kWh)
var COUNTRIES = [
  // Afrique du Nord & Moyen-Orient
  ["0.587","Algeria / Alg\u00e9rie (0.587)"],
  ["0.718","Morocco / Maroc (0.718)"],
  ["0.534","Tunisia / Tunisie (0.534)"],
  ["0.482","Libya / Libye (0.482)"],
  ["0.463","Egypt / Egypte (0.463)"],
  ["0.641","Saudi Arabia / Arabie Saoudite (0.641)"],
  ["0.516","UAE / Emirats Arabes Unis (0.516)"],
  ["0.458","Qatar (0.458)"],
  ["0.588","Kuwait / Kowe\u00eft (0.588)"],
  ["0.531","Bahrain / Bahre\u00efn (0.531)"],
  ["0.503","Oman (0.503)"],
  ["0.439","Jordan / Jordanie (0.439)"],
  ["0.543","Lebanon / Liban (0.543)"],
  ["0.477","Iraq (0.477)"],
  ["0.582","Iran (0.582)"],
  ["0.498","Syria / Syrie (0.498)"],
  ["0.412","Israel / Isra\u00ebl (0.412)"],
  ["0.508","Yemen / Y\u00e9men (0.508)"],
  // Afrique subsaharienne
  ["0.891","Nigeria (0.891)"],
  ["0.541","South Africa / Afrique du Sud (0.541)"],
  ["0.562","Kenya (0.562)"],
  ["0.487","Ghana (0.487)"],
  ["0.398","Ethiopia / Ethiopie (0.398)"],
  ["0.425","Tanzania / Tanzanie (0.425)"],
  ["0.612","Angola (0.612)"],
  ["0.384","Mozambique (0.384)"],
  ["0.578","Cameroon / Cameroun (0.578)"],
  ["0.456","Senegal (0.456)"],
  ["0.623","C\u00f4te d'Ivoire (0.623)"],
  // Europe
  ["0.052","France RTE (0.052)"],
  ["0.275","EU-27 avg. / UE-27 moy. (0.275)"],
  ["0.380","Germany / Allemagne (0.380)"],
  ["0.312","Italy / Italie (0.312)"],
  ["0.196","Spain / Espagne (0.196)"],
  ["0.207","United Kingdom / Royaume-Uni (0.207)"],
  ["0.451","Turkey / Turquie (0.451)"],
  ["0.145","Norway / Norv\u00e8ge (0.145)"],
  ["0.013","Sweden / Su\u00e8de (0.013)"],
  ["0.174","Finland / Finlande (0.174)"],
  ["0.119","Denmark / Danemark (0.119)"],
  ["0.253","Netherlands / Pays-Bas (0.253)"],
  ["0.168","Belgium / Belgique (0.168)"],
  ["0.028","Switzerland / Suisse (0.028)"],
  ["0.181","Austria / Autriche (0.181)"],
  ["0.256","Portugal (0.256)"],
  ["0.283","Greece / Gr\u00e8ce (0.283)"],
  ["0.641","Poland / Pologne (0.641)"],
  ["0.398","Czech Rep. / R\u00e9p. Tch\u00e8que (0.398)"],
  ["0.187","Romania / Roumanie (0.187)"],
  ["0.445","Bulgaria (0.445)"],
  ["0.291","Hungary / Hongrie (0.291)"],
  ["0.098","Croatia / Croatie (0.098)"],
  ["0.251","Slovakia / Slovaquie (0.251)"],
  ["0.203","Ukraine (0.203)"],
  ["0.321","Serbia / Serbie (0.321)"],
  // Asie - Pacifique
  ["0.581","China / Chine (0.581)"],
  ["0.471","Japan / Japon (0.471)"],
  ["0.415","South Korea / Cor\u00e9e du Sud (0.415)"],
  ["0.708","India / Inde (0.708)"],
  ["0.724","Australia / Australie (0.724)"],
  ["0.411","New Zealand / Nouvelle-Z\u00e9lande (0.411)"],
  ["0.569","Indonesia (0.569)"],
  ["0.486","Malaysia / Malaisie (0.486)"],
  ["0.412","Thailand / Tha\u00eflande (0.412)"],
  ["0.618","Vietnam (0.618)"],
  ["0.498","Philippines (0.498)"],
  ["0.408","Singapore / Singapour (0.408)"],
  ["0.512","Pakistan (0.512)"],
  ["0.623","Bangladesh (0.623)"],
  ["0.587","Taiwan (0.587)"],
  // Am\u00e9riques
  ["0.386","USA (0.386)"],
  ["0.140","Canada (0.140)"],
  ["0.075","Brazil / Br\u00e9sil (0.075)"],
  ["0.298","Mexico / Mexique (0.298)"],
  ["0.398","Argentina (0.398)"],
  ["0.187","Chile / Chili (0.187)"],
  ["0.312","Colombia (0.312)"],
  ["0.421","Venezuela (0.421)"],
  ["0.562","Peru / P\u00e9rou (0.562)"],
  // Custom
  ["custom","Custom / Personnalis\u00e9..."]
];

var scriptLines = [
'(function(){',
'  var GRID=' + JSON.stringify(COUNTRIES) + ';',
'  function updateGrid(){',
'    var sel=document.getElementById("tewi_grid");',
'    if(!sel)return;',
'    var cur=sel.value;',
'    sel.innerHTML="";',
'    GRID.forEach(function(c){',
'      var o=document.createElement("option");',
'      o.value=c[0];o.textContent=c[1];',
'      sel.appendChild(o);',
'    });',
'    // Restaurer la valeur si elle existe',
'    if(cur){',
'      Array.from(sel.options).forEach(function(o){if(o.value===cur)o.selected=true;});',
'    }',
'  }',
'  document.addEventListener("DOMContentLoaded",function(){',
'    setTimeout(updateGrid,1000);',
'    setTimeout(updateGrid,3000);',
'  });',
'  window._updateTewiGrid=updateGrid;',
'})();'
];

var scriptContent = scriptLines.join('\n');

// Verifier pas de non-ASCII
var nonAscii=0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:', nonAscii);

var newScript='<script id="tewi-grid-v1">\n'+scriptContent+'\n</script>';
var insertPos=h.lastIndexOf('</body>');
if(insertPos===-1)insertPos=h.length;
var result=h.substring(0,insertPos)+newScript+'\n'+h.substring(insertPos);
fs.writeFileSync(distFile,result,'utf8');
console.log('OK - tewi-grid-v1 applique');
console.log('Pays:', COUNTRIES.length-1, '+ Custom');
