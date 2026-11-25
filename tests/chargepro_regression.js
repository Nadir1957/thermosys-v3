// Thermosys - Tests de non-regression du module « CHARGE PRO » (moteur CLE : charge frigorifique heure par heure) et de « CHARGE » (estimation rapide)
// Usage (depuis le dossier files) :  node tests\chargepro_regression.js     (ou : node tests\chargepro_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Conduction dans les parois : le moteur (volumes finis, BDF2) est compare a la solution ANALYTIQUE periodique de l'EN ISO 13786 (matrices de
//    transfert complexes, periode 24 h) recalculee dans ce test : amplitude et dephasage. Regime permanent : U = 1 / (1/hO + somme d/k + 1/hc).
//  - Geometrie solaire : declinaison de Cooper, altitude a midi = 90 - |latitude - declinaison|, angle d'incidence recalcule par la formule
//    cos(theta) = sin(h).cos(beta) + cos(h).sin(beta).cos(az - gamma), lever du soleil, symetries.
//  - Ciel clair (Hottel) : formule recalculee ; ordre de grandeur de l'eclairement horizontal de midi verifie.
//  - Psychrometrie : CoolProp 8.0.0 (eau, glace par Murphy-Koop 2005) ; humidite absolue par temperature humide : CoolProp (HAPropsSI).
//  - Bilan : conservation de l'energie sur 24 h dans une enceinte adiabatique (gains internes, solaire, infiltration, air neuf, latent), somme des
//    postes = total, regime permanent des parois exterieures, convergence periodique.
//  - NON verifie ici : aucune comparaison avec un logiciel de reference (ex. methode RTS/CLTD de l'ASHRAE, EnergyPlus) ni avec un exemple publie ;
//    les bibliotheques (materiaux, vitrages, activites, villes) ; l'interface ; les 40 constructions pre-enregistrees.
//  - CHARGE (estimation rapide, +-30 %) : formules recalculees a la main ; ce n'est pas une methode normalisee.
//  - 18 mutations volontaires du moteur doivent toutes etre detectees.
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
const REF = {"psatW": {"0": 611.2104516797365, "10": 1228.1989307541448, "20": 2339.3181834056754, "30": 4246.970836903843, "40": 7384.938073826001, "50": 12351.945837607573}, "psatI": {"-30": 38.012172777456485, "-20": 103.2524632801715, "-10": 259.89216379154277, "-5": 401.75594839757645}, "wRH": [[10, 50, 0.003807867236455046], [20, 50, 0.007293697701974733], [25, 60, 0.01194902651563823], [35, 40, 0.014200453713552788], [35, 80, 0.029064518106635098], [5, 90, 0.004877934124824854]], "wWB": [[35, 24, 0.014310393261943326], [30, 20, 0.010574876607725494], [20, 10, 0.0035723971606612917], [10, 5, 0.0033902616164376083], [40, 26, 0.015500952261698073]]};

let html; try { html = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
function grab(id) { const o = '<script id="' + id + '">', a = html.indexOf(o); if (a < 0) return null; const b = html.indexOf('</script>', a); return html.slice(a + o.length, b); }
const CODE = grab('chargepro-module'), CODE50 = grab('charge-50-module');
if (!CODE || !CODE50) { console.error('Module CHARGE PRO ou CHARGE introuvable'); process.exit(2); }
function loadC(code) { const win = {}; try { new Function('window', code)(win); } catch (e) { return null; } return win.CLE || null; }
const C0 = loadC(CODE);
if (!C0 || typeof C0.runDay !== 'function') { console.error('Moteur CLE illisible ou non expose'); process.exit(2); }

const PI = Math.PI, RAD = PI / 180;
function near(a, b, tol) { return Math.abs(a - b) <= tol; }
function rel(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(b)); }
let seed = 777; function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
const ONES = () => Array(24).fill(1);

