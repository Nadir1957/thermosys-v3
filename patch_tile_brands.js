// Thermosys - case "Constructeurs" de l'accueil : 50 -> 38 (marques reellement presentes au catalogue)
// Usage : node patch_tile_brands.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const OLD = '<div class="sc-l" id="t_sc_brands">Constructeurs</div><div class="sc-v">50</div>';
const NEW = '<div class="sc-l" id="t_sc_brands">Constructeurs</div><div class="sc-v">38</div>';
if (s.indexOf(NEW) >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const n = s.split(OLD).length - 1;
if (n !== 1) { console.log('ARRET : ancre introuvable ou multiple (' + n + ')'); process.exit(1); }
s = s.replace(OLD, function () { return NEW; });
fs.writeFileSync(f, s, 'utf8');
console.log('Case Constructeurs de l\'accueil : 50 -> 38 : OK');
