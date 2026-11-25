// Thermosys - Tests de non-regression du module « Chauffage » (deperditions de base, methode simplifiee de local EN 12831)
// Usage (depuis le dossier files) :  node tests\heating_regression.js     (ou avec un autre fichier : node tests\heating_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Aucun exemple chiffre officiel de la norme n'a pu etre consulte gratuitement. Les sections 2 a 8 recalculent donc les formules de facon
//    INDEPENDANTE du module (a la main, puis par une seconde implementation, puis par 300 locaux aleatoires) : elles detectent une modification
//    accidentelle ou une erreur de programmation, mais ne prouvent pas la conformite a la norme.
//  - Les coefficients de protection au vent e (0,03/0,05 ; 0,02/0,03 ; 0,01/0,02) et de hauteur epsilon (1,0 ; 1,2 ; 1,5 ; seuils 10 m et 30 m)
//    ont ete confrontes a l'implementation d'un tiers (bibliotheque AixLib, modele InfiltrationRate_DIN12831) : ils concordent.
//  - Le module applique la methode CLASSIQUE (infiltration 2.V.n50.e.eps, facteur de sol 1,45, 0,34 W/(m3/h.K)). L'edition EN 12831-1:2017 decrit
//    d'autres formules de debit d'air (d'apres les sources consultees) : elles ne sont pas reproduites ici ni verifiees.
//  - Les 14 mutations de la section 9 introduisent volontairement une erreur dans le moteur : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');

let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const open = '<script id="heat-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
if (a < 0 || b < 0) { console.error('Module chauffage introuvable dans ' + htmlFile); process.exit(2); }
const CODE = h.slice(a + open.length, b);
function loadCode(code) {
  const win = {};
  try { new Function('window', code)(win); } catch (e) { return null; }
  return win.HEAT || null;
}
const HREAL = loadCode(CODE);
if (!HREAL) { console.error('Moteur HEAT illisible ou non expose'); process.exit(2); }

function near(x, y, tol) { return Math.abs(x - y) <= tol; }
function rel(x, y, tol) { return Math.abs(x - y) <= tol * Math.max(1, Math.abs(y)); }

const g0 = { Te: -5, Tme: 8, n50: 3, shield: 'moderate', zc: 5, dUtb: 0.05, fRH: 0, Gw: 1, wall: 0.3, lam: 2.0 };
const el = (kind, area, U, adj, extra) => Object.assign({ kind: kind, area: area, U: U, adj: adj, bu: 0.5, Tadj: 15, label: kind }, extra || {});
const room = (elems, extra) => Object.assign({ area: 20, h: 2.5, Ti: 20, nmin: 0.5, vent: { mode: 'nat', vsu: 0, eta: 0 }, exposure: 'one', per: 0, elems: elems }, extra || {});
function uRef(A, P, Uf, w, lam) {
  const Bp = A / (0.5 * P), Rf = 1 / Uf - 0.21, dt = w + lam * (0.21 + Rf);
  return dt < Bp ? 2 * lam / (Math.PI * Bp + dt) * Math.log(Math.PI * Bp / dt + 1) : lam / (0.457 * Bp + dt);
}
// 2e implementation, ecrite separement a partir des formules (jamais copiee du moteur)
function ref(r, g) {
  const dT = r.Ti - g.Te, V = r.area * r.h, sh = { none: [0.03, 0.05], moderate: [0.02, 0.03], high: [0.01, 0.02] }[g.shield][r.exposure === 'more' ? 1 : 0];
  const epsl = g.zc > 30 ? 1.5 : g.zc > 10 ? 1.2 : 1.0;
  let PT = 0, Pint = 0; const Ag = r.elems.filter(e => e.adj === 'gnd').reduce((s, e) => s + e.area, 0);
  for (const e of r.elems) {
    const gl = e.kind === 'glaz' || e.kind === 'door', Ub = e.U + (gl ? 0 : g.dUtb);
    if (e.adj === 'ext') PT += e.area * Ub * dT;
    else if (e.adj === 'unc') PT += e.area * Ub * e.bu * dT;
    else if (e.adj === 'adj') Pint += e.area * e.U * (r.Ti - e.Tadj);
    else if (e.adj === 'gnd') PT += 1.45 * g.Gw * e.area * uRef(Ag, r.per, e.U, g.wall, g.lam) * (r.Ti - g.Tme);
  }
  const Vinf = 2 * V * g.n50 * sh * epsl, Vmin = r.nmin * V;
  let Vv; if (r.vent.mode === 'bal') { const vs = r.vent.vsu > 0 ? r.vent.vsu : Vmin; Vv = vs * (1 - Math.min(0.95, Math.max(0, r.vent.eta))) + Vinf; } else Vv = Math.max(Vinf, Vmin);
  const PV = 0.34 * Vv * dT, PRH = r.area * g.fRH;
  return { PT, Pint, PV, PRH, Ptot: PT + Pint + PV + PRH, Pbld: PT + PV + PRH, Veff: Vv };
}
let seed = 12345; function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }

function suite(H, log) {
  let ok = 0, ko = 0;
  function check(nom, cond, detail) { if (cond) ok++; else { ko++; if (log) console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
  try {
    if (log) console.log('1) Constantes et tables');
    check('Capacite volumique 0,34 W/(m3/h.K)', H.RHOCP === 0.34);
    check('Facteur de hauteur epsilon : 1,0 / 1,2 / 1,5', H.eps(5) === 1.0 && H.eps(10) === 1.0 && H.eps(15) === 1.2 && H.eps(30) === 1.2 && H.eps(35) === 1.5);
    check('Seuils epsilon exacts (10 m et 30 m inclus dans la classe inferieure)', H.eps(10.01) === 1.2 && H.eps(30.01) === 1.5 && H.eps(0) === 1.0);
    check('Coefficients e (blindage nul/modere/fort ; une facade/plusieurs)', JSON.stringify(H.SHIELD) === JSON.stringify({ none: [0.03, 0.05], moderate: [0.02, 0.03], high: [0.01, 0.02] }));

    if (log) console.log('2) Piece simple, calculs a la main');
    let r = H.room(room([el('wall', 10, 0.4, 'ext'), el('glaz', 3, 1.4, 'ext'), el('roof', 20, 0.25, 'ext')]), g0);
    check('Transmission PT = 367,5 W', near(r.PT, 367.5, 1e-6), 'PT = ' + r.PT);
    check('Debit 25 m3/h (minimum) et infiltration 6 m3/h', near(r.Veff, 25, 1e-9) && near(r.Vinf, 6, 1e-9), 'Veff = ' + r.Veff + ', Vinf = ' + r.Vinf);
    check('Ventilation PV = 212,5 W', near(r.PV, 212.5, 1e-6), 'PV = ' + r.PV);
    check('Total 580 W (29 W/m2)', near(r.Ptot, 580, 1e-6) && near(r.wm2, 29, 1e-6), 'Ptot = ' + r.Ptot);

    if (log) console.log('3) Ventilation');
    r = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 25, eta: 0.8 } }), g0);
    check('Double flux : 11 m3/h, PV = 93,5 W', near(r.Veff, 11, 1e-9) && near(r.PV, 93.5, 1e-6), 'Veff = ' + r.Veff + ', PV = ' + r.PV);
    r = H.room(room([el('wall', 10, 0.4, 'ext')]), Object.assign({}, g0, { shield: 'none', n50: 10 }));
    check('Infiltration dominante : 30 m3/h', near(r.Veff, 30, 1e-9), 'Veff = ' + r.Veff);
    r = H.room(room([el('wall', 10, 0.4, 'ext')], { exposure: 'more' }), Object.assign({}, g0, { shield: 'none', n50: 10 }));
    check('Plusieurs facades : 50 m3/h', near(r.Veff, 50, 1e-9), 'Veff = ' + r.Veff);
    r = H.room(room([el('wall', 10, 0.4, 'ext')], { exposure: 'more' }), Object.assign({}, g0, { shield: 'none', n50: 10, zc: 35 }));
    check('Hauteur > 30 m (epsilon 1,5) : 75 m3/h', near(r.Veff, 75, 1e-9), 'Veff = ' + r.Veff);

    if (log) console.log('4) Locaux voisins, local non chauffe, relance');
    r = H.room(room([el('wall', 10, 1.0, 'adj', { Tadj: 15 })]), g0);
    check('Local adjacent chauffe : 50 W en echange interne, 0 W de transmission', near(r.Pint, 50, 1e-9) && near(r.PT, 0, 1e-9), 'Pint = ' + r.Pint + ', PT = ' + r.PT);
    check('Total = echange interne + batiment', near(r.Ptot - r.Pbld, 50, 1e-9));
    r = H.room(room([el('wall', 10, 1.0, 'unc', { bu: 0.5 })]), g0);
    check('Local non chauffe (b = 0,5) : 131,25 W', near(r.PT, 131.25, 1e-9), 'PT = ' + r.PT);
    r = H.room(room([el('wall', 10, 0.4, 'ext')]), Object.assign({}, g0, { fRH: 12 }));
    check('Relance 12 W/m2 : 240 W', near(r.PRH, 240, 1e-9), 'PRH = ' + r.PRH);

    if (log) console.log('5) Plancher sur terre-plein (EN ISO 13370)');
    let ug = H.uGround(50, 28, 0.5, 0.3, 2.0), rf = uRef(50, 28, 0.5, 0.3, 2.0);
    check('U equivalent plancher non isole : ' + rf.toFixed(4), near(ug.U, rf, 1e-9) && near(ug.U, 0.3372, 0.0005), 'U = ' + ug.U);
    ug = H.uGround(100, 40, 2, 0.3, 1.0); rf = uRef(100, 40, 2, 0.3, 1.0);
    check('U equivalent plancher peu isole : ' + rf.toFixed(4), near(ug.U, rf, 1e-9) && near(ug.U, 0.3668, 0.0005), 'U = ' + ug.U);
    r = H.room(room([el('floor', 50, 0.5, 'gnd')], { area: 50, per: 28 }), g0);
    check('Perte par le sol 293 W', near(r.PT, 1.45 * 50 * uRef(50, 28, 0.5, 0.3, 2.0) * 12, 1e-6), 'PT = ' + r.PT);
    // continuite des deux branches de la formule (dt = B') : ecart < 0,1 %
    { const Bp = 10, lam = 2, w = 0.3; // dt = B' obtenu par le choix de Rf
      const Rf = (Bp - w) / lam - 0.21, U1 = H.uGround(Bp * 0.5 * 40, 40, 1 / (Rf + 0.21), w, lam).U, A = Bp * 0.5 * 40;
      const lo = H.uGround(A, 40, 1 / (Rf - 0.02 + 0.21), w, lam).U, hi = H.uGround(A, 40, 1 / (Rf + 0.02 + 0.21), w, lam).U;
      check('Formule du sol continue au passage dt = B\'', Math.abs(lo - hi) / lo < 0.01 && Math.abs(U1 - lo) / lo < 0.01, lo + ' ; ' + U1 + ' ; ' + hi); }
    check('U du sol diminue quand le plancher est mieux isole', H.uGround(50, 28, 0.2, 0.3, 2).U < H.uGround(50, 28, 2, 0.3, 2).U);

    if (log) console.log('6) Batiment');
    const A = room([el('wall', 10, 0.4, 'ext'), el('wall', 8, 1.0, 'adj', { Tadj: 20 })]);
    const B = room([el('wall', 12, 0.4, 'ext'), el('wall', 8, 1.0, 'adj', { Tadj: 20 })], { area: 16 });
    const bld = H.building([A, B], g0), ra = H.room(A, g0), rb = H.room(B, g0);
    check('Somme des pieces : Ptot', near(bld.sum.Ptot, ra.Ptot + rb.Ptot, 1e-9));
    check('Echanges internes nuls entre pieces a meme temperature', near(bld.sum.Pint, 0, 1e-9));
    check('Contribution au batiment = transmission + ventilation + relance', near(bld.sum.Pbld, bld.sum.PT + bld.sum.PV + bld.sum.PRH, 1e-9));
    check('Surface et volume cumules', near(bld.sum.A, 36, 1e-9) && near(bld.sum.V, 90, 1e-9), 'A = ' + bld.sum.A + ', V = ' + bld.sum.V);
    check('Coefficient G = (HT + HV) / V', near(bld.sum.G, (ra.HT + ra.HV + rb.HT + rb.HV) / 90, 1e-9));

    if (log) console.log('7) Proprietes physiques');
    const base = room([el('wall', 10, 0.4, 'ext'), el('glaz', 3, 1.4, 'ext')]);
    r = H.room(Object.assign({}, base, { Ti: -5 }), g0);
    check('Ti = Te : plus aucune deperdition', near(r.PT, 0, 1e-9) && near(r.PV, 0, 1e-9) && near(r.Ptot, 0, 1e-9));
    const p1 = H.room(room([el('wall', 10, 0.4, 'ext')]), g0).PT, p2 = H.room(room([el('wall', 20, 0.4, 'ext')]), g0).PT, p3 = H.room(room([el('wall', 10, 0.8, 'ext')]), g0).PT;
    check('Perte proportionnelle a la surface', near(p2, 2 * p1, 1e-9));
    check('Perte croissante avec U', p3 > p1);
    r = H.room(room([el('wall', 10, 1, 'adj', { Tadj: 20 })]), g0);
    check('Voisin a la meme temperature : echange nul', near(r.Pint, 0, 1e-9));
    r = H.room(room([el('wall', 10, 1, 'adj', { Tadj: 25 })]), g0);
    check('Voisin plus chaud : apport (signe negatif)', r.Pint < 0);
    const pv0 = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 100, eta: 0 } }), g0).PV, pv8 = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 100, eta: 0.8 } }), g0).PV;
    check('Meilleur rendement : moins de perte de ventilation', pv8 < pv0);
    const e1 = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 100, eta: 1 } }), g0).PV, e95 = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 100, eta: 0.95 } }), g0).PV;
    check('Rendement plafonne a 0,95', near(e1, e95, 1e-9));
    const en = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 100, eta: -1 } }), g0).PV;
    check('Rendement negatif ramene a 0', near(en, pv0, 1e-9));
    r = H.room(room([el('wall', 10, 0.4, 'ext')]), Object.assign({}, g0, { fRH: 12 })); const r0 = H.room(room([el('wall', 10, 0.4, 'ext')]), g0);
    check('Relance ajoutee au total', near(r.Ptot - r0.Ptot, 240, 1e-9));
    check('Porte et vitrage : pas de pont thermique ajoute', near(H.room(room([el('door', 2, 2, 'ext')]), g0).PT, 2 * 2 * 25, 1e-9) && near(H.room(room([el('glaz', 3, 1.4, 'ext')]), g0).PT, 3 * 1.4 * 25, 1e-9));
    check('Mur, toit : pont thermique ajoute', near(H.room(room([el('roof', 10, 0.3, 'ext')]), g0).PT, 10 * 0.35 * 25, 1e-9));
    check('Element de surface nulle ignore', near(H.room(room([el('wall', 0, 5, 'ext'), el('wall', 10, 0.4, 'ext')]), g0).PT, p1, 1e-9));

    if (log) console.log('8) Deux implementations, 300 locaux aleatoires');
    let bad = 0, worst = '';
    for (let k = 0; k < 300; k++) {
      const adjs = ['ext', 'unc', 'adj', 'gnd'], kinds = ['wall', 'roof', 'floor', 'glaz', 'door'], els = [];
      for (let i = 0, n = 1 + Math.floor(rnd() * 5); i < n; i++) { const adj = pick(adjs); els.push(el(adj === 'gnd' ? 'floor' : pick(kinds), 1 + rnd() * 30, 0.15 + rnd() * 3, adj, { bu: rnd(), Tadj: 5 + rnd() * 20 })); }
      const area = 8 + rnd() * 60, rm = room(els, { area: area, h: 2.2 + rnd() * 2, Ti: 16 + rnd() * 8, nmin: pick([0.3, 0.5, 1, 2]), exposure: pick(['one', 'more']), per: 8 + rnd() * 30, vent: pick([{ mode: 'nat', vsu: 0, eta: 0 }, { mode: 'bal', vsu: rnd() * 150, eta: rnd() * 1.2 - 0.1 }]) });
      const gg = { Te: -15 + rnd() * 15, Tme: rnd() * 12, n50: 1 + rnd() * 10, shield: pick(['none', 'moderate', 'high']), zc: pick([3, 12, 28, 45]), dUtb: pick([0, 0.05, 0.1]), fRH: pick([0, 8, 15]), Gw: pick([1, 1.15]), wall: 0.2 + rnd() * 0.3, lam: pick([1, 1.5, 2, 3]) };
      if (!(rm.Ti > gg.Te + 1)) continue;
      const x = H.room(rm, gg), y = ref(rm, gg);
      if (!(rel(x.PT, y.PT, 1e-9) && rel(x.PV, y.PV, 1e-9) && rel(x.Pint, y.Pint, 1e-9) && rel(x.PRH, y.PRH, 1e-9) && rel(x.Ptot, y.Ptot, 1e-9) && rel(x.Pbld, y.Pbld, 1e-9) && rel(x.Veff, y.Veff, 1e-9))) { bad++; worst = JSON.stringify([x.Ptot, y.Ptot]); }
    }
    check('300 locaux : moteur = reference independante (' + bad + ' ecart(s))', bad === 0, worst);
  } catch (e) { ko++; if (log) console.log('  ECHEC  exception : ' + e.message); }
  return { ok: ok, ko: ko };
}