// ---- solution analytique periodique (EN ISO 13786) : flux entrant dans le local pour une temperature sol-air exterieure cos(w.t), air interieur a 0
function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
function cadd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function cdiv(a, b) { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
function cexp(a) { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; }
function csinh(a) { const p = cexp(a), m = cexp([-a[0], -a[1]]); return [(p[0] - m[0]) / 2, (p[1] - m[1]) / 2]; }
function ccosh(a) { const p = cexp(a), m = cexp([-a[0], -a[1]]); return [(p[0] + m[0]) / 2, (p[1] + m[1]) / 2]; }
function csqrt(a) { const r = Math.hypot(a[0], a[1]), t = Math.atan2(a[1], a[0]); return [Math.sqrt(r) * Math.cos(t / 2), Math.sqrt(r) * Math.sin(t / 2)]; }
function analytic(layers, hO, hc, period) {
  const w = 2 * PI / period;
  let M = [[[1, 0], [0, 0]], [[0, 0], [1, 0]]]; // [theta;q] = M [theta_ext; q_ext]
  const mul2 = (A, B) => [[cadd(cmul(A[0][0], B[0][0]), cmul(A[0][1], B[1][0])), cadd(cmul(A[0][0], B[0][1]), cmul(A[0][1], B[1][1]))], [cadd(cmul(A[1][0], B[0][0]), cmul(A[1][1], B[1][0])), cadd(cmul(A[1][0], B[0][1]), cmul(A[1][1], B[1][1]))]];
  const film = R => [[[1, 0], [-R, 0]], [[0, 0], [1, 0]]];
  const lay = (d, k, rho, cp) => { const kk = csqrt([0, w * rho * cp / k]), x = [kk[0] * d, kk[1] * d], ch = ccosh(x), sh = csinh(x);
    return [[ch, cdiv([-sh[0], -sh[1]], [k * kk[0], k * kk[1]])], [[-k * cmul(kk, sh)[0], -k * cmul(kk, sh)[1]], ch]]; };
  M = mul2(film(1 / hO), M);
  for (const L of layers) { if (L.R) M = mul2(film(L.R), M); else M = mul2(lay(L.d, L.k, L.rho, L.cp), M); }
  M = mul2(film(1 / hc), M);
  // theta_int = M11*1 + M12*q_ext = 0 -> q_ext ; q_int = M21 + M22 q_ext
  const qe = cdiv([-M[0][0][0], -M[0][0][1]], M[0][1]), qi = cadd(M[1][0], cmul(M[1][1], qe));
  return qi; // W/m2 par K d'amplitude
}
function engineWall(C, layers, A, cosForced) {
  const wall = C.buildWall({ layers: layers, area: A, adj: 'ext', type: 'wall' }, { hO: 17, hr: 4.5, Rg: 1 });
  const nsub = 4, ns = 96, dt = 3600 / nsub, w = 2 * PI / 86400, tsa = new Float64Array(ns);
  for (let s = 0; s < ns; s++) tsa[s] = cosForced ? Math.cos(w * (s + 1) * dt) : 1;
  const r = C.simulate([wall], { tsa: [tsa], qU: new Float64Array(ns), qF: new Float64Array(ns) }, nsub, { maxDays: 120 });
  return { q: r.qc, days: r.days, resid: r.resid, dt: dt, w: w, ns: ns };
}

function mkRoom(extra) {
  const ly = [{ d: 0.02, k: 1.0, rho: 1800, cp: 1000 }, { d: 0.2, k: 0.87, rho: 1200, cp: 900 }, { d: 0.015, k: 0.51, rho: 1200, cp: 1000 }];
  return Object.assign({ Ti: 24, RHi: 50, Tmax: 35, dtr: 10, Wout: 0.015, month: 7, day: 21, lat: 36.7, alt: 25, climate: 'midlat-summer', clear: 1, Vroom: 90,
    surfaces: [{ layers: ly, area: 30, adj: 'ext', type: 'wall', az: 180, tilt: 90, abs: 0.6 }, { layers: ly, area: 20, adj: 'adiab', type: 'int' }],
    windows: [{ area: 4, az: 180, tilt: 90, shgc: 0.7 }], people: { n: 4, sens: 75, lat: 55, sched: ONES() }, lights: { W: 200, sched: ONES() }, equip: { W: 300, sched: ONES() },
    inf: { ach: 0.5, sched: ONES() }, vent: { flow: 100, sched: ONES() } }, extra || {});
}

function suite(C, log) {
  let ok = 0, ko = 0;
  function chk(c, m) { if (c) ok++; else { ko++; if (log) console.log('  ECHEC  ' + m); } }
  try {
    if (log) console.log('1) Psychrometrie');
    for (const t in REF.psatW) chk(rel(C.psat(+t), REF.psatW[t], 0.0015), 'psat eau ' + t + ' : ' + C.psat(+t) + ' vs ' + REF.psatW[t]);
    for (const t in REF.psatI) chk(rel(C.psat(+t), REF.psatI[t], 0.004), 'psat glace ' + t + ' : ' + C.psat(+t) + ' vs ' + REF.psatI[t]);
    for (const [t, rh, W] of REF.wRH) chk(rel(C.wFromRH(t, rh, 101325), W, 0.008), 'W(T,HR) ' + t + '/' + rh + ' : ' + C.wFromRH(t, rh, 101325) + ' vs ' + W);
    for (const [t, b, W] of REF.wWB) chk(rel(C.wFromWB(t, b, 101325), W, 0.012), 'W(T,Th) ' + t + '/' + b + ' : ' + C.wFromWB(t, b, 101325) + ' vs ' + W);
    chk(near(C.pAlt(0), 101325, 1e-6) && near(C.pAlt(1000), 89875, 12) && near(C.pAlt(2000), 79495, 25), 'pression en altitude (atmosphere standard) : ' + C.pAlt(1000));

    if (log) console.log('2) Geometrie solaire');
    chk(near(C.decl(172), 23.44, 0.1) && near(C.decl(355), -23.4, 0.15) && Math.abs(C.decl(80)) < 0.6, 'declinaison : ' + C.decl(172) + ' ; ' + C.decl(355) + ' ; ' + C.decl(80));
    chk(near(C.g0n(3), 1367 * 1.033, 1) && near(C.g0n(185), 1367 * 0.967, 3), 'constante solaire corrigee');
    for (const lat of [36.7, 48.9, 25, -33.9, 0]) for (const n of [21, 80, 172, 266, 355]) {
      const s = C.sun(lat, n, 12), d = C.decl(n);
      chk(near(s.alt / RAD, 90 - Math.abs(lat - d), 0.01), 'hauteur a midi lat ' + lat + ' n ' + n + ' : ' + (s.alt / RAD) + ' vs ' + (90 - Math.abs(lat - d)));
      const a = C.sun(lat, n, 9.5), b = C.sun(lat, n, 14.5);
      chk(near(a.alt, b.alt, 1e-9) && near(a.az, -b.az, 1e-9), 'symetrie matin/apres-midi lat ' + lat + ' n ' + n);
      const wsr = Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat * RAD) * Math.tan(d * RAD)))) / RAD / 15;
      if (wsr > 0.2 && wsr < 11.8) { const tr = 12 - wsr; chk(C.sun(lat, n, tr - 0.05).cz < 0.002 && C.sun(lat, n, tr + 0.05).cz > -0.002 && C.sun(lat, n, tr + 0.3).cz > 0, 'lever du soleil lat ' + lat + ' n ' + n); }
    }
    let bad = 0;
    for (let k = 0; k < 400; k++) {
      const lat = -60 + rnd() * 120, n = 1 + Math.floor(rnd() * 365), t = 5 + rnd() * 14, beta = rnd() * PI / 2, gam = (rnd() * 2 - 1) * PI, s = C.sun(lat, n, t);
      if (s.cz < 0.05) continue;
      const exp = Math.sin(s.alt) * Math.cos(beta) + Math.cos(s.alt) * Math.sin(beta) * Math.cos(s.az - gam);
      if (Math.abs(C.cosInc(s, beta, gam) - exp) > 1e-9) bad++;
    }
    chk(bad === 0, 'angle d\'incidence : ' + bad + ' ecart(s) sur 400 cas');

    if (log) console.log('3) Ciel clair (Hottel)');
    const CL = { 'tropical': [0.95, 0.98, 1.02], 'midlat-summer': [0.97, 0.99, 1.02], 'subarctic-summer': [0.99, 0.99, 1.01], 'midlat-winter': [1.03, 1.01, 1.00] };
    bad = 0; for (let k = 0; k < 60; k++) {
      const cz = 0.1 + rnd() * 0.9, alt = rnd() * 2500, cl = Object.keys(CL)[Math.floor(rnd() * 4)], n = 1 + Math.floor(rnd() * 365), A = alt / 1000, r = CL[cl];
      const a0 = r[0] * (0.4237 - 0.00821 * (6 - A) * (6 - A)), a1 = r[1] * (0.5055 + 0.00595 * (6.5 - A) * (6.5 - A)), kk = r[2] * (0.2711 + 0.01858 * (2.5 - A) * (2.5 - A));
      const tb = a0 + a1 * Math.exp(-kk / cz), td = 0.2710 - 0.2939 * tb, G0 = 1367 * (1 + 0.033 * Math.cos(360 * n / 365 * RAD));
      const x = C.clearSky({ cz: cz }, n, alt, cl, 1);
      if (!rel(x.Gbn, G0 * tb, 1e-9) || !rel(x.Gdh, G0 * td * cz, 1e-9)) bad++;
    }
    chk(bad === 0, 'ciel clair de Hottel recalcule : ' + bad + ' ecart(s)');
    chk(C.clearSky({ cz: 0.01 }, 100, 0, 'tropical', 1).Gbn === 0, 'soleil sous l\'horizon : aucun eclairement');
    const noon = C.clearSky(C.sun(36.7, 172, 12), 172, 0, 'midlat-summer', 1), Ghn = noon.Gbn * C.sun(36.7, 172, 12).cz + noon.Gdh;
    chk(Ghn > 900 && Ghn < 1080, 'eclairement horizontal de midi en ete a 37 N : ' + Ghn.toFixed(0) + ' W/m2');
    chk(C.clearSky(C.sun(36.7, 172, 12), 172, 0, 'midlat-summer', 0.5).Gbn === 0.5 * noon.Gbn, 'facteur de ciel kc proportionnel');
    chk(C.angFactor(0) === 1 && C.angFactor(90) === 0 && near(C.angFactor(60), 1 - Math.pow(60 / 90, 5), 1e-12), 'facteur d\'incidence du vitrage');

    if (log) console.log('4) Conduction dans les parois : analytique EN ISO 13786');
    const WALLS = {
      lourd: [{ d: 0.02, k: 1.0, rho: 1800, cp: 1000 }, { d: 0.2, k: 1.65, rho: 2200, cp: 1000 }, { d: 0.015, k: 0.51, rho: 1200, cp: 1000 }],
      isole: [{ d: 0.02, k: 1.0, rho: 1800, cp: 1000 }, { d: 0.2, k: 1.65, rho: 2200, cp: 1000 }, { d: 0.05, k: 0.038, rho: 20, cp: 1450 }, { d: 0.013, k: 0.25, rho: 900, cp: 1000 }],
      leger: [{ d: 0.02, k: 0.2, rho: 700, cp: 1200 }, { d: 0.10, k: 0.040, rho: 40, cp: 1030 }, { d: 0.013, k: 0.25, rho: 900, cp: 1000 }]
    };
    for (const nm of Object.keys(WALLS)) {
      const ly = WALLS[nm], A = 12, Rt = 1 / 17 + 1 / 3 + ly.reduce((s, x) => s + x.d / x.k, 0), U = 1 / Rt;
      const st = engineWall(C, ly, A, false), mean = st.q.reduce((s, x) => s + x, 0) / st.ns;
      chk(rel(st.q[st.ns - 1], A * U, 0.002) && rel(mean, A * U, 0.002), 'regime permanent ' + nm + ' : ' + st.q[st.ns - 1] + ' vs ' + A * U + ' (U = ' + U.toFixed(3) + ')');
      const e = engineWall(C, ly, A, true); let Ac = 0, Bc = 0;
      for (let s = 0; s < e.ns; s++) { const t = (s + 1) * e.dt; Ac += e.q[s] * Math.cos(e.w * t); Bc += e.q[s] * Math.sin(e.w * t); }
      Ac *= 2 / e.ns; Bc *= 2 / e.ns;
      const Q = analytic(ly, 17, 3, 86400), amp = A * Math.hypot(Q[0], Q[1]), ph = Math.atan2(Q[1], Q[0]), ampE = Math.hypot(Ac, Bc), phE = Math.atan2(-Bc, Ac);
      chk(rel(ampE, amp, 0.03) || near(ampE, amp, 0.002 * A), 'amplitude periodique ' + nm + ' : moteur ' + ampE.toFixed(4) + ' vs analytique ' + amp.toFixed(4));
      let dph = phE - ph; while (dph > PI) dph -= 2 * PI; while (dph < -PI) dph += 2 * PI;
      chk(Math.abs(dph) * 24 / (2 * PI) < 0.25 || amp < 1e-3, 'dephasage ' + nm + ' : ecart ' + (dph * 24 / (2 * PI)).toFixed(3) + ' h');
      chk(e.days < 120 && e.resid < 0.01 * Math.max(1, ampE), 'convergence periodique ' + nm + ' : ' + e.days + ' jours');
    }
    // plus de masse : amplitude plus faible, retard plus grand (sens physique)
    { const f = (ly) => { const e = engineWall(C, ly, 10, true); let a = 0, b = 0; for (let s = 0; s < e.ns; s++) { const t = (s + 1) * e.dt; a += e.q[s] * Math.cos(e.w * t); b += e.q[s] * Math.sin(e.w * t); } return [Math.hypot(a, b) * 2 / e.ns, Math.atan2(-b, a)]; };
      const fl = f(WALLS.leger), fh = f(WALLS.isole); chk(fh[0] < fl[0] || near(fh[0], fl[0], 1e-9) === false, 'paroi isolee lourde : amplitude du flux plus faible que paroi legere (' + fh[0].toFixed(3) + ' < ' + fl[0].toFixed(3) + ')'); }

    if (log) console.log('5) Journee de calcul : conservation de l\'energie (enceinte adiabatique)');
    const adia = ly => [{ layers: ly, area: 50, adj: 'adiab', type: 'int' }, { layers: ly, area: 40, adj: 'adiab', type: 'floor' }];
    const lyb = [{ d: 0.1, k: 1.65, rho: 2200, cp: 1000 }];
    const base = mkRoom({ surfaces: adia(lyb) });
    let r = C.runDay(base);
    const sumH = k => r.hours.reduce((s, x) => s + x.comp[k], 0);
    chk(r.meta.days < 80 && r.meta.resid < 0.5, 'convergence : ' + r.meta.days + ' jours, residu ' + r.meta.resid);
    chk(rel(sumH('people'), 4 * 75 * 24, 0.002) && rel(sumH('lights'), 200 * 24, 0.002) && rel(sumH('equip'), 300 * 24, 0.002), 'gains internes : energie journaliere conservee (' + sumH('people').toFixed(0) + ' ; ' + sumH('lights').toFixed(0) + ' ; ' + sumH('equip').toFixed(0) + ')');
    // gains permanents : charge = gain a chaque heure
    chk(r.hours.every(x => near(x.comp.people, 300, 1.0) && near(x.comp.lights, 200, 1.0) && near(x.comp.equip, 300, 1.0)), 'gains permanents restitues integralement');
    // programme de bureau : energie conservee, retard de la part rayonnee
    const sch = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
    const r2 = C.runDay(Object.assign({}, base, { people: { n: 0, sens: 75, lat: 55 }, lights: { W: 1000, sched: sch }, equip: null }));
    const s2 = r2.hours.reduce((s, x) => s + x.comp.lights, 0);
    chk(rel(s2, 9000, 0.003), 'eclairage 9 h : energie conservee ' + s2.toFixed(0));
    chk(r2.hours[8].comp.lights < 1000 * 1.0 && r2.hours[8].comp.lights > 1000 * 0.33 - 1, 'premiere heure : part convective (33 %) + debut du rayonne : ' + r2.hours[8].comp.lights.toFixed(0));
    chk(r2.hours[17].comp.lights > 0 && r2.hours[17].comp.lights < 1000 * 0.9, 'apres l\'arret : restitution differee ' + r2.hours[17].comp.lights.toFixed(0));
    // air : infiltration et air neuf, formules recalculees
    const P = C.pAlt(25), rhoA = P / (287.042 * (24 + 273.15)), Wi = C.wFromRH(24, 50, P);
    let eInf = 0, eVen = 0;
    for (let h = 0; h < 24; h++) {
      let ti = 0, tv = 0, li = 0;
      for (let q = 0; q < 4; q++) { const t = h + (q + 1) / 4, To = C.toutAt(35, 10, t); ti += rhoA * 0.5 * 90 / 3600 * 1006 * (To - 24) / 4; tv += rhoA * 100 / 3600 * 1006 * (To - 24) / 4; li += rhoA * 0.5 * 90 / 3600 * 2501000 * Math.max(0, 0.015 - Wi) / 4; }
      if (!near(r.hours[h].comp.inf, ti, 1e-6 * Math.max(1, Math.abs(ti))) || !near(r.hours[h].comp.vent, tv, 1e-6 * Math.max(1, Math.abs(tv))) || !near(r.hours[h].lat.inf, li, 1e-6 * Math.max(1, li))) eInf++;
      eVen += 0;
    }
    chk(eInf === 0, 'infiltration et air neuf (sensible et latent) : ' + eInf + ' heure(s) differente(s)');
    chk(r.hours.every(x => near(x.lat.people, 4 * 55, 1e-6) && near(x.lat.equip, 0, 1e-9)), 'latent des personnes = n x 55 W');
    chk(r.hours.every(x => near(x.sens, Object.keys(x.comp).reduce((s, k) => s + x.comp[k], 0), 1e-6) && near(x.total, x.sens + x.latent, 1e-6) && near(x.zone, x.zoneSens + x.zoneLat, 1e-6) && near(x.zoneSens, x.sens - x.comp.vent, 1e-6)), 'somme des postes = total ; zone = total - air neuf');
    chk(r.peak.total === Math.max.apply(null, r.hours.map(x => x.total)) && r.peakZone.zone === Math.max.apply(null, r.hours.map(x => x.zone)), 'pointe = maximum horaire');
    // solaire : energie journaliere conservee, gains recalcules
    const w0 = { area: 6, az: 225, tilt: 90, shgc: 0.6, iac: 0.8, fr: 0.1 }, rs = C.runDay(Object.assign({}, base, { people: null, lights: null, equip: null, inf: null, vent: null, windows: [w0] }));
    let gSol = 0, gCond = 0; const n = C.dayOfYear(7, 21);
    for (let s = 0; s < 96; s++) {
      const t = (s + 1) / 4, sp = C.sun(36.7, n, t), cs = C.clearSky(sp, n, 25, 'midlat-summer', 1), beta = 90 * RAD, gam = (225 - 180) * RAD;
      let ci = Math.max(0, C.cosInc(sp, beta, gam)); if (sp.cz <= 0.017) ci = 0;
      const th = Math.acos(Math.min(1, ci)) / RAD, Gh = cs.Gbn * Math.max(sp.cz, 0) + cs.Gdh, Id = cs.Gdh * (1 + Math.cos(beta)) / 2, Ir = 0.2 * Gh * (1 - Math.cos(beta)) / 2;
      const Ag = 6 * 0.9; gSol += (Ag * 0.6 * C.angFactor(th) * cs.Gbn * ci * 0.8 + Ag * 0.6 * 0.9 * (Id + Ir) * 0.8) / 4;
      gCond += 6 * 2.8 * (C.toutAt(35, 10, t) - 24) / 4;
    }
    const sSol = rs.hours.reduce((s, x) => s + x.comp.winsol, 0), sWc = rs.hours.reduce((s, x) => s + x.comp.wincond, 0);
    chk(rel(sSol, gSol, 0.004), 'solaire a travers le vitrage : energie journaliere ' + sSol.toFixed(0) + ' vs ' + gSol.toFixed(0));
    chk(rel(sWc, gCond, 0.004), 'conduction du vitrage : energie journaliere ' + sWc.toFixed(0) + ' vs ' + gCond.toFixed(0));
    const sunMax = rs.hours.reduce((b, x) => x.comp.winsol > b.comp.winsol ? x : b, rs.hours[0]);
    chk(rs.hours.every(x => x.comp.winsol > 0) && sunMax.comp.winsol > 1.5 * Math.min.apply(null, rs.hours.map(x => x.comp.winsol)), 'solaire : restitution differee positive, pointe nettement au-dessus du minimum');
    chk(sunMax.h >= 15 && sunMax.h <= 19, 'vitrage sud-ouest : pointe solaire l\'apres-midi (heure ' + sunMax.h + ')');

    // profil de temperature exterieure (ASHRAE) : minimum a 5 h, maximum a 15 h
    chk(near(C.toutAt(35, 10, 15), 35, 1e-9) && near(C.toutAt(35, 10, 5), 25, 1e-9) && C.toutAt(35, 10, 9) > C.toutAt(35, 10, 7) && C.toutAt(35, 10, 20) < C.toutAt(35, 10, 14), 'profil journalier : minimum a 5 h, maximum a 15 h');
    // temperature sol-air moyenne (mur ouest et toiture) : charge moyenne = U.A.(moyenne(T_sa) - Ti)
    for (const cfg of [{ type: 'wall', tilt: 90, az: 270, hc: 3.0 }, { type: 'roof', tilt: 0, az: 180, hc: 1.5 }]) {
      const lyr = [{ d: 0.02, k: 1.0, rho: 1800, cp: 1000 }, { d: 0.2, k: 0.87, rho: 1200, cp: 900 }, { d: 0.015, k: 0.51, rho: 1200, cp: 1000 }];
      const rr = C.runDay({ Ti: 24, RHi: 50, Tmax: 35, dtr: 10, Wout: 0.015, month: 7, lat: 36.7, alt: 25, climate: 'midlat-summer', clear: 1, Vroom: 90, surfaces: [{ layers: lyr, area: 20, adj: 'ext', type: cfg.type, az: cfg.az, tilt: cfg.tilt, abs: 0.6 }] });
      const nn = C.dayOfYear(7, 21), beta = cfg.tilt * RAD, gam = (cfg.az - 180) * RAD; let ts = 0;
      for (let q = 0; q < 96; q++) {
        const t = (q + 1) / 4, sp = C.sun(36.7, nn, t), cs = C.clearSky(sp, nn, 25, 'midlat-summer', 1);
        let ci = Math.max(0, C.cosInc(sp, beta, gam)); if (sp.cz <= 0.017) ci = 0;
        const Gh = cs.Gbn * Math.max(sp.cz, 0) + cs.Gdh, I = cs.Gbn * ci + cs.Gdh * (1 + Math.cos(beta)) / 2 + 0.2 * Gh * (1 - Math.cos(beta)) / 2;
        ts += (C.toutAt(35, 10, t) + 0.6 * I / 17 - (cfg.tilt < 45 ? 3.9 : 0) - 24) / 96;
      }
      const Ueff = 1 / (1 / 17 + 1 / cfg.hc + lyr.reduce((s2, x) => s2 + x.d / x.k, 0)), mean = rr.hours.reduce((s2, x) => s2 + x.comp[cfg.type === 'roof' ? 'roof' : 'walls'], 0) / 24;
      chk(rel(mean, 20 * Ueff * ts, 0.006), 'charge moyenne de la paroi (' + cfg.type + ') = U.A.(T_sa moyenne - Ti) : ' + mean.toFixed(2) + ' vs ' + (20 * Ueff * ts).toFixed(2));
    }
    // amplitude de la conduction du vitrage (part rayonnee 33 %) et premiere heure d'un eclairage (part rayonnee 67 %) : valeurs gelees du moteur (enceinte massive, 30 cm de beton)
    { const lyh = [{ d: 0.3, k: 1.65, rho: 2200, cp: 1000 }], bs = { Ti: 24, RHi: 50, Tmax: 35, dtr: 10, Wout: 0.015, month: 7, lat: 36.7, alt: 25, climate: 'midlat-summer', clear: 0, Vroom: 90, surfaces: [{ layers: lyh, area: 50, adj: 'adiab', type: 'int' }, { layers: lyh, area: 40, adj: 'adiab', type: 'floor' }] };
      const rw = C.runDay(Object.assign({}, bs, { windows: [{ area: 6, az: 180, tilt: 90, shgc: 0.6, U: 2.8 }] })), wc = rw.hours.map(x => x.comp.wincond), qc = [];
      for (let h = 0; h < 24; h++) { let s3 = 0; for (let k = 0; k < 4; k++) s3 += 6 * 2.8 * (C.toutAt(35, 10, h + (k + 1) / 4) - 24) / 4; qc.push(s3); }
      const amp = a => Math.max.apply(null, a) - Math.min.apply(null, a), ratio = amp(wc) / amp(qc);
      chk(ratio > 0.66 && ratio < 0.76, 'conduction du vitrage : amplitude de la charge / amplitude du gain = ' + ratio.toFixed(3) + ' (attendu ~0,71 : 67 % immediat + part rayonnee amortie)');
      const sc = Array(24).fill(0); for (let i = 8; i < 17; i++) sc[i] = 1;
      const rl = C.runDay(Object.assign({}, bs, { windows: [{ area: 0.1, az: 180, tilt: 90, shgc: 0.1 }], lights: { W: 1000, sched: sc } }));
      chk(rl.hours[8].comp.lights > 450 && rl.hours[8].comp.lights < 650, 'premiere heure d\'un eclairage en enceinte massive : ' + rl.hours[8].comp.lights.toFixed(0) + ' W (33 % convectif immediat + rayonnement amorti)'); }

    if (log) console.log('6) Parois exterieures en regime permanent');
    const lyw = [{ d: 0.02, k: 1.0, rho: 1800, cp: 1000 }, { d: 0.2, k: 0.87, rho: 1200, cp: 900 }, { d: 0.015, k: 0.51, rho: 1200, cp: 1000 }];
    const stdy = C.runDay({ Ti: 24, RHi: 50, Tmax: 35, dtr: 0, Wout: 0.0093, month: 7, lat: 36.7, alt: 0, clear: 0, Vroom: 90, surfaces: [{ layers: lyw, area: 30, adj: 'ext', type: 'wall' }, { layers: lyw, area: 20, adj: 'ext', type: 'wall' }] });
    const Uw = 1 / (1 / 17 + 1 / 3 + lyw.reduce((s, x) => s + x.d / x.k, 0));
    chk(stdy.hours.every(x => rel(x.comp.walls, 50 * Uw * 11, 0.003)), 'murs exterieurs en regime permanent : ' + stdy.hours[10].comp.walls.toFixed(1) + ' vs ' + (50 * Uw * 11).toFixed(1));
    chk(stdy.hours.every(x => Math.abs(x.comp.winsol) < 1e-9), 'sans soleil : pas d\'apport solaire');
    const none = C.runDay({ Ti: 24, RHi: 50, Tmax: 24, dtr: 0, Wout: 0.0093, month: 7, lat: 36.7, alt: 0, clear: 0, Vroom: 90, surfaces: [{ layers: lyw, area: 30, adj: 'ext', type: 'wall' }] });
    chk(none.hours.every(x => Math.abs(x.total) < 1e-6 * 100 + 1e-3), 'sans ecart de temperature ni gain : charge nulle');
    let thr = false; try { C.runDay(Object.assign({}, base, { surfaces: [] })); } catch (e) { thr = true; } chk(thr, 'aucune paroi : erreur declaree');
    chk(Math.abs(C.runDay(mkRoom({ clear: 1, month: 7 })).peak.total) > Math.abs(C.runDay(mkRoom({ clear: 0.3, month: 7 })).peak.total) * 0.9, 'ciel moins clair : charge de pointe non superieure');
    const mo = C.scanMonths(mkRoom({ Twin: 12 }), {}); chk(mo.rows.length === 12 && mo.best.total === Math.max.apply(null, mo.rows.map(x => x.total)), 'balayage de 12 mois : maximum retenu');
    chk(C.monthlyTmax(38, 12, 36.7)[6] > C.monthlyTmax(38, 12, 36.7)[0] && near(C.monthlyTmax(38, 12, 36.7)[6], 38, 1.2), 'temperatures mensuelles : maximum en juillet (hemisphere nord)');
    chk(C.monthlyTmax(38, 12, -33.9)[0] > C.monthlyTmax(38, 12, -33.9)[6], 'hemisphere sud : maximum en janvier');
  } catch (e) { ko++; if (log) console.log('  ECHEC  exception : ' + e.message); }
  return { ok, ko };
}

