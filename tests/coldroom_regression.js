// Thermosys - Tests de non-regression du module « Chambre froide » (moteur CR_ENGINE : bilan frigorifique)
// Usage (depuis le dossier files) :  node tests\coldroom_regression.js     (ou : node tests\coldroom_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Psychrometrie : pression de saturation de l'eau et densite/humidite/enthalpie de l'air humide figees a partir de CoolProp 8.0.0 (IAPWS) ;
//    glace : formule de Murphy et Koop (2005). Tolerances : voir les verifications.
//  - Renouvellement d'air par 24 h : tableaux classiques de l'ASHRAE (au-dessus et au-dessous de 0 C) tels que reproduits par le manuel Krack
//    « Refrigeration Load Estimating Manual » (tableaux 4A et 4B), volumes convertis de pieds cubes en m3 ; le point 3 000 pi3 = 9,5 vol/24 h
//    est confirme par le manuel Copeland (partie 3). Chaleur d'occupation 270 - 6.T (W) confrontee au tableau 6 de Krack (ecart <= 1 %).
//  - Modele de porte : formule ASHRAE (0,221.A.(hi-hr).rho_r.sqrt(1-rho_i/rho_r).sqrt(g.H).Fm ; Df 1,1 / 0,8 ; Dt) recalculee a la main ;
//    elle n'a pas ete confrontee a un exemple chiffre publie.
//  - Le bilan complet est recalcule par une SECONDE implementation independante (200 chambres aleatoires) et par 16 mutations volontaires.
//  - NON verifie ici : les donnees des 40 produits (taux d'eau, respiration, durees), l'interface, les calculs de cycle/tuyauterie/charge du module.
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
const D = {"P": [[200, 44.0], [300, 34.5], [400, 29.5], [500, 26.0], [600, 23.0], [800, 20.0], [1000, 17.5], [1500, 14.0], [2000, 12.0], [3000, 9.5], [4000, 8.2], [5000, 7.2], [6000, 6.5], [8000, 5.5], [10000, 4.9], [15000, 3.9], [20000, 3.5], [25000, 3.0], [30000, 2.7], [40000, 2.3], [50000, 2.0], [75000, 1.6], [100000, 1.4], [200000, 0.9]], "N": [[250, 29.0], [300, 26.2], [400, 22.5], [500, 20.0], [600, 18.0], [800, 15.3], [1000, 13.5], [1500, 11.0], [2000, 9.3], [2500, 8.1], [3000, 7.4], [4000, 6.3], [5000, 5.6], [6000, 5.0], [8000, 4.3], [10000, 3.8], [15000, 3.0], [20000, 2.6], [25000, 2.3], [30000, 2.1], [40000, 1.8], [50000, 1.6], [75000, 1.3], [100000, 1.1]], "Pm": [[5.66, 44.0], [8.5, 34.5], [11.33, 29.5], [14.16, 26.0], [16.99, 23.0], [22.65, 20.0], [28.32, 17.5], [42.48, 14.0], [56.63, 12.0], [84.95, 9.5], [113.27, 8.2], [141.58, 7.2], [169.9, 6.5], [226.53, 5.5], [283.17, 4.9], [424.75, 3.9], [566.34, 3.5], [707.92, 3.0], [849.5, 2.7], [1132.67, 2.3], [1415.84, 2.0], [2123.76, 1.6], [2831.68, 1.4], [5663.36, 0.9]], "Nm": [[7.08, 29.0], [8.5, 26.2], [11.33, 22.5], [14.16, 20.0], [16.99, 18.0], [22.65, 15.3], [28.32, 13.5], [42.48, 11.0], [56.63, 9.3], [70.79, 8.1], [84.95, 7.4], [113.27, 6.3], [141.58, 5.6], [169.9, 5.0], [226.53, 4.3], [283.17, 3.8], [424.75, 3.0], [566.34, 2.6], [707.92, 2.3], [849.5, 2.1], [1132.67, 1.8], [1415.84, 1.6], [2123.76, 1.3], [2831.68, 1.1]], "ref": {"psatW": {"0": 611.2104516797365, "5": 872.575113905957, "10": 1228.1989307541448, "15": 1705.7929161256181, "20": 2339.3181834056754, "25": 3169.9293389430873, "30": 4246.970836903843, "35": 5629.016106787652, "40": 7384.938073826001}, "psatI": {"-30": 38.012172777456485, "-25": 63.28358532418115, "-20": 103.2524632801715, "-15": 165.29048699694505, "-10": 259.89216379154277, "-5": 401.75594839757645, "-2": 517.712660883399}, "states": [[0, 50, 0.0018892608940164954, 4.723436632091611, 1.2916247681483926], [0, 85, 0.00321858741428019, 8.046414475905141, 1.2905964192133965], [0, 95, 0.0035994361935898205, 8.998357846091675, 1.2903027932786901], [4, 50, 0.0025171422371085025, 10.334701735963842, 1.27243918453245], [4, 85, 0.004291299256601413, 14.782661769640967, 1.2710905301264273], [4, 95, 0.004800054397331916, 16.058022726363593, 1.2707054961535884], [10, 50, 0.003807867236455046, 19.64837278974263, 1.2444258457394444], [10, 85, 0.006501237044299977, 26.430430665463536, 1.2424339657794552], [10, 95, 0.007275035105930433, 28.378640169856393, 1.2418654245522205], [20, 50, 0.007293697701974733, 38.62283892386773, 1.1993592767723618], [20, 85, 0.012501915156851189, 51.83211956883829, 1.1956989586651294], [20, 95, 0.014005850596211712, 55.64570907237763, 1.194654716138261], [30, 50, 0.01337258655974562, 64.35567707062224, 1.1555570301163771], [30, 85, 0.023080782912617115, 89.15294197395181, 1.1491409121228207], [30, 95, 0.02590928802079836, 96.37565357354592, 1.147311692457884], [35, 50, 0.01785247051815012, 81.00169196851536, 1.1338155363619498], [35, 85, 0.03097150985457798, 114.62845805613209, 1.1254574058280307], [35, 95, 0.03481920758981407, 124.48762666833004, 1.1230754781859353]]}};

