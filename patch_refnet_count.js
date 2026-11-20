// Thermosys - REFNET : nombre de constructeurs VRF = 12 (13 gammes, LG compte 2 gammes) au lieu de 10 (AIDE) / 7 (commentaire)
// Usage : node patch_refnet_count.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const RE = /(?<![0-9])10((?: |\\x20)(?:constructeurs(?: |\\x20)VRF|VRF(?: |\\x20)manufacturers|fabricantes(?: |\\x20)de(?: |\\x20)VRF))/g;
const C_OLD = 'REFNET — Sélection multi-marques (7 fabricants)';
const C_NEW = 'REFNET — Sélection multi-marques (12 fabricants, 13 gammes)';
const nAide = (s.match(RE) || []).length;
const nCom = s.split(C_OLD).length - 1;
if (nAide === 0 && nCom === 0) { console.log('DEJA FAIT (ou rien a corriger)'); process.exit(0); }
if (nCom > 1) { console.log('ARRET : commentaire en plusieurs exemplaires (' + nCom + ')'); process.exit(1); }
const before = s.length;
s = s.replace(RE, function (m, tail) { return '12' + tail; });
if (nCom === 1) s = s.replace(C_OLD, function () { return C_NEW; });
fs.writeFileSync(f, s, 'utf8');
console.log('AIDE Refnet (FR/EN/ES) "10" -> "12" : ' + nAide + ' texte(s)');
console.log('Commentaire du code : ' + (nCom === 1 ? 'OK' : 'non trouve'));
console.log('Taille : ' + before + ' -> ' + s.length + ' octets');
let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (er) { bad++; console.log('ATTENTION script ' + i + ' : ' + er.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
