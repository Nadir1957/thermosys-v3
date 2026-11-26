// Thermosys - Tests de non-regression du module VANNES (Kvs, calculateur dP/debit, lecture du Kvs, avertissements du catalogue)
// Usage (depuis le dossier files) :  node tests\vannes_regression.js     (ou : node tests\vannes_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Kv = Q x racine(masse volumique / (1000 x dP en bar)) : formule classique (definition du Kv, norme EN 60534 / IEC 60534) ; serie R5 des Kvs : 0,16 ; 0,25 ; 0,4 ; 0,63 ; 1 ; 1,6 ; 2,5 ; 4 ; 6,3 ; 10 ... (serie de Renard R5).
//  - Perte de charge : Swamee-Jain (approximation de Colebrook, ecart < 2 %) verifiee ici contre une resolution iterative de Colebrook. Le diametre interieur est pris egal au DN (approximation annoncee).
//    Les proprietes de l'eau viennent de la table du programme (reseauWater : LSBU, Anton Paar, EngineersEdge).
//  - Autorite a = dP vanne / (dP vanne + dP circuit), seuils 0,3 (minimum) et 0,5 (recommande) : regle usuelle de regulation hydronique, pas une exigence normative.
//  - CATALOGUE (55 vannes, 25 servomoteurs) : NON verifie constructeur par constructeur. Seule verification faite : Belimo LM24A-SR est un servomoteur de CLAPETS D'AIR
//    (5 Nm, 150 s, 2-10 V, fiche Belimo) et non de vanne d'eau ; les series NM, AM, GM sont signalees de la meme facon (famille Belimo clapets, a confirmer sur fiche).
//    Les fiches affichent donc un avertissement « indicatif, a verifier sur la fiche constructeur ». Les anciennes tables de paliers « constructeur » (IMI, TA, Danfoss, Belimo) etaient inventees et ont ete retirees.
//  - Melanges glycoles : refuses dans l'outil rapide (chaleur massique non sourcee).
//  - Les mutations (derniere section) introduisent volontairement une erreur dans le code : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const open = '<script id="vannes38-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
if (a < 0 || b < 0) { console.error('Module VANNES introuvable dans ' + htmlFile); process.exit(2); }
const CODE = h.slice(a + open.length, b);
const wm = /var RESEAU_WT = (\[\[[\s\S]*?\]\]);/.exec(h);
if (!wm) { console.error('Table RESEAU_WT introuvable'); process.exit(2); }
const RESEAU_WT = JSON.parse(wm[1]);
function reseauWater(T) { const t = Math.max(0, Math.min(100, +T)), i = Math.min(9, Math.floor(t / 10)), A = RESEAU_WT[i], B = RESEAU_WT[i + 1], x = (t - A[0]) / 10;
  return { rho: A[1] + (B[1] - A[1]) * x, mu: Math.exp(Math.log(A[2]) + (Math.log(B[2]) - Math.log(A[2])) * x) / 1000 }; }

