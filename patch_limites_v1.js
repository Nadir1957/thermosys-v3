// Thermosys - Module horaire : avertissement visible sous les resultats (froid sous-estime)
// Usage : node patch_limites_v1.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('hz-warn-froid') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const A = "h += resultsHtml(R); }";
const n = s.split(A).length - 1;
if (n !== 1) { console.log('ARRET : ancre trouvee ' + n + ' fois (attendu 1)'); process.exit(1); }
const W = {
  fr: '⚠ Attention : sur 6 cas comparés à EnergyPlus, le froid sensible annuel est sous-estimé de 7 à 35 % et les pointes de puissance sont inférieures de 0 à 24 %. Prévoir une marge de sécurité sur le refroidissement. Non validé en climat méditerranéen ni algérien.',
  en: '⚠ Warning: in 6 cases compared with EnergyPlus, annual sensible cooling is underestimated by 7 to 35 % and power peaks are 0 to 24 % lower. Allow a safety margin on cooling. Not validated in Mediterranean or Algerian climate.',
  es: '⚠ Atención: en 6 casos comparados con EnergyPlus, el frío sensible anual está subestimado entre un 7 y un 35 % y las puntas de potencia son entre un 0 y un 24 % inferiores. Prever un margen de seguridad en la refrigeración. No validado en clima mediterráneo ni argelino.'
};
const B = "h += resultsHtml(R); h += '<div class=\"hz-warn-froid\" style=\"color:var(--wn);font-size:11px;margin:6px 0\">' + (" + JSON.stringify(W) + "[L()] || " + JSON.stringify(W.en) + ") + '</div>'; }";
const before = s.length;
s = s.replace(A, function () { return B; });
const scripts = s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || [];
let ok = true;
scripts.forEach(function (x) { const body = x.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''); if (!body.trim() || /type="(application\/json|text\/template)"/.test(x)) return; try { new Function(body); } catch (er) { ok = false; console.log('Erreur de syntaxe : ' + er.message); } });
if (!ok) { console.log('ARRET : rien ecrit'); process.exit(1); }
fs.writeFileSync(f, s, 'utf8');
console.log('Avertissement ajoute (FR/EN/ES)');
console.log('Taille : ' + before + ' -> ' + s.length + ' octets');
console.log('Syntaxe JS : OK');