seed = 777; const res = suite(C0, true);

// ---- 7) CHARGE rapide (charge-50-module) : formules recalculees
console.log('7) CHARGE (estimation rapide)');
let okq = 0, koq = 0; function chq(c, m) { if (c) okq++; else { koq++; console.log('  ECHEC  ' + m); } }
function runQuick(vals, code) {
  const els = {}; const ids = ['chgSurf', 'chgH', 'chgIso', 'chgSol', 'chgPers', 'chgEquip', 'chgText', 'chgTint', 'chgType'];
  ids.forEach(i => els[i] = { value: String(vals[i] !== undefined ? vals[i] : '') }); els.chgResult = { textContent: '' }; els.chgReco = { textContent: '' };
  els.chgEquip.parentNode = null;
  const document = { getElementById: id => els[id] || null, readyState: 'complete', addEventListener() {} };
  const window = { lang: 'fr' };
  new Function('window', 'document', 'setInterval', 'lang', code)(window, document, () => {}, 'fr');
  window.calcCharge(); return { out: els.chgResult.textContent, reco: els.chgReco.textContent };
}
function quickRef(v) {
  const S = v.chgSurf, H = v.chgH, U = v.chgIso, Te = v.chgText, Ti = v.chgTint, pers = v.chgPers, eq = v.chgEquip, sol = v.chgSol, type = v.chgType, SOL = { 0: 50, 30: 150, 60: 250, 90: 400 };
  const dT = Math.max(0, Te - Ti), vit = S * 0.15, ach = { res: 0.5, bur: 1.5, com: 2, ind: 2 }[type];
  const env = U * S * dT, solar = vit * SOL[sol], occ = pers * 75, ren = S * H * ach * 1.2 * 1006 * dT / 3600, tot = (env + solar + occ + eq + ren) / 1000, all = tot + pers * 55 / 1000;
  const rule = { res: 35, bur: 50, com: 70, ind: 60 }[type];
  return { all, tot, need: Math.max(Math.ceil(all * 1.2 / 1.5) * 1.5, S * rule / 1000), env, solar, ren };
}
for (const v of [{ chgSurf: 100, chgH: 2.7, chgIso: 0.9, chgSol: 30, chgPers: 10, chgEquip: 1500, chgText: 35, chgTint: 24, chgType: 'bur' }, { chgSurf: 40, chgH: 3, chgIso: 1.5, chgSol: 90, chgPers: 3, chgEquip: 400, chgText: 40, chgTint: 26, chgType: 'res' }, { chgSurf: 300, chgH: 5, chgIso: 0.6, chgSol: 0, chgPers: 50, chgEquip: 8000, chgText: 30, chgTint: 22, chgType: 'ind' }]) {
  const q = runQuick(v, CODE50), r = quickRef(v);
  const m = /TOTAL: ([\d.]+) kW/.exec(q.out), m2 = /TOTAL avec latent personnes : ([\d.]+) kW/.exec(q.out), m3 = /Puissance recommandée : ([\d.]+) kW/.exec(q.reco);
  chq(m && near(+m[1], r.tot, 0.006), 'CHARGE total sensible ' + (m && m[1]) + ' vs ' + r.tot.toFixed(2));
  chq(m2 && near(+m2[1], r.all, 0.006), 'CHARGE total avec latent ' + (m2 && m2[1]) + ' vs ' + r.all.toFixed(2));
  chq(m3 && near(+m3[1], r.need, 0.06), 'CHARGE puissance recommandee ' + (m3 && m3[1]) + ' vs ' + r.need.toFixed(1));
}
{ const q = runQuick({ chgSurf: 0, chgH: 2.7, chgIso: 0.9, chgSol: 30, chgPers: 1, chgEquip: 0, chgText: 35, chgTint: 24, chgType: 'bur' }, CODE50); chq(/⚠/.test(q.out) && !/TOTAL/.test(q.out), 'surface nulle : message d\'erreur');
  const q2 = runQuick({ chgSurf: 50, chgH: 25, chgIso: 0.9, chgSol: 30, chgPers: 1, chgEquip: 0, chgText: 35, chgTint: 24, chgType: 'bur' }, CODE50); chq(/⚠/.test(q2.out), 'hauteur > 20 m : message d\'erreur');
  const q3 = runQuick({ chgSurf: 50, chgH: 2.5, chgIso: 0.9, chgSol: 30, chgPers: 1, chgEquip: 0, chgText: 20, chgTint: 24, chgType: 'bur' }, CODE50); chq(/Parois\/enveloppe: 0 W/.test(q3.out), 'dehors plus froid que dedans : pas de charge d\'enveloppe'); }

