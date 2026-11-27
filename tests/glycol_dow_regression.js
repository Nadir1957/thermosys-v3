/* Thermosys - Eau glycolee : comparaison du tableau PGLY aux guides Dow (DOWFROST propylene, DOWTHERM SR-1 ethylene), a la fiche Tyfocor L (propylene) aux correlations MEGlobal (ethylene) et aux ajustements ASHRAE (CoolProp AEG/APG).
   Concentrations Dow en VOLUME, converties en masse avec rho pur a 20 C (EG 1113.2, PG 1036.1) et eau 998.2.
   Lancer : node tests\glycol_dow_regression.js */
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
const s = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const m = /var PGLY = (\{.*?\});\nwindow\.PGLY/s.exec(s);
if (!m) { console.log('ECHEC : tableau PGLY introuvable'); process.exit(1); }
const P0 = JSON.parse(m[1]);
const RG = { EG: 1113.2, PG: 1036.1 };
// [temperature, mu Dow mPa.s, rho Dow kg/m3] par glycol et % volume
const DOW = {
  PG: { 30: [[0, 7.07, 1037.4], [20, 3.06, 1029.5], [40, 1.63, 1019.6], [60, 1.01, 1007.6]], 40: [[0, 12.30, 1046.3], [20, 4.59, 1037.4], [40, 2.24, 1026.4], [60, 1.31, 1013.4]] },
  EG: { 30: [[0, 4.15, 1053.0], [20, 2.20, 1046.4], [40, 1.34, 1037.9], [60, 0.90, 1027.5]], 40: [[0, 5.83, 1068.0], [20, 2.96, 1060.9], [40, 1.77, 1051.8], [60, 1.17, 1040.8]] }
};
function tab(P, key, T) { if (!P[key]) return null; const r = P[key][1]; for (let i = 0; i < r.length - 1; i++) { const a = r[i], b = r[i + 1]; if (a[0] <= T && T <= b[0]) { const f = (T - a[0]) / (b[0] - a[0]); return [a[1] + f * (b[1] - a[1]), Math.exp(Math.log(a[2]) + f * (Math.log(b[2]) - Math.log(a[2])))]; } } return null; }
function mix(P, g, w, T) { if (w % 10 === 0) return tab(P, g + w, T); const lo = Math.floor(w / 10) * 10, hi = lo + 10, a = tab(P, g + lo, T), b = tab(P, g + hi, T); if (!a || !b) return null; const f = (w - lo) / 10; return [a[0] + f * (b[0] - a[0]), Math.exp(Math.log(a[1]) + f * (Math.log(b[1]) - Math.log(a[1])))]; }
// ecarts maximaux admis (mesures le 27/11/2026, avec une petite marge)
const TOL_MU = { PG: { 0: 6, 20: 2, 40: 2.5, 60: 1.5 }, EG: { 0: 12, 20: 5.5, 40: 2.5, 60: 2.5 } };
const TOL_RHO = 1.0;
// Tyfocor L (propylene, % volume) : nu [mm2/s] x rho [kg/m3] / 1000 ; [T, nu, rho]
const TYF = { 30: [[0, 7.20, 1037], [20, 3.09, 1029], [40, 1.66, 1019], [60, 1.06, 1007]], 40: [[0, 11.4, 1049], [20, 4.28, 1039], [40, 2.18, 1027], [60, 1.36, 1014]] };
// MEGlobal (ethylene, % masse) : log10(mu cP) = A - B/(w + C), T en F ; densite = (a + b w + c w2) x 999.04
const MGV = { 50: [-4.489869, 1941.309, -422.768], 100: [-3.968390, 1596.092, -420.283], 150: [-3.619555, 1368.620, -420.761] };
const MGD = { 50: [0.99873, 1.6424E-3, -4.0019E-6], 100: [0.99284, 1.4017E-3, -2.9868E-6], 150: [0.98017, 1.2599E-3, -2.3334E-6] };
// ASHRAE (ajustements CoolProp AEG/APG, fraction volumique, [T, mu mPa.s, rho]) : valeurs figees le 27/11/2026
const ASH = { EG: { 30: [[0, 4.154, 1051.8], [20, 2.156, 1045.2], [40, 1.326, 1036.8], [60, 0.912, 1026.4]], 40: [[0, 5.953, 1066.8], [20, 2.93, 1059.7], [40, 1.741, 1050.6], [60, 1.17, 1039.6]] },
  PG: { 30: [[0, 7.232, 1036.2], [20, 3.069, 1028.3], [40, 1.618, 1018.4], [60, 1.006, 1006.4]], 40: [[0, 12.186, 1045.1], [20, 4.623, 1036.2], [40, 2.249, 1025.3], [60, 1.323, 1012.3]] } };
