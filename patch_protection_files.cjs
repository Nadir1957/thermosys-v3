// patch_protection_files.js — Protection clic droit sur files/index.html
const fs = require('fs');

const FICHIER = 'D:\\Froid et climatisation\\Thermosys\\Thermosys v3\\files\\index.html';

console.log('='.repeat(55));
console.log('  THERMOSYS v3 - Protection fichier final');
console.log('='.repeat(55));
console.log('');

if (!fs.existsSync(FICHIER)) {
  console.log('ERREUR : Fichier introuvable');
  process.exit(1);
}

const SAUVEGARDE = FICHIER.replace('index.html', 'index_AVANT_PROTECTION.html');
if (!fs.existsSync(SAUVEGARDE)) {
  fs.copyFileSync(FICHIER, SAUVEGARDE);
  console.log('OK Sauvegarde creee');
} else {
  console.log('OK Sauvegarde existante conservee');
}

let c = fs.readFileSync(FICHIER, 'utf8');

if (c.includes('Protection Thermosys v3')) {
  console.log('!! Protection deja presente');
  process.exit(0);
}

const PROTECTION_CSS = `
<style>
/* Protection Thermosys v3 */
body { -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; }
input, textarea, select { -webkit-user-select:text; -moz-user-select:text; user-select:text; }
</style>`;

const PROTECTION_JS = `
<script>
/* Protection Thermosys v3 © Nadir Mouissat */
(function(){
  document.addEventListener('contextmenu',function(e){e.preventDefault();return false;});
  document.addEventListener('keydown',function(e){
    if(e.key==='F12'){e.preventDefault();return false;}
    if(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='i')){e.preventDefault();return false;}
    if(e.ctrlKey&&e.shiftKey&&(e.key==='J'||e.key==='j')){e.preventDefault();return false;}
    if(e.ctrlKey&&e.shiftKey&&(e.key==='C'||e.key==='c')){e.preventDefault();return false;}
    if(e.ctrlKey&&(e.key==='U'||e.key==='u')){e.preventDefault();return false;}
    if(e.ctrlKey&&(e.key==='S'||e.key==='s')){e.preventDefault();return false;}
  });
  document.addEventListener('selectstart',function(e){e.preventDefault();return false;});
})();
</script>`;

// Ajouter CSS dans <head>
const headClose = c.lastIndexOf('</head>');
if (headClose >= 0) {
  c = c.slice(0, headClose) + PROTECTION_CSS + '\n</head>' + c.slice(headClose + 7);
  console.log('OK CSS anti-selection ajoute');
}

// Ajouter JS avant </body>
const bodyClose = c.lastIndexOf('</body>');
if (bodyClose >= 0) {
  c = c.slice(0, bodyClose) + PROTECTION_JS + '\n</body>' + c.slice(bodyClose + 7);
  console.log('OK Protection clic droit + F12 ajoutee');
}

fs.writeFileSync(FICHIER, c, 'utf8');

console.log('');
console.log('='.repeat(55));
console.log('  SUCCES ! Fichier final protege.');
console.log('  Tapez maintenant : vercel --prod --force');
console.log('='.repeat(55));
