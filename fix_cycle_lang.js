/* fix_cycle_lang.js - corrige la traduction automatique du module CYCLE FRIGORIFIQUE et ameliore la note imprimee
   Usage (depuis le dossier files) : node fix_cycle_lang.js dist\index.html   -  idempotent */
var fs = require('fs');
var f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier (dist\\index.html)'); process.exit(1); }
var s = fs.readFileSync(f, 'utf8');
if (s.indexOf('cyLastLang') >= 0) { console.log('DEJA FAIT : correction deja appliquee'); process.exit(0); }
var E = [
 ["window.toggleLang = function () { if (_ot) { _ot.apply(this, arguments); } setTimeout(function () { applyLang(); window.cyCalc(); }, 150); };",
  "window.toggleLang = function () { if (_ot) { _ot.apply(this, arguments); } setTimeout(function () { applyLang(); window.cyCalc(); }, 150); };\n  var cyLastLang = window.lang;\n  setInterval(function () { if (window.lang !== cyLastLang) { cyLastLang = window.lang; applyLang(); if ($('cy_out')) { window.cyCalc(); } } }, 300);"],
 ["font-size=\"10\" style=\"fill:var(--ts)\">' + T('1 aspiration", "font-size=\"11\" style=\"fill:var(--ts)\">' + T('1 aspiration"],
 ["'<h1>THERMOSYS — ' + T('NOTE CYCLE FRIGORIFIQUE', 'REFRIGERATION CYCLE NOTE') + '</h1>",
  "'<div style=\"font-size:20pt;font-weight:900;letter-spacing:5px\">THERMOSYS</div><div style=\"font-size:8pt;letter-spacing:3px;color:#555\">HVAC WORKSTATION v3</div><hr><h1>' + T('NOTE CYCLE FRIGORIFIQUE', 'REFRIGERATION CYCLE NOTE') + '</h1><p style=\"font-size:9pt;color:#555\">' + T('Référence', 'Reference') + ' : ' + ref + '</p>"]
];
for (var i = 0; i < E.length; i++) {
  var c = s.split(E[i][0]).length - 1;
  if (c !== 1) { console.log('ARRET : ancre ' + (i + 1) + ' trouvee ' + c + ' fois (attendu 1). Rien modifie.'); process.exit(1); }
}
E.forEach(function (p) { s = s.replace(p[0], function () { return p[1]; }); });
fs.writeFileSync(f, s, 'utf8');
console.log('OK : correction appliquee (traduction automatique + note imprimee)');
