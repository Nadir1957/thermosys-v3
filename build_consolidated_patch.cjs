const fs = require('fs');
const files = [];
for (let i = 1; i <= 18; i++) files.push('fix' + i + '.cjs');
files.push('fix21.cjs');
files.push('fix22.cjs');
files.push('fix23.cjs');
files.push('fix24.cjs');
files.push('fix25.cjs');
files.push('fix26.cjs');

let combined = '// Patch consolide - Session 14 juillet 2026\n';
combined += '// Regroupe fix1.cjs a fix18.cjs (F-GAS bidirectionnel + SCOP/COP bidirectionnel complet)\n';
combined += '// Genere automatiquement le 15 juillet 2026\n\n';

files.forEach(function(fname) {
  if (!fs.existsSync(fname)) {
    console.log('MANQUANT:', fname);
    return;
  }
  const content = fs.readFileSync(fname, 'utf8');
  combined += '// ===== ' + fname + ' =====\n';
  combined += '{\n' + content + '\n}\n\n';
});

fs.writeFileSync('patch_scop_fgas_bidirectional_14juillet2026.cjs', combined, 'utf8');
console.log('Patch consolide cree:', combined.length, 'caracteres');