function makeRun(code) {
  const els = {};
  const el = id => (els[id] = els[id] || { id, value: '', textContent: '', innerHTML: '', style: {}, placeholder: '', parentNode: { style: {} }, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, nextElementSibling: null, querySelectorAll() { return []; } });
  const doc = { getElementById: id => els[id] || null, _el: el };
  const win = { lang: 'fr', reseauWater };
  const hdr = { textContent: 'PALIERS DE RÉFÉRENCE CONSTRUCTEUR', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, nextElementSibling: { innerHTML: '<table>inventee</table>' } };
  const hdr2 = { textContent: 'TABLE PALIERS CALCULÉE', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, nextElementSibling: { innerHTML: 'x' } };
  el('prc-palier').querySelectorAll = () => [hdr2, hdr]; el('prc-palier').__hdr = hdr; el('prc-palier').__hdr2 = hdr2;
  ['pal-brand', 'pr-valve-brand', 'kvs-manual-row', 'pr-kvs'].forEach(k => el(k)); els['pr-kvs'].value = '2.5'; els['kvs-manual-row'].style.display = 'none';
  const ACT = [
    { br: 'Belimo', m: 'LM24A-SR', cat: 'Rotatif 90°', force: '5 Nm', detail: { 'Référence': 'x', 'Compatibilité vannes': 'x', 'Applications': 'x', 'Options': 'x', 'Câble': 'x', 'Consommation': 'x', 'Poids': 'x', 'Couple limite': 'x', 'Type': 'Rotatif', 'Temps rotation': '90° en 150s (réglable 35s option)', 'Couple nominal': '5 Nm' } },
    { br: 'Belimo', m: 'AM24A-SR', cat: 'Rotatif 90°', force: '20 Nm', detail: { 'Applications': 'x' } },
    { br: 'Belimo', m: 'GM24A-SR', cat: 'Rotatif 90°', force: '40 Nm', detail: {} },
    { br: 'Belimo', m: 'NM24A-SR', cat: 'Rotatif 90°', force: '10 Nm', detail: {} },
    { br: 'Belimo', m: 'SM230A', cat: 'Rotatif 90°', force: '20 Nm', detail: { 'Applications': 'garde' } },
    { br: 'Siemens', m: 'SQS65', cat: 'Rotatif 90°', force: '20 Nm', detail: { 'Applications': 'garde' } }];
  const VAL = [{ br: 'Danfoss', m: 'VB2 DN15', kvs: 0.63 }];
  win.renderActuators = function () { const g = el('actGrid'); g.innerHTML = '100 N Nm | 5 Nm Nm | 20 Nm'; };
  win.showActDetail = function (i) { el('actuatorBody').innerHTML = '<chip>100 N Nm</chip>' + ACT[i].m; };
  win.showValveDetail = function (i) { el('valveBody').innerHTML = '<b>' + VAL[i].m + '</b>'; };
  win.renderValves = function () {};
  const f = new Function('document', 'window', 'reseauWater', 'ACTUATORS', 'VALVES', 'setInterval', 'setTimeout', code + '\nreturn window;');
  const w = f(doc, win, reseauWater, ACT, VAL, () => 0, () => 0);
  return { w, el, ACT, VAL };
}
function run(code, inputs, lang) {
  const r = makeRun(code); r.w.lang = lang || 'fr';
  for (const k in inputs) r.el(k).value = String(inputs[k]);
  ['kvsResult', 'preregl-result', 'preregl-table-cont', 'palier-result', 'palier-table-cont', 'kvs-manual-row', 'pr-kvs'].forEach(k => r.el(k));
  return r;
}
const num = s => parseFloat(String(s).replace(/[\s  ]/g, '').replace(',', '.'));
const near = (x, y, tol) => Math.abs(x - y) <= tol;
const R5 = [0.16, 0.25, 0.4, 0.63, 1, 1.6, 2.5, 4, 6.3, 10, 16, 25, 40, 63, 100, 160, 250, 400, 630, 1000];
const refKv = (q, dp, rho) => q * Math.sqrt(rho / 1000 / (dp / 100));       // dp en kPa -> bar
const refNext = kv => R5.find(k => k >= kv * 0.999999) || null;
const refDp = (q, kv, rho) => (rho / 1000) * Math.pow(q / kv, 2) * 100;      // kPa
function colebrook(Re, rel) { let x = 0.02; for (let i = 0; i < 100; i++) { x = Math.pow(-2 * Math.log10(rel / 3.7 + 2.51 / (Re * Math.sqrt(x))), -2); } return x; }
function refPre(kw, dt, L, Tm) {
  const w = reseauWater(Tm), md = kw / (4.186 * dt), q = md * 3600 / w.rho;
  const rows = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150].map(dn => { const d = dn / 1000, v = q / 3600 / (Math.PI * d * d / 4), Re = v * d * w.rho / w.mu; const lam = Re < 2300 ? 64 / Re : colebrook(Re, 0.000046 / d); const Rr = lam / d * w.rho * v * v / 2; return { dn, v, Re, R: Rr, dp: Rr * L / 1000 }; });
  let best = null; rows.forEach(r => { if (r.v >= 0.5 && r.v <= 2 && (!best || Math.abs(r.v - 1) < Math.abs(best.v - 1))) best = r; });
  if (!best) rows.forEach(r => { if (!best || Math.abs(r.v - 1) < Math.abs(best.v - 1)) best = r; });
  const kv = refKv(q, best.dp, w.rho);
  return { q, md, best, kv, nx: refNext(kv), rho: w.rho };
}
function pre(code, inp, lang) {
  const base = { 'pr-kw': 20, 'pr-dt': 10, 'pr-l': 80, 'pr-fluid': '1000', 'pr-regime': '45_35', 'pr-kvs': '' };
  const r = run(code, Object.assign(base, inp || {}), lang); r.w.calcPrereglDP();
  const t = r.el('preregl-result').textContent; return { t, L: t.split('\n'), r };
}
function pal(code, inp, lang) {
  const r = run(code, Object.assign({ 'pal-q': 1.5, 'pal-dp': 20, 'pal-kvs': 2.5 }, inp || {}), lang); r.w.genPaliers();
  return { t: r.el('palier-result').textContent, tab: r.el('palier-table-cont').innerHTML, r };
}
function kvs(code, inp, lang) {
  const r = run(code, Object.assign({ kvsQ: 2.5, kvsDp: 20, kvsRho: 1000 }, inp || {}), lang); r.w.calcKvs();
  return r.el('kvsResult').textContent;
}
const MEAN = { '80_60': 70, '60_40': 50, '45_35': 40, '7_12': 9.5, '14_18': 16 };

