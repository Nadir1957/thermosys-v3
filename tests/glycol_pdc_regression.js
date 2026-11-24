// Thermosys - Tests de non-regression : eau glycolee dans « Pertes de charge » et « Reseau » (troncons)
// Usage (depuis le dossier files) :  node tests\glycol_pdc_regression.js
//   ou avec un autre fichier :       node tests\glycol_pdc_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou fonction illisible.
//
// Statut des references (rien n'est cache) :
//  - Donnees : Melinder (IIR) evaluees avec CoolProp 8.0.0 (fraction massique 20 a 50 %, pression atmospherique). Les valeurs hors nœuds
//    ci-dessous sont calculees directement par CoolProp : elles verifient l'interpolation (ecart <= 2 % sur la viscosite), pas la physique.
//  - Controle independant limite : un seul point publie (DOW DOWCAL 100, ethylene-glycol 32,7 % en masse a 20 C : 2,48 mPa.s) ;
//    Melinder interpole donne environ 2,34 mPa.s (-6 %). Les tableaux d'EngineeringToolBox (en volume) sont ~10-25 % plus bas.
//    Les donnees de viscosite des fabricants different donc de 5 a 25 % selon la source : ce test ne tranche pas entre elles.
//  - Le propylene-glycol n'a pas ete compare a DOWFROST / ASHRAE (non fait).
//  - Perte de charge : formule Swamee-Jain du module (rugosite 0,046 mm), recalculee ici independamment.
//  - Les anciennes options « Glycol 30 % / 40 % » (1040 / 1060) gardent leurs valeurs fixes d'avant : resultat fige.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
let G, PDC, SEG, WATER;
const els = {};
const $ = id => els[id] || (els[id] = { value: '', textContent: '' });
try {
  const a = h.indexOf('var PGLY = '), b = h.indexOf('var RESEAU_WT = ');
  if (a < 0 || b < 0 || b < a) { throw new Error('donnees glycol introuvables'); }
  const win = {};
  new Function('window', h.slice(a, b))(win);
  G = win;
  const c = h.indexOf('var RESEAU_WT = '), d = h.indexOf('var reseauSegments = [];', c);
  const wsrc = h.slice(c, d);
  const wf = new Function('window', wsrc + '\nreturn { water: reseauWater, seg: calcSegmentPDC };');
  const o = wf(G); WATER = o.water; SEG = o.seg; G.reseauWater = WATER;
  const p = h.indexOf('window.calcPDC=function(){'), q = h.indexOf('\n/* 3. Separateur', p);
  if (p < 0 || q < 0) { throw new Error('calculateur pdc introuvable'); }
  const lang = 'fr';
  const f = new Function('$', 'val', 'bad', 'L', 'window', h.slice(p, q) + '\nreturn window.calcPDC;');
  PDC = f($, id => parseFloat($(id).value), (out, m) => { out.textContent = '⚠ ' + m; }, (fr, en) => fr, G);
} catch (e) { console.error('Fonction illisible : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function rel(a, b) { return Math.abs(a / b - 1) * 100; }
const KEYS = ['EG20', 'EG30', 'EG40', 'EG50', 'PG20', 'PG30', 'PG40', 'PG50'];
const TF = { EG20: -7.9, EG30: -14.6, EG40: -23.8, EG50: -36.0, PG20: -7.2, PG30: -12.8, PG40: -20.6, PG50: -32.2 };

console.log('1) Interpolation contre CoolProp 8.0.0 (hors nœuds du tableau)');
const REF = {"EG20": [[-5, 1029.85, 3.8409], [5, 1028.09, 2.6594], [15, 1025.61, 1.9245], [25, 1022.43, 1.4498], [35, 1018.57, 1.1324], [55, 1008.98, 0.7579], [75, 997.07, 0.5589], [95, 983.1, 0.4397]], "EG30": [[-5, 1046.31, 5.2541], [5, 1043.47, 3.5592], [15, 1040.0, 2.5285], [25, 1035.94, 1.8752], [35, 1031.32, 1.4454], [55, 1020.48, 0.9465], [75, 1007.72, 0.6848], [95, 993.27, 0.5281]], "EG40": [[-15, 1065.33, 11.5576], [-5, 1062.18, 7.1985], [5, 1058.45, 4.7569], [15, 1054.19, 3.3158], [25, 1049.41, 2.4238], [35, 1044.15, 1.8472], [55, 1032.32, 1.188], [75, 1018.95, 0.8419], [95, 1004.29, 0.6275]], "EG50": [[-15, 1080.52, 16.6724], [-5, 1076.73, 9.9791], [5, 1072.39, 6.4063], [15, 1067.53, 4.3763], [25, 1062.21, 3.1562], [35, 1056.46, 2.3842], [55, 1043.85, 1.5147], [75, 1030.02, 1.0534], [95, 1015.3, 0.7528]], "PG20": [[-5, 1020.84, 5.4095], [5, 1019.09, 3.4941], [15, 1016.42, 2.3995], [25, 1012.94, 1.7393], [35, 1008.72, 1.3212], [55, 998.47, 0.8524], [75, 986.39, 0.608], [95, 973.24, 0.4527]], "PG30": [[-5, 1033.02, 9.2719], [5, 1029.89, 5.5694], [15, 1026.0, 3.5985], [25, 1021.41, 2.4802], [35, 1016.23, 1.8085], [55, 1004.37, 1.1012], [75, 991.07, 0.7601], [95, 976.99, 0.5565]], "PG40": [[-15, 1048.15, 31.5583], [-5, 1044.47, 16.0655], [5, 1040.06, 8.9817], [15, 1035.02, 5.4626], [25, 1029.4, 3.5802], [35, 1023.28, 2.5048], [55, 1009.86, 1.4362], [75, 995.36, 0.9546], [95, 980.37, 0.6819]], "PG50": [[-15, 1058.31, 56.0156], [-5, 1053.56, 26.6374], [5, 1048.17, 14.0539], [15, 1042.22, 8.1396], [25, 1035.79, 5.1201], [35, 1028.93, 3.4611], [55, 1014.27, 1.8807], [75, 998.82, 1.1993], [95, 983.16, 0.8243]]};
let nb = 0;
KEYS.forEach(k => REF[k].forEach(r => {
  const g = G.glyProps(k, r[0]);
  if (!g) { return; }
  nb++;
  check(k + ' ' + r[0] + ' C masse volumique', rel(g.rho, r[1]) < 0.1, 'module ' + g.rho.toFixed(2) + ' ref ' + r[1]);
  check(k + ' ' + r[0] + ' C viscosite', rel(g.mu * 1000, r[2]) < 2, 'module ' + (g.mu * 1000).toFixed(3) + ' ref ' + r[2]);
}));
check('au moins 50 points compares', nb >= 50, nb + ' points');

console.log('2) Structure des donnees, points de congelation, limites');
KEYS.forEach(k => {
  const g = G.PGLY[k];
  check(k + ' present', !!g);
  if (!g) { return; }
  check(k + ' point de congelation', Math.abs(g[0] - TF[k]) <= 0.15, g[0] + ' vs ' + TF[k]);
  check(k + ' 1re ligne au-dessus de la congelation', g[1][0][0] > g[0], g[1][0][0] + ' vs ' + g[0]);
  check(k + ' derniere ligne = 100 C', g[1][g[1].length - 1][0] === 100);
  check(k + ' viscosite decroit avec T', g[1].every((r, i) => i === 0 || r[2] < g[1][i - 1][2]));
  check(k + ' masse volumique decroit avec T', g[1].every((r, i) => i === 0 || r[1] < g[1][i - 1][1]));
  check(k + ' glyMin', G.glyMin(k) === g[1][0][0]);
  check(k + ' hors domaine : trop froid', G.glyProps(k, g[1][0][0] - 0.5) === null);
  check(k + ' hors domaine : > 100 C', G.glyProps(k, 100.5) === null);
  const r0 = g[1][1], r1 = g[1][2], tm = (r0[0] + r1[0]) / 2, gm = G.glyProps(k, tm);
  check(k + ' point milieu : viscosite = moyenne geometrique', rel(gm.mu * 1000, Math.sqrt(r0[2] * r1[2])) < 1e-9);
  check(k + ' point milieu : masse volumique = moyenne', rel(gm.rho, (r0[1] + r1[1]) / 2) < 1e-9);
  g[1].forEach(r => { const q = G.glyProps(k, r[0]); check(k + ' nœud ' + r[0], rel(q.rho, r[1]) < 1e-9 && rel(q.mu * 1000, r[2]) < 1e-9); });
});
['EG', 'PG'].forEach(f => [20, 30, 40, 50].forEach((x, i, a) => { if (i > 0) { const p = G.glyProps(f + x, 20), q = G.glyProps(f + a[i - 1], 20); check(f + ' ' + x + ' % plus visqueux que ' + a[i - 1] + ' % a 20 C', p.mu > q.mu && p.rho > q.rho); } }));
check('cles invalides refusees', !G.glyOK('EG60') && !G.glyOK('1040') && !G.glyOK('EG30; x') && G.glyOK('PG50'));

console.log('3) Controle independant : un point publie (DOW DOWCAL 100, ethylene-glycol 32,7 % en masse, 20 C : 2,48 mPa.s)');
{
  const a = G.glyProps('EG30', 20), b = G.glyProps('EG40', 20), x = (32.7 - 30) / 10;
  const mu = (a.mu + (b.mu - a.mu) * x) * 1000;
  check('ecart avec DOWCAL <= 10 %', rel(mu, 2.48) <= 10, 'Melinder interpole ' + mu.toFixed(3) + ' vs 2,48');
}

console.log('4) Calculateur « Pertes de charge » : recalcul independant (9 fluides x 4 temperatures x 3 cas)');
function indep(rho, mu, Q, dn, L) { const D = dn / 1000, v = Q / (3600 * Math.PI * D * D / 4), Re = v * D * rho / mu, lam = Re < 2300 ? 64 / Re : 0.25 / Math.pow(Math.log10(0.000046 / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2); return { v: v, Re: Re, dp: lam * (L / D) * (rho * v * v / 2) }; }
function runPdc(f, T, Q, dn, L) { $('pdcFluid').value = f; $('pdcT').value = String(T); $('pdcQ').value = String(Q); $('pdcDN').value = String(dn); $('pdcL').value = String(L); $('pdcResult').textContent = ''; PDC(); return $('pdcResult').textContent; }
const cases = [[10, 40, 50], [3, 32, 30], [25, 65, 100]];
let nbc = 0;
KEYS.concat(['1000']).forEach(f => [-10, 5, 30, 60].forEach(T => cases.forEach(c => {
  const gp = f === '1000' ? (T < 0 ? null : { rho: WATER(T).rho, mu: WATER(T).mu }) : G.glyProps(f, T);
  const t = runPdc(f, T, c[0], c[1], c[2]), tag = f + ' ' + T + ' C ' + c.join('/') + ' : ';
  if (!gp) { check(tag + 'refus hors domaine', /⚠/.test(t) && !/dP =/.test(t), t.slice(0, 80)); return; }
  const m = /dP = (\d+) Pa/.exec(t), mv = /v = ([0-9.]+) m\/s/.exec(t), mr = /Re = (\d+)/.exec(t);
  check(tag + 'sortie lisible', !!(m && mv && mr), t.slice(0, 120));
  if (!(m && mv && mr)) { return; }
  nbc++;
  const r = indep(gp.rho, gp.mu, c[0], c[1], c[2]);
  check(tag + 'dP', Math.abs(+m[1] - r.dp) <= 1 + 0.002 * r.dp, 'module ' + m[1] + ' attendu ' + r.dp.toFixed(1));
  check(tag + 'vitesse', Math.abs(+mv[1] - r.v) <= 0.001 + 0.001 * r.v);
  check(tag + 'Re', Math.abs(+mr[1] - r.Re) <= 1 + 0.002 * r.Re, 'module ' + mr[1] + ' attendu ' + Math.round(r.Re));
  if (f !== '1000') { check(tag + 'ligne fluide affichee', /Fluide : .*μ = /.test(t)); }
})));
check('au moins 90 cas exploitables', nbc >= 90, nbc + ' cas');

console.log('5) Sens physique et anciennes options');
{
  const dpOf = (f, T) => +(/dP = (\d+) Pa/.exec(runPdc(f, T, 10, 40, 50)) || [0, 0])[1];
  KEYS.forEach(k => { check(k + ' : plus froid -> plus de perte de charge (turbulent)', dpOf(k, 0) > dpOf(k, 40)); });
  check('glycol 40 % EG > eau a 20 C', dpOf('EG40', 20) > dpOf('1000', 20));
  check('ancienne option 1040 inchangee (82941 Pa)', dpOf('1040', 20) === 82941 && dpOf('1040', -5) === 82941, dpOf('1040', 20) + ' / ' + dpOf('1040', -5));
  check('ancienne option 1060 inchangee (rho 1060, mu 3,8)', (() => { const r = indep(1060, 0.0038, 10, 40, 50); return Math.abs(dpOf('1060', 20) - r.dp) <= 1; })());
  check('eau 20 C proche de l\'ancien calcul (+-1 %)', rel(dpOf('1000', 20), 70457) < 1.5, String(dpOf('1000', 20)));
  const t = runPdc('EG30', -5, 10, 40, 50);
  check('exemple EG 30 % a -5 C : environ 932 mbar', /= 93[0-9]\.[0-9]+ mbar|= 932/.test(t) || /dP = 93[0-9]{3} Pa/.test(t), t.slice(0, 120));
  check('entree invalide refusee', /⚠/.test(runPdc('EG30', 20, 0, 40, 50)));
  check('temperature vide = 20 C', (() => { $('pdcFluid').value = 'EG30'; $('pdcT').value = ''; $('pdcQ').value = '10'; $('pdcDN').value = '40'; $('pdcL').value = '50'; PDC(); return /20 °C/.test($('pdcResult').textContent); })());
}

console.log('6) Troncons du reseau : calcSegmentPDC identique au calculateur');
KEYS.forEach(k => [-5, 20, 70].forEach(T => {
  const g = G.glyProps(k, T); if (!g) { return; }
  const s = SEG(10, 40, 50, k, T), r = indep(g.rho, g.mu, 10, 40, 50), t = runPdc(k, T, 10, 40, 50), m = /dP = (\d+) Pa/.exec(t);
  check(k + ' ' + T + ' C troncon : rho', rel(s.rho, g.rho) < 1e-9);
  check(k + ' ' + T + ' C troncon : mu', rel(s.mu, g.mu) < 1e-9);
  check(k + ' ' + T + ' C troncon : dP', Math.abs(s.dP - r.dp) <= 0.002 * r.dp + 1, s.dP + ' vs ' + r.dp);
  check(k + ' ' + T + ' C troncon = calculateur', m && Math.abs(+m[1] - s.dP) <= 1);
}));
check('troncon eau 20 C inchange', (() => { const s = SEG(10, 40, 50, 1000, 20), r = indep(WATER(20).rho, WATER(20).mu, 10, 40, 50); return Math.abs(s.dP - r.dp) < 1; })());
check('troncon ancien 1040 inchange (rho 1040, mu 2,8)', (() => { const s = SEG(10, 40, 50, 1040, -5), r = indep(1040, 0.0028, 10, 40, 50); return Math.abs(s.dP - r.dp) < 1; })());
console.log(ko === 0 ? 'OK : ' + ok + ' verifications reussies.' : 'ECHEC : ' + ko + ' erreur(s) sur ' + (ok + ko) + '.');
process.exit(ko === 0 ? 0 : 1);
