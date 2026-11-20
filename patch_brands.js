// Thermosys - coherence du nombre de marques : seules les marques ayant des equipements au catalogue sont comptees (38).
// - supprime le doublon CIAT et les 11 marques sans equipement de la liste BRANDS (filtre, accueil, export, message de demarrage)
// - remplace les textes ecrits en dur "50 constructeurs / manufacturers / fabricantes..." par 38 (FR / EN / ES)
// Usage : node patch_brands.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');

const CODE_OLD = 'BRANDS=APPDATA[a0_0x2df16a(0xb5f)]||[],';
const CODE_NEW = 'BRANDS=(function(a){a=a.filter(function(b,i){return a.indexOf(b)===i;});try{var u=a.filter(function(b){return PRODS.some(function(p){return p.brand===b;});});return u.length?u:a;}catch(e){return a;}})(APPDATA[a0_0x2df16a(0xb5f)]||[]),';

const RE = /(?<![0-9])50((?: |\\x20)(?:constructeurs|manufacturers|fabricantes|fabricants|international(?: |\\x20)brands|marcas(?: |\\x20)internacionales|marques(?: |\\x20)internationales))/gi;

const codeOld = s.split(CODE_OLD).length - 1;
const codeNew = s.split(CODE_NEW).length - 1;
const texts = (s.match(RE) || []).length;

if (codeNew === 1 && texts === 0) { console.log('DEJA FAIT'); process.exit(0); }
if (codeOld + codeNew !== 1) { console.log('ARRET : ancre du code introuvable ou multiple (' + codeOld + ' / ' + codeNew + ')'); process.exit(1); }

const before = s.length;
if (codeOld === 1) { s = s.replace(CODE_OLD, function () { return CODE_NEW; }); console.log('Liste des marques (doublons et marques sans equipement) : OK'); }
let n = 0;
s = s.replace(RE, function (m, tail) { n++; return '38' + tail; });
console.log('Textes "50 ..." remplaces par 38 : ' + n);
fs.writeFileSync(f, s, 'utf8');
console.log('Taille : ' + before + ' -> ' + s.length + ' octets');

let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (er) { bad++; console.log('ATTENTION script ' + i + ' : ' + er.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
const left = (s.match(RE) || []).length;
console.log('Restes "50 constructeurs..." : ' + left);
