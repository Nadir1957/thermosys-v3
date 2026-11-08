const fs = require('fs');
const c = fs.readFileSync('dist/index.html', 'utf8');
// Extract all <script> blocks and check each parses as valid JS
const scriptRe = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
let m, idx = 0, errors = 0;
while ((m = scriptRe.exec(c)) !== null) {
  idx++;
  const code = m[1];
  if (!code.trim()) continue;
  try {
    new Function(code);
  } catch (e) {
    errors++;
    console.log('ERREUR dans <script> #' + idx + ': ' + e.message);
    const errPos = c.indexOf(code);
    console.log('Contexte: ...' + c.slice(Math.max(0,errPos), errPos+200) + '...');
  }
}
console.log(errors === 0 ? 'TOUS LES SCRIPTS SONT SYNTAXIQUEMENT VALIDES (' + idx + ' blocs verifies)' : errors + ' ERREUR(S) TROUVEE(S)');
