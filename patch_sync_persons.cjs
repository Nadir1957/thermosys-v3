const fs = require('fs');
const path = require('path');

// Appliquer sur index.html (avant obfuscation)
const srcFile = path.join(__dirname, 'index.html');
let h = fs.readFileSync(srcFile, 'utf8');

// Supprimer ancien patch si présent
if(h.includes('sync-persons-init')) {
  const s = h.lastIndexOf('<script', h.indexOf('sync-persons-init'));
  const e = h.indexOf('</script>', s) + 9;
  h = h.substring(0, s) + h.substring(e);
}

// Ajouter sync au chargement - avant </body>
const script = `<script id="sync-persons-init">
(function(){
  function syncPersons(){
    var src = document.getElementById('chgPers');
    var dst = document.getElementById('anPersons');
    if(src && dst && src.value) {
      dst.value = src.value;
      dst.dispatchEvent(new Event('change', {bubbles:true}));
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    // Sync initiale après chargement complet
    setTimeout(syncPersons, 800);
    setTimeout(syncPersons, 2000);
    // Sync à chaque changement de chgPers
    document.addEventListener('input', function(e){
      if(e.target && e.target.id === 'chgPers') syncPersons();
    });
    document.addEventListener('change', function(e){
      if(e.target && e.target.id === 'chgPers') syncPersons();
    });
  });
})();
</script>`;

const insertPos = h.lastIndexOf('</body>');
const result = h.substring(0, insertPos) + script + '\n' + h.substring(insertPos);
fs.writeFileSync(srcFile, result, 'utf8');
console.log('✅ Patch sync personnes appliqué sur index.html');
console.log('sync-persons-init:', (result.match(/sync-persons-init/g)||[]).length, 'occurrence(s)');
