// Thermosys - Tests de non-regression du module « Chauffage » (deperditions de base, methode simplifiee EN 12831-1)
// Usage (depuis le dossier files) :  node tests\heating_regression.js
//   ou avec un autre fichier :       node tests\heating_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// IMPORTANT - statut des references (rien n'est cache) :
//  Aucun exemple chiffre officiel de la norme EN 12831-1 n'a pu etre consulte gratuitement. Ces tests recalculent donc a la main
//  les formules de la methode simplifiee (transmission, ventilation et infiltration, relance, sol selon EN ISO 13370) de facon
//  INDEPENDANTE du module : ils detectent une modification accidentelle ou une erreur de programmation, mais ne prouvent pas
//  la conformite a la norme elle-meme. Les constantes (0,34 W/(m3/h.K) ; coefficients e ; facteur 1,45 ; epsilon) sont celles
//  que le module utilise et que je connais de la norme ; elles restent a confirmer sur le texte officiel.
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');

function loadHeat(file) {
  let h; try { h = fs.readFileSync(file, 'utf8'); } catch (e) { console.error('Fichier illisible : ' + file); process.exit(2); }
  const open = '<script id="heat-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
  if (a < 0 || b < 0) { console.error('Module chauffage introuvable dans ' + file); process.exit(2); }
  const win = {};
  try { new Function('window', h.slice(a + open.length, b))(win); } catch (e) { console.error('Module illisible : ' + e.message); process.exit(2); }
  if (!win.HEAT) { console.error('Moteur HEAT non expose'); process.exit(2); }
  return win.HEAT;
}
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message + ' (module ancien ou incompatible)'); process.exit(1); });
const H = loadHeat(htmlFile);
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function near(a, b, tol) { return Math.abs(a - b) <= tol; }

const g = { Te: -5, Tme: 8, n50: 3, shield: 'moderate', zc: 5, dUtb: 0.05, fRH: 0, Gw: 1, wall: 0.3, lam: 2.0 };
const el = (kind, area, U, adj, extra) => Object.assign({ kind: kind, area: area, U: U, adj: adj, bu: 0.5, Tadj: 15, label: kind }, extra || {});
const room = (elems, extra) => Object.assign({ area: 20, h: 2.5, Ti: 20, nmin: 0.5, vent: { mode: 'nat', vsu: 0, eta: 0 }, exposure: 'one', per: 0, elems: elems }, extra || {});

console.log('1) Constantes');
check('Capacite volumique 0,34 W/(m3/h.K)', H.RHOCP === 0.34);
check('Facteur de hauteur epsilon : 1,0 / 1,2 / 1,5', H.eps(5) === 1.0 && H.eps(10) === 1.0 && H.eps(15) === 1.2 && H.eps(30) === 1.2 && H.eps(35) === 1.5);
check('Coefficients e (blindage nul/modere/fort ; une facade/plusieurs)',
  JSON.stringify(H.SHIELD) === JSON.stringify({ none: [0.03, 0.05], moderate: [0.02, 0.03], high: [0.01, 0.02] }));

console.log('2) Piece simple, calculs a la main');
// dT = 20 - (-5) = 25 K. Mur 10 m2 U 0,4 (+0,05 pont thermique) = 4,5 W/K ; fenetre 3 m2 U 1,4 (sans pont) = 4,2 W/K ; toit 20 m2 U 0,25 (+0,05) = 6,0 W/K
// HT = 14,7 W/K -> PT = 367,5 W. V = 50 m3 ; infiltration 2.V.n50.e.eps = 2 x 50 x 3 x 0,02 x 1 = 6 m3/h ; minimum 0,5 x 50 = 25 m3/h -> 25 m3/h
// HV = 0,34 x 25 = 8,5 W/K -> PV = 212,5 W. Total = 580 W.
let r = H.room(room([el('wall', 10, 0.4, 'ext'), el('glaz', 3, 1.4, 'ext'), el('roof', 20, 0.25, 'ext')]), g);
check('Transmission PT = 367,5 W', near(r.PT, 367.5, 1e-6), 'PT = ' + r.PT);
check('Volume d\'air 25 m3/h (minimum hygienique) et infiltration 6 m3/h', near(r.Veff, 25, 1e-9) && near(r.Vinf, 6, 1e-9), 'Veff = ' + r.Veff + ', Vinf = ' + r.Vinf);
check('Ventilation PV = 212,5 W', near(r.PV, 212.5, 1e-6), 'PV = ' + r.PV);
check('Total 580 W (29 W/m2)', near(r.Ptot, 580, 1e-6) && near(r.wm2, 29, 1e-6), 'Ptot = ' + r.Ptot);

