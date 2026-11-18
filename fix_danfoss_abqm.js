// Corrige la plage de temperature de la vanne Danfoss AB-QM DN10 (min et max etaient inverses :
// "120°C min / -10°C max" devient "-10°C min / 120°C max")
// Usage : node fix_danfoss_abqm.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('Usage: node fix_danfoss_abqm.js dist\\index.html'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const a = "'T°\\x20fluide\\x20max':a0_0x2df16a(0x5d8)";
const b = "'T°\\x20fluide\\x20max':'-10°C\\x20min\\x20/\\x20120°C\\x20max'";
if (s.includes(b)) { console.log('DEJA FAIT : rien modifie.'); process.exit(0); }
const n = s.split(a).length - 1;
if (n !== 1) { console.log('ARRET : texte trouve ' + n + ' fois (attendu 1). Rien modifie.'); process.exit(1); }
const before = s.length;
s = s.replace(a, () => b);
fs.writeFileSync(f, s, 'utf8');
console.log('OK : plage AB-QM DN10 corrigee (-10°C min / 120°C max). Taille : ' + before + ' -> ' + s.length);