const TOL_ASH = { PG: { 0: 6, 20: 2.5, 40: 3, 60: 2 }, EG: { 0: 12, 20: 7.5, 40: 3, 60: 2 } };
function run(P) {
  let n = 0, bad = [];
  for (const g in ASH) for (const v in ASH[g]) {
    const mg = v / 100 * RG[g], w = 100 * mg / (mg + (1 - v / 100) * 998.2);
    for (const [T, mu, rho] of ASH[g][v]) {
      const r = mix(P, g, w, T); if (!r) { bad.push('ASHRAE ' + g + v + ' hors table'); continue; }
      const dm = 100 * (r[1] / mu - 1), dr = 100 * (r[0] / rho - 1); n += 2;
      if (Math.abs(dm) > TOL_ASH[g][T]) bad.push('ASHRAE ' + g + v + ' ' + T + ' C mu ' + dm.toFixed(1) + ' %');
      if (Math.abs(dr) > TOL_RHO) bad.push('ASHRAE ' + g + v + ' ' + T + ' C rho ' + dr.toFixed(2) + ' %');
    }
  }
  for (const v in TYF) {
    const mg = v / 100 * RG.PG, w = 100 * mg / (mg + (1 - v / 100) * 998.2);
    for (const [T, nu, rho] of TYF[v]) {
      const r = mix(P, 'PG', w, T); if (!r) { bad.push('Tyfocor ' + v + ' hors table'); continue; }
      const dm = 100 * (r[1] / (nu * rho / 1000) - 1), dr = 100 * (r[0] / rho - 1); n += 2;
      if (Math.abs(dm) > 6) bad.push('Tyfocor PG' + v + ' ' + T + ' C mu ' + dm.toFixed(1) + ' %');
      if (Math.abs(dr) > TOL_RHO) bad.push('Tyfocor PG' + v + ' ' + T + ' C rho ' + dr.toFixed(2) + ' %');
    }
  }
  for (const w of [30, 40, 50]) for (const F in MGV) {
    const T = (F - 32) / 1.8, [A, B, C] = MGV[F], mu = Math.pow(10, A - B / (w + C)), [a, b, c] = MGD[F], rho = (a + b * w + c * w * w) * 999.04;
    const r = mix(P, 'EG', w, T); if (!r) { bad.push('MEGlobal EG' + w + ' hors table'); continue; }
    const dm = 100 * (r[1] / mu - 1), dr = 100 * (r[0] / rho - 1); n += 2;
    if (Math.abs(dm) > 6.5) bad.push('MEGlobal EG' + w + ' ' + F + ' F mu ' + dm.toFixed(1) + ' %');
    if (Math.abs(dr) > 0.4) bad.push('MEGlobal EG' + w + ' ' + F + ' F rho ' + dr.toFixed(2) + ' %');
  }
  for (const g in DOW) for (const v in DOW[g]) {
    const mg = v / 100 * RG[g], w = 100 * mg / (mg + (1 - v / 100) * 998.2);
    for (const [T, mu, rho] of DOW[g][v]) {
      const r = mix(P, g, w, T); if (!r) { bad.push(g + v + ' hors table'); continue; }
      const dm = 100 * (r[1] / mu - 1), dr = 100 * (r[0] / rho - 1);
      n += 2;
      if (Math.abs(dm) > TOL_MU[g][T]) bad.push(g + v + ' ' + T + ' C mu ' + dm.toFixed(1) + ' %');
      if (Math.abs(dr) > TOL_RHO) bad.push(g + v + ' ' + T + ' C rho ' + dr.toFixed(2) + ' %');
    }
  }
  return { n, bad };
}
const base = run(P0);
let fails = base.bad.length, checks = base.n;
base.bad.forEach(x => console.log('ECART : ' + x));
// mutations : toute alteration de 8 % d'une valeur du tableau doit etre detectee
let killed = 0, total = 0;
for (const k of ['PG30', 'PG40', 'EG30', 'EG40', 'PG20', 'EG50']) for (const col of [1, 2]) for (const sign of [1, -1]) {
  const P = JSON.parse(m[1]); P[k][1].forEach(r => { r[col] *= 1 + sign * 0.08; });
  const r = run(P);
  if (['PG20', 'EG50'].includes(k)) continue; // ces melanges ne servent qu'a l'interpolation (bornes)
  total++; if (r.bad.length) killed++; else { fails++; console.log('MUTANT SURVIVANT : ' + k + ' col ' + col + ' ' + sign); }
}
checks += total;
if (fails) { console.log('ECHEC : ' + fails); process.exit(1); }
console.log('TOUT EST BON : ' + checks + ' verifications, ' + killed + ' mutations tuees');