console.log('8) Mutations (chacune doit etre detectee)');
function nth(code, s, r, n) { let i = -1; for (let k = 0; k <= n; k++) { i = code.indexOf(s, i + 1); if (i < 0) return null; } return code.slice(0, i) + r + code.slice(i + s.length); }
const MUT = [
  ['declinaison : 23,45 devient 23,0', 'return 23.45 * Math.sin', 'return 23.0 * Math.sin'],
  ['angle horaire : 15 devient 14', 'w = 15 * (t - 12) * R', 'w = 14 * (t - 12) * R'],
  ['Hottel : a0 modifie', '0.4237 - 0.00821', '0.4137 - 0.00821'],
  ['diffus : 0,2939 devient 0,25', '0.2710 - 0.2939 * tb', '0.2710 - 0.25 * tb'],
  ['facteur d\'incidence : exposant 4', 'return 1 - Math.pow(x, 5)', 'return 1 - Math.pow(x, 4)'],
  ['cp de l\'air 1006 devient 1000', 'var cpA = 1006', 'var cpA = 1000'],
  ['chaleur latente 2501 devient 2400', 'hfg = 2501000', 'hfg = 2400000'],
  ['conduction du vitrage : 0,33 devient 0,5', 'qradWinCond[s_] = 0.33 * qC; qconvWinCond[s_] = 0.67 * qC;', 'qradWinCond[s_] = 0.5 * qC; qconvWinCond[s_] = 0.5 * qC;'],
  ['gains lumineux : part rayonnee 0,67 devient 0,3', "key === 'lights' ? 0.67 : 0.3", "key === 'lights' ? 0.3 : 0.3"],
  ['rayonnement diffus du sol oublie', 'Ir = rhoG * Gh[s_] * (1 - Math.cos(beta)) / 2;\n          var a =', 'Ir = 0;\n          var a ='],
  ['rayonnement infrarouge du toit : 3,9 K retire', '- (tilt < 45 ? 3.9 : 0)', '- (tilt < 45 ? 0 : 0)'],
  ['coefficient d\'echange exterieur 17 devient 25', 'hO: c.hO || 17', 'hO: c.hO || 25'],
  ['coefficient convectif des murs 3 devient 5', "typ === 'floor' ? 3.5 : 3.0", "typ === 'floor' ? 3.5 : 5.0"],
  ['capacite thermique des cellules oubliee', 'C: rho * cp * d / n', 'C: 1e-9 * rho * cp * d / n'],
  ['profil de temperature : signe inverse', 'return Tmax - dtr * p / 100', 'return Tmax + dtr * p / 100'],
  ['humidite absolue (temperature humide) : 2501 devient 2400', '((2501 - 2.326 * Twb) * ws', '((2400 - 2.326 * Twb) * ws'],
  ['pression d\'altitude : exposant 5,25588 devient 5', '5.25588', '5.0'],
  ['masse volumique de l\'air : 287,042 devient 280', 'P / (287.042 * (Ti + 273.15))', 'P / (280 * (Ti + 273.15))']
];
let mok = 0, mko = 0;
for (const [nm, s, r] of MUT) {
  const code = nth(CODE, s, r, 0);
  if (code === null) { console.log('  ECHEC  mutation « ' + nm + ' » : ancre introuvable'); mko++; continue; }
  const C2 = loadC(code);
  if (!C2) { console.log('  ECHEC  mutation « ' + nm + ' » : code illisible'); mko++; continue; }
  seed = 777; const q = suite(C2, false);
  if (q.ko > 0) mok++; else { console.log('  ECHEC  mutation « ' + nm + ' » NON detectee'); mko++; }
}
const ok = res.ok + okq + mok, ko = res.ko + koq + mko;
console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