seed = 12345;
const res = suite(HREAL, true);

// ---- 9) Mutations : une erreur introduite dans le moteur doit faire echouer au moins un test
console.log('9) Mutations (chacune doit etre detectee)');
function nth(code, s, r, n) { let i = -1; for (let k = 0; k <= n; k++) { i = code.indexOf(s, i + 1); if (i < 0) return null; } return code.slice(0, i) + r + code.slice(i + s.length); }
const MUT = [
  ['capacite volumique 0,30', 'var RHOCP = 0.34', 'var RHOCP = 0.30', 0],
  ['e modere une facade 0,03', 'moderate: [0.02, 0.03]', 'moderate: [0.03, 0.03]', 0],
  ['epsilon 1,1', 'zc > 10 ? 1.2 : 1.0', 'zc > 10 ? 1.1 : 1.0', 0],
  ['facteur de sol 1,35', '1.45 * g.Gw * A * Ue', '1.35 * g.Gw * A * Ue', 0],
  ['infiltration sans le facteur 2', 'var Vinf = 2 * V', 'var Vinf = 1 * V', 0],
  ['max devient min', 'vv = Math.max(Vinf, Vmin)', 'vv = Math.min(Vinf, Vmin)', 0],
  ['local non chauffe sans b', 'H = A * Ue * e.bu', 'H = A * Ue', 0],
  ['pont thermique oublie (mur exterieur)', 'Ue = U + (isG ? 0 : g.dUtb)', 'Ue = U', 0],
  ['pont thermique oublie (local non chauffe)', 'Ue = U + (isG ? 0 : g.dUtb)', 'Ue = U', 1],
  ['signe de l\'echange interne', 'phi = A * U * (Ti - e.Tadj)', 'phi = A * U * (e.Tadj - Ti)', 0],
  ['relance sans la surface', 'out.PRH = r.area * g.fRH', 'out.PRH = g.fRH', 0],
  ['plafond de rendement 0,99', 'Math.min(0.95', 'Math.min(0.99', 0],
  ['sol : 0,457 devient 0,5', '0.457 * Bp', '0.5 * Bp', 0],
  ['sol : facteur 2 oublie', 'U = 2 * lam / (Math.PI * Bp + dt)', 'U = lam / (Math.PI * Bp + dt)', 0]
];
let mdet = 0, mok = 0;
for (const [nm, s, r, n] of MUT) {
  const code = nth(CODE, s, r, n);
  if (code === null) { console.log('  ECHEC  mutation « ' + nm + ' » : ancre introuvable'); mdet++; continue; }
  const H2 = loadCode(code);
  if (!H2) { console.log('  ECHEC  mutation « ' + nm + ' » : code illisible'); mdet++; continue; }
  seed = 12345; const q = suite(H2, false);
  if (q.ko > 0) mok++; else { console.log('  ECHEC  mutation « ' + nm + ' » NON detectee'); mdet++; }
}
const ok = res.ok + mok, ko = res.ko + mdet;
console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
