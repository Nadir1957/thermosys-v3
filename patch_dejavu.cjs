const fs = require('fs');
const path = require('path');

// 1. Copier le fichier de police dans dist/
const distDir = path.join(__dirname, 'dist');
const fontSrc = path.join(__dirname, 'dejavu-sans.js');
const fontDst = path.join(distDir, 'dejavu-sans.js');

if(fs.existsSync(fontSrc)) {
  fs.copyFileSync(fontSrc, fontDst);
  console.log('Police copiée dans dist/');
} else {
  console.log('ERREUR: dejavu-sans.js non trouvé');
  process.exit(1);
}

// 2. Modifier dist/index.html pour charger la police lazily
const distFile = path.join(distDir, 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch
if(h.includes('dejavu-font-patch')) {
  var s=h.lastIndexOf('<script',h.indexOf('dejavu-font-patch'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

var lines = [
'(function(){',
'  var loaded=false,loading=false;',

// Charger le fichier JS de police à la demande
'  function loadFont(cb){',
'    if(loaded&&window.DEJAVU_SANS_B64){cb(true);return;}',
'    if(loading){setTimeout(function(){loadFont(cb);},300);return;}',
'    loading=true;',
'    var sc=document.createElement("script");',
'    sc.src="/dejavu-sans.js";',
'    sc.onload=function(){loaded=true;loading=false;cb(true);};',
'    sc.onerror=function(){loading=false;cb(false);};',
'    document.head.appendChild(sc);',
'  }',

// Ajouter DejaVu au doc jsPDF
'  function addFont(doc,cb){',
'    loadFont(function(ok){',
'      if(!ok||!window.DEJAVU_SANS_B64){cb(false);return;}',
'      try{',
'        doc.addFileToVFS("DejaVuSans.ttf",window.DEJAVU_SANS_B64);',
'        doc.addFont("DejaVuSans.ttf","DejaVuSans","normal");',
'        cb(true);',
'      }catch(e){console.log("DejaVu:",e);cb(false);}',
'    });',
'  }',

'  window._addDejaVuToDoc=addFont;',
'  window._loadDejaVuFont=loadFont;',
'})();'
];

var newScript = '<script id="dejavu-font-patch">\n' + lines.join('\n') + '\n</script>';
var insertPos = h.lastIndexOf('</body>');
if(insertPos===-1) insertPos=h.length;
var result = h.substring(0,insertPos) + newScript + '\n' + h.substring(insertPos);
fs.writeFileSync(distFile, result, 'utf8');
console.log('OK - dejavu-font-patch applique');
