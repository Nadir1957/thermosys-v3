// Thermosys - Module horaire : note imprimable (PDF) = avertissement froid + pointe horaire de froid en kW
// Usage : node patch_limites_v2.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('hz-warn-pdf') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
if (s.indexOf('hz-warn-froid') < 0) { console.log('ARRET : appliquez d\'abord patch_limites_v1.js'); process.exit(1); }
const A1 = "var body = '<div class=\"sum\">' + box(t('rh'), fmt(sm.tH, 0) + ' kWh', fmt(sm.tH / A, 1) + ' ' + t('kwhm2')) + box(t('peakh'), fmt(sm.pH, 2) + ' kW', fmt(sm.pH * 1000 / A, 0) + ' W/m²') + (cl ? box(t('rc'), fmt(sm.tC, 0) + ' kWh', fmt(sm.tC / A, 1) + ' ' + t('kwhm2')) : box(";
const B1 = "var body = '<div class=\"sum\"' + (cl ? ' style=\"grid-template-columns:repeat(4,1fr)\"' : '') + '>' + box(t('rh'), fmt(sm.tH, 0) + ' kWh', fmt(sm.tH / A, 1) + ' ' + t('kwhm2')) + box(t('peakh'), fmt(sm.pH, 2) + ' kW', fmt(sm.pH * 1000 / A, 0) + ' W/m²') + (cl ? box(t('rc'), fmt(sm.tC, 0) + ' kWh', fmt(sm.tC / A, 1) + ' ' + t('kwhm2')) + box(t('peakc'), fmt(sm.pC, 2) + ' kW', fmt(sm.pC * 1000 / A, 0) + ' W/m²') : box(";
const A2 = "body += '<h2>' + t('lim') + '</h2><p>' + t('v1') + '</p>";
const W = {
  fr: '⚠ Attention : sur 6 cas comparés à EnergyPlus, le froid sensible annuel est sous-estimé de 7 à 35 % et les pointes de puissance sont inférieures de 0 à 24 %. Prévoir une marge de sécurité sur le refroidissement. Non validé en climat méditerranéen ni algérien.',
  en: '⚠ Warning: in 6 cases compared with EnergyPlus, annual sensible cooling is underestimated by 7 to 35 % and power peaks are 0 to 24 % lower. Allow a safety margin on cooling. Not validated in Mediterranean or Algerian climate.',
  es: '⚠ Atención: en 6 casos comparados con EnergyPlus, el frío sensible anual está subestimado entre un 7 y un 35 % y las puntas de potencia son entre un 0 y un 24 % inferiores. Prever un margen de seguridad en la refrigeración. No validado en clima mediterráneo ni argelino.'
};
const B2 = "body += '<p class=\"hz-warn-pdf\" style=\"border:1pt solid #b45309;border-radius:3pt;padding:2mm 3mm;margin:3mm 0;font-weight:600\">' + (" + JSON.stringify(W) + "[L()] || " + JSON.stringify(W.en) + ") + '</p>';\n  " + A2;
[[A1, 'cases du resume'], [A2, 'section limites']].forEach(function (p) { const n = s.split(p[0]).length - 1; if (n !== 1) { console.log('ARRET : ancre ' + p[1] + ' trouvee ' + n + ' fois (attendu 1)'); process.exit(1); } });
const before = s.length;
s = s.replace(A1, function () { return B1; }).replace(A2, function () { return B2; });
let ok = true;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x) { if (/type="(application\/json|text\/template)"/.test(x)) return; const body = x.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''); if (!body.trim()) return; try { new Function(body); } catch (er) { ok = false; console.log('Erreur de syntaxe : ' + er.message); } });
if (!ok) { console.log('ARRET : rien ecrit'); process.exit(1); }
fs.writeFileSync(f, s, 'utf8');
console.log('Note imprimable : avertissement + pointe de froid ajoutes (FR/EN/ES)');
console.log('Taille : ' + before + ' -> ' + s.length + ' octets');
console.log('Syntaxe JS : OK');
