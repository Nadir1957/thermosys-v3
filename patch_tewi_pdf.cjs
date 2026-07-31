const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

if(h.includes('tewi-pdf-v1')){
  var s=h.lastIndexOf('<script',h.indexOf('tewi-pdf-v1'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

var lines = [
'(function(){',

'function clean(t){',
'  if(!t)return"";',
'  return t',
'    .replace(/[\\uD83C][\\uDDE0-\\uDDFF][\\uD83C][\\uDDE0-\\uDDFF]/g,"")',
'    .replace(/[\\u2500-\\u257F\\u2014\\u2013]/g,"-")',
'    .replace(/[\\u2714\\u2713\\u2705]/g,"[OK]")',
'    .replace(/[\\u274C\\u2716\\u2718]/g,"[X]")',
'    .replace(/\\u00B2/g,"2")',
'    .replace(/\\u00B3/g,"3")',
'    .replace(/\\u00B0C/g,"degC")',
'    .replace(/\\u00B0/g,"deg")',
'    .replace(/\\u2082/g,"2")',
'    .replace(/\\u2265/g,">=")',
'    .replace(/\\u2264/g,"<=")',
'    .replace(/\\u202F/g," ")',
'    .replace(/[\\uD800-\\uDFFF]/g,"")',
'    .replace(/[^\\x00-\\xFF]/g,"?");',
'}',

'function gt(id){',
'  var el=document.getElementById(id);',
'  if(!el)return"";',
'  if(el.tagName==="SELECT"&&el.selectedIndex>=0)return clean(el.options[el.selectedIndex].text);',
'  return clean(el.value||"");',
'}',

'function exportTewiPDF(){',
'  var L=window.lang||"fr";',
'  var EN=L==="en";',
'  var jsPDF=window.jspdf?window.jspdf.jsPDF:window.jsPDF;',
'  if(!jsPDF){alert(EN?"jsPDF not available":"jsPDF non disponible");return;}',

'  var sys=gt("tewi_sys");',
'  var ref=gt("tewi_ref");',
'  var charge=document.getElementById("tewi_charge")?document.getElementById("tewi_charge").value:"";',
'  var leak=document.getElementById("tewi_leak")?document.getElementById("tewi_leak").value:"";',
'  var life=document.getElementById("tewi_life")?document.getElementById("tewi_life").value:"";',
'  var recov=document.getElementById("tewi_recov")?document.getElementById("tewi_recov").value:"";',
'  var conso=document.getElementById("tewi_conso")?document.getElementById("tewi_conso").value:"";',
'  var grid=gt("tewi_grid");',
'  var cap=document.getElementById("tewi_cap")?document.getElementById("tewi_cap").value:"";',

// Résultats depuis tewiResult
'  var resEl=document.getElementById("tewiResult");',
'  var resText=resEl?clean(resEl.textContent):"";',

// Extraire les valeurs du tableau résultat
'  var opLeakKg="",opLeakT="",opLeakPct="";',
'  var eolKg="",eolT="",eolPct="";',
'  var dirKg="",dirT="",dirPct="";',
'  var indKg="",indT="",indPct="";',
'  var totKg="",totT="";',
'  var totalTco2="",kgPerYr="",tco2kw="";',

'  if(resEl){',
'    var rows=resEl.querySelectorAll("tr");',
'    rows.forEach(function(tr){',
'      var cells=Array.from(tr.querySelectorAll("td,th")).map(function(c){return clean(c.textContent.trim());});',
'      if(cells.length>=4){',
'        if(cells[0].indexOf("Operational")!==-1||cells[0].indexOf("Fuites")!==-1){opLeakKg=cells[1];opLeakT=cells[2];opLeakPct=cells[3];}',
'        if(cells[0].indexOf("End of life")!==-1||cells[0].indexOf("Fin de vie")!==-1){eolKg=cells[1];eolT=cells[2];eolPct=cells[3];}',
'        if(cells[0].indexOf("Total Direct")!==-1){dirKg=cells[1];dirT=cells[2];dirPct=cells[3];}',
'        if(cells[0].indexOf("Indirect")!==-1){indKg=cells[1];indT=cells[2];indPct=cells[3];}',
'        if(cells[0].indexOf("TOTAL")!==-1){totKg=cells[1];totT=cells[2];}',
'      }',
'    });',
'    var spans=resEl.querySelectorAll("span,div,p");',
'    spans.forEach(function(sp){',
'      var t=clean(sp.textContent.trim());',
'      if(t.indexOf("kgCO2/yr")!==-1||t.indexOf("kgCO2/an")!==-1)kgPerYr=t;',
'      if(t.indexOf("tCO2/kWcold")!==-1||t.indexOf("tCO2/kWfroid")!==-1)tco2kw=t;',
'    });',
'  }',

'  var doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});',
'  var now=new Date();',
'  var dateStr=now.toLocaleDateString()+" "+now.toLocaleTimeString();',
'  var W=210,y=0;',

// EN-TETE
'  doc.setFillColor(0,80,140);',
'  doc.rect(0,0,W,30,"F");',
'  doc.setFillColor(255,140,0);',
'  doc.rect(0,26,W,4,"F");',
'  doc.setTextColor(255,255,255);',
'  doc.setFontSize(20);doc.setFont("helvetica","bold");',
'  doc.text("THERMOSYS v3",14,13);',
'  doc.setFontSize(9);doc.setFont("helvetica","normal");',
'  doc.text(EN?"TEWI CALCULATION — EN 378-1:2021 / F-Gas EU 2024/573":"CALCUL TEWI — EN 378-1:2021 / F-Gas UE 2024/573",14,21);',
'  doc.text(dateStr,W-14,21,{align:"right"});',
'  doc.setTextColor(0,0,0);',
'  y=38;',

// Fonction section
'  function section(title){',
'    if(y>260){doc.addPage();y=20;}',
'    doc.setFillColor(220,235,255);',
'    doc.rect(10,y,W-20,8,"F");',
'    doc.setDrawColor(0,80,140);doc.setLineWidth(0.5);',
'    doc.rect(10,y,W-20,8,"S");',
'    doc.setFont("helvetica","bold");doc.setFontSize(9);',
'    doc.setTextColor(0,60,120);',
'    doc.text(title,14,y+5.5);',
'    doc.setTextColor(0,0,0);',
'    y+=11;',
'  }',

// Fonction ligne
'  function row(lbl,val){',
'    if(y>275){doc.addPage();y=20;}',
'    doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.setTextColor(60,60,60);',
'    doc.text(lbl,14,y);',
'    doc.setFont("helvetica","normal");doc.setTextColor(0,0,0);',
'    doc.text(String(val||""),100,y);',
'    y+=5.5;',
'  }',

// Fonction ligne tableau résultat
'  function trow(item,kg,t,pct,isBold){',
'    if(y>275){doc.addPage();y=20;}',
'    if(isBold){doc.setFont("helvetica","bold");}else{doc.setFont("helvetica","normal");}',
'    doc.setFontSize(8.5);',
'    doc.text(item,14,y);',
'    doc.text(kg,95,y,{align:"right"});',
'    doc.text(t,130,y,{align:"right"});',
'    doc.text(pct,155,y,{align:"right"});',
'    y+=5.5;',
'  }',

// SECTION 1 - Données système
'  section(EN?"SYSTEM DATA":"DONNEES SYSTEME");',
'  row(EN?"System type:":"Type systeme:",sys);',
'  row(EN?"Refrigerant:":"Refrigerant:",ref);',
'  row(EN?"Capacity (kW):":"Capacite (kW):",cap);',
'  row(EN?"Refrigerant charge (kg):":"Charge frigorigene (kg):",charge);',
'  row(EN?"Leak rate (%/yr):":"Taux de fuite (%/an):",leak);',
'  row(EN?"Service life (yrs):":"Duree de vie (ans):",life);',
'  row(EN?"End-of-life recovery (%):":"Recuperation fin de vie (%):",recov);',
'  row(EN?"Electricity consumption (kWh/yr):":"Consommation electrique (kWh/an):",conso);',
'  row(EN?"Electrical grid:":"Reseau electrique:",grid);',
'  y+=3;',

// SECTION 2 - Résultats TEWI
'  section(EN?"TEWI RESULTS — EN 378-1:2021":"RESULTATS TEWI — EN 378-1:2021");',

// En-tête tableau
'  doc.setFillColor(0,80,140);',
'  doc.rect(10,y,W-20,7,"F");',
'  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(255,255,255);',
'  doc.text(EN?"Item":"Poste",14,y+5);',
'  doc.text("kgCO2eq",95,y+5,{align:"right"});',
'  doc.text("tCO2eq",130,y+5,{align:"right"});',
'  doc.text("%",155,y+5,{align:"right"});',
'  doc.setTextColor(0,0,0);',
'  y+=9;',

// Lignes résultats
'  doc.setFillColor(245,250,255);doc.rect(10,y,W-20,5.5*5,"F");',
'  trow(EN?"Operational leaks":"Fuites exploitation",opLeakKg,opLeakT,opLeakPct,false);',
'  trow(EN?"End of life":"Fin de vie",eolKg,eolT,eolPct,false);',
'  doc.setFillColor(200,220,240);doc.rect(10,y,W-20,5.5,"F");',
'  trow(EN?"Total Direct":"Total Direct",dirKg,dirT,dirPct,true);',
'  trow(EN?"Indirect (electricity)":"Indirect (electricite)",indKg,indT,indPct,false);',
'  doc.setFillColor(0,80,140);doc.rect(10,y,W-20,5.5,"F");',
'  doc.setTextColor(255,255,255);',
'  trow("TOTAL TEWI",totKg,totT,"100%",true);',
'  doc.setTextColor(0,0,0);',
'  y+=5;',

// Indicateurs
'  doc.setFillColor(240,248,255);',
'  doc.rect(10,y,W-20,20,"F");',
'  doc.setDrawColor(0,80,140);doc.setLineWidth(0.3);',
'  doc.rect(10,y,W-20,20,"S");',
'  doc.setFont("helvetica","bold");doc.setFontSize(9);',
'  doc.setTextColor(0,80,140);',
'  doc.text(EN?"KEY INDICATORS":"INDICATEURS CLES",14,y+6);',
'  doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(0,0,0);',
'  if(kgPerYr)doc.text(kgPerYr,14,y+12);',
'  if(tco2kw)doc.text(tco2kw,14,y+17);',
'  y+=25;',

// SECTION 3 - Normes
'  section(EN?"STANDARDS & REFERENCES":"NORMES ET REFERENCES");',
'  var norms=["EN 378-1:2021 — Safety and environmental requirements for refrigerating systems",',
'    "EU Regulation 2024/573 (F-Gas) — Phase-down schedule HFC",',
'    "ISO 817:2014 — Refrigerant designation and safety classification",',
'    "EU Regulation 517/2014 — Fluorinated greenhouse gases"];',
'  norms.forEach(function(n){',
'    if(y>272){doc.addPage();y=20;}',
'    doc.setFont("helvetica","normal");doc.setFontSize(8);',
'    doc.text("- "+n,14,y);y+=5;',
'  });',
'  y+=3;',

// Avertissement
'  if(y>250){doc.addPage();y=20;}',
'  doc.setFillColor(255,248,230);',
'  doc.rect(10,y,W-20,14,"F");',
'  doc.setDrawColor(255,140,0);doc.setLineWidth(0.5);',
'  doc.rect(10,y,W-20,14,"S");',
'  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(180,80,0);',
'  doc.text(EN?"WARNING:":"AVERTISSEMENT:",14,y+5);',
'  doc.setFont("helvetica","normal");doc.setTextColor(100,60,0);',
'  doc.text(EN?"Indicative results only. To be validated by a qualified engineer per applicable regulations.":"Resultats indicatifs. A valider par un ingenieur qualifie.",14,y+10);',
'  y+=18;',

// PIED DE PAGE
'  var pages=doc.internal.getNumberOfPages();',
'  for(var i=1;i<=pages;i++){',
'    doc.setPage(i);',
'    doc.setDrawColor(0,80,140);doc.setLineWidth(0.3);',
'    doc.line(10,285,W-10,285);',
'    doc.setFontSize(7);doc.setTextColor(120,120,120);',
'    doc.text("Thermosys v3 - thermosys-v3.vercel.app | EN 378-1:2021 | F-Gas EU 2024/573",14,290);',
'    doc.text("Page "+i+"/"+pages,W-14,290,{align:"right"});',
'  }',

'  var fn="Thermosys_TEWI_"+new Date().toISOString().slice(0,10)+".pdf";',
'  doc.save(fn);',
'  if(typeof showToast==="function")showToast(EN?"TEWI PDF exported":"PDF TEWI exporte","s");',
'}',

'window.exportTewiPDF=exportTewiPDF;',

// Ajouter bouton après tewiResult
'document.addEventListener("DOMContentLoaded",function(){',
'  setTimeout(function(){',
'    var pg=document.getElementById("pg-fluides");',
'    if(!pg||document.getElementById("tewi-pdf-btn"))return;',
'    var res=document.getElementById("tewiResult");',
'    if(!res)return;',
'    var btn=document.createElement("button");',
'    btn.id="tewi-pdf-btn";',
'    btn.className="btn bp";',
'    btn.style.cssText="width:100%;margin-top:8px;";',
'    btn.innerHTML="\\uD83D\\uDCC4 "+(window.lang==="en"?"Export PDF":"Exporter PDF");',
'    btn.onclick=exportTewiPDF;',
'    res.parentNode.insertBefore(btn,res.nextSibling);',
'  },2000);',
'});',

'})();'
];

var scriptContent = lines.join('\n');
var nonAscii=0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:',nonAscii);

var newScript='<script id="tewi-pdf-v1">\n'+scriptContent+'\n</script>';
var insertPos=h.lastIndexOf('</body>');
if(insertPos===-1)insertPos=h.length;
var result=h.substring(0,insertPos)+newScript+'\n'+h.substring(insertPos);
fs.writeFileSync(distFile,result,'utf8');
console.log('OK - tewi-pdf-v1 applique');
