// Thermosys - CHARGE PRO : la charge latente de l'air neuf et de l'infiltration ne peut pas etre negative
// (un air exterieur plus sec que l'air interieur ne donne aucun credit de deshumidification).
// Usage : node patch_charge_lat.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const A_OLD = 'inf[1][s_] = mInf * hfg * (Wo - Wi);';
const A_NEW = 'inf[1][s_] = mInf * hfg * Math.max(0, Wo - Wi);';
const B_OLD = 'vent[1][s_] = mVen * hfg * (Wo - Wi);';
const B_NEW = 'vent[1][s_] = mVen * hfg * Math.max(0, Wo - Wi);';
if (s.indexOf(A_NEW) >= 0 && s.indexOf(B_NEW) >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const na = s.split(A_OLD).length - 1, nb = s.split(B_OLD).length - 1;
if (na !== 1 || nb !== 1) { console.log('ARRET : ancres introuvables ou multiples (infiltration ' + na + ', air neuf ' + nb + ')'); process.exit(1); }
const before = s.length;
s = s.replace(A_OLD, A_NEW).replace(B_OLD, B_NEW);
fs.writeFileSync(f, s, 'utf8');
console.log('Infiltration latente : OK');
console.log('Air neuf latent : OK');
console.log('Taille : ' + before + ' -> ' + s.length + ' octets (+' + (s.length - before) + ')');
let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (er) { bad++; console.log('ATTENTION script ' + i + ' : ' + er.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
