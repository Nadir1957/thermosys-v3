/* Thermosys - met a jour tests\\tewi_regression.js pour la nouvelle regle des facteurs du reseau (50 pays AIE 2025, 21 pays ADEME 2011, Iran non verifie, moyenne UE retiree).
   Usage (depuis le dossier files) :  node patch_tewi_test_v1.js */
'use strict';
const fs = require('fs'), path = require('path');
const f = path.join('tests', 'tewi_regression.js');
if (!fs.existsSync(f)) { console.error('Fichier introuvable : ' + f); process.exit(2); }
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.indexOf('\r\n') >= 0;
let s = crlf ? raw.replace(/\r\n/g, '\n') : raw;
if (s.indexOf('const ADEME =') >= 0) { console.log('Deja applique.'); process.exit(0); }
const ADEME = {"Morocco":0.718,"Tunisia":0.463,"Libya":0.885,"Kuwait":0.842,"Bahrain":0.64,"Oman":0.794,"Jordan":0.566,"Lebanon":0.709,"Iraq":1.003,"Syria":0.594,"Yemen":0.655,"Kenya":0.274,"Ghana":0.259,"Ethiopia":0.007,"Tanzania":0.329,"Cameroon":0.207,"Senegal":0.637,"Ivory Coast":0.445,"Ukraine":0.419,"Pakistan":0.425,"Bangladesh":0.593};
const R = [
  ['const UNV = ["Morocco", "Tunisia", "Libya", "Kuwait", "Bahrain", "Oman", "Jordan", "Lebanon", "Iraq", "Iran", "Syria", "Yemen", "Kenya", "Ghana", "Ethiopia", "Tanzania", "Cameroon", "Senegal", "Ivory Coast", "EU-27 avg.", "Ukraine", "Pakistan", "Bangladesh"];',
   'const ADEME = ' + JSON.stringify(ADEME) + ';\nconst UNV = ["Iran"];'],
  ["chk(gnames.length === 73, '73 pays attendus : ' + gnames.length);", "chk(gnames.length === 72, '72 pays attendus : ' + gnames.length);"],
  ["chk(isFinite(val) && val > 0.001 && val < 1.0, 'facteur plausible ' + lab);", "chk(isFinite(val) && val > 0.001 && val < 1.1, 'facteur plausible ' + lab);"],
  ["  else { nv++; chk(UNV.indexOf(nm) >= 0, 'pays hors AIE attendu : ' + nm); chk(lab.indexOf('non v') >= 0, 'mention non verifie manquante : ' + nm); }",
   "  else if (ADEME[nm] !== undefined) { chk(Math.abs(val - ADEME[nm]) < 0.0006, 'ADEME ' + nm + ' attendu ' + ADEME[nm] + ' trouve ' + val); chk(lab.indexOf('ADEME 2011') > 0, 'mention ADEME 2011 manquante : ' + nm); chk(lab.indexOf('non v') < 0, 'pas de mention non verifie (source ADEME) : ' + nm); }\n  else { nv++; chk(UNV.indexOf(nm) >= 0, 'pays hors AIE et ADEME attendu : ' + nm); chk(lab.indexOf('non v') >= 0, 'mention non verifie manquante : ' + nm); }"],
  ["chk(nv === UNV.length, 'pays non verifies : ' + nv + ' attendus ' + UNV.length);", "chk(nv === UNV.length, 'pays non verifies : ' + nv + ' attendus ' + UNV.length);\nchk(!gnames.some(x => /EU-27/.test(x[1])), 'moyenne UE-27 retiree (aucune source)');\nchk(Object.keys(IEA).length === 50 && Object.keys(ADEME).length === 21, 'sources : 50 AIE + 21 ADEME');"],
  ["size === 73, 'pas de doublon de pays'", "size === 72, 'pas de doublon de pays'"],
  ["chk(sg.length === 17, 'liste statique : 17 pays : ' + sg.length);", "chk(sg.length === 16, 'liste statique : 16 pays : ' + sg.length);"]
];
for (const p of R) { if (s.indexOf(p[0]) < 0) { console.error('ECHEC : ancre introuvable : ' + p[0].slice(0, 60) + '. Fichier non modifie.'); process.exit(3); } s = s.replace(p[0], () => p[1]); }
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s, 'utf8');
console.log('OK : tests\\tewi_regression.js mis a jour.');