console.log('3) Ventilation');
// double flux : debit 25 m3/h, rendement 0,8 -> 25 x 0,2 + infiltration 6 = 11 m3/h -> PV = 0,34 x 11 x 25 = 93,5 W
r = H.room(room([el('wall', 10, 0.4, 'ext')], { vent: { mode: 'bal', vsu: 25, eta: 0.8 } }), g);
check('Double flux : 11 m3/h, PV = 93,5 W', near(r.Veff, 11, 1e-9) && near(r.PV, 93.5, 1e-6), 'Veff = ' + r.Veff + ', PV = ' + r.PV);
// infiltration dominante : blindage nul, une facade, n50 = 10 -> 2 x 50 x 10 x 0,03 = 30 m3/h (> 25)
r = H.room(room([el('wall', 10, 0.4, 'ext')]), Object.assign({}, g, { shield: 'none', n50: 10 }));
check('Infiltration dominante : 30 m3/h', near(r.Veff, 30, 1e-9), 'Veff = ' + r.Veff);
// plusieurs facades exposees, blindage nul : e = 0,05 -> 2 x 50 x 10 x 0,05 = 50 m3/h ; hauteur 35 m : epsilon 1,5 -> 75 m3/h
r = H.room(room([el('wall', 10, 0.4, 'ext')], { exposure: 'more' }), Object.assign({}, g, { shield: 'none', n50: 10 }));
check('Plusieurs facades : 50 m3/h', near(r.Veff, 50, 1e-9), 'Veff = ' + r.Veff);
r = H.room(room([el('wall', 10, 0.4, 'ext')], { exposure: 'more' }), Object.assign({}, g, { shield: 'none', n50: 10, zc: 35 }));
check('Hauteur > 30 m (epsilon 1,5) : 75 m3/h', near(r.Veff, 75, 1e-9), 'Veff = ' + r.Veff);

console.log('4) Parois sur local chauffe, local non chauffe, relance');
// paroi vers un local chauffe a 15 C : 10 m2 x U 1,0 x (20 - 15) = 50 W (echange interne, hors batiment)
r = H.room(room([el('wall', 10, 1.0, 'adj', { Tadj: 15 })]), g);
check('Local adjacent chauffe : 50 W en echange interne, 0 W de transmission', near(r.Pint, 50, 1e-9) && near(r.PT, 0, 1e-9), 'Pint = ' + r.Pint + ', PT = ' + r.PT);
check('Le total de la piece compte l\'echange interne, la contribution au batiment ne le compte pas', near(r.Ptot - r.Pbld, 50, 1e-9));
// local non chauffe, b = 0,5 : H = 10 x (1,0 + 0,05) x 0,5 = 5,25 W/K ; phi = 5,25 x 25 = 131,25 W
r = H.room(room([el('wall', 10, 1.0, 'unc', { bu: 0.5 })]), g);
check('Local non chauffe (b = 0,5) : 131,25 W', near(r.PT, 131.25, 1e-9), 'PT = ' + r.PT);
// relance : fRH = 12 W/m2 x 20 m2 = 240 W
r = H.room(room([el('wall', 10, 0.4, 'ext')]), Object.assign({}, g, { fRH: 12 }));
check('Relance 12 W/m2 : 240 W', near(r.PRH, 240, 1e-9), 'PRH = ' + r.PRH);

console.log('5) Plancher sur terre-plein (EN ISO 13370), recalcul independant');
function uRef(A, P, Uf, w, lam) {
  const Bp = A / (0.5 * P), Rf = 1 / Uf - 0.21, dt = w + lam * (0.21 + Rf);
  return dt < Bp ? 2 * lam / (Math.PI * Bp + dt) * Math.log(Math.PI * Bp / dt + 1) : lam / (0.457 * Bp + dt);
}
let ug = H.uGround(50, 28, 0.5, 0.3, 2.0), ref = uRef(50, 28, 0.5, 0.3, 2.0);
check('U equivalent plancher non isole (dt >= B\') : ' + ref.toFixed(4) + ' W/m2K', near(ug.U, ref, 1e-9) && near(ug.U, 0.3372, 0.0005), 'U = ' + ug.U);
ug = H.uGround(100, 40, 2, 0.3, 1.0); ref = uRef(100, 40, 2, 0.3, 1.0);
check('U equivalent plancher peu isole (dt < B\') : ' + ref.toFixed(4) + ' W/m2K', near(ug.U, ref, 1e-9) && near(ug.U, 0.3668, 0.0005), 'U = ' + ug.U);
// piece sur terre-plein : phi = 1,45 x Gw x A x Ue x (Ti - Tme) = 1,45 x 1 x 50 x 0,3372 x 12 = 293,3 W
r = H.room(room([el('floor', 50, 0.5, 'gnd')], { area: 50, per: 28 }), g);
check('Perte par le sol 293 W', near(r.PT, 1.45 * 1 * 50 * uRef(50, 28, 0.5, 0.3, 2.0) * 12, 1e-6), 'PT = ' + r.PT);

console.log('6) Batiment (somme des pieces)');
const A = room([el('wall', 10, 0.4, 'ext'), el('wall', 8, 1.0, 'adj', { Tadj: 20 })]);
const B = room([el('wall', 12, 0.4, 'ext'), el('wall', 8, 1.0, 'adj', { Tadj: 20 })], { area: 16 });
const bld = H.building([A, B], g), ra = H.room(A, g), rb = H.room(B, g);
check('Somme des pieces : Ptot', near(bld.sum.Ptot, ra.Ptot + rb.Ptot, 1e-9));
check('Echanges internes nuls entre pieces a meme temperature', near(bld.sum.Pint, 0, 1e-9));
check('Contribution au batiment = transmission + ventilation + relance', near(bld.sum.Pbld, bld.sum.PT + bld.sum.PV + bld.sum.PRH, 1e-9));
check('Surface et volume cumules', near(bld.sum.A, 36, 1e-9) && near(bld.sum.V, 90, 1e-9), 'A = ' + bld.sum.A + ', V = ' + bld.sum.V);

console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
