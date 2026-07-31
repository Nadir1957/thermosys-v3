const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

if(h.includes('re2020-pdf-v1')){
  var s=h.lastIndexOf('<script',h.indexOf('re2020-pdf-v1'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

var lines = [
'(function(){',

'function clean(t){',
'  if(!t)return"";',
'  return t',
'    .replace(/[\\u2550-\\u256C]/g,"-")',
'    .replace(/[\\u2714\\u2713\\u2705]/g,"[OK]")',
'    .replace(/[\\u274C\\u2716\\u2718\\u26A0]/g,"[!]")',
'    .replace(/\\u00B2/g,"2")',
'    .replace(/\\u00B3/g,"3")',
'    .replace(/\\u00E9/g,"e")',
'    .replace(/\\u00E8/g,"e")',
'    .replace(/\\u00EA/g,"e")',
'    .replace(/\\u00E0/g,"a")',
'    .replace(/\\u00F4/g,"o")',
'    .replace(/\\u00FB/g,"u")',
'    .replace(/\\u00EE/g,"i")',
'    .replace(/\\u00E7/g,"c")',
'    .replace(/[\\uD800-\\uDFFF]/g,"")',
'    .replace(/[^\\x00-\\xFF]/g,"?");',
'}',

'function g(id){var el=document.getElementById(id);if(!el)return"";if(el.tagName==="SELECT"&&el.selectedIndex>=0)return el.options[el.selectedIndex].text;return el.value||"";}',

'function _re2020PdfExport(){',
'  var EN=window.lang==="en";',
'  var jsPDF=window.jspdf?window.jspdf.jsPDF:window.jsPDF;',
'  if(!jsPDF){alert("jsPDF not available");return;}',

// Appeler genRapportAudit pour générer le texte
'  if(typeof genRapportAudit==="function")genRapportAudit();',

// Lire les champs
'  var ref=g("rpt-ref")||"N/A";',
'  var site=g("rpt-site")||"N/A";',
'  var aud=g("rpt-aud")||"N/A";',
'  var date=g("rpt-date")||new Date().toISOString().slice(0,10);',
'  var type=g("rpt-type")||"indiv";',
'  var surf=g("rpt-surf")||"?";',
'  var ic=g("rpt-ic")||"0";',
'  var cep=g("rpt-cep")||"0";',
'  var scop=g("rpt-scop")||"0";',
'  var gwp=g("rpt-gwp")||"0";',
'  var gtb=g("rpt-gtb")||"B";',
'  var obs=g("rpt-obs")||"—";',

// Seuils RE2020
'  var seuils={indiv:{ic:530,cep:70,scop:3.8},collec:{ic:490,cep:70,scop:3.8},',
'    tertio:{ic:600,cep:120,scop:3.6},enseig:{ic:550,cep:100,scop:3.6},sante:{ic:580,cep:120,scop:3.6}};',
'  var r=seuils[type]||seuils.indiv;',
'  var typeLabel={indiv:"Individual residential",collec:"Multi-residential",tertio:"Commercial offices",',
'    enseig:"Education",sante:"Healthcare / Hospital"}[type]||type;',

// Résultat global
'  var icN=parseFloat(ic)||0,cepN=parseFloat(cep)||0,scopN=parseFloat(scop)||0,gwpN=parseFloat(gwp)||0;',
'  var compliant=icN>0&&icN<=r.ic&&cepN>0&&cepN<=r.cep&&scopN>0&&scopN>=r.scop&&gwpN>0&&gwpN<=750;',

'  var doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});',
'  var now=new Date();',
'  var W=210,y=0;',

// EN-TETE
'  doc.setFillColor(0,100,60);',
'  doc.rect(0,0,W,32,"F");',
'  doc.setFillColor(255,180,0);',
'  doc.rect(0,28,W,4,"F");',
'  doc.setTextColor(255,255,255);',
'  doc.setFontSize(20);doc.setFont("helvetica","bold");',
'  doc.text("THERMOSYS v3",14,13);',
'  doc.setFontSize(9);doc.setFont("helvetica","normal");',
'  doc.text("RE2020 COMPLIANCE AUDIT REPORT — 2025 THRESHOLD",14,22);',
'  doc.text(now.toLocaleDateString()+" "+now.toLocaleTimeString(),W-14,22,{align:"right"});',
'  doc.setTextColor(0,0,0);',
'  y=40;',

// Fonction section
'  function section(title,color){',
'    if(y>260){doc.addPage();y=20;}',
'    color=color||[0,100,60];',
'    doc.setFillColor(color[0],color[1],color[2]);',
'    doc.rect(10,y,W-20,8,"F");',
'    doc.setFont("helvetica","bold");doc.setFontSize(9);',
'    doc.setTextColor(255,255,255);',
'    doc.text(title,14,y+5.5);',
'    doc.setTextColor(0,0,0);',
'    y+=11;',
'  }',

// Fonction ligne
'  function row(lbl,val,ok){',
'    if(y>275){doc.addPage();y=20;}',
'    doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.setTextColor(60,60,60);',
'    doc.text(lbl,14,y);',
'    doc.setFont("helvetica","normal");',
'    if(ok===true){doc.setTextColor(0,120,0);}',
'    else if(ok===false){doc.setTextColor(180,0,0);}',
'    else{doc.setTextColor(0,0,0);}',
'    doc.text(String(val||""),105,y);',
'    doc.setTextColor(0,0,0);',
'    y+=5.5;',
'  }',

// SECTION 1 - Identification
'  section("01 — PROJECT IDENTIFICATION");',
'  row("File reference:",clean(ref));',
'  row("Site / Installation:",clean(site));',
'  row("Auditor:",clean(aud));',
'  row("Audit date:",clean(date));',
'  row("Building type:",clean(typeLabel));',
'  row("Area (m2):",clean(surf));',
'  y+=3;',

// SECTION 2 - Résultats mesurés
'  section("02 — MEASURED RESULTS vs RE2020 2025 THRESHOLDS");',

// Tableau résultats
'  doc.setFillColor(0,100,60);',
'  doc.rect(10,y,W-20,7,"F");',
'  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(255,255,255);',
'  doc.text("Parameter",14,y+5);',
'  doc.text("Measured",80,y+5);',
'  doc.text("Threshold",120,y+5);',
'  doc.text("Result",160,y+5);',
'  doc.setTextColor(0,0,0);',
'  y+=9;',

'  function trow(param,meas,thresh,result,ok){',
'    if(y>275){doc.addPage();y=20;}',
'    if(ok===true){doc.setFillColor(235,255,235);}',
'    else if(ok===false){doc.setFillColor(255,235,235);}',
'    else{doc.setFillColor(248,248,248);}',
'    doc.rect(10,y,W-20,6,"F");',
'    doc.setFont("helvetica","normal");doc.setFontSize(8.5);',
'    doc.setTextColor(0,0,0);doc.text(param,14,y+4);',
'    doc.text(meas,80,y+4);',
'    doc.text(thresh,120,y+4);',
'    if(ok===true){doc.setTextColor(0,120,0);doc.setFont("helvetica","bold");}',
'    else if(ok===false){doc.setTextColor(180,0,0);doc.setFont("helvetica","bold");}',
'    doc.text(result,160,y+4);',
'    doc.setTextColor(0,0,0);doc.setFont("helvetica","normal");',
'    y+=6.5;',
'  }',

'  trow("Ic construction (kgCO2eq/m2)",ic+"",String.fromCharCode(8804)+r.ic,(icN>0?(icN<=r.ic?"COMPLIANT":"EXCEEDED"):"N/A"),(icN>0?icN<=r.ic:null));',
'  trow("Cep,nr (kWhEP/m2/yr)",cep+"",String.fromCharCode(8804)+r.cep,(cepN>0?(cepN<=r.cep?"COMPLIANT":"EXCEEDED"):"N/A"),(cepN>0?cepN<=r.cep:null));',
'  trow("HP SCOP",scop+"",String.fromCharCode(8805)+r.scop,(scopN>0?(scopN>=r.scop?"COMPLIANT":"INSUFFICIENT"):"N/A"),(scopN>0?scopN>=r.scop:null));',
'  trow("Refrigerant GWP",gwp+"",String.fromCharCode(8804)+"750",(gwpN>0?(gwpN<=750?"COMPLIANT":"EXCEEDED"):"N/A"),(gwpN>0?gwpN<=750:null));',
'  trow("BMS Class (EN 15232-1)",clean(gtb),"Class B min.","INFO",null);',
'  y+=3;',

// SECTION 3 - Observations
'  section("03 — OBSERVATIONS");',
'  doc.setFont("helvetica","normal");doc.setFontSize(8.5);',
'  doc.text(clean(obs)||"—",14,y);',
'  y+=10;',

// SECTION 4 - Conclusion
'  var bgColor=compliant?[0,120,0]:[180,0,0];',
'  doc.setFillColor(bgColor[0],bgColor[1],bgColor[2]);',
'  doc.rect(10,y,W-20,14,"F");',
'  doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(255,255,255);',
'  var verdict=compliant?"[OK] COMPLIANT WITH RE2020 THRESHOLD 2025":"[!] NON-COMPLIANT — SEE DETAILS ABOVE";',
'  doc.text(verdict,W/2,y+9,{align:"center"});',
'  doc.setTextColor(0,0,0);',
'  y+=20;',

// SECTION 5 - Normes
'  section("04 — REGULATORY REFERENCES",[30,30,80]);',
'  var norms=["RE2020 — Reglementation Environnementale 2020 (France)",',
'    "Arrete du 4 aout 2021 — Seuils RE2020 2025",',
'    "EN 14825:2023 — SCOP calculation method",',
'    "EU 2024/573 — F-Gas Regulation",',
'    "EN 15232-1:2017 — Building automation class"];',
'  norms.forEach(function(n){',
'    if(y>275){doc.addPage();y=20;}',
'    doc.setFont("helvetica","normal");doc.setFontSize(8);',
'    doc.text("- "+n,14,y);y+=5;',
'  });',
'  y+=3;',

// Signatures
'  if(y>240){doc.addPage();y=20;}',
'  doc.setDrawColor(0,100,60);doc.setLineWidth(0.3);',
'  doc.line(14,y+15,80,y+15);',
'  doc.line(W-80,y+15,W-14,y+15);',
'  doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(80,80,80);',
'  doc.text("Auditor / Stamp",14,y+18);',
'  doc.text("Technical Manager / Visa",W-80,y+18);',
'  y+=25;',

// PIED DE PAGE
'  var pages=doc.internal.getNumberOfPages();',
'  for(var i=1;i<=pages;i++){',
'    doc.setPage(i);',
'    doc.setDrawColor(0,100,60);doc.setLineWidth(0.3);',
'    doc.line(10,285,W-10,285);',
'    doc.setFontSize(7);doc.setTextColor(120,120,120);',
'    doc.text("Thermosys v3 — RE2020 Compliance Audit — thermosys-v3.vercel.app",14,290);',
'    doc.text("Page "+i+"/"+pages,W-14,290,{align:"right"});',
'  }',

'  var fn="Thermosys_RE2020_Audit_"+new Date().toISOString().slice(0,10)+".pdf";',
'  doc.save(fn);',
'  if(typeof showToast==="function")showToast("RE2020 Audit PDF exported","s");',
'}',

'window._re2020PdfExport=_re2020PdfExport;',

// Ajouter bouton après le bouton Generate PDF Report
'document.addEventListener("DOMContentLoaded",function(){',
'  setTimeout(function(){',
'    var btn=document.querySelector("[onclick*=genRapportAudit]");',
'    if(!btn||document.getElementById("re2020-pdf-btn"))return;',
'    var b=document.createElement("button");',
'    b.id="re2020-pdf-btn";',
'    b.className="btn bp";',
'    b.style.cssText="width:100%;margin-top:8px;";',
'    b.innerHTML="\\uD83D\\uDCC4 Export PDF Report";',
'    b.addEventListener("click",function(e){e.preventDefault();_re2020PdfExport();});',
'    btn.parentNode.insertBefore(b,btn.nextSibling);',
'  },2000);',
'});',

'})();'
];

var scriptContent = lines.join('\n');
var nonAscii=0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:',nonAscii);

var newScript='<script id="re2020-pdf-v1">\n'+scriptContent+'\n</script>';
var insertPos=h.lastIndexOf('</body>');
if(insertPos===-1)insertPos=h.length;
var result=h.substring(0,insertPos)+newScript+'\n'+h.substring(insertPos);
fs.writeFileSync(distFile,result,'utf8');
console.log('OK - re2020-pdf-v1 applique');
