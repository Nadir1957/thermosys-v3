// Thermosys - Chauffage EN 12831 : exemples numeriques publies et tables de coefficients
// Sources : Calculytic (local 60 m3, 0,5 vol/h, 20/-12 C : 326 W ; recuperation 85 % : 49 W), heiznorm.de (20 m2 x U 1,0 x 32 K = 640 W ; 40 m3 x 0,7 x 0,34 x 32 K = 305 W),
// Rapport DIN/TS 12831-1:2020 (ingenieurbuero-heckmann.de : 10 locaux, ventilation 1580 W, batiment 790 W), mepbau.com (138,5 m3/h : 47,1 W/K, 1507 W a 32 K), Univ. de Trieste (coefficients e, epsilon, nmin ; formule d'infiltration), SBZ (formules 2003 : 0,34 ; sol f_g1 = 1,45, G_w).
// Usage (depuis le dossier files) :  node tests\heating_exemples_regression.js
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
if (!fs.existsSync(file)) { console.error('Fichier introuvable : ' + file); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');
const a = html.indexOf('(function (root) {\n  \'use strict\';\n  var RHOCP = 0.34;'), b0 = a < 0 ? -1 : html.indexOf("})(typeof window !== 'undefined' ? window : globalThis);", a);
let src = a < 0 ? null : html.slice(a, b0 + "})(typeof window !== 'undefined' ? window : globalThis);".length);
if (!src) { const h2 = html.replace(/\r\n/g, '\n'), a2 = h2.indexOf('(function (root) {\n  \'use strict\';\n  var RHOCP = 0.34;'); if (a2 < 0) { console.log('ECHEC : moteur de chauffage introuvable'); process.exit(3); } const e2 = h2.indexOf("})(typeof window !== 'undefined' ? window : globalThis);", a2); src = h2.slice(a2, e2 + "})(typeof window !== 'undefined' ? window : globalThis);".length); }
let bad = 0, nb = 0;
function ok(c, m) { nb++; if (!c) { bad++; console.log('ECHEC : ' + m); } }
const near = (x, y, t) => Math.abs(x - y) <= t;
function load(s) { const sb = { module: { exports: {} } }; new Function('module', 'globalThis', s.replace("typeof window !== 'undefined' ? window : globalThis", 'globalThis'))(sb.module, sb); return sb.module.exports; }
function checks(H, tag) {
  const g = { Te: -12, Tme: 10, n50: 0, shield: 'moderate', zc: 5, dUtb: 0, fRH: 0, Gw: 1, wall: 0.3, lam: 2 };
  const nat = (area, h, n, Ti) => ({ area: area, h: h, Ti: Ti || 20, nmin: n, vent: { mode: 'nat' }, exposure: 'one', per: 0, elems: [] });
  const bal = (v, eta) => ({ area: 24, h: 2.5, Ti: 20, nmin: 0.5, vent: { mode: 'bal', vsu: v, eta: eta }, exposure: 'one', per: 0, elems: [] });
  let r = H.room(nat(24, 2.5, 0.5), g);                      // Calculytic : V = 60, n = 0,5, 20/-12
  ok(near(r.HV, 10.2, 1e-9) && near(r.PV, 326.4, 1e-6), tag + 'Calculytic : 10,2 W/K et 326 W');
  r = H.room(bal(30, 0.85), g);                              // recuperation 85 % : 49 W
  ok(near(r.PV, 48.96, 1e-6), tag + 'Calculytic avec recuperation 85 % : 49 W');
  r = H.room({ area: 20, h: 2.5, Ti: 20, nmin: 0, vent: { mode: 'nat' }, exposure: 'one', per: 0, elems: [{ kind: 'wall', area: 20, U: 1.0, adj: 'ext' }] }, g);
  ok(near(r.PT, 640, 1e-9), tag + 'heiznorm : 20 m2 x 1,0 x 32 K = 640 W');
  r = H.room(nat(16, 2.5, 0.7), g);                          // V = 40, n = 0,7
  ok(near(r.PV, 304.64, 1e-6), tag + 'heiznorm : 305 W');
  r = H.room(bal(138.5, 0), g);                              // mepbau : 138,5 m3/h
  ok(near(r.HV, 47.09, 1e-6) && near(r.PV, 1506.88, 1e-3), tag + 'mepbau : 47,1 W/K et 1507 W');
  // Rapport de logiciel conforme a DIN/TS 12831-1:2020 (ingenieurbuero-heckmann.de, maison de 10 locaux, ventilation naturelle, theta_e = -9,5 C, n_min = 0,5 /h)
  const REP = [[76.80, 21, 398.2], [28.19, 21, 146.1], [14.59, 21, 75.7], [6.94, 21, 36.0], [23.53, 21, 122.0], [37.99, 21, 197.0], [41.07, 21, 212.9], [11.72, 21, 60.8], [37.15, 21, 192.6], [24.44, 24, 139.2]];
  const gR = Object.assign({}, g, { Te: -9.5 });
  const rooms = REP.map(x => ({ area: x[0], h: 1, Ti: x[1], nmin: 0.5, vent: { mode: 'nat' }, exposure: 'one', per: 0, elems: [] }));
  const bR = H.building(rooms, gR);
  ok(bR.rooms.every((o, i) => near(o.PV, REP[i][2], 0.15)), tag + 'rapport 2020 : ventilation de chacun des 10 locaux');
  ok(near(bR.sum.PVrooms, 1580.4, 0.6), tag + 'rapport 2020 : somme des locaux 1580 W');
  ok(near(bR.sum.PV, 790, 0.4), tag + 'rapport 2020 : ventilation du batiment 790 W (moitie)');
  ok(bR.sum.fz === 0.5 && near(bR.sum.Pbld, bR.sum.PT + 790.2, 0.5), tag + 'rapport 2020 : total du batiment = transmission + 790 W');
  // Meme rapport (maison avec ventilation a double flux, rendement 90 %, theta_e = -11 C) : temperature de l'air souffle apres recuperation
  const EXH = [[40, 20], [25, 20], [25, 20], [25, 20], [40, 24]];                  // debits extraits (m3/h) et temperatures des locaux
  const tex = EXH.reduce((a, x) => a + x[0] * x[1], 0) / EXH.reduce((a, x) => a + x[0], 0), trec = -11 + 0.9 * (tex + 11);
  ok(near(trec, 17.8, 0.05), tag + 'rapport 2020 (VMC) : theta_rec = theta_e + eta (theta_extraction - theta_e) = 17,8 C');
  ok(near(0.34 * 155 * (20 - trec), 114, 3), tag + 'rapport 2020 (VMC) : air souffle 114 W avec la formule de la norme');
  const rv = H.room({ area: 24, h: 2.5, Ti: 20, nmin: 0.5, vent: { mode: 'bal', vsu: 155, eta: 0.9 }, exposure: 'one', per: 0, elems: [] }, Object.assign({}, g, { Te: -11 }));
  ok(near(rv.PV / 114 - 1, 0.43, 0.01), tag + 'ecart documente : Thermosys surestime ce terme de 43 % (163 W au lieu de 114 W)');
  // tables de coefficients (Univ. de Trieste, independante de AixLib)
  const E = H.SHIELD;
  ok(E.none[0] === 0.03 && E.none[1] === 0.05 && E.moderate[0] === 0.02 && E.moderate[1] === 0.03 && E.high[0] === 0.01 && E.high[1] === 0.02, tag + 'coefficients e');
  ok(H.eps(0) === 1.0 && H.eps(10) === 1.0 && H.eps(10.5) === 1.2 && H.eps(30) === 1.2 && H.eps(31) === 1.5, tag + 'coefficients epsilon (0-10 / 10-30 / >30 m)');
  ok(H.RHOCP === 0.34, tag + 'rho x cp = 0,34');
  // formule d'infiltration 2 V n50 e eps : V = 100 m3, n50 = 3, e = 0,02, eps = 1,2 -> 14,4 m3/h
  const g2 = Object.assign({}, g, { n50: 3, zc: 20 }), r2 = H.room({ area: 40, h: 2.5, Ti: 20, nmin: 0, vent: { mode: 'nat' }, exposure: 'one', per: 0, elems: [] }, g2);
  ok(near(r2.Vinf, 2 * 100 * 3 * 0.02 * 1.2, 1e-9), tag + 'infiltration 2 V n50 e eps = 14,4 m3/h');
  // ventilation mecanique : V = Vinf + Vsu (Univ. de Trieste), sans recuperation
  const g3 = Object.assign({}, g, { n50: 3 }), r3 = H.room({ area: 40, h: 2.5, Ti: 20, nmin: 0, vent: { mode: 'bal', vsu: 50, eta: 0 }, exposure: 'one', per: 0, elems: [] }, g3);
  ok(near(r3.Veff, 50 + 2 * 100 * 3 * 0.02, 1e-9), tag + 'ventilation mecanique : Vsu + Vinf');
  // ventilation naturelle : max(Vinf, Vmin)
  const rm1 = H.room({ area: 40, h: 2.5, Ti: 20, nmin: 0.5, vent: { mode: 'nat' }, exposure: 'one', per: 0, elems: [] }, g2);
  ok(near(rm1.Veff, 50, 1e-9), tag + 'max : Vmin domine (50 m3/h)');
  const rm2 = H.room({ area: 40, h: 2.5, Ti: 20, nmin: 0.1, vent: { mode: 'nat' }, exposure: 'one', per: 0, elems: [] }, Object.assign({}, g2, { n50: 10 }));
  ok(near(rm2.Veff, 48, 1e-9), tag + 'max : Vinf domine (48 m3/h)');
  // EN ISO 13370, valeurs recalculees independamment : branche dt >= B' et branche dt < B'
  const u1 = H.uGround(4, 8, 0.5, 0.3, 2).U, d1 = 0.3 + 2 * (0.21 + (1 / 0.5 - 0.21));
  ok(near(u1, 2 / (0.457 * 1 + d1), 1e-12), tag + 'ISO 13370 branche dt >= B\'');
  const u2 = H.uGround(100, 40, 1.0, 0.3, 2).U, d2 = 0.3 + 2 * (0.21 + (1 / 1.0 - 0.21)), B2 = 5;
  ok(near(u2, 2 * 2 / (Math.PI * B2 + d2) * Math.log(Math.PI * B2 / d2 + 1), 1e-12), tag + 'ISO 13370 branche dt < B\'');
  // sol : f_g1 = 1,45 ; G_w = 1,15 nappe a moins de 3 m ; f_g2 = (Ti - Tme)/(Ti - Te)
  const gs = Object.assign({}, g, { Gw: 1.15, Tme: 10 }), rs = H.room({ area: 25, h: 2.5, Ti: 20, nmin: 0, vent: { mode: 'nat' }, exposure: 'one', per: 20, elems: [{ kind: 'floor', area: 25, U: 0.5, adj: 'gnd' }] }, gs);
  const ug = H.uGround(25, 20, 0.5, 0.3, 2);
  ok(near(rs.PT, 1.45 * 1.15 * 25 * ug.U * (20 - 10), 1e-9), tag + 'sol : 1,45 x G_w x A x U x (Ti - Tme)');
  // relance : A x f_RH
  const gr = Object.assign({}, g, { fRH: 12 }), rr = H.room(nat(24, 2.5, 0.5), gr);
  ok(near(rr.PRH, 24 * 12, 1e-9), tag + 'relance : A x f_RH');
  // EN ISO 13370 : continuite des deux branches a dt = B' (2 lam ln(pi+1)/(B'(pi+1)) = lam/(1,457 B'))
  const B = 5, lam = 2, dt = B, U1 = 2 * lam / (Math.PI * B + dt) * Math.log(Math.PI * B / dt + 1), U2 = lam / (0.457 * B + dt);
  ok(Math.abs(U1 / U2 - 1) < 1e-3, tag + 'ISO 13370 : continuite des deux formules a dt = B\'');
  ok(near(H.uGround(100, 40, 0.3, 0.3, 2).Bp, 5, 1e-12), tag + "B' = A/(0,5 P)");
}
const H0 = load(src);
checks(H0, '');
const muts = [
  ['var RHOCP = 0.34', 'var RHOCP = 0.33', 'rho cp 0,33'], ['moderate: [0.02, 0.03]', 'moderate: [0.03, 0.03]', 'e moyen'], ['none: [0.03, 0.05]', 'none: [0.03, 0.04]', 'e sans protection'],
  ['zc > 30 ? 1.5 : zc > 10 ? 1.2 : 1.0', 'zc > 30 ? 1.5 : zc > 10 ? 1.1 : 1.0', 'epsilon 1,2'], ['zc > 30 ? 1.5', 'zc > 30 ? 1.4', 'epsilon 1,5'], ['zc > 10 ? 1.2', 'zc > 20 ? 1.2', 'seuil 10 m'],
  ['2 * V * g.n50', '1 * V * g.n50', 'infiltration facteur 2'], ['phi = 1.45 * g.Gw', 'phi = 1.4 * g.Gw', 'f_g1'], ['out.PRH = r.area * g.fRH', 'out.PRH = V * g.fRH', 'relance'],
  ['0.457 * Bp', '0.5 * Bp', 'ISO 13370 0,457'], ['0.5 * P)', '1.0 * P)', "B' demi-perimetre"],
  ['s.fz = nNat >= 2 ? 0.5 : 1', 's.fz = nNat >= 2 ? 0.6 : 1', 'batiment : facteur 0,6'], ['s.PV += o.PV * f', 's.PV += o.PV', 'batiment : sans reduction'], ['vv = Vsu * (1 - Math.max(0, Math.min(0.95, r.vent.eta))) + Vinf', 'vv = Vsu * (1 - Math.max(0, Math.min(0.95, r.vent.eta))) + 0.5 * Vinf', 'ventilation meca Vinf'],
  ['vv = Math.max(Vinf, Vmin)', 'vv = Vinf + Vmin', 'max(Vinf, Vmin)'], ['(1 - Math.max(0, Math.min(0.95, r.vent.eta)))', '(1 - 0.5 * Math.max(0, Math.min(0.95, r.vent.eta)))', 'recuperation'],
  ['Math.PI * Bp + dt) * Math.log', 'Math.PI * Bp + 0.5 * dt) * Math.log', 'ISO 13370 premiere formule']
];
let killedAll = true;
muts.forEach(m => {
  if (src.indexOf(m[0]) < 0) { ok(false, 'mutation introuvable : ' + m[1]); return; }
  const bb = bad, nn = nb, sv = console.log; console.log = () => {};
  let H; try { H = load(src.replace(m[0], m[1])); checks(H, ''); } catch (e) { bad++; }
  console.log = sv; const killed = bad > bb; bad = bb; nb = nn; ok(killed, 'mutant survivant : ' + m[2]);
});
if (bad) { console.log('\n' + bad + ' ECHEC(S) sur ' + nb + ' verifications'); process.exit(1); }
console.log('TOUT EST BON : ' + nb + ' verifications, ' + muts.length + ' mutations tuees');