let html; try { html = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const open = '<script id="coldroom-module">', a0 = html.indexOf(open), b0 = html.indexOf('</script>', a0);
if (a0 < 0 || b0 < 0) { console.error('Module chambre froide introuvable'); process.exit(2); }
const CODE = html.slice(a0 + open.length, b0);
function load(code) {
  const win = { addEventListener() {}, location: { href: '' } };
  try { new Function('window', code)(win); } catch (e) { return null; }
  return win.CR_ENGINE || null;
}
const E0 = load(CODE);
if (!E0 || typeof E0.compute !== 'function') { console.error('Moteur CR_ENGINE illisible ou non expose'); process.exit(2); }

function rel(x, y, tol) { return Math.abs(x - y) <= tol * Math.max(1e-9, Math.abs(y)); }
function near(x, y, tol) { return Math.abs(x - y) <= tol; }
let seed = 4242; function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }

const BASE = { Tr: 2, RHr: 85, Tf: -1, cpA: 3.6, cpF: 1.9, Lat: 280, resp: 5, respT: 5, Tst: 2, stockT: 20, pct: 10, Tin: 20, tpull: 24, packPct: 5,
  Lg: 6, Wd: 5, Hh: 3, lam: 0.023, dWall: 100, dRoof: 100, dFloor: 100, floorAdj: 'air', Text: 35, RHext: 50, Twall: 35, solW: 3, solR: 8, Tgnd: 15,
  infMode: 'table', use: 1, dA: 4, dH: 2.5, dP: 20, dTp: 15, dTo: 10, dHrs: 10, dE: 0.8, vent: 100, ventH: 6,
  lightW: 10, lightH: 10, nP: 2, hP: 4, nF: 1, kWF: 3, hF: 2, otherKW: 0.5, otherH: 4, tRun: 18, fanF: 5, fanH: 20, defF: 0.06, sf: 10 };

