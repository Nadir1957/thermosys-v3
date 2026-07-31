const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch TV si présent
if(h.includes('tv-menu-fix')) {
  const s = h.lastIndexOf('<style', h.indexOf('tv-menu-fix'));
  const e = h.indexOf('</style>', s) + 8;
  h = h.substring(0, s) + h.substring(e);
}

const tvCSS = `<style id="tv-menu-fix">
/* Sony Bravia / Smart TV menu fix */
@media screen and (max-width: 1400px) {
  .mbar {
    flex-wrap: wrap !important;
    overflow-x: visible !important;
    height: auto !important;
    max-height: none !important;
    padding: 4px !important;
    gap: 4px !important;
  }
  .mbar .mn, .mbar button {
    flex: 0 0 auto !important;
    font-size: 10px !important;
    padding: 4px 8px !important;
  }
}
/* Forcer wrap sur tous les écrans TV */
@media tv, screen and (-webkit-min-device-pixel-ratio: 1) and (min-width: 960px) and (max-width: 1920px) {
  .mbar {
    flex-wrap: wrap !important;
    overflow: visible !important;
    height: auto !important;
  }
}
</style>`;

// Insérer avant </head>
const insertPos = h.indexOf('</head>');
if(insertPos > -1) {
  h = h.substring(0, insertPos) + tvCSS + '\n' + h.substring(insertPos);
  console.log('✅ CSS TV inséré avant </head>');
} else {
  // Insérer avant </body>
  const bodyPos = h.lastIndexOf('</body>');
  h = h.substring(0, bodyPos) + tvCSS + '\n' + h.substring(bodyPos);
  console.log('✅ CSS TV inséré avant </body>');
}

fs.writeFileSync(distFile, h, 'utf8');
console.log('Taille:', h.length);
console.log('tv-menu-fix présent:', h.includes('tv-menu-fix') ? '✅' : '❌');
