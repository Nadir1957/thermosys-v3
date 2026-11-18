// Ajoute la validation sur mesures reelles au texte lu a voix haute du module ESTIMATION HORAIRE (FR / EN / ES)
// Usage : node add_voice_validation.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('Usage: node add_voice_validation.js dist\\index.html'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const R = [
  ["elle sous-estime en général le froid.",
   "elle sous-estime en général le froid. Comparée à des mesures réelles de deux maisons d essai allemandes, la température est juste à 0,4 à 0,9 degré près, et le besoin de chauffage s écarte de moins 23 à plus 13 pour cent selon l essai. Non validée en climat méditerranéen ni algérien."],
  ["it generally underestimates cooling.",
   "it generally underestimates cooling. Compared with measurements on two German test houses, temperature is within 0.4 to 0.9 degrees, and heating demand deviates from minus 23 to plus 13 percent depending on the test. Not validated in Mediterranean or Algerian climate."],
  ["suele subestimar el frío.",
   "suele subestimar el frío. Comparada con mediciones reales de dos casas de ensayo alemanas, la temperatura es correcta con 0,4 a 0,9 grados de diferencia, y la demanda de calefacción se desvía de menos 23 a más 13 por ciento según el ensayo. No validada en clima mediterráneo ni argelino."]
];
if (s.includes('deux maisons d essai allemandes')) { console.log('DEJA FAIT : rien modifie.'); process.exit(0); }
for (const [a] of R) {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.log('ARRET : texte trouve ' + n + ' fois (attendu 1) : ' + a); process.exit(1); }
}
for (const [a, b] of R) s = s.replace(a, () => b);
fs.writeFileSync(f, s, 'utf8');
console.log('OK : 3 remplacements effectues (FR + EN + ES).');