// ---- 2e implementation independante du bilan (formules ecrites separement)
function refCompute(E, p) {
  const V = p.Lg * p.Wd * p.Hh, Af = p.Lg * p.Wd, Aw = 2 * p.Hh * (p.Lg + p.Wd), R = {};
  const Rin = 1 / 8, Rout = 1 / 23;
  const Uw = 1 / (Rin + Rout + p.dWall / 1000 / p.lam), Ur = 1 / (Rin + Rout + p.dRoof / 1000 / p.lam);
  const Uf = p.floorAdj === 'air' ? 1 / (Rin + Rout + p.dFloor / 1000 / p.lam) : 1 / (Rin + p.dFloor / 1000 / p.lam + 0.5);
  const Tfl = p.floorAdj === 'air' ? p.Text : p.Tgnd;
  const trans = (Uw * Aw * (p.Twall + p.solW - p.Tr) + Ur * Af * (p.Text + p.solR - p.Tr) + Uf * Af * (Tfl - p.Tr)) / 1000;
  R.trans = trans * 24;
  const q = (m, Tin, Tout, cA, cF, L, Tf) => { if (!(Tin > Tout) || !(m > 0)) return 0; if (Tin > Tf) { let s = m * cA * (Tin - Math.max(Tout, Tf)); if (Tout < Tf) s += m * L + m * cF * (Tf - Tout); return s; } return m * cF * (Tin - Tout); };
  const m = p.stockT * 1000 * p.pct / 100;
  R.prod = q(m, p.Tin, p.Tr, p.cpA, p.cpF, p.Lat, p.Tf) / 3600; R.pack = q(m * p.packPct / 100, p.Tin, p.Tr, 1.6, 1.6, 0, -99) / 3600;
  const rw = T => p.resp * 2.96 * Math.pow(2.5, (T - p.respT) / 10);
  const rs = rw(p.Tr) * p.stockT / 1000 * 24, ri = p.Tin > p.Tr ? Math.max(0, (rw((p.Tin + p.Tr) / 2) - rw(p.Tr)) * (m / 1000) / 1000 * p.tpull) : 0;
  R.resp = Math.max(0, rs + ri);
  const hX = E.enth(p.Text, p.RHext), hR = E.enth(p.Tr, p.RHr), rR = E.rho(p.Tr, p.RHr), rX = E.rho(p.Text, p.RHext);
  if (p.infMode === 'door') {
    const Fm = Math.pow(2 / (1 + Math.pow(rR / rX, 1 / 3)), 1.5);
    const qd = 0.221 * p.dA * (hX - hR) * rR * Math.sqrt(Math.max(0, 1 - rX / rR)) * Math.sqrt(9.81 * p.dH) * Fm;
    const Dt = (p.dP * p.dTp + 60 * p.dTo) / (3600 * p.dHrs), Df = Math.abs(p.Text - p.Tr) < 11 ? 1.1 : 0.8;
    R.air = Math.max(0, qd * Math.min(Dt, 1) * Df * (1 - p.dE) * p.dHrs);
  } else R.air = Math.max(0, V * E.achInterp(V, p.Tr < 0) * p.use * rR * (hX - hR) / 3600);
  R.vent = Math.max(0, p.vent / 3600 * rX * (hX - hR) * p.ventH);
  R.light = p.lightW * Af / 1000 * p.lightH; R.people = p.nP * Math.max(0, 270 - 6 * p.Tr) / 1000 * p.hP; R.fork = p.nF * p.kWF * p.hF; R.other = p.otherKW * p.otherH;
  const S0 = ['trans', 'prod', 'pack', 'resp', 'air', 'vent', 'light', 'people', 'fork', 'other'].reduce((s, k) => s + R[k], 0);
  const k = (1 + p.defF) * (1 + p.sf / 100), den = p.tRun - k * (p.fanF / 100) * p.fanH;
  if (!(den > 0.5)) return null;
  R.S0 = S0; R.Q0 = k * S0 / den; R.fan = p.fanF / 100 * R.Q0 * p.fanH; R.Etot = k * (S0 + R.fan);
  R.defr = (S0 + R.fan) * p.defF; R.safe = (S0 + R.fan) * (1 + p.defF) * p.sf / 100;
  const Ep = R.prod + R.pack + ri; R.peak = Ep * k / p.tpull + (R.Etot - Ep * k) / p.tRun; R.Qsel = Math.max(R.Q0, R.peak);
  return R;
}
function randomParams(E) {
  const p = Object.assign({}, BASE), pr = pick(E.PROD);
  p.Tr = pick([-25, -18, -5, 0, 2, 4, 8, 12]); p.RHr = pick([70, 85, 92]); p.Tf = pick([-1.5, -3, -8]); p.cpA = 2.5 + rnd() * 1.7; p.cpF = 1.4 + rnd() * 1; p.Lat = 100 + rnd() * 250;
  p.resp = pick([0, 3, 10, 25]); p.respT = pick([0, 5, 10]); p.stockT = 1 + rnd() * 80; p.pct = 2 + rnd() * 20; p.Tin = p.Tr - 3 + rnd() * 30; p.tpull = 6 + rnd() * 24; p.packPct = rnd() * 15;
  p.Lg = 2 + rnd() * 20; p.Wd = 2 + rnd() * 15; p.Hh = 2.2 + rnd() * 5; p.lam = pick([0.022, 0.023, 0.026, 0.038, 0.04]); p.dWall = pick([60, 100, 150, 200]); p.dRoof = pick([80, 120, 200]); p.dFloor = pick([0.001 + 50, 100, 150]);
  p.floorAdj = pick(['air', 'gnd']); p.Text = pick([20, 30, 38, 45]); p.RHext = pick([30, 50, 80]); p.Twall = p.Text + rnd() * 5; p.solW = rnd() * 6; p.solR = rnd() * 12; p.Tgnd = pick([10, 15, 20]);
  p.infMode = pick(['table', 'door']); p.use = pick([0.6, 1, 2]); p.dA = 1 + rnd() * 8; p.dH = 2 + rnd() * 3; p.dP = rnd() * 60; p.dTp = 5 + rnd() * 20; p.dTo = rnd() * 20; p.dHrs = 6 + rnd() * 14; p.dE = pick([0, 0.8, 0.85, 0.9]);
  p.vent = rnd() * 300; p.ventH = rnd() * 12; p.lightW = rnd() * 15; p.lightH = rnd() * 14; p.nP = Math.floor(rnd() * 5); p.hP = rnd() * 8; p.nF = Math.floor(rnd() * 3); p.kWF = rnd() * 5; p.hF = rnd() * 6; p.otherKW = rnd(); p.otherH = rnd() * 8;
  p.tRun = pick([16, 18, 20, 22]); p.fanF = pick([0, 5, 10]); p.fanH = pick([16, 20, 24]); p.defF = pick([0, 0.06, 0.1]); p.sf = pick([0, 10, 15]);
  return p;
}

