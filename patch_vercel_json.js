// Thermosys - vercel.json : publier sw.js, manifest.json, dejavu-sans.js, robots.txt (ils etaient remplaces par index.html)
// Usage : node patch_vercel_json.js dist\vercel.json
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let cfg;
try { cfg = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log('ARRET : vercel.json illisible : ' + e.message); process.exit(1); }
const FILES = ['sw.js', 'manifest.json', 'dejavu-sans.js', 'robots.txt'];
if (!Array.isArray(cfg.builds) || !Array.isArray(cfg.routes)) { console.log('ARRET : structure inattendue'); process.exit(1); }
const hasFs = cfg.routes.some(function (r) { return r.handle === 'filesystem'; });
const missing = FILES.filter(function (n) { return !cfg.builds.some(function (b) { return b.src === n; }); });
if (hasFs && missing.length === 0) { console.log('DEJA FAIT'); process.exit(0); }
const idx = cfg.routes.findIndex(function (r) { return r.src === '(.*)' && r.dest === '/index.html'; });
if (idx < 0) { console.log('ARRET : regle finale vers index.html introuvable'); process.exit(1); }
missing.forEach(function (n) { cfg.builds.push({ src: n, use: '@vercel/static' }); });
if (!hasFs) {
  cfg.routes.splice(idx, 0, { src: '/sw.js', headers: { 'Cache-Control': 'no-cache' }, continue: true }, { handle: 'filesystem' });
}
fs.writeFileSync(f, JSON.stringify(cfg), 'utf8');
console.log('Fichiers ajoutes a builds : ' + (missing.join(', ') || 'aucun'));
console.log('Regle filesystem : ' + (hasFs ? 'deja presente' : 'ajoutee'));
console.log('Builds : ' + cfg.builds.length + ' | Routes : ' + cfg.routes.length);
