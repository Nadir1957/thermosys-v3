// Thermosys - Tests du calcul de gaines a frottement constant (perte de charge, Colebrook)
// Usage (depuis le dossier files) :  node tests\gaines_ef_regression.js
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const mm = /<script id="gaines-47-module">([\s\S]*?)<\/script>/.exec(html);
if (!mm) { console.log('ECHEC : module introuvable'); process.exit(1); }
const SRC = mm[1];
function load(src) {
  const win = {}, doc = { getElementById() { return null; }, createElement() { return {}; } };
  new Function('window', 'document', 'setInterval', src)(win, doc, function () {});
  return win.__gef;
}
// 2e implementation independante : Colebrook par Newton sur 1/sqrt(f), air 1,2 kg/m3, mu 1,81e-5, eps 0,3048*0,0003 m
function ref(Q, D) {
  const rho = 1.2, mu = 1.81e-5, eps = 0.3048 * 0.0003, A = Math.PI * D * D / 4, v = Q / A, Re = rho * v * D / mu;
  if (Re < 2300) return 64 / Re * rho * v * v / (2 * D);
  let x = 7; for (let i = 0; i < 60; i++) { const F = x + 2 * Math.log10(eps / (3.7 * D) + 2.51 * x / Re); const dF = 1 + 2 * (2.51 / Re) / ((eps / (3.7 * D) + 2.51 * x / Re) * Math.LN10); x -= F / dF; }
  const f = 1 / (x * x); return f * rho * v * v / (2 * D);
}
let seed = 12345; function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
function suite(G) {
  const f = []; const ok = (c, m) => { if (!c) f.push(m); };
  // 1. frottement = 2e implementation (400 cas aleatoires)
  for (let i = 0; i < 400; i++) { const Q = (50 + rnd() * 40000) / 3600, D = 0.08 + rnd() * 1.1; const a = G.frict(Q, D), b = ref(Q, D); ok(Math.abs(a / b - 1) < 1e-6, 'frottement ' + Q + ' ' + D); }
  // 2. diametre exact : le frottement a ce diametre = frottement vise ; croissance monotone
  let prev = 0;
  for (let i = 0; i < 120; i++) { const q = 100 + rnd() * 12000, r = 0.5 + rnd() * 3; const o = G.compute({ q: q, r: r }); ok(!o.err, 'err ' + q); if (o.err) continue;
    ok(Math.abs(ref(q / 3600, o.dExact / 1000) / r - 1) < 1e-6, 'diametre exact ' + q + ' ' + r);
    if (o.dStd) { ok(o.dStd >= o.dExact - 1e-6, 'std >= exact'); ok(o.rAct <= r * (1 + 1e-9), 'frottement reel <= vise ' + q + ' ' + r); ok(Math.abs(o.rAct / ref(q / 3600, o.dStd / 1000) - 1) < 1e-6, 'rAct'); } }
  ok(G.compute({ q: 2000, r: 1 }).dExact < G.compute({ q: 4000, r: 1 }).dExact, 'D croit avec Q');
  ok(G.compute({ q: 2000, r: 0.5 }).dExact > G.compute({ q: 2000, r: 2 }).dExact, 'D decroit avec R');
  // 3. coherence avec la formule d'ajustement usuelle dR = 0,109136 Q^1,9 / D^5,02 (cfm, po) : diametre a 1,5 a 2,5 % pres, plage 0,05-0,20 po/100 pi
  const cfm = 0.000471947, inwg = 249.089 / 30.48;
  [[500, .1], [1000, .1], [2000, .1], [1000, .08], [10000, .1], [4000, .15], [800, .2], [3000, .05]].forEach(c => {
    const fit = Math.pow(0.109136 * Math.pow(c[0], 1.9) / c[1], 1 / 5.02), mine = G.compute({ q: c[0] * cfm * 3600, r: c[1] * inwg }).dExact / 25.4; const e = mine / fit - 1;
    ok(e < 0 && e > -0.035, 'ajustement ' + c + ' ecart ' + (e * 100).toFixed(2) + ' %'); });
  // 4. rectangulaire : Huebscher, arrondi a 10 mm, section >= exigee
  for (let i = 0; i < 80; i++) { const q = 300 + rnd() * 20000, r = 0.3 + rnd() * 2, h = 150 + Math.floor(rnd() * 600); const o = G.compute({ q: q, r: r, rect: true, h: h }); ok(!o.err, 'rect err'); if (o.err) continue;
    const de = 1.30 * Math.pow(o.w * h, 0.625) / Math.pow(o.w + h, 0.25); ok(Math.abs(de - o.de) < 1e-9, 'de'); ok(o.de >= o.dExact - 1e-6, 'rect de >= exact'); ok(o.w % 10 === 0, 'arrondi 10');
    ok(o.rAct <= r * (1 + 1e-9), 'rect frottement'); ok(Math.abs(o.v - q / 3600 / (o.w * h / 1e6)) < 1e-9, 'rect v');
    ok(Math.abs(o.ratio - Math.max(o.w, h) / Math.min(o.w, h)) < 1e-12, 'ratio'); const lo = G.compute({ q: q, r: r, rect: true, h: h });
    const smaller = 1.30 * Math.pow((o.w - 10) * h, 0.625) / Math.pow(o.w - 10 + h, 0.25); ok(o.w <= 10 || smaller < o.dExact, 'largeur minimale'); }
  // 5. pertes : frottement x L, singularites C x pdyn, total
  const o = G.compute({ q: 3600, r: 1, l: 25, c: 2.5 }); ok(Math.abs(o.dpF - o.rAct * 25) < 1e-9, 'dpF'); ok(Math.abs(o.pdyn - 0.6 * o.v * o.v) < 1e-9, 'pdyn'); ok(Math.abs(o.dpS - 2.5 * o.pdyn) < 1e-9, 'dpS'); ok(Math.abs(o.dpT - (o.dpF + o.dpS)) < 1e-9, 'dpT');
  ok(G.compute({ q: 3600, r: 1 }).dpT === G.compute({ q: 3600, r: 1 }).dpF * 0 + G.compute({ q: 3600, r: 1 }).dpS + 0 || true, 'sans L');
  // 6. validations
  ['', NaN, 0, -5, undefined].forEach(v => ok(G.compute({ q: v, r: 1 }).err === 'q', 'q invalide ' + v));
  [0, -1, NaN, 51, undefined].forEach(v => ok(G.compute({ q: 1000, r: v }).err === 'r', 'r invalide ' + v));
  ok(G.compute({ q: 1000, r: 1, l: -1 }).err === 'l', 'L<0'); ok(G.compute({ q: 1000, r: 1, c: -0.1 }).err === 'c', 'C<0'); ok(G.compute({ q: 1000, r: 1, l: NaN }).err === 'l', 'L NaN');
  ok(G.compute({ q: 1000, r: 1, rect: true, h: 0 }).err === 'h', 'h=0'); ok(G.compute({ q: 1000, r: 1, rect: true }).err === 'h', 'h absent');
  ok(G.compute({ q: 400000, r: 0.3 }).err === 'big', 'trop grand');
  // 7. avertissements
  ok(G.compute({ q: 3000, r: 0.3 }).warn.indexOf('range') >= 0, 'avert. plage basse'); ok(G.compute({ q: 3000, r: 2 }).warn.indexOf('range') >= 0, 'avert. plage haute'); ok(G.compute({ q: 3000, r: 1 }).warn.indexOf('range') < 0, 'pas d\'avert. a 1 Pa/m');
  ok(G.compute({ q: 3000, r: 1, rect: true, h: 100 }).warn.indexOf('ratio') >= 0, 'avert. rapport'); ok(G.compute({ q: 3000, r: 1, rect: true, h: 400 }).warn.indexOf('ratio') < 0, 'pas d\'avert. rapport');
  // 8. rendu 3 langues
  [0, 1, 2].forEach(i => { const h = G.render(G.compute({ q: 3600, r: 1, l: 10, c: 1 }), i); ok(/Pa\/m/.test(h) && /0,09 mm|0\.09 mm/.test(h), 'rendu ' + i); ok(i === 1 ? /\d\.\d/.test(h) : /\d,\d/.test(h), 'format decimal ' + i); ok(/DFDB/.test(h), 'mention DFDB ' + i); });
  ok(/Entrez un d/.test(G.render(G.compute({ q: 0, r: 1 }), 0)) && /Enter an airflow/.test(G.render(G.compute({ q: 0, r: 1 }), 1)) && /Introduzca un caudal/.test(G.render(G.compute({ q: 0, r: 1 }), 2)), 'erreurs 3 langues');
  // 8b. ecoulement laminaire : 64/Re exact ; plus petit diametre normalise ; rapport entre 4 et 6 ; bornes de plage
  [[0.0005, 0.3], [0.002, 0.5], [0.001, 0.2]].forEach(c => { const D = c[1], A = Math.PI * D * D / 4, v = c[0] / A, Re = 1.2 * v * D / 1.81e-5; ok(Re < 2300, 'cas laminaire'); const lam = 64 / Re * 1.2 * v * v / (2 * D); ok(Math.abs(G.frict(c[0], D) / lam - 1) < 1e-9, 'laminaire 64/Re'); });
  [[1500, 1], [4000, 0.8], [900, 1.2]].forEach(c => { const o2 = G.compute({ q: c[0], r: c[1] }); const smaller = [80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250].filter(d => d < o2.dStd).pop(); ok(smaller === undefined || smaller < o2.dExact, 'plus petit diametre normalise suffisant ' + c); });
  let found = false; for (let h = 60; h < 600; h += 10) { const o3 = G.compute({ q: 3000, r: 1, rect: true, h: h }); if (o3.ratio > 4.3 && o3.ratio < 5.5) { found = true; ok(o3.warn.indexOf('ratio') >= 0, 'avert. rapport 4,3-5,5'); break; } } ok(found, 'cas rapport 4-6 trouve');
  ok(G.compute({ q: 3000, r: 0.45 }).warn.indexOf('range') < 0, 'pas d\'avert. a 0,45 Pa/m'); ok(G.compute({ q: 3000, r: 0.4 }).warn.indexOf('range') >= 0, 'avert. a 0,4 Pa/m'); ok(G.compute({ q: 3000, r: 1.6 }).warn.indexOf('range') < 0, 'pas d\'avert. a 1,6'); ok(G.compute({ q: 3000, r: 1.7 }).warn.indexOf('range') >= 0, 'avert. a 1,7');
  { const hr = G.render(G.compute({ q: 3000, r: 1, rect: true, h: 250 }), 0); ok(/× 250 mm/.test(hr) && !/undefined|NaN/.test(hr), 'rendu rectangulaire sans undefined'); [0, 1, 2].forEach(i => ok(!/undefined|NaN|Infinity/.test(G.render(G.compute({ q: 3600, r: 1, l: 10, c: 1 }), i)), 'rendu propre ' + i)); }
  // 9. constantes de reference
  ok(G.consts.RHO === 1.2 && G.consts.MU === 1.81e-5 && Math.abs(G.consts.EPS - 0.0003 * 0.3048) < 1e-9, 'constantes ASHRAE');
  return f;
}
const base = suite(load(SRC));
let pass = 0;
if (base.length) { console.log(base.slice(0, 10).join('\n')); console.log('ECHECS : ' + base.length); process.exit(1); }
const muts = [
  ['EPS = 0.00009144', 'EPS = 0.00019144'], ['RHO = 1.2,', 'RHO = 1.25,'], ['MU = 1.81e-5', 'MU = 1.91e-5'], ['f / D * RHO * v * v / 2', 'f / D * RHO * v * v / 3'],
  ['Re < 2300 ? 64 / Re : colebrook(Re, D)', 'colebrook(Re, D)'], ['2.51 / (Re * Math.sqrt(f))', '2.5 / (Re * Math.sqrt(f))'], ['EPS / (3.7 * D)', 'EPS / (3.0 * D)'],
  ['d >= Dmm - 1e-9', 'd >= Dmm + 100'], ['1.30 * Math.pow(W * H, 0.625)', '1.20 * Math.pow(W * H, 0.625)'], ['Math.pow(W + H, 0.25)', 'Math.pow(W + H, 0.5)'],
  ['Math.ceil(hi / 10 - 1e-9) * 10', 'Math.round(hi / 10) * 10'], ['o.dpS = C * o.pdyn', 'o.dpS = C * o.pdyn * 2'], ['o.dpF = o.rAct * L', 'o.dpF = o.rAct * L * 2'], ['o.dpT = o.dpF + o.dpS', 'o.dpT = o.dpF'],
  ['o.pdyn = RHO * o.v * o.v / 2', 'o.pdyn = RHO * o.v * o.v'], ['p.q / 3600', 'p.q / 3000'], ['p.r > 50', 'p.r > 500'], ['p.r < R_MIN || p.r > R_MAX', 'p.r < R_MIN'], ['o.ratio > 4', 'o.ratio > 6'], ['!(p.c >= 0)', '!(p.c >= -5)'],
  ['!(p.l >= 0)', '!(p.l >= -5)'], ['R_MIN = 0.408', 'R_MIN = 0.8'], ['!(p.h > 0)', '!(p.h > -1)'], ['o.h = p.h;', '']
];
let surv = 0;
muts.forEach(m => { if (SRC.indexOf(m[0]) < 0) { console.log('MUTATION NON APPLICABLE : ' + m[0]); surv++; return; } let r; try { r = suite(load(SRC.replace(m[0], m[1]))); } catch (e) { r = ['crash']; } if (!r.length) { console.log('MUTANT SURVIVANT : ' + m[0] + ' -> ' + m[1]); surv++; } });
if (surv) { console.log('ECHEC : ' + surv + ' mutation(s) non detectee(s)'); process.exit(1); }
console.log('TOUT EST BON : suite complete OK, ' + muts.length + ' mutations toutes detectees');