function suite(E, log) {
  let ok = 0, ko = 0;
  function chk(c, m) { if (c) ok++; else { ko++; if (log) console.log('  ECHEC  ' + m); } }
  try {
    if (log) console.log('1) Psychrometrie (CoolProp 8.0.0, Murphy-Koop)');
    for (const t in D.ref.psatW) chk(rel(E.psat(+t), D.ref.psatW[t], 0.004), 'psat eau ' + t + ' C : ' + E.psat(+t) + ' vs ' + D.ref.psatW[t]);
    for (const t in D.ref.psatI) chk(rel(E.psat(+t), D.ref.psatI[t], 0.006), 'psat glace ' + t + ' C : ' + E.psat(+t) + ' vs ' + D.ref.psatI[t]);
    for (const s of D.ref.states) { const [t, rh, W, h, rho] = s; chk(rel(E.enth(t, rh), h, 0.0) || near(E.enth(t, rh), h, 0.35 + 0.005 * Math.abs(h)), 'enthalpie ' + t + '/' + rh); chk(rel(E.rho(t, rh), rho, 0.003), 'masse volumique ' + t + '/' + rh + ' : ' + E.rho(t, rh) + ' vs ' + rho); }
    for (let t = -30; t <= 40; t += 5) chk(near(E.dewPt(t, 100), t, 0.02), 'point de rosee/givre a 100 % = T a ' + t + ' C : ' + E.dewPt(t, 100));
    for (let t = -20; t <= 35; t += 5) { chk(E.dewPt(t, 50) < E.dewPt(t, 80) && E.dewPt(t, 80) < E.dewPt(t, 100) + 1e-9, 'point de rosee croissant avec HR a ' + t); chk(E.dewPt(t, 60) <= t + 1e-9, 'point de rosee <= T a ' + t); }
    chk(near(E.dewPt(20, 50), 9.3, 0.15), 'point de rosee 20 C / 50 % ~ 9,3 C : ' + E.dewPt(20, 50));

    if (log) console.log('2) Tableaux de renouvellement d\'air (ASHRAE via Krack)');
    for (const [v, n] of D.Pm) chk(near(E.achInterp(v, false), n, 1e-9), 'au-dessus de 0 C, ' + v + ' m3 : ' + E.achInterp(v, false) + ' vs ' + n);
    for (const [v, n] of D.Nm) chk(near(E.achInterp(v, true), n, 1e-9), 'au-dessous de 0 C, ' + v + ' m3 : ' + E.achInterp(v, true) + ' vs ' + n);
    chk(near(E.achInterp(3000 * 0.0283168, false), 9.5, 0.02), '3 000 pi3 : 9,5 vol/24 h (Copeland) : ' + E.achInterp(3000 * 0.0283168, false));
    for (let v = 6; v < 5000; v *= 1.37) { chk(E.achInterp(v * 1.1, false) <= E.achInterp(v, false) + 1e-9, 'decroissant (>0 C) ' + v.toFixed(0)); chk(E.achInterp(v * 1.1, true) <= E.achInterp(v, true) + 1e-9, 'decroissant (<0 C) ' + v.toFixed(0)); chk(E.achInterp(v, true) < E.achInterp(v, false) + 1e-9 || v < 7.1 || v > 2800, 'moins d\'air en negatif ' + v.toFixed(0)); }
    chk(E.achInterp(0.5, false) === E.achInterp(1, false) && E.achInterp(1e6, false) === D.Pm[D.Pm.length - 1][1], 'plafonnement aux extremites');
    chk(near(E.achInterp(70, false), D.Pm[8][1] + (Math.log(70) - Math.log(D.Pm[8][0])) / (Math.log(D.Pm[9][0]) - Math.log(D.Pm[8][0])) * (D.Pm[9][1] - D.Pm[8][1]), 1e-9), 'interpolation logarithmique entre deux lignes');

    if (log) console.log('3) Chaleur du produit (Siebel)');
    const T = E.PBY.apple; chk(near(T.cpA, 4.19 * 0.85 + 0.837 * 0.15, 1e-9) && near(T.cpF, 2.09 * 0.85 + 0.837 * 0.15, 1e-9) && near(T.L, 335 * 0.85, 1e-9), 'Siebel pomme : ' + T.cpA + ' ; ' + T.cpF + ' ; ' + T.L);
    chk(near(E.prodHeat(1000, 20, 2, 3.6, 1.9, 280, -1), 1000 * 3.6 * 18, 1e-6), 'refroidissement au-dessus du point de congelation');
    chk(near(E.prodHeat(1000, 20, -10, 3.6, 1.9, 280, -1), 1000 * 3.6 * 21 + 1000 * 280 + 1000 * 1.9 * 9, 1e-6), 'passage par la congelation');
    chk(near(E.prodHeat(1000, -5, -20, 3.6, 1.9, 280, -1), 1000 * 1.9 * 15, 1e-6), 'produit deja congele');
    chk(E.prodHeat(1000, 2, 5, 3.6, 1.9, 280, -1) === 0 && E.prodHeat(0, 20, 0, 3.6, 1.9, 280, -1) === 0, 'rien si Tin <= Tsortie ou masse nulle');
    chk(near(E.respW({ resp: 10, respT: 5 }, 5), 29.6, 1e-9) && near(E.respW({ resp: 10, respT: 5 }, 15), 29.6 * 2.5, 1e-9), 'respiration : 2,96 W/t par mg CO2/kg.h, Q10 = 2,5');
    // chaleur d'occupation 270 - 6.T confrontee au tableau 6 de Krack (BTU/24 h -> W) ; la ligne 10 F (28 800) du tableau semble irreguliere : tolerance 3 %
    for (const [F, btu] of [[50, 17300], [40, 20200], [30, 22800], [20, 25200], [10, 28800], [0, 31200], [-10, 33600]]) { const C = (F - 32) / 1.8, w = btu / 24 * 0.29307; chk(near(270 - 6 * C, w, 0.03 * w + 1), 'occupation a ' + F + ' F : ' + (270 - 6 * C).toFixed(1) + ' W vs ' + w.toFixed(1)); }

    if (log) console.log('4) Cas calcule a la main');
    let p = Object.assign({}, BASE, { stockT: 0, pct: 0, resp: 0, packPct: 0, vent: 0, ventH: 0, lightW: 0, nP: 0, nF: 0, otherKW: 0, infMode: 'table', use: 0, defF: 0, sf: 0, fanF: 0, solW: 0, solR: 0, Twall: 35, Text: 35, floorAdj: 'air' });
    let r = E.compute(p);
    const U = 1 / (1 / 8 + 1 / 23 + 0.1 / 0.023), Aw = 2 * 3 * 11, Af = 30, dT = 33; // 6 x 5 x 3
    chk(near(r.trans.w, U * Aw * dT / 1000, 1e-9) && near(r.trans.r, U * Af * dT / 1000, 1e-9) && near(r.trans.f, U * Af * dT / 1000, 1e-9), 'transmission par paroi : U = ' + U.toFixed(4));
    chk(near(r.Q0, r.trans.tot * 24 / 18, 1e-9), 'Q0 = transmission x 24 / temps de marche');
    p = Object.assign({}, p, { fanF: 5, fanH: 20, defF: 0.06, sf: 10 }); r = E.compute(p);
    const k = 1.06 * 1.1, Q0 = k * r.S0 / (18 - k * 0.05 * 20);
    chk(near(r.Q0, Q0, 1e-9) && near(r.Etot, r.Q0 * 18, 1e-6), 'Q0 avec ventilateurs, degivrage et securite');
    chk(near(r.Efan, 0.05 * r.Q0 * 20, 1e-9), 'chaleur des ventilateurs');
    chk(near(r.lines.reduce((s, x) => s + x.E, 0), r.Etot, 1e-6) && near(r.lines.reduce((s, x) => s + x.kW, 0), r.Q0, 1e-6), 'les lignes du bilan somment au total');
    chk(near(r.lines.reduce((s, x) => s + x.pct, 0), 100, 1e-6), 'pourcentages = 100');
    const rp = E.compute(Object.assign({}, p, { fanF: 50, fanH: 24, tRun: 6 })); chk(rp.err === 'den', 'ventilateurs trop importants : erreur controlee');

    if (log) console.log('5) Avertissements');
    r = E.compute(Object.assign({}, BASE, { Tr: -2, Tf: -1, Tst: 2 })); chk(r.warn.indexOf('freeze') >= 0, 'avertissement congelation');
    r = E.compute(Object.assign({}, BASE, { Tin: 0, Tr: 4 })); chk(r.warn.indexOf('tin') >= 0, 'avertissement Tin < Tr');
    r = E.compute(Object.assign({}, BASE, { Tr: 2, dWall: 20, Twall: 35, RHext: 80 })); chk(r.warn.indexOf('thin') >= 0, 'avertissement isolation faible');
    r = E.compute(Object.assign({}, BASE, { Lg: 20, Wd: 20, Hh: 6 })); chk(r.warn.indexOf('bigtable') >= 0, 'avertissement grand volume (methode tableau)');
    r = E.compute(Object.assign({}, BASE, { Tr: -20, dWall: 150, Twall: 35, RHext: 70 })); chk(r.cond && isFinite(r.cond.Td) && isFinite(r.cond.Ts), 'condensation : valeurs finies');

    if (log) console.log('6) 200 chambres aleatoires : moteur = 2e implementation');
    let bad = 0, worst = '', nn = 0;
    for (let i = 0; i < 200; i++) {
      const q = randomParams(E), x = E.compute(q), y = refCompute(E, q);
      if (!y) { if (x.err !== 'den') bad++; continue; }
      nn++;
      const okk = ['trans', 'prod', 'pack', 'resp', 'air', 'vent', 'light', 'people', 'fork', 'other'].every(kk => rel(x.E[kk], y[kk], 1e-9)) && rel(x.Q0, y.Q0, 1e-9) && rel(x.Etot, y.Etot, 1e-9) && rel(x.Qsel, y.Qsel, 1e-9) && rel(x.Efan, y.fan, 1e-9) && rel(x.Edef, y.defr, 1e-9) && rel(x.Esaf, y.safe, 1e-9) && rel(x.Etot, x.Q0 * q.tRun, 1e-9);
      if (!okk) { bad++; worst = JSON.stringify([x.Q0, y.Q0]); }
    }
    chk(bad === 0 && nn > 150, bad + ' ecart(s) sur ' + nn + ' chambres ' + worst);
    // bornes physiques
    let neg = 0; for (let i = 0; i < 100; i++) { const q = randomParams(E), x = E.compute(q); if (!x.err) { ['trans', 'prod', 'pack', 'resp', 'air', 'vent', 'light', 'people', 'fork', 'other'].forEach(kk => { if (kk !== 'trans' && x.E[kk] < -1e-9) neg++; }); if (!(x.Q0 > 0) && x.S0 > 0) neg++; } }
    chk(neg === 0, 'aucune charge negative hors transmission : ' + neg);
    const A = E.compute(Object.assign({}, BASE, { dWall: 100 })), B = E.compute(Object.assign({}, BASE, { dWall: 200 }));
    chk(B.trans.w < A.trans.w, 'plus d\'isolant, moins de transmission');
    const C1 = E.compute(Object.assign({}, BASE, { stockT: 10 })), C2 = E.compute(Object.assign({}, BASE, { stockT: 40 }));
    chk(C2.Q0 > C1.Q0, 'plus de produit, plus de puissance');
  } catch (e) { ko++; if (log) console.log('  ECHEC  exception : ' + e.message); }
  return { ok, ko };
}