function suite(code, verbose) {
  let ok = 0, ko = 0;
  function T(name, cond, detail) { if (cond) ok++; else { ko++; if (verbose) console.log('  ECHEC : ' + name + (detail ? ' -> ' + detail : '')); } }

  // ---- Kvs
  { const t = kvs(code, {}); const k = refKv(2.5, 20, 1000);
    T('Kvs : Kv = 5,590', t.indexOf('5,590') >= 0, t.split('\n')[0]);
    T('Kvs : serie R5 -> 6,30', t.indexOf('6,30') >= 0);
    T('Kvs : dP pleine ouverture 15,7 kPa', t.indexOf('15,7 kPa') >= 0, t);
    T('Kvs : reference independante', near(k, 5.5902, 1e-3)); }
  for (const bad of [{ kvsQ: '' }, { kvsQ: 0 }, { kvsQ: -1 }, { kvsDp: '' }, { kvsDp: 0 }, { kvsRho: '' }, { kvsRho: 100 }, { kvsRho: 2000 }]) {
    const t = kvs(code, bad); T('Kvs : entree invalide refusee ' + JSON.stringify(bad), /Saisir un débit/.test(t) && t.indexOf('Kv au') < 0, t); }
  { const t = kvs(code, { kvsRho: 500 }); T('Kvs : rho 500 accepte', t.indexOf('Kv au') >= 0);
    const t2 = kvs(code, { kvsRho: 1500 }); T('Kvs : rho 1500 accepte', t2.indexOf('Kv au') >= 0);
    const t3 = kvs(code, { kvsQ: 1000, kvsDp: 1 }); T('Kvs : Kv hors serie signale', /supérieur à la série/.test(t3), t3.split('\n')[0]);
    const t4 = kvs(code, { kvsQ: 1, kvsDp: 100, kvsRho: 1000 }); T('Kvs : Kv 1,0 -> Kvs 1 (egalite)', /\(série R5\) : 1,00 m³\/h/.test(t4), t4);
    const t5 = kvs(code, { kvsQ: 1.0001, kvsDp: 100 }); T('Kvs : Kv 1,0001 -> 1,6', /\(série R5\) : 1,60/.test(t5), t5.split('\n')[1]);
    const e = kvs(code, { kvsQ: 2.5 }, 'en'); T('Kvs : texte anglais et point decimal', /Kv at design flow: 5\.590/.test(e), e.split('\n')[0]); }
  for (const [q, dp, rho] of [[0.3, 10, 1000], [12, 35, 992.2], [80, 15, 983.2], [2.5, 20, 1040], [0.05, 60, 1000]]) {
    const t = kvs(code, { kvsQ: q, kvsDp: dp, kvsRho: rho }), k = refKv(q, dp, rho), nx = refNext(k);
    T('Kvs : Kv reference ' + [q, dp, rho], near(num(/Kv au débit de calcul : ([\d,]+)/.exec(t)[1]), k, 0.0006 + k * 1e-4), t.split('\n')[0]);
    if (nx) { const m = /\(série R5\) : ([\d,]+) m³\/h\nΔP de la vanne pleine ouverture à ce débit : ([\d,]+) kPa/.exec(t);
      T('Kvs : Kvs suivant et dP ' + [q, dp, rho], m && near(num(m[1]), nx, 0.006) && near(num(m[2]), refDp(q, nx, rho), 0.06), t); } }

  // ---- calculateur dP / debit
  { const t = pre(code, {}); const ref = refPre(20, 10, 80, 40);
    T('Pre : debit 1,734 m3/h', t.t.indexOf('1,734 m³/h') >= 0, t.L[1]);
    T('Pre : masse 0,478 kg/s = 477,8 g/s (et non kg/min)', /0,478 kg\/s = 477,8 g\/s/.test(t.t) && t.t.indexOf('kg/min') < 0, t.L[1]);
    T('Pre : DN25', /DN25/.test(t.L[2]), t.L[2]);
    const R = num(/R = (\d+) Pa\/m/.exec(t.L[2])[1]); T('Pre : R vs Colebrook (2 %)', near(R, ref.best.R, ref.best.R * 0.02), R + ' vs ' + ref.best.R);
    const dp = num(/\) : ([\d,]+) kPa/.exec(t.L[3])[1]); T('Pre : dP circuit = R x L (sans coefficient 1,4)', near(dp, ref.best.dp, ref.best.dp * 0.02 + 0.06), dp + ' vs ' + ref.best.dp);
    const kv = num(/Kv requis : ([\d,]+)/.exec(t.t)[1]); T('Pre : Kv requis', near(kv, ref.kv, ref.kv * 0.02), kv + ' vs ' + ref.kv);
    T('Pre : Kvs suivant 4,00', /\(R5\) : 4,00 m³\/h/.test(t.t), t.t);
    const au = num(/supérieur \(R5\) : [\d,]+ m³\/h → ΔP [\d,]+ kPa, autorité ([\d,]+)/.exec(t.t)[1]); const dv = refDp(ref.q, 4, ref.rho); T('Pre : autorite avec Kvs normalise', near(au, dv / (dv + ref.best.dp), 0.02), au);
    T('Pre : alerte autorite < 0,3 absente a 0,31', t.t.indexOf('⚠️ < 0,3') < 0, t.t);
    T('Pre : hypotheses annoncees', /rugosité acier 0,046 mm/.test(t.t) && /cp 4,186/.test(t.t));
    T('Pre : tableau des DN rempli', (t.r.el('preregl-table-cont').innerHTML.match(/<tr/g) || []).length === 12); }
  { const C = [[0.63, 5], [0.5, 5]];
    for (const [kw, dt] of C) { const tt = pre(code, { 'pr-kw': kw, 'pr-dt': dt, 'pr-regime': '7_12' }), ref = refPre(kw, dt, 80, 9.5); const R = num(/R = (\d+) Pa\/m/.exec(tt.L[2])[1]);
      T('Pre : laminaire (Re ' + Math.round(ref.best.Re) + ') R = 64/Re', ref.best.Re < 2300 && /DN15/.test(tt.L[2]) && near(R, ref.best.R, ref.best.R * 0.02 + 0.6) && R > 15, R + ' vs ' + ref.best.R); } }
  for (const kw of [0.8, 0.9, 1.9]) { const ref = refPre(kw, 5, 80, 9.5), tt = pre(code, { 'pr-kw': kw, 'pr-dt': 5, 'pr-regime': '7_12' }); const R = num(/R = (\d+) Pa\/m/.exec(tt.L[2])[1]);
    T('Pre : apres le seuil 2300 (Re ' + Math.round(ref.best.Re) + ') : Colebrook', ref.best.Re > 2300 && near(R, ref.best.R, ref.best.R * 0.05 + 1), R + ' vs ' + ref.best.R); }
  for (const [kw, warn] of [[2.9, true], [20, false], [1800, true], [1000, false], [0.05, true]]) { const tt = pre(code, { 'pr-kw': kw }), ref = refPre(kw, 10, 80, 40);
    T('Pre : plage de vitesse 0,5-2 m/s kW=' + kw + ' (v ' + ref.best.v.toFixed(2) + ')', /hors de la plage usuelle/.test(tt.L[2]) === warn && (ref.best.v < 0.5 || ref.best.v > 2) === warn, tt.L[2]); }
  for (const L of [30, 45, 60, 80, 88, 90, 120, 200]) { const tt = pre(code, { 'pr-l': L }), ref = refPre(20, 10, L, 40); const dv = refDp(ref.q, ref.nx, ref.rho), a = dv / (dv + ref.best.dp);
    if (Math.abs(a - 0.3) > 0.005) T('Pre : alerte autorite < 0,3 pour L=' + L + ' (a=' + a.toFixed(2) + ')', /autorité [\d,]+ ⚠️ < 0,3/.test(tt.L.find(x => /supérieur/.test(x))) === (a < 0.3), tt.L.find(x => /supérieur/.test(x))); }
  { const t2 = kvs(code, { kvsQ: 2.6, kvsDp: 100, kvsRho: 1000 }); T('Kvs : Kv 2,6 -> Kvs 4 (pas 2,5)', /\(série R5\) : 4,00/.test(t2), t2.split('\n')[1]); }
  for (const reg of Object.keys(MEAN)) { const t = pre(code, { 'pr-regime': reg }), ref = refPre(20, 10, 80, MEAN[reg]);
    T('Pre : temperature moyenne ' + reg, near(num(/moyenne de l’eau ([\d,]+) °C/.exec(t.t)[1]), MEAN[reg], 0.05), t.L[0]);
    T('Pre : debit ' + reg, near(num(/Débit : ([\d,]+) m³/.exec(t.t)[1]), ref.q, 0.0006), t.L[1]); }
  { let n = 0, good = 0; let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    for (let i = 0; i < 60; i++) { const kw = Math.round((0.5 + rnd() * 600) * 10) / 10, dt = [3, 4, 5, 6, 8, 10, 15, 20][Math.floor(rnd() * 8)], L = Math.round(20 + rnd() * 500), reg = Object.keys(MEAN)[Math.floor(rnd() * 5)];
      const t = pre(code, { 'pr-kw': kw, 'pr-dt': dt, 'pr-l': L, 'pr-regime': reg }), ref = refPre(kw, dt, L, MEAN[reg]); n++;
      const m = /DN(\d+) \| vitesse ([\d,]+) m\/s \| R = (\d+) Pa\/m/.exec(t.t); const dpm = /\) : ([\d,]+) kPa/.exec(t.L[3]);
      if (m && +m[1] === ref.best.dn && near(num(m[2]), ref.best.v, 0.006) && near(num(m[3]), ref.best.R, ref.best.R * 0.02 + 1) && dpm && near(num(dpm[1]), ref.best.dp, ref.best.dp * 0.02 + 0.06)) good++; else if (verbose) console.log('   cas ' + [kw, dt, L, reg] + ' : ' + t.L[2] + ' | ref DN' + ref.best.dn + ' v=' + ref.best.v.toFixed(2)); }
    T('Pre : 60 cas aleatoires (DN, vitesse, R, dP) vs reference independante', good === n, good + '/' + n); }
  { const t = pre(code, { 'pr-kw': 0.05 }), ref = refPre(0.05, 10, 80, 40);
    T('Pre : regime laminaire (Re < 2300) : DN15 retenu', /DN15/.test(t.L[2]) && ref.best.Re < 2300, t.L[2]);
    const R = num(/R = (\d+) Pa\/m/.exec(t.L[2])[1]); T('Pre : laminaire R = 64/Re', near(R, ref.best.R, 1), R + ' vs ' + ref.best.R); }
  { const t = pre(code, { 'pr-kvs': 2.5 }), ref = refPre(20, 10, 80, 40);
    const m = /Votre vanne Kvs 2,50 → Kv requis = (\d+) % du Kvs, ΔP ([\d,]+) kPa, autorité ([\d,]+)( ⚠️ < 0,3)?( ⚠️ Kvs insuffisant)?/.exec(t.t);
    T('Pre : Kvs saisi trop petit signale', m && m[5] && !m[4], t.t);
    if (m) { const dv = refDp(ref.q, 2.5, ref.rho); T('Pre : dP vanne Kvs saisi', near(num(m[2]), dv, 0.2), m[2] + ' vs ' + dv); T('Pre : autorite Kvs saisi', near(num(m[3]), dv / (dv + ref.best.dp), 0.02)); T('Pre : % du Kvs requis', near(+m[1], 100 * ref.kv / 2.5, 2)); } }
  { const t = pre(code, { 'pr-kvs': 4 }); T('Pre : Kvs saisi suffisant sans alerte Kvs', t.t.indexOf('insuffisant') < 0 && /Votre vanne Kvs 4,00/.test(t.t), t.t); }
  for (const bad of [{ 'pr-kw': 0 }, { 'pr-kw': '' }, { 'pr-kw': -5 }, { 'pr-dt': 0 }, { 'pr-dt': '' }, { 'pr-l': 0 }, { 'pr-l': '' }]) {
    const t = pre(code, bad); T('Pre : entree invalide refusee ' + JSON.stringify(bad), /Saisir une puissance/.test(t.t) && t.t.indexOf('Débit') < 0, t.t); }
  for (const g of ['1040', '1060']) { const t = pre(code, { 'pr-fluid': g }); T('Pre : glycol ' + g + ' refuse', /limité à l’eau/.test(t.t) && t.t.indexOf('Débit') < 0, t.t); }
  { const t = pre(code, {}, 'en'); T('Pre : anglais', /Flow: 1\.734 m³\/h/.test(t.t) && /Selected pipe: DN25/.test(t.t), t.t); }

  // ---- lecture du Kvs
  { const t = pal(code, {}); const kv = refKv(1.5, 20, 1000), dpf = refDp(1.5, 2.5, 1000);
    T('Pal : Kv requis 3,354', t.t.indexOf('3,354') >= 0, t.t);
    T('Pal : 134 % du Kvs', /134 %/.test(t.t), t.t);
    T('Pal : Kvs insuffisant signale', /Kvs insuffisant/.test(t.t) && t.t.indexOf('36,0 kPa') >= 0 && near(dpf, 36, 0.01), t.t);
    T('Pal : 10 lignes de table', (t.tab.match(/<tr/g) || []).length === 11);
    T('Pal : aucune table de marque', !/IMI|Danfoss|Belimo|Tour/.test(t.t + t.tab));
    T('Pal : pas de Kv > Kvs (ligne 100 %)', /<td>100 %<\/td><td>2,50<\/td>/.test(t.tab)); }
  { const t = pal(code, { 'pal-q': 1.5, 'pal-dp': 20, 'pal-kvs': 10 }); const kv = refKv(1.5, 20, 1000);
    T('Pal : surdimensionnement < 20 %', /Vanne surdimensionnée/.test(t.t) && Math.round(100 * kv / 10) === 34 ? false : /34 %/.test(t.t), t.t);
  }
  { const t = pal(code, { 'pal-q': 1, 'pal-dp': 20, 'pal-kvs': 10 }); const kv = refKv(1, 20, 1000);   // 2,236 -> 22 %
    T('Pal : 22 % -> pas d alerte', /22 %/.test(t.t) && t.t.indexOf('surdimensionnée') < 0 && kv / 10 > 0.2, t.t);
    const t2 = pal(code, { 'pal-q': 0.6, 'pal-dp': 20, 'pal-kvs': 10 }); const k2 = refKv(0.6, 20, 1000);  // 1,34 -> 13 %
    T('Pal : 13 % -> surdimensionnee', /13 %/.test(t2.t) && /surdimensionnée/.test(t2.t) && k2 / 10 < 0.2, t2.t);
    T('Pal : ligne cible a 10 ou 20 %', /background:rgba\(0,229,255,\.1\)"><td>10 %/.test(t2.tab) || /background:rgba\(0,229,255,\.1\)"><td>20 %/.test(t2.tab), t2.tab.slice(0, 400));
    const t3 = pal(code, { 'pal-q': 1, 'pal-dp': 20, 'pal-kvs': 10 }); T('Pal : ligne cible 20 %', /rgba\(0,229,255,\.1\)"><td>20 %/.test(t3.tab) && !/rgba\(0,229,255,\.1\)"><td>40 %/.test(t3.tab)); }
  for (const bad of [{ 'pal-q': 0 }, { 'pal-q': '' }, { 'pal-dp': 0 }, { 'pal-dp': '' }, { 'pal-kvs': 0 }, { 'pal-kvs': '' }]) { const t = pal(code, bad); T('Pal : entree invalide refusee ' + JSON.stringify(bad), /Saisir un débit/.test(t.t) && t.tab === '', t.t); }
  { const t = pal(code, { 'pal-q': 1, 'pal-dp': 20, 'pal-kvs': 10 }, 'en'); T('Pal : anglais', /Required Kv: 2\.236/.test(t.t), t.t); }
  { const t = pal(code, {}); T('Pal : mention de lecture sur l abaque', /abaque du constructeur/.test(t.t)); }

  // ---- interface
  { const r = run(code, {}); const p = r.el('prc-palier');
    T('UI : titre des paliers constructeur remplace', p.__hdr.textContent === 'PALIERS CONSTRUCTEUR : NON FOURNIS' && p.__hdr.attrs['data-fr'] === 'PALIERS CONSTRUCTEUR : NON FOURNIS' && /MANUFACTURER SETTINGS/.test(p.__hdr.attrs['data-en']), p.__hdr.textContent);
    T('UI : table inventee supprimee', p.__hdr.nextElementSibling.innerHTML.indexOf('inventee') < 0 && /Aucune table de constructeur/.test(p.__hdr.nextElementSibling.innerHTML));
    T('UI : autre titre intact', p.__hdr2.textContent === 'TABLE PALIERS CALCULÉE' && p.__hdr2.nextElementSibling.innerHTML === 'x');
    T('UI : choix de marque masque (paliers)', r.el('pal-brand').parentNode.style.display === 'none');
    T('UI : choix de marque masque (calculateur)', r.el('pr-valve-brand').parentNode.style.display === 'none');
    T('UI : champ Kvs toujours visible et vide', r.el('kvs-manual-row').style.display === 'flex' && r.el('pr-kvs').value === '' && r.el('pr-kvs').placeholder === 'optionnel'); }

  // ---- catalogue
  { const r = run(code, {}); const A = r.ACT;
    T('Cat : LM24A-SR classe clapet d air', /Clapet d’air/.test(A[0].cat));
    for (const i of [1, 2, 3]) T('Cat : ' + A[i].m + ' classe clapet d air', /Clapet d’air/.test(A[i].cat));
    T('Cat : SM230A inchange', A[4].cat === 'Rotatif 90°' && A[4].detail['Applications'] === 'garde');
    T('Cat : Siemens inchange', A[5].cat === 'Rotatif 90°' && A[5].detail['Applications'] === 'garde');
    for (const k of ['Référence', 'Compatibilité vannes', 'Options', 'Câble', 'Consommation', 'Poids', 'Couple limite']) T('Cat : champ invente retire ' + k, !(k in A[0].detail));
    T('Cat : temps de rotation LM = 150 s', /150 s pour 90°/.test(A[0].detail['Temps rotation']));
    T('Cat : couple conserve', A[0].detail['Couple nominal'] === '5 Nm');
    r.w.renderActuators(); T('Cat : unites sans doublon', r.el('actGrid').innerHTML === '100 N | 5 Nm | 20 Nm', r.el('actGrid').innerHTML);
    r.w.showActDetail(0); const b0 = r.el('actuatorBody').innerHTML; T('Cat : avertissement clapet sur LM', /Servomoteur de clapets d’air/.test(b0) && /série Belimo LR/.test(b0) && b0.indexOf('100 N Nm') < 0, b0);
    r.w.showActDetail(5); const b5 = r.el('actuatorBody').innerHTML; T('Cat : avertissement indicatif sur Siemens', /Fiche indicative/.test(b5) && b5.indexOf('clapets d’air') < 0, b5);
    r.w.showActDetail(4); T('Cat : avertissement indicatif sur SM230A', /Fiche indicative/.test(r.el('actuatorBody').innerHTML));
    r.w.showValveDetail(0); const bv = r.el('valveBody').innerHTML; T('Cat : avertissement sur les vannes', /Fiche indicative/.test(bv) && /VB2 DN15/.test(bv), bv);
    const re = run(code, {}, 'en'); re.w.showValveDetail(0); T('Cat : avertissement en anglais', /Indicative sheet/.test(re.el('valveBody').innerHTML));
    const re2 = run(code, {}, 'en'); re2.w.showActDetail(1); T('Cat : avertissement clapet en anglais', /Air-damper actuator/.test(re2.el('actuatorBody').innerHTML)); }
  return { ok, ko };
}

