// Remplace la phrase "Pas de comparaison avec une maison reelle mesuree" par la validation sur mesures (FR + EN)
// Usage : node add_validation_note.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('Usage: node add_validation_note.js dist\\index.html'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const R = [
  [
    "dans la littérature. Pas de comparaison avec une maison réelle mesurée à ce jour.",
    "dans la littérature. Comparé à des mesures réelles de deux maisons d'essai allemandes (Holzkirchen, projets AIE EBC Annexes 58 et 71, sans réglage sur ces mesures) : température à 0,4 à 0,9 K près ; chauffage entre −23 % et +13 % selon l'essai. Non validé en climat méditerranéen ni algérien."
  ],
  [
    "in the literature. No comparison with a measured real house yet.",
    "in the literature. Compared with measurements on two German test houses (Holzkirchen, IEA EBC Annexes 58 and 71, not tuned to these measurements): temperature within 0.4 to 0.9 K; heating between −23 % and +13 % depending on the test. Not validated in Mediterranean or Algerian climate."
  ]
];
for (const [a, b] of R) {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.log('ARRET : texte trouve ' + n + ' fois (attendu 1) : ' + a.slice(0, 60) + '...'); process.exit(1); }
}
for (const [a, b] of R) s = s.replace(a, () => b);
fs.writeFileSync(f, s, 'utf8');
console.log('OK : 2 remplacements effectues (FR + EN).');
