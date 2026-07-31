const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

// Dossiers source et destination
const SRC = __dirname;
const DIST = path.join(__dirname, 'dist');

// Créer le dossier dist et dist/api
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);
if (!fs.existsSync(path.join(DIST, 'api'))) fs.mkdirSync(path.join(DIST, 'api'));

// Lire le fichier index.html
const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');

// Options de minification
const options = {
    collapseWhitespace: false,
    removeComments: false,
    removeRedundantAttributes: true,
    minifyJS: false,
    minifyCSS: true
};

// Minifier et sauvegarder
minify(html, options).then(minified => {
    fs.writeFileSync(path.join(DIST, 'index.html'), minified);
    console.log('✅ index.html minifié');

    // Copier api/ocr.js
    fs.copyFileSync(
        path.join(SRC, 'api', 'ocr.js'),
        path.join(DIST, 'api', 'ocr.js')
    );
    console.log('✅ api/ocr.js copié');

    // Copier les autres fichiers
    ['vercel.json', 'package.json', 'robots.txt'].forEach(f => {
        fs.copyFileSync(path.join(SRC, f), path.join(DIST, f));
    });
    console.log('✅ Fichiers de configuration copiés');
    console.log('🎉 Minification terminée ! Dossier dist prêt.');
});