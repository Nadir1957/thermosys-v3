const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Remplacer le script fix-scop-sync
const start = h.lastIndexOf('<script', h.indexOf('fix-scop-sync'));
const end = h.indexOf('</script>', start) + 9;

const newScript = `<script id="fix-scop-sync">
(function(){
  function cleanEmoji(txt){
    return txt.replace(/\\p{Regional_Indicator}{2}/gu,'').replace(/  +/g,' ').trim();
  }

  var isSelectOpen = false;

  function cleanScopOptions(){
    if(isSelectOpen) return; // Ne pas modifier pendant la selection
    var sc=document.getElementById('scopCountry');
    if(!sc||sc.options.length===0)return;
    Array.from(sc.options).forEach(function(o){
      o.textContent=cleanEmoji(o.textContent);
    });
  }

  var lastCountry=null;
  function syncAll(){
    if(isSelectOpen) return; // Ne pas modifier pendant la selection
    var sc=document.getElementById('scopCountry');
    if(!sc)return;
    cleanScopOptions();
    var code=sc.value;
    if(code===lastCountry)return;
    lastCountry=code;
    var F=window._costFournisseurs;
    if(!F)return;
    var span=document.getElementById('costFournisseur');
    if(span)span.textContent=F[code]||code;
    if(typeof updateCostFromCountry==='function')updateCostFromCountry(code);
  }

  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(cleanScopOptions,200);
    setTimeout(cleanScopOptions,600);
    setTimeout(cleanScopOptions,1200);

    // Detecter ouverture/fermeture du select sur mobile
    document.addEventListener('focus', function(e){
      if(e.target && e.target.id === 'scopCountry') isSelectOpen = true;
    }, true);
    document.addEventListener('blur', function(e){
      if(e.target && e.target.id === 'scopCountry'){
        isSelectOpen = false;
        setTimeout(syncAll, 100);
      }
    }, true);
    document.addEventListener('change', function(e){
      if(e.target && e.target.id === 'scopCountry'){
        isSelectOpen = false;
        setTimeout(syncAll, 50);
      }
    }, true);

    // Interval ralenti - toutes les 2s au lieu de 300ms
    setInterval(syncAll, 2000);
  });
})();
</script>`;

h = h.substring(0, start) + newScript + h.substring(end);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - fix-scop-sync corrigé');
console.log('fix-scop-sync:', (h.match(/fix-scop-sync/g)||[]).length, 'occurrence(s)');