// ---- mutations
const MUT = [
  ['chaleur massique', 'var CP_WATER = 4.186;', 'var CP_WATER = 4.0;'],
  ['formule Kv (10 -> 100)', 'return q * Math.sqrt(rho / (10 * dp));', 'return q * Math.sqrt(rho / (100 * dp));'],
  ['formule dP vanne', 'return rho * Math.pow(q / kv, 2) / 10;', 'return rho * Math.pow(q / kv, 2) / 100;'],
  ['autorite', 'return dpv / (dpv + dpc);', 'return dpv / dpc;'],
  ['laminaire', 'Re < 2300 ? 64 / Re', 'Re < 2300 ? 60 / Re'],
  ['seuil laminaire', 'Re < 2300 ? 64 / Re', 'Re < 1 ? 64 / Re'],
  ['rugosite', '0.000046 / (3.7 * d)', '0.00046 / (3.7 * d)'],
  ['coefficient 1,4 sur dP', 'dp: r.R * L / 1000', 'dp: r.R * L / 1000 * 1.4'],
  ['plage vitesse basse', 'best.v < 0.5 ||', 'best.v < 0.3 ||'],
  ['plage vitesse haute', '|| best.v > 2 ?', '|| best.v > 3 ?'],
  ['vitesse cible', 'Math.abs(r.v - 1) < Math.abs(best.v - 1)) { best = r; } });\n    var dpc', 'Math.abs(r.v - 1.5) < Math.abs(best.v - 1.5)) { best = r; } });\n    var dpc'],
  ['glycol non refuse', 'if (fl !== 1000)', 'if (false)'],
  ['kW = 0 accepte', 'if (!(kw > 0) || !(dt > 0) || !(L > 0))', 'if (!(kw >= 0) || !(dt > 0) || !(L > 0))'],
  ['L = 0 accepte', '|| !(L > 0))', '|| !(L >= 0))'],
  ['rho min Kvs', 'rho >= 500 && rho <= 1500', 'rho >= 0 && rho <= 1500'],
  ['rho max Kvs', 'rho >= 500 && rho <= 1500', 'rho >= 500 && rho <= 5000'],
  ['dp = 0 accepte Kvs', 'if (!(q > 0) || !(dp > 0) || !(rho', 'if (!(q > 0) || !(dp >= 0) || !(rho'],
  ['serie R5 (6,3 retire)', '4, 6.3, 10,', '4, 10,'],
  ['tolerance Kvs', 'KVS[i] >= kv * 0.999999', 'KVS[i] >= kv * 0.9'],
  ['temperature moyenne 45/35', "'45_35': 40", "'45_35': 45"],
  ['temperature moyenne 7/12', "'7_12': 9.5", "'7_12': 20"],
  ['g/s -> kg/min', "f(mdot * 1000, 1)", "f(mdot * 60, 1)"],
  ['seuil surdimensionnement', 'pct < 20', 'pct < 10'],
  ['Kvs insuffisant (Pal)', 'if (kv > kvs) {', 'if (kv > kvs * 2) {'],
  ['Kvs insuffisant (Pre)', "(kv > kvsU ? ' ⚠️ Kvs '", "(kv > kvsU * 2 ? ' ⚠️ Kvs '"],
  ['alerte autorite 0,3', "(auth(dv, dpc) < 0.3 ? ' ⚠️ < ' + f(0.3, 1) : '')); }\n    if (kvsU", "(auth(dv, dpc) < 0.1 ? ' ⚠️ < ' + f(0.3, 1) : '')); }\n    if (kvsU"],
  ['surbrillance table', 'Math.abs(x * 100 - pct) <= 5', 'Math.abs(x * 100 - pct) <= 25'],
  ['clapet AM24A', '(LM24A-SR|NM24A-SR|AM24A-SR|GM24A-SR)', '(LM24A-SR|NM24A-SR|GM24A-SR)'],
  ['clapet SM230A ajoute', '(LM24A-SR|NM24A-SR|AM24A-SR|GM24A-SR)', '(LM24A-SR|NM24A-SR|AM24A-SR|GM24A-SR|SM230A)'],
  ['champs inventes gardes', "'Référence', 'Compatibilité vannes',", "'Compatibilité vannes',"],
  ['unites doublees', '(\\bN|\\bNm) Nm\\b', '(\\bNx) Nm\\b'],
  ['avertissement vannes', "banner('valveBody', i, typeof VALVES", "void ('valveBody', i, typeof VALVES"],
  ['avertissement actionneurs', "banner('actuatorBody', i,", "void ('actuatorBody', i,"],
  ['texte clapet', 'var t = damper ? (en() ? DAMP_EN : DAMP_FR) : (en() ? UNVER_EN : UNVER_FR);', 'var t = en() ? UNVER_EN : UNVER_FR;'],
  ['marque palier', "document.getElementById('pal-brand')", "document.getElementById('pal-brandX')"]
];
(function main() {
  const base = suite(CODE, true);
  if (base.ko) { console.log('ECHEC : ' + base.ko + ' verification(s) en echec sur ' + (base.ok + base.ko) + '.'); process.exit(1); }
  let mok = 0, bad = [];
  for (const [name, from, to] of MUT) {
    const parts = CODE.split(from);
    if (parts.length !== 2) { console.log('  MUTATION INAPPLICABLE (' + parts.length + ' occurrences) : ' + name); bad.push(name); continue; }
    let r; try { r = suite(parts.join(to), false); } catch (e) { r = { ko: 1 }; }
    if (r.ko > 0) mok++; else { console.log('  MUTATION NON DETECTEE : ' + name); bad.push(name); }
  }
  console.log((bad.length ? 'ECHEC' : 'TOUT EST BON') + ' : ' + base.ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + bad.length + ' echec(s).');
  process.exit(bad.length ? 1 : 0);
})();
