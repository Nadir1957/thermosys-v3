/* Thermosys - chambre froide : chaleur de respiration des produits (tableau 1 du USDA Handbook 66, 2016), courbes en fonction de la temperature.
   Rejoue le moteur extrait de dist\index.html : courbes figees, valeurs par produit, 7 cas de reference de la page Validation,
   calcul complet (compute) sur une chambre de pommes de terre, mutations.
   Lancer : node tests\coldroom_resp_regression.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const file = process.argv[2] || path.join('dist', 'index.html');
const s = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
let n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log('ECHEC : ' + m); } }
const RC = {"apple": [[0, 3], [5, 6], [10, 9], [15, 15], [20, 20]], "pear": [[0, 3.9], [5, 8.8], [10, 14.7], [20, 44.1]], "orange": [[0, 4], [5, 6], [10, 8], [15, 18], [20, 28]], "clem": [[5, 6], [10, 8], [15, 16], [20, 25]], "lemon": [[10, 11], [15, 19], [20, 24]], "grape": [[0, 3], [5, 7], [10, 13], [20, 27]], "pomeg": [[5, 6], [10, 12], [20, 24]], "fig": [[0, 6], [5, 13], [10, 21], [20, 50]], "apricot": [[0, 6], [10, 16], [20, 40]], "peach": [[0, 5], [10, 20], [20, 87]], "straw": [[0, 16], [10, 75], [20, 150]], "melon": [[0, 6], [5, 10], [10, 15], [15, 37], [20, 55]], "wmelon": [[5, 4], [10, 8], [20, 21]], "potc": [[5, 12], [10, 16], [15, 17], [20, 22]], "pots": [[5, 12], [10, 16], [15, 17], [20, 22]], "onion": [[0, 3], [5, 5], [10, 7], [15, 7], [20, 8]], "garlic": [[0, 8], [5, 16], [10, 24], [15, 22], [20, 20]], "carrot": [[0, 15], [5, 20], [10, 31], [15, 40], [20, 70]], "cabbage": [[0, 5], [5, 11], [10, 18], [15, 28], [20, 42]], "tomato": [[10, 15], [15, 22], [20, 35]], "pepper": [[5, 7], [10, 12], [15, 27], [20, 34]], "cucumber": [[10, 26], [15, 29], [20, 31]], "zucchini": [[0, 25], [5, 32], [10, 67], [15, 153], [20, 164]], "lettuce": [[0, 12], [5, 17], [10, 31], [15, 39], [20, 56]], "beans": [[0, 20], [5, 34], [10, 58], [15, 92], [20, 130]], "broccoli": [[0, 21], [5, 34], [10, 81], [15, 170], [20, 300]]};
const TST = {"apple": [1, 3.45], "pear": [0, 3.9], "orange": [5, 6.0], "clem": [5, 6.0], "lemon": [12, 13.69], "grape": [0, 3.0], "pomeg": [5, 6.0], "fig": [0, 6.0], "apricot": [0, 6.0], "peach": [0, 5.0], "straw": [0, 16.0], "melon": [4, 9.03], "wmelon": [12, 9.7], "potc": [5, 12.0], "pots": [3, 10.7], "onion": [0, 3.0], "garlic": [0, 8.0], "carrot": [0, 15.0], "cabbage": [0, 5.0], "tomato": [10, 15.0], "pepper": [8, 9.67], "cucumber": [11, 26.57], "zucchini": [7, 43.01], "eggplant": [11, 58.9], "lettuce": [0, 12.0], "beans": [6, 37.83], "broccoli": [0, 21.0]};
const FROZEN = {"CR1": [26.6, 0.3, "apple", 10, 9], "CR2": [50.24, 0.3, "potc", 15, 17], "CR3": [100.48, 0.3, "broccoli", 5, 34], "CR4": [221.65, 0.3, "straw", 10, 75], "CR5": [271.9, 0.3, "beans", 15, 92], "CR6": [56.15, 0.3, "lemon", 15, 19], "CR7": [47.29, 0.3, "garlic", 5, 16], "CR8": [2.31, 0.5, "date", "cpA"], "CR9": [2.19, 0.5, "garlic", "cpF"], "CR10": [2.06, 0.5, "pear", "cpF"], "CR11": [264, 0.5, "potc", "L"]};
const OV = {"apple": [3.81, 1.98, 280], "pear": [3.8, 2.06, 280], "orange": [3.81, 1.96, 275], "clem": [3.9, 1.93, 293], "lemon": [3.94, 2.02, 292], "grape": [3.7, 2.16, 269], "pomeg": [3.7, 2.3, 270], "fig": [3.7, 2.25, 264], "apricot": [3.87, 1.95, 288], "peach": [3.91, 1.9, 293], "straw": [4.0, 1.84, 306], "melon": [3.93, 1.91, 300], "wmelon": [3.97, 1.74, 306], "date": [2.31, 2.3, 75], "potc": [3.67, 1.93, 264], "pots": [3.67, 1.93, 264], "onion": [3.95, 1.87, 300], "garlic": [3.17, 2.19, 196], "carrot": [3.92, 2.0, 293], "cabbage": [4.02, 1.85, 308], "tomato": [4.08, 1.79, 313], "pepper": [4.01, 1.8, 308], "cucumber": [4.09, 1.71, 321], "zucchini": [4.07, 1.74, 315], "eggplant": [4.02, 1.83, 307], "lettuce": [4.09, 1.65, 320], "beans": [3.99, 1.85, 302], "broccoli": [4.01, 1.82, 303], "milk": [3.89, 1.81, 293], "eggs": [3.63, 1.95, 252], "cheese": [2.8, 2.9, 128]};
const m0 = /<script id="coldroom-module">([\s\S]*?)<\/script>/.exec(s);
ok(!!m0, 'module chambre froide introuvable');
const src = m0 ? m0[1] : '';
const a = s.indexOf("['CHAMBRE FROIDE','CR1'"), b = s.indexOf("\n];\nfunction run(){", a);
ok(a > 0 && b > a, 'lignes de cas CR introuvables');
const rowsSrc = a > 0 && b > a ? s.slice(a, b) : '';
function ref(rc, T) { let i = 0; const k = rc.length; if (T >= rc[k - 1][0]) i = k - 2; else if (T > rc[0][0]) while (T > rc[i + 1][0]) i++; let sl = Math.log(rc[i + 1][1] / rc[i][1]) / (rc[i + 1][0] - rc[i][0]); if (T < rc[0][0]) return rc[0][1] * Math.exp(Math.max(sl, 0) * (T - rc[0][0])); if (T > rc[k - 1][0]) return rc[k - 1][1] * Math.exp(Math.max(sl, 0) * (T - rc[k - 1][0])); return rc[i][1] * Math.exp(sl * (T - rc[i][0])); }
function load(code) {
  const el = () => ({ addEventListener() {}, style: {}, setAttribute() {}, appendChild() {}, classList: { add() {}, remove() {} }, querySelectorAll: () => [], innerHTML: '', value: '' });
  const sb = { console, Math, JSON, Object, Array, String, Number, isFinite, parseFloat, parseInt, Date, RegExp, setTimeout() {}, setInterval() {}, clearTimeout() {}, document: { getElementById: el, addEventListener() {}, createElement: el, querySelector: () => null, querySelectorAll: () => [], readyState: 'complete', body: el(), head: el() }, navigator: {}, localStorage: { getItem: () => null, setItem() {} }, location: { search: '' } };
  sb.window = sb; vm.createContext(sb); vm.runInContext(code, sb); return sb;
}
function checks(code) { try { return checks0(code); } catch (e) { return ['exception : ' + e.message]; } }
function checks0(code) {
  const f = []; let sb;
  try { sb = load(code); } catch (e) { return ['module : ' + e.message]; }
  const E = sb.CR_ENGINE; if (!E) return ['CR_ENGINE absent'];
  const near = (x, y, t) => Math.abs(x - y) <= t * Math.abs(y);
  for (const k of Object.keys(RC)) {
    const p = E.PBY[k]; if (!p) { f.push('produit ' + k + ' absent'); continue; }
    if (JSON.stringify(p.rc) !== JSON.stringify(RC[k])) f.push('courbe ' + k + ' modifiee');
    if (p.Tst !== TST[k][0]) f.push('Tst ' + k);
    if (Math.abs(p.resp - TST[k][1]) > 1e-9) f.push('resp ' + k + ' : ' + p.resp + ' au lieu de ' + TST[k][1]);
    if (Math.abs(p.resp - ref(RC[k], p.Tst)) > 0.005 + 1e-9) f.push('resp de ' + k + ' incoherent avec sa courbe');
    for (const pt of RC[k]) { const w = E.respW({ resp: p.resp, respT: p.Tst, rc: p.rc }, pt[0]); if (!near(w, pt[1] * 2.96, 0.002)) f.push(k + ' a ' + pt[0] + ' C : ' + w.toFixed(3) + ' W/t au lieu de ' + (pt[1] * 2.96).toFixed(3)); }
    // milieu de segment : log-lineaire
    for (let i = 0; i < RC[k].length - 1; i++) { const a0 = RC[k][i], b0 = RC[k][i + 1], T = (a0[0] + b0[0]) / 2, w = E.respW({ resp: p.resp, respT: p.Tst, rc: p.rc }, T), e = Math.sqrt(a0[1] * b0[1]) * 2.96; if (!near(w, e, 0.003)) f.push(k + ' milieu ' + T + ' C'); }
    // hors plage : jamais decroissant
    const lo = E.respW({ resp: p.resp, respT: p.Tst, rc: p.rc }, RC[k][RC[k].length - 1][0]), hi = E.respW({ resp: p.resp, respT: p.Tst, rc: p.rc }, RC[k][RC[k].length - 1][0] + 5);
    if (hi < lo - 1e-9) f.push(k + ' decroit au-dela de la plage');
    const w0 = E.respW({ resp: p.resp, respT: p.Tst, rc: p.rc }, RC[k][0][0]), w1 = E.respW({ resp: p.resp, respT: p.Tst, rc: p.rc }, RC[k][0][0] - 5);
    if (w1 > w0 + 1e-9) f.push(k + ' croit sous la plage');
  }
  // proprietes thermiques : tableau 3 d'ASHRAE (2002)
  for (const k of Object.keys(OV)) { const p = E.PBY[k]; if (!p) { f.push('produit ' + k + ' absent'); continue; } if (p.cpA !== OV[k][0] || p.cpF !== OV[k][1] || p.L !== OV[k][2]) f.push('proprietes thermiques de ' + k + ' : ' + p.cpA + ' / ' + p.cpF + ' / ' + p.L); }
  if (E.PBY.eggs.Tf !== -0.6) f.push('point de congelation de l oeuf : ' + E.PBY.eggs.Tf);
  if (E.PBY.eggplant.resp !== 58.9 || E.PBY.eggplant.rc) f.push('aubergine');
  // courbes synthetiques : pente negative aux extremites -> valeur constante hors plage
  const s1 = { resp: 10, respT: 0, rc: [[0, 10], [10, 5]] }, s2 = { resp: 10, respT: 20, rc: [[0, 5], [10, 10], [20, 6]] };
  if (!near(E.respW(s1, -5), E.respW(s1, 0), 1e-9)) f.push('hors plage bas, pente negative');
  if (!near(E.respW(s2, 25), E.respW(s2, 20), 1e-9)) f.push('hors plage haut, pente negative');
  // l'utilisateur change le taux : la courbe est mise a l'echelle
  const pp = E.PBY.potc; if (!near(E.respW({ resp: pp.resp * 2, respT: pp.Tst, rc: pp.rc }, 15), 2 * 17 * 2.96, 0.003)) f.push('mise a l\'echelle du taux saisi');
  // sans courbe : Q10 = 2,5
  if (!near(E.respW({ resp: 10, respT: 5 }, 15), 10 * 2.96 * 2.5, 1e-9)) f.push('loi Q10 sans courbe');
  for (const k of ['date', 'eggplant', 'custom', 'beef']) if (E.PBY[k] && E.PBY[k].rc) f.push(k + ' ne doit pas avoir de courbe');
  if (E.PBY.tomato.Tst !== 10) f.push('tomate : temperature');
  // 7 cas de la page Validation
  try {
    const rows = vm.runInContext('[' + rowsSrc + ']', sb);
    rows.forEach(c => { const t = FROZEN[c[1]]; if (!t) { f.push('cas inattendu ' + c[1]); return; } if (c[4] !== t[0] || c[5] !== t[1]) f.push(c[1] + ' : valeur ou tolerance modifiee'); const v = c[9](), e = Math.abs(v - c[4]) / c[4] * 100; if (!(isFinite(e) && e <= c[5] + 1e-9)) f.push(c[1] + ' : ecart ' + e.toFixed(2) + ' %'); if (typeof t[3] === 'string') { const ix = { cpA: 0, cpF: 1, L: 2 }[t[3]]; if (OV[t[2]][ix] !== c[4]) f.push(c[1] + ' : reference differente du tableau ASHRAE'); } else { const exp = RC[t[2]].filter(x => x[0] === t[3])[0][1] * 61 * 4.186 / 86.4; if (Math.abs(exp - c[4]) / exp > 0.0005) f.push(c[1] + ' : reference differente du tableau'); } });
    if (rows.length !== Object.keys(FROZEN).length) f.push('nombre de cas CR ' + rows.length);
  } catch (e) { f.push('lignes CR : ' + e.message); }
  // calcul complet : chambre de pommes de terre, produit deja a la temperature de la chambre (pas de pull-down)
  try {
    const p = { Tr: 5, RHr: 90, Tf: -1.7, cpA: 3.5, cpF: 1.8, Lat: 250, resp: E.PBY.potc.resp, respT: E.PBY.potc.Tst, rc: E.PBY.potc.rc, Tst: 5, stockT: 100, pct: 0, Tin: 5, tpull: 24, packPct: 0, Lg: 10, Wd: 8, Hh: 4, lam: 0.023, dWall: 100, dRoof: 100, dFloor: 100, floorAdj: 'air', Text: 35, RHext: 50, Twall: 35, solW: 0, solR: 0, Tgnd: 15, infMode: 'ach', use: 1, dA: 4, dH: 2.5, dP: 0, dTp: 0, dTo: 0, dHrs: 10, dE: 0, vent: 0, ventH: 0, lightW: 0, lightH: 0, nP: 0, hP: 0, nF: 0, kWF: 0, hF: 0, otherKW: 0, otherH: 0, tRun: 18, fanF: 5, fanH: 20, defF: 0, sf: 10 };
    const r = E.compute(p);
    if (r.err) f.push('compute : ' + r.err); else {
      const ex = 12 * 100 * 2.9554 / 1000 * 24; // kWh/jour
      const got = (r.E && r.E.resp != null) ? r.E.resp : NaN;
      if (!(Math.abs(got - ex) / ex < 0.004)) f.push('energie de respiration : ' + got + ' au lieu de ' + ex.toFixed(2));
      const q = Object.assign({}, p, { Tr: 10 }), r2 = E.compute(q), ex2 = 16 * 100 * 2.9554 / 1000 * 24;
      if (!(Math.abs(r2.E.resp - ex2) / ex2 < 0.004)) f.push('respiration a 10 C : ' + r2.E.resp + ' au lieu de ' + ex2.toFixed(2));
    }
  } catch (e) { f.push('compute : ' + e.message); }
  return f;
}
const cnt = (h, x) => h.split(x).length - 1;
if (m0 && a > 0) {
  const base = checks(src); base.forEach(x => console.log('ECART : ' + x)); bad += base.length; n += 1;
  ok(cnt(src, 'var pr = { resp: p.resp, respT: p.respT, rc: p.rc };') === 1, 'compute : la courbe n\'est pas transmise');
  ok(cnt(src, "resp: num('cr_resp', 0), respT: pr.Tst, rc: pr.rc,") === 1, 'interface : la courbe n\'est pas transmise');
  ok(cnt(src, 'rc: RC[r[0]] || null') === 1, 'produits : courbe non rattachee');
  ok(s.indexOf("'CHAMBRE FROIDE':'COLD ROOM'") > 0, 'traduction du module Validation');
  ok(/Handbook 66/.test(s) && cnt(s, 'Non vérifié : données des 40 produits') === 0, 'texte de limites du module');
  const MUT = [['potc: [[5,12]', 'potc: [[5,11]'], ['apple: [[0,3]', 'apple: [[0,4]'], ['broccoli: [[0,21],[5,34]', 'broccoli: [[0,21],[5,36]'], ['straw: [[0,16],[10,75]', 'straw: [[0,16],[10,70]'], ['lemon: [[10,11],[15,19]', 'lemon: [[10,11],[15,21]'], ['garlic: [[0,8],[5,16]', 'garlic: [[0,8],[5,18]'], ['beans: [[0,20],[5,34],[10,58],[15,92]', 'beans: [[0,20],[5,34],[10,58],[15,90]'],
    ['p.resp * 2.96 * rcRate(p.rc, T) / r0', 'p.resp * 3.0 * rcRate(p.rc, T) / r0'], ['p.resp * 2.96 * rcRate(p.rc, T) / r0', 'p.resp * 2.96 * rcRate(p.rc, T)'], ['Math.max(s, 0) * (T - rc[0][0])', 's * (T - rc[0][0])'], ['Math.max(s, 0) * (T - rc[n - 1][0])', 's * (T - rc[n - 1][0])'], ['rc[n - 1][1] * Math.exp(Math.max(s, 0)', 'rc[i][1] * Math.exp(Math.max(s, 0)'],
    ['(rc[i + 1][0] - rc[i][0]);\n    if (T < rc[0][0])', '(rc[i + 1][0] - rc[i][0]) * 1.1;\n    if (T < rc[0][0])'], ['Math.pow(2.5, (T - p.respT) / 10)', 'Math.pow(2.0, (T - p.respT) / 10)'], ['var pr = { resp: p.resp, respT: p.respT, rc: p.rc };', 'var pr = { resp: p.resp, respT: p.respT };'],
    ["'Ripe tomato', 10, 92", "'Ripe tomato', 9, 92"], ['rc: RC[r[0]] || null', 'rc: null'], ['{ a: 2.31, f: 2.3, L: 75 }', '{ a: 1.54, f: 2.3, L: 75 }'], ['{ a: 3.17, f: 2.19, L: 196 }', '{ a: 3.17, f: 1.6, L: 196 }'], ['{ a: 2.8, f: 2.9, L: 128 }', '{ a: 2.2, f: 2.9, L: 128 }'], ['{ a: 3.8, f: 2.06, L: 280 }', '{ a: 3.8, f: 1.88, L: 280 }'], ["'Eggplant', 11, 92, -0.8, .93, 58.9", "'Eggplant', 11, 92, -0.8, .93, 10"], ["'Shell eggs', 1, 82, -0.6, .75", "'Shell eggs', 1, 82, -2.2, .75"], ['pear: [[0,3.9]', 'pear: [[0,5]'], ['[20,70]]', '[20,25]]'], ['T >= rc[n - 1][0]) { i = n - 2;', 'T >= rc[n - 1][0] + 50) { i = n - 2;']];
  let killed = 0, total = 0;
  for (const [o, w] of MUT) {
    if (cnt(src, o) < 1) { ok(false, 'ancre de mutation introuvable : ' + o); continue; }
    total++; if (checks(src.split(o).join(w)).length) killed++; else ok(false, 'MUTANT SURVIVANT : ' + o + ' -> ' + w);
  }
  // valeurs de resp dans les lignes de produits
  for (const k of ['potc', 'strawberry']) { /* ancre ci-dessous */ }
  n += total;
  if (bad) { console.log('ECHEC : ' + bad); process.exit(1); }
  console.log('TOUT EST BON : ' + n + ' verifications, ' + killed + ' mutations tuees');
} else { console.log('ECHEC'); process.exit(1); }