seed = 4242; const res = suite(E0, true);

console.log('7) Mutations (chacune doit etre detectee)');
function nth(code, s, r, n) { let i = -1; for (let k = 0; k <= n; k++) { i = code.indexOf(s, i + 1); if (i < 0) return null; } return code.slice(0, i) + r + code.slice(i + s.length); }
const MUT = [
  ['coefficient exterieur he = 17', 'hi = 8, he = 23', 'hi = 8, he = 17'],
  ['rayonnement du toit oublie', 'p.Text + p.solR - Tr', 'p.Text - Tr'],
  ['transmission sur 18 h au lieu de 24 h', 'E.trans = r.trans.tot * 24', 'E.trans = r.trans.tot * 18'],
  ['chaleur sensible sous congelation avec cpA', 'm * cpF * (Tf - Tout)', 'm * cpA * (Tf - Tout)'],
  ['chaleur latente oubliee', 'q += m * L +', 'q += 0 * L +'],
  ['respiration Q10 = 2', '2.96 * Math.pow(2.5', '2.96 * Math.pow(2.0'],
  ['coefficient de porte 0,2', '0.221 * p.dA', '0.2 * p.dA'],
  ['facteur Df inverse', 'Math.abs(p.Text - Tr) < 11) ? 1.1 : 0.8', 'Math.abs(p.Text - Tr) < 11) ? 0.8 : 1.1'],
  ['chaleur d\'occupation 270 - 3.T', '270 - 6 * Tr', '270 - 3 * Tr'],
  ['coefficient de securite/degivrage oublie', 'var k = (1 + p.defF) * (1 + p.sf / 100);', 'var k = (1 + p.defF);'],
  ['ventilateurs oublies dans Q0', 'p.tRun - k * p.fanF / 100 * p.fanH', 'p.tRun'],
  ['usage oublie (methode tableau)', 'V * N * p.use * rR', 'V * N * rR'],
  ['interpolation lineaire au lieu de logarithmique', 'Math.log(V) - Math.log(a[0])', 'V - a[0]'],
  ['point de givre ignore', 'if (Td < 0)', 'if (Td < -999)'],
  ['efficacite du rideau inversee', '(1 - p.dE)', '(p.dE)'],
  ['vitesse d\'air neuf non divisee par 3600', 'p.vent / 3600 * rX', 'p.vent / 360 * rX']
];
let mok = 0, mko = 0;
for (const [nm, s, r] of MUT) {
  const code = nth(CODE, s, r, 0);
  if (code === null) { console.log('  ECHEC  mutation « ' + nm + ' » : ancre introuvable'); mko++; continue; }
  const E2 = load(code);
  if (!E2) { console.log('  ECHEC  mutation « ' + nm + ' » : code illisible'); mko++; continue; }
  seed = 4242; const q = suite(E2, false);
  if (q.ko > 0) mok++; else { console.log('  ECHEC  mutation « ' + nm + ' » NON detectee'); mko++; }
}
const ok = res.ok + mok, ko = res.ko + mko;
console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
