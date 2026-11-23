// Thermosys - Tests de non-regression du module « Estimation horaire »
// Usage (depuis le dossier files) :  node tests\hourly_regression.js
//   ou avec un autre fichier :       node tests\hourly_regression.js chemin\vers\index.html
// Les fichiers meteo (.epw, decompresses) vont dans tests\meteo\ : Algiers, Ghardaia, Ouargla, Denver.
// Les chiffres EnergyPlus ci-dessous ont ete calcules avec EnergyPlus 23.2 le 23/11/2026 (voir tests\README_TESTS.txt).
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
const meteoDir = path.join(__dirname, 'meteo');

// ── 1) Chargement du moteur horaire de la page, sans navigateur ──────────────
function loadEngine(file) {
  const h = fs.readFileSync(file, 'utf8');
  const a = h.indexOf('<script id="hourly-module">'), b = h.indexOf('</script>', a);
  if (a < 0 || b < 0) { throw new Error('module horaire introuvable dans ' + file); }
  let src = h.slice(a + '<script id="hourly-module">'.length, b);
  const mark = '/* ---- installation ---- */';
  if (src.indexOf(mark) < 0) { throw new Error('marqueur d\'installation introuvable'); }
  src = src.replace(mark, 'window.__HX={parseEPW:parseEPW,wxStats:wxStats,buildCfg:buildCfg,simulate:simulate,summarize:summarize,defaults:defaults,bestestCfg:bestestCfg,CHK:CHK};\n' + mark);
  const win = {}, noop = () => { };
  const doc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop }), head: { appendChild: noop }, body: { appendChild: noop }, addEventListener: noop };
  const ls = { getItem: () => null, setItem: noop };
  win.window = win; win.document = doc; win.localStorage = ls;
  new Function('window', 'document', 'localStorage', 'setInterval', 'setTimeout', 'clearTimeout', 'navigator', src)(win, doc, ls, noop, noop, noop, {});
  return win.__HX;
}

// ── 2) Cas de reference ──────────────────────────────────────────────────────
// Maison 10 x 8 x 2,7 m ; trois variantes. [chauffage kWh, froid kWh, pointe chauffage kW, pointe froid kW]
const VARIANTES = {
  std: {},
  iso: { wins: 8, rins: 10 },                                                            // murs 8 cm, toit 10 cm d'isolant
  ouest: { aw0: 3, aw1: 8, aw2: 3, aw3: 3, wabs: 0.3, rabs: 0.3 }                          // grandes fenetres a l'ouest, murs clairs
};
// app = valeurs de l'application le 23/11/2026 (detecte toute derive) ; ep = EnergyPlus 23.2 (convection exterieure DOE-2 avec vent)
const CAS = [
  { ville: 'Algiers',  v: 'std',   app: [2351, 5429, 5.81, 4.68], ep: [2144, 5317, 6.42, 4.48] },
  { ville: 'Algiers',  v: 'iso',   app: [219, 2596, 2.20, 2.60],  ep: [177, 2564, 2.41, 2.50] },
  { ville: 'Algiers',  v: 'ouest', app: [4522, 2482, 6.27, 3.62], ep: [4308, 2436, 6.87, 3.48] },
  { ville: 'Denver',   v: 'std',   app: [18853, 1209, 11.57, 3.58], ep: [17470, 1183, 11.24, 3.40] },
  { ville: 'Denver',   v: 'iso',   app: [6255, 222, 5.99, 1.27],  ep: [6035, 194, 6.61, 1.13] },
  { ville: 'Denver',   v: 'ouest', app: [23138, 134, 11.84, 2.52], ep: [21775, 136, 11.52, 2.36] },
  { ville: 'Ghardaia', v: 'std',   app: [893, 15516, 5.18, 7.96], ep: [746, 14796, 5.96, 7.51] },
  { ville: 'Ghardaia', v: 'iso',   app: [0, 8935, 0, 3.82],       ep: [0, 8665, 0, 3.64] },
  { ville: 'Ghardaia', v: 'ouest', app: [2498, 10536, 5.47, 6.54], ep: [2311, 10182, 6.26, 6.27] },
  { ville: 'Ouargla',  v: 'std',   app: [595, 18113, 4.35, 7.76], ep: [462, 17323, 4.76, 7.35] },
  { ville: 'Ouargla',  v: 'iso',   app: [0, 10827, 0, 4.16],      ep: [0, 10499, 0, 4.00] },
  { ville: 'Ouargla',  v: 'ouest', app: [2067, 13111, 5.19, 6.86], ep: [1866, 12672, 5.77, 6.51] }
];
// Fourchettes d'ecart avec EnergyPlus (en %), alignees sur l'avertissement affiche dans l'application, elargies d'un point.
const BORNES = { chauffage: [2, 12], froid: [-3, 6], pointeChauffage: [-15, 5], pointeFroid: [2, 14] };
const SEUIL_KWH = 1000;   // en dessous, les ecarts relatifs sont peu significatifs : on ne les juge pas
const TOL_DERIVE = 0.01;  // 1 % de derive tolere par rapport aux valeurs enregistrees de l'application

