const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch si présent
if(h.includes('dsf-pdf-v1')) {
  var s=h.lastIndexOf('<script',h.indexOf('dsf-pdf-v1'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

var lines = [
'(function(){',

// Nettoyage caracteres
'function clean(t){',
'  if(!t)return"";',
'  return t',
'    .replace(/[\\uD83C][\\uDDE0-\\uDDFF][\\uD83C][\\uDDE0-\\uDDFF]/g,"")',
'    .replace(/[\\u2500-\\u257F\\u2014\\u2013]/g,"-")',
'    .replace(/[\\u2714\\u2713\\u2705]/g,"[OK]")',
'    .replace(/[\\u274C\\u2716\\u2718]/g,"[X]")',
'    .replace(/\\u2082/g,"2")',
'    .replace(/\\u00B2/g,"2")',
'    .replace(/\\u00B0/g,"deg")',
'    .replace(/\\u202F/g," ")',
'    .replace(/\\u2192/g,"->") ',
'    .replace(/\\u2265/g,">=")',
'    .replace(/\\u2264/g,"<=")',
'    .replace(/[^\\x00-\\xFF]/g,"?");',
'}',

'function exportDsfPDF(){',
'  var L=window.lang||"fr";',
'  var FR=L==="fr";',
'  var g=function(id){return(document.getElementById(id)||{}).value||"";};',
'  var gt=function(id){',
'    var el=document.getElementById(id);',
'    if(!el)return"";',
'    if(el.selectedIndex!==undefined&&el.options&&el.options[el.selectedIndex])',
'      return el.options[el.selectedIndex].text;',
'    return el.value||"";',
'  };',

// Donnees saisies
'  var surf=g("dsf_surface");',
'  var haut=g("dsf_hauteur");',
'  var type=gt("dsf1_type");',
'  var mode=gt("dsf1_mode");',
'  var cantons=g("dsf1_cantons");',
'  var qc2=g("dsf2_qc");',
'  var z2=g("dsf2_z");',
'  var t02=g("dsf2_t0");',
'  var qc3=g("dsf3_q");',
'  var z3=g("dsf3_z");',

// Resultats
'  var resEl=document.getElementById("dsf_result");',
'  var resText=clean(resEl?resEl.textContent:"");',

// Verifications IT246
'  var checks=[];',
'  document.querySelectorAll("#pg-desenfumage .it246-check, #pg-desenfumage input[type=checkbox]").forEach(function(el){',
'    var lbl=el.parentElement?el.parentElement.textContent.trim():"";',
'    if(lbl) checks.push((el.checked?"[OK] ":"[ ] ")+clean(lbl.substring(0,60)));',
'  });',

// Creer PDF
'  var jsPDF=window.jspdf?window.jspdf.jsPDF:window.jsPDF;',
'  if(!jsPDF){alert(FR?"jsPDF non disponible":"jsPDF not available");return;}',
'  var doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});',
'  var now=new Date();',
'  var dateStr=now.toLocaleDateString()+" "+now.toLocaleTimeString();',
'  var W=210,y=0;',

// EN-TETE
'  doc.setFillColor(0,119,168);',
'  doc.rect(0,0,W,30,"F");',
'  doc.setFillColor(255,140,0);',
'  doc.rect(0,26,W,4,"F");',
'  doc.setTextColor(255,255,255);',
'  doc.setFontSize(20);doc.setFont("helvetica","bold");',
'  doc.text("THERMOSYS v3",14,13);',
'  doc.setFontSize(9);doc.setFont("helvetica","normal");',
'  doc.text(FR?"CALCUL DESENFUMAGE - IT 246 / DTR C3-41":"SMOKE EXTRACTION CALCULATION - IT 246 / DTR C3-41",14,21);',
'  doc.text(dateStr,W-14,21,{align:"right"});',
'  doc.setTextColor(0,0,0);',
'  y=38;',

// Fonction section
'  function section(title){',
'    if(y>260){doc.addPage();y=20;}',
'    doc.setFillColor(230,242,255);',
'    doc.rect(10,y,W-20,8,"F");',
'    doc.setDrawColor(0,119,168);',
'    doc.setLineWidth(0.5);',
'    doc.rect(10,y,W-20,8,"S");',
'    doc.setFont("helvetica","bold");',
'    doc.setFontSize(9);',
'    doc.setTextColor(0,80,130);',
'    doc.text(title,14,y+5.5);',
'    doc.setTextColor(0,0,0);',
'    y+=11;',
'  }',

// Fonction ligne
'  function row(lbl,val){',
'    if(y>275){doc.addPage();y=20;}',
'    doc.setFont("helvetica","bold");',
'    doc.setFontSize(8.5);',
'    doc.setTextColor(60,60,60);',
'    doc.text(lbl,14,y);',
'    doc.setFont("helvetica","normal");',
'    doc.setTextColor(0,0,0);',
'    doc.text(String(val),105,y);',
'    y+=5.5;',
'  }',

// Fonction bloc texte
'  function bloc(txt){',
'    if(!txt)return;',
'    doc.setFont("courier","normal");',
'    doc.setFontSize(7.5);',
'    doc.setTextColor(30,30,30);',
'    doc.setFillColor(248,252,255);',
'    var tLines=txt.split(String.fromCharCode(10));',
'    var validLines=tLines.filter(function(l){return l.trim().length>0;});',
'    var bh=validLines.length*4.5+6;',
'    if(y+bh>275){doc.addPage();y=20;}',
'    doc.rect(10,y,W-20,bh,"F");',
'    doc.setDrawColor(180,210,240);',
'    doc.rect(10,y,W-20,bh,"S");',
'    y+=4;',
'    validLines.forEach(function(l){',
'      if(y>272){doc.addPage();y=20;}',
'      doc.text(l.trim(),14,y);',
'      y+=4.5;',
'    });',
'    y+=3;',
'  }',

// SECTION 1 - Donnees locaux
'  section(FR?"DONNEES DU LOCAL":"ROOM DATA");',
'  row(FR?"Surface (m2) :":"Area (m2):",surf);',
'  row(FR?"Hauteur (m) :":"Height (m):",haut);',
'  row(FR?"Volume (m3) :":"Volume (m3):",surf&&haut?(parseFloat(surf)*parseFloat(haut)).toFixed(1):"");',
'  row(FR?"Type de local :":"Room type:",clean(type));',
'  row(FR?"Mode d\'extraction :":"Extraction mode:",clean(mode));',
'  row(FR?"Nombre de cantons :":"Smoke zones:",cantons);',
'  y+=3;',

// SECTION 2 - Panache thermique
'  section(FR?"PANACHE THERMIQUE (Methode IT 246)":"THERMAL PLUME (IT 246 Method)");',
'  row(FR?"Puissance feu Qc (kW) :":"Fire HRR Qc (kW):",qc2);',
'  row(FR?"Hauteur interface z (m) :":"Interface height z (m):",z2);',
'  row(FR?"Temperature ambiante T0 (degC) :":"Ambient temp T0 (degC):",t02);',
'  y+=3;',

// SECTION 3 - Resultats
'  section(FR?"RESULTATS DESENFUMAGE":"SMOKE EXTRACTION RESULTS");',

// Parser et afficher les resultats de maniere structuree
'  if(resText){',
'    var pairs=resText.match(/([A-Za-z\\u00C0-\\u024F][^:]+):\\s*([^\\n]+)/g);',
'    if(pairs&&pairs.length>3){',
'      pairs.forEach(function(p){',
'        var parts=p.split(":");',
'        if(parts.length>=2){',
'          var lbl=parts[0].trim();',
'          var val=parts.slice(1).join(":").trim();',
'          if(lbl.length<50&&val.length<60) row(lbl+" :",val);',
'        }',
'      });',
'    } else {',
'      bloc(resText);',
'    }',
'  }',
'  y+=3;',

// SECTION 4 - Normes
'  section(FR?"NORMES ET REFERENCES":"STANDARDS AND REFERENCES");',
'  doc.setFont("helvetica","normal");',
'  doc.setFontSize(8);',
'  doc.setTextColor(40,40,40);',
'  var normes=[',
'    "IT 246 (Instruction Technique 246) - Desenfumage des ERP",',
'    "DTR C3-41 - Regles de conception du desenfumage (Algerie)",',
'    "EN 12101-6 - Systemes de controle des fumees et de la chaleur",',
'    "EN 12101-3 - Extracteurs de fumees et de chaleur"',
'  ];',
'  normes.forEach(function(n){',
'    if(y>272){doc.addPage();y=20;}',
'    doc.text("- "+n,14,y);',
'    y+=5;',
'  });',
'  y+=3;',

// SECTION 5 - Avertissement
'  if(y>240){doc.addPage();y=20;}',
'  doc.setFillColor(255,248,230);',
'  doc.rect(10,y,W-20,18,"F");',
'  doc.setDrawColor(255,140,0);',
'  doc.setLineWidth(0.5);',
'  doc.rect(10,y,W-20,18,"S");',
'  doc.setFont("helvetica","bold");',
'  doc.setFontSize(8);',
'  doc.setTextColor(180,80,0);',
'  doc.text(FR?"AVERTISSEMENT :":"WARNING:",14,y+5);',
'  doc.setFont("helvetica","normal");',
'  doc.setTextColor(100,60,0);',
'  doc.text(FR?"Resultats indicatifs uniquement. A valider obligatoirement par un bureau d\'etudes agree":"Indicative results only. Must be validated by an approved engineering firm.",14,y+10);',
'  doc.text(FR?"conformement aux reglementations en vigueur.":"in accordance with applicable regulations.",14,y+15);',
'  y+=22;',

// PIED DE PAGE
'  var pages=doc.internal.getNumberOfPages();',
'  for(var i=1;i<=pages;i++){',
'    doc.setPage(i);',
'    doc.setDrawColor(0,119,168);',
'    doc.setLineWidth(0.3);',
'    doc.line(10,285,W-10,285);',
'    doc.setFontSize(7);',
'    doc.setTextColor(120,120,120);',
'    doc.text("Thermosys v3 - thermosys-v3.vercel.app",14,290);',
'    doc.text("Page "+i+"/"+pages,W-14,290,{align:"right"});',
'  }',

'  var fn="Thermosys_Desenfumage_"+new Date().toISOString().slice(0,10)+".pdf";',
'  doc.save(fn);',
'  if(typeof showToast==="function")showToast(FR?"PDF Desenfumage exporte":"Smoke extraction PDF exported","s");',
'  if(typeof logHist==="function")logHist(FR?"Export PDF Desenfumage":"Smoke extraction PDF export");',
'}',

'window.exportDsfPDF=exportDsfPDF;',

// Ajouter bouton apres le resultat
'document.addEventListener("DOMContentLoaded",function(){',
'  setTimeout(function(){',
'    var pg=document.getElementById("pg-desenfumage");',
'    if(!pg||document.getElementById("dsf-pdf-btn"))return;',
'    var res=document.getElementById("dsf_result");',
'    if(!res)return;',
'    var btn=document.createElement("button");',
'    btn.id="dsf-pdf-btn";',
'    btn.className="btn bp";',
'    btn.style.cssText="width:100%;margin-top:8px;";',
'    btn.innerHTML="\\uD83D\\uDCC4 "+(window.lang==="en"?"Export PDF":"Exporter PDF");',
'    btn.onclick=exportDsfPDF;',
'    res.parentNode.insertBefore(btn,res.nextSibling);',
'  },2000);',
'});',
'})();'
];

var scriptContent = lines.join('\n');

// Verifier pas de non-ASCII
var nonAscii=0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:', nonAscii);

var newScript='<script id="dsf-pdf-v1">\n'+scriptContent+'\n</script>';
var insertPos=h.lastIndexOf('</body>');
if(insertPos===-1)insertPos=h.length;
var result=h.substring(0,insertPos)+newScript+'\n'+h.substring(insertPos);
fs.writeFileSync(distFile,result,'utf8');
console.log('OK - dsf-pdf-v1 applique');
console.log('Occurrences:',(result.match(/dsf-pdf-v1/g)||[]).length);
