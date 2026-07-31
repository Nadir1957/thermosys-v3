const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch si présent
if(h.includes('scop-pdf-v1')) {
  const s = h.lastIndexOf('<script', h.indexOf('scop-pdf-v1'));
  const e = h.indexOf('</script>', s) + 9;
  h = h.substring(0, s) + h.substring(e);
}

const script = `<script id="scop-pdf-v1">
(function(){
  function exportScopPDF(){
    var lang = window.lang || 'fr';
    var isFR = lang === 'fr';
    
    // Récupérer les données
    var country = (document.getElementById('scopCountry')||{}).value || '';
    var zone = (document.getElementById('scopZone')||{}).value || '';
    var cap = (document.getElementById('scopCap')||{}).value || '';
    var cop = (document.getElementById('scopCOP')||{}).value || '';
    var ref = (document.getElementById('scopRef')||{}).value || '';
    var costCap = (document.getElementById('costCap')||{}).value || '';
    var costH = (document.getElementById('costH')||{}).value || '';
    var costKWh = (document.getElementById('costKWh')||{}).value || '';
    var roiInstPAC = (document.getElementById('roiInstPAC')||{}).value || '';
    var roiInstChaud = (document.getElementById('roiInstChaud')||{}).value || '';
    var roiKwh = (document.getElementById('roiKwh')||{}).value || '';
    var roiScop = (document.getElementById('roiScop')||{}).value || '';
    var roiPrixElec = (document.getElementById('roiPrixElec')||{}).value || '';
    var roiPrixGaz = (document.getElementById('roiPrixGaz')||{}).value || '';
    
    // Récupérer le résultat affiché
    var resultEl = document.querySelector('#pg-scop .res');
    var resultText = resultEl ? resultEl.textContent.trim() : '';
    
    // Créer le PDF avec jsPDF
    if(typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      alert(isFR ? 'jsPDF non disponible' : 'jsPDF not available');
      return;
    }
    
    var jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    var now = new Date();
    var dateStr = now.toLocaleDateString(isFR?'fr-FR':'en-GB') + ' ' + now.toLocaleTimeString(isFR?'fr-FR':'en-GB');
    
    // === EN-TÊTE ===
    doc.setFillColor(0, 119, 168);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('THERMOSYS v3', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(isFR ? 'CALCUL SCOP/COP — PERFORMANCE PAC' : 'SCOP/COP CALCULATION — HP PERFORMANCE', 14, 20);
    doc.text(dateStr, 196, 12, {align:'right'});
    doc.setTextColor(0, 0, 0);
    
    var y = 36;
    
    // === PARAMÈTRES ===
    doc.setFillColor(230, 242, 248);
    doc.rect(10, y, 90, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 100, 150);
    doc.text(isFR ? 'PARAMÈTRES ÉQUIPEMENT' : 'EQUIPMENT PARAMETERS', 14, y+5);
    doc.setTextColor(0,0,0);
    y += 10;
    
    var params = [
      [isFR?'Zone climatique :':'Climate zone:', zone],
      [isFR?'Puissance nominale (kW) :':'Nominal capacity (kW):', cap],
      ['COP nominal (A7/W35) :', cop],
      [isFR?'Frigorigène :':'Refrigerant:', ref],
    ];
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    params.forEach(function(p){
      doc.setFont('helvetica', 'bold');
      doc.text(p[0], 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(p[1]), 80, y);
      y += 6;
    });
    
    y += 4;
    
    // === RÉSULTATS ===
    doc.setFillColor(230, 242, 248);
    doc.rect(10, y, 90, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 100, 150);
    doc.text(isFR ? 'RÉSULTATS' : 'RESULTS', 14, y+5);
    doc.setTextColor(0,0,0);
    y += 10;
    
    // Afficher le résultat ligne par ligne
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    var lines = resultText.split('\n');
    lines.forEach(function(line){
      if(line.trim()) {
        doc.text(line.trim(), 14, y);
        y += 5;
      }
    });
    
    y += 6;
    
    // === COÛT ÉNERGÉTIQUE ===
    if(costCap || costH || costKWh) {
      doc.setFillColor(230, 242, 248);
      doc.rect(10, y, 90, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 100, 150);
      doc.text(isFR ? 'COÛT ÉNERGÉTIQUE ANNUEL' : 'ANNUAL ENERGY COST', 14, y+5);
      doc.setTextColor(0,0,0);
      y += 10;
      
      var costParams = [
        [isFR?'Puissance PAC (kW) :':'HP capacity (kW):', costCap],
        [isFR?'Heures fonct./an :':'Operating hours/yr:', costH],
        [isFR?'Prix kWh (DA/kWh) :':'Energy price:', costKWh],
      ];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      costParams.forEach(function(p){
        doc.setFont('helvetica', 'bold');
        doc.text(p[0], 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(p[1]), 80, y);
        y += 6;
      });
      y += 4;
    }
    
    // === ROI ===
    if(roiInstPAC) {
      doc.setFillColor(230, 242, 248);
      doc.rect(10, y, 90, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 100, 150);
      doc.text(isFR ? 'ANALYSE ROI PAC vs CHAUDIÈRE' : 'HP vs BOILER ROI ANALYSIS', 14, y+5);
      doc.setTextColor(0,0,0);
      y += 10;
      
      var roiParams = [
        [isFR?'Invest. PAC :':'HP investment:', roiInstPAC + ' DA'],
        [isFR?'Invest. chaudière :':'Boiler investment:', roiInstChaud + ' DA'],
        [isFR?'Conso. annuelle (kWh) :':'Annual consumption (kWh):', roiKwh],
        ['SCOP PAC :', roiScop],
        [isFR?'Prix élec. (DA/kWh) :':'Elec. price:', roiPrixElec],
        [isFR?'Prix gaz (DA/kWh) :':'Gas price:', roiPrixGaz],
      ];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      roiParams.forEach(function(p){
        if(y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(p[0], 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(p[1]), 80, y);
        y += 6;
      });
    }
    
    // === PIED DE PAGE ===
    var pageCount = doc.internal.getNumberOfPages();
    for(var i=1; i<=pageCount; i++){
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150,150,150);
      doc.text('Thermosys v3 — thermosys-v3.vercel.app', 14, 290);
      doc.text('Page ' + i + '/' + pageCount, 196, 290, {align:'right'});
    }
    
    // Sauvegarder
    var filename = 'Thermosys_SCOP_' + new Date().toISOString().slice(0,10) + '.pdf';
    doc.save(filename);
    if(typeof logHist === 'function') logHist(isFR ? 'Export PDF SCOP généré' : 'SCOP PDF exported');
    if(typeof showToast === 'function') showToast(isFR ? 'PDF SCOP exporté ✓' : 'SCOP PDF exported ✓', 's');
  }
  
  // Exposer globalement
  window.exportScopPDF = exportScopPDF;
  
  // Ajouter le bouton dans le module SCOP
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      var pg = document.getElementById('pg-scop');
      if(!pg) return;
      if(document.getElementById('scop-pdf-btn')) return;
      
      // Trouver un bon endroit pour insérer le bouton
      var resultEl = pg.querySelector('.res');
      if(resultEl) {
        var btn = document.createElement('button');
        btn.id = 'scop-pdf-btn';
        btn.className = 'btn bp';
        btn.style.cssText = 'width:100%;margin-top:8px;';
        btn.innerHTML = '\uD83D\uDCC4 ' + (window.lang==='en' ? 'Export PDF' : 'Exporter PDF');
        btn.onclick = exportScopPDF;
        resultEl.parentNode.insertBefore(btn, resultEl.nextSibling);
      }
    }, 2000);
  });
})();
</script>`;

const insertPos = h.lastIndexOf('</body>');
const result = h.substring(0, insertPos) + script + '\n' + h.substring(insertPos);
fs.writeFileSync(distFile, result, 'utf8');
console.log('OK - scop-pdf-v1 appliqué');
console.log('Occurrences:', (result.match(/scop-pdf-v1/g)||[]).length);