// ── 3) Execution ─────────────────────────────────────────────────────────────
let ok = 0, ko = 0, ignores = 0;
function check(nom, bon, detail) { if (bon) { ok++; console.log('  OK      ' + nom + (detail ? '  ' + detail : '')); } else { ko++; console.log('  ECHEC   ' + nom + (detail ? '  ' + detail : '')); } }
function trouveMeteo(motif) {
  if (!fs.existsSync(meteoDir)) { return null; }
  const f = fs.readdirSync(meteoDir).filter(n => /\.epw$/i.test(n) && new RegExp(motif, 'i').test(n))[0];
  return f ? path.join(meteoDir, f) : null;
}
const pct = (a, b) => (b === 0 ? 0 : (a / b - 1) * 100);
const f1 = x => (x >= 0 ? '+' : '') + x.toFixed(1) + ' %';

let HX;
try { HX = loadEngine(htmlFile); } catch (e) { console.log('ARRET : ' + e.message); process.exit(2); }
console.log('Fichier teste : ' + htmlFile + '\n');
const cache = {};
function meteo(ville) {
  if (cache[ville] !== undefined) { return cache[ville]; }
  const p = trouveMeteo(ville); if (!p) { return (cache[ville] = null); }
  const wx = HX.parseEPW(fs.readFileSync(p, 'utf8')); wx.st = HX.wxStats(wx); return (cache[ville] = wx);
}

console.log('A) ASHRAE 140 (cas 600 et 900, Denver) : resultats dans les fourchettes de reference');
const wxD = meteo('Denver');
if (!wxD) { ignores++; console.log('  IGNORE  fichier meteo Denver absent de tests\\meteo\n'); } else {
  ['600', '900'].forEach(function (c) {
    const sm = HX.summarize(wxD, HX.simulate(wxD, HX.bestestCfg(c === '900'), { dt: 900, passes: 2 })), rf = HX.CHK[c];
    [['chauffage', sm.tH / 1e3, rf.h], ['froid', sm.tC / 1e3, rf.c], ['pointe chauffage', sm.pH, rf.ph], ['pointe froid', sm.pC, rf.pc]].forEach(function (q) {
      check('cas ' + c + ' ' + q[0], q[1] >= q[2][0] && q[1] <= q[2][1], q[1].toFixed(3) + ' dans [' + q[2][0] + ' ; ' + q[2][1] + ']');
    });
  });
  console.log('');
}

console.log('B) Maisons types : derive par rapport aux valeurs enregistrees, et ecart avec EnergyPlus');
CAS.forEach(function (c) {
  const wx = meteo(c.ville), nom = c.ville + ' / ' + c.v;
  if (!wx) { ignores++; console.log('  IGNORE  ' + nom + ' : fichier meteo absent de tests\\meteo'); return; }
  const o = Object.assign(HX.defaults(), VARIANTES[c.v]);
  const sm = HX.summarize(wx, HX.simulate(wx, HX.buildCfg(o, wx.st.mean), { dt: 900, passes: 2 }));
  const val = [sm.tH, sm.tC, sm.pH, sm.pC], noms = ['chauffage', 'froid', 'pointe chauffage', 'pointe froid'];
  let derive = true;
  val.forEach(function (x, i) { const ref = c.app[i], tol = Math.max(Math.abs(ref) * TOL_DERIVE, i < 2 ? 2 : 0.02); if (Math.abs(x - ref) > tol) { derive = false; console.log('     derive : ' + noms[i] + ' ' + x.toFixed(2) + ' au lieu de ' + ref); } });
  check(nom + ' : valeurs inchangees', derive, '[' + val.map((x, i) => i < 2 ? x.toFixed(0) : x.toFixed(2)).join(' ; ') + ']');
  const lim = [['chauffage', 0, BORNES.chauffage, c.ep[0] >= SEUIL_KWH], ['froid', 1, BORNES.froid, c.ep[1] >= SEUIL_KWH], ['pointe chauffage', 2, BORNES.pointeChauffage, c.ep[2] > 0.5], ['pointe froid', 3, BORNES.pointeFroid, c.ep[3] > 0.5]];
  lim.forEach(function (q) {
    if (!q[3]) { return; }
    const e = pct(val[q[1]], c.ep[q[1]]);
    check(nom + ' : ' + q[0] + ' vs EnergyPlus', e >= q[2][0] && e <= q[2][1], f1(e) + '  (admis ' + q[2][0] + ' a ' + q[2][1] + ' %)');
  });
});

console.log('\nResultat : ' + ok + ' reussis, ' + ko + ' echecs, ' + ignores + ' ignores (meteo absente)');
if (ko > 0) { console.log('ECHEC : le module horaire ne se comporte plus comme documente. Ne pas deployer avant d\'en comprendre la cause.'); process.exit(1); }
if (ignores > 0) { console.log('ATTENTION : des fichiers meteo manquent, la verification est incomplete.'); process.exit(3); }
console.log('TOUT EST CONFORME.');
