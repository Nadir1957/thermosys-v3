// ═══════════════════════════════════════════════
// THERMOSYS v4 — CORRECTIONS
// ═══════════════════════════════════════════════

// CORRECTION 1 — Kvs vannes (facteur x10)
var _kvsOriginal = window.calcKvs;
window.calcKvs = function() {
  var q = parseFloat(document.getElementById('kvsQ') ? document.getElementById('kvsQ').value : 0) || 0;
  var dp = parseFloat(document.getElementById('kvsDp') ? document.getElementById('kvsDp').value : 0) || 0;
  var rho = parseFloat(document.getElementById('kvsRho') ? document.getElementById('kvsRho').value : 1) || 1;
  if (q<=0 || dp<=0) { if(typeof _kvsOriginal==='function') _kvsOriginal(); return; }
  var kvs = q / Math.sqrt(dp / (100 * rho));
  var kvsSelect = kvs * 1.3;
  var dpVanne = Math.pow(q/kvs, 2) * 100 * rho;
  var res = document.getElementById('kvsResult');
  if (res) {
    var lang = window.lang || 'fr';
    res.textContent =
      'Kvs requis: ' + kvs.toFixed(3) + ' m³/h\n' +
      'Kvs à sélectionner (+30%): ' + kvsSelect.toFixed(3) + ' m³/h\n' +
      'ΔP vanne: ' + dp + ' kPa | Densité: ' + rho + ' kg/m³\n\n' +
      (lang==='fr' ? 'Sélectionner la vanne avec le Kvs normalisé immédiatement supérieur.' : 'Select valve with next higher normalized Kvs.');
  }
};
