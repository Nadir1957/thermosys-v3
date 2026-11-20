// Thermosys - correction : les traductions des blocs 26-29 doivent aller dans le dictionnaire .es
// Usage : node fix_aide_es.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('<script id="lang-es-data-34">');
if (a < 0) { console.log('ARRET : script lang-es-data-34 introuvable'); process.exit(1); }
const e = s.indexOf('</script>', a);
let blk = s.slice(a, e);
const OLD = ';var t=window.I18N3.dict;Object.keys(D)';
const NEW = ';var t=window.I18N3.dict.es=window.I18N3.dict.es||{};Object.keys(D)';
if (blk.indexOf(NEW) >= 0) { console.log('DEJA FAIT'); process.exit(0); }
if (blk.split(OLD).length !== 2) { console.log('ARRET : ancre introuvable ou multiple'); process.exit(1); }
blk = blk.replace(OLD, NEW);
s = s.slice(0, a) + blk + s.slice(e);
fs.writeFileSync(f, s, 'utf8');
console.log('OK : traductions redirigees vers le dictionnaire espagnol');
let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (er) { bad++; console.log('ATTENTION script ' + i + ' : ' + er.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
