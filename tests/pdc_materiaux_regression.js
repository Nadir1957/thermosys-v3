/* Thermosys - pertes de charge : materiaux, diametres interieurs EN 10255, Colebrook-White exact, zone critique 2300-4000.
   Rejoue les moteurs extraits de dist\index.html : 11 cas de reference figes (Colebrook resolu a part), solveur independant
   sur une grille Re x rugosite, regimes, tables de materiaux, texte de calcPDC (FR/EN), mutations.
   Lancer : node tests\pdc_materiaux_regression.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const file = process.argv[2] || path.join('dist', 'index.html');
const s = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
let n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log('ECHEC : ' + m); } }
const FROZEN = {"D1": [45461.86, 0.05], "D2": [64711.87, 0.05], "D3": [29418.34, 0.05], "D4": [354.24, 0.05], "D5": [55899.77, 0.1], "D6": [178234.45, 0.05], "D7": [50090.56, 0.05], "D8": [8761.61, 0.05], "D9": [32692.22, 0.05], "D10": [79521.61, 0.05], "D11": [144.35, 0.05]};
const MATS = { steel_new: [0.046, true], steel_galv: [0.15, true], steel_old: [0.3, true], copper: [0.0015, false], inox: [0.0015, false], plastic: [0.007, false] };
const EN10255 = { 8: 8.8, 10: 12.5, 15: 16.0, 20: 21.6, 25: 27.2, 32: 35.9, 40: 41.8, 50: 53.0, 65: 68.8, 80: 80.8, 100: 105.3, 125: 130.0, 150: 155.4 };
function scriptWith(marker) { const re = /<script[^>]*>([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(s))) if (m[1].indexOf(marker) >= 0 && m[1].length < 400000) return m[1]; return null; }
const eng = scriptWith('function calcSegmentPDC(');
ok(!!eng, 'script du moteur introuvable');
const a = s.indexOf("['PERTES DE CHARGE','D1'"), b = Math.min(...[s.indexOf(",\n['CHAMBRE FROIDE','CR1'", a), s.indexOf("\n];\nfunction run(){", a)].filter(x => x > 0));
ok(a > 0 && b > a, 'lignes de cas introuvables');
const cs = s.indexOf('window.calcPDC=function(){'), ce = s.indexOf('\n};\n', cs);
ok(cs > 0 && ce > cs, 'calcPDC introuvable');
const calcSrc = s.slice(cs, ce + 3);
const fs0 = s.indexOf('  function friction(q, dmm, rho, mu) {'), fe = s.indexOf('\n  }\n', fs0);
ok(fs0 > 0 && fe > fs0, 'friction (prereglage) introuvable');
const frSrc = s.slice(fs0, fe + 4);
function newSb() { const sb = { console, Math, JSON, Object, Array, String, Number, isFinite, parseFloat, document: { getElementById: () => null, addEventListener() {} } }; sb.window = sb; vm.createContext(sb); return sb; }
// solveur Colebrook independant : bissection sur f
function cwRef(Re, rr) { let lo = 0.004, hi = 0.5; const g = f => 1 / Math.sqrt(f) + 2 * Math.log10(rr / 3.7 + 2.51 / (Re * Math.sqrt(f))); for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (g(m) > 0) lo = m; else hi = m; } return (lo + hi) / 2; }
function engineChecks(src, rowsSrc) {
  const f = [], sb = newSb();
  try { vm.runInContext(src, sb); } catch (e) { return ['moteur : ' + e.message]; }
  const run = x => vm.runInContext(x, sb);
  let rows; try { rows = run('[' + rowsSrc + ']'); } catch (e) { return ['lignes : ' + e.message]; }
  rows.forEach(c => {
    const t = FROZEN[c[1]]; if (!t) { f.push('cas inattendu ' + c[1]); return; }
    if (c[4] !== t[0] || c[5] !== t[1]) f.push(c[1] + ' : attendu ou tolerance modifie');
    let v; try { v = c[9](); } catch (e) { f.push(c[1] + ' : ' + e.message); return; }
    const e = Math.abs(v - c[4]) / c[4] * 100; if (!(isFinite(e) && e <= c[5] + 1e-9)) f.push(c[1] + ' : ecart ' + e.toFixed(2) + ' %');
  });
  if (rows.length !== Object.keys(FROZEN).length) f.push('nombre de cas ' + rows.length);
  try {
    for (const Re of [2300, 2500, 3000, 3999, 4000, 5000, 12345, 1e5, 1e6, 5e6]) for (const rr of [0, 1e-5, 3e-5, 1e-4, 1e-3, 5e-3, 0.02, 0.05]) {
      const r = run('pdcLambda(' + Re + ',' + rr + ')'), x = cwRef(Re, rr);
      if (!(Math.abs(r.f - x) / x < 1e-8)) f.push('lambda Re=' + Re + ' rr=' + rr + ' : ' + r.f + ' au lieu de ' + x);
    }
    const lm = x => run('pdcLambda(' + x + ',0.001)');
    if (!(lm(1000).reg === 'lam' && Math.abs(lm(1000).f - 0.064) < 1e-12)) f.push('laminaire');
    if (lm(2299.99).reg !== 'lam') f.push('regime 2299,99');
    if (lm(2300).reg !== 'crit' || lm(3999.99).reg !== 'crit') f.push('regime critique');
    if (lm(4000).reg !== 'turb') f.push('regime turbulent');
    if (!(Math.abs(lm(3000).fLam - 64 / 3000) < 1e-15)) f.push('fLam');
    for (const k of Object.keys(MATS)) { const m = run('pdcMatOf(' + JSON.stringify(k) + ')'); if (m.eps !== MATS[k][0] || m.dn !== MATS[k][1]) f.push('materiau ' + k); }
    if (run('pdcMatOf("inconnu").eps') !== 0.046) f.push('materiau inconnu');
    for (const k of Object.keys(EN10255)) { const r = run('pdcInnerD("steel_new",' + k + ')'); if (r.di !== EN10255[k] || r.fromDN !== true) f.push('EN 10255 DN' + k); }
    for (const k of ['steel_galv', 'steel_old']) { const r = run('pdcInnerD("' + k + '",50)'); if (r.di !== 53.0 || !r.fromDN) f.push('Di ' + k); }
    for (const k of ['copper', 'inox', 'plastic']) { const r = run('pdcInnerD("' + k + '",40)'); if (r.di !== 40 || r.fromDN) f.push('Di saisi ' + k); }
    for (const x of [200, 41, 3]) { const r = run('pdcInnerD("steel_new",' + x + ')'); if (r.di !== x || r.fromDN) f.push('DN hors tableau ' + x); }
    if (run('calcSegmentPDC(10,50,100,1000,20).dP') !== run('calcSegmentPDC(10,50,100,1000,20,0.046).dP')) f.push('eps par defaut');
    if (!(run('calcSegmentPDC(10,50,100,1000,20,0.0015).dP') < run('calcSegmentPDC(10,50,100,1000,20,0.15).dP'))) f.push('sens de la rugosite');
    const c = run('calcSegmentPDC(0.4,50,100,1000,20)');
    if (c.reg !== 'crit' || !(c.dPLam < c.dP) || !(Math.abs(c.dPLam / c.dP - (64 / c.Re) / c.f) < 1e-12)) f.push('zone critique');
    if (run('calcSegmentPDC(10,50,100,1000,20).reg') !== 'turb' || run('calcSegmentPDC(0.05,20,100,1000,20).reg') !== 'lam') f.push('regimes du segment');
    const d = run('calcSegmentPDC(0.05,20,100,1000,20)'); if (!(Math.abs(d.dP - d.dPLam) < 1e-9)) f.push('laminaire dPLam');
  } catch (e) { f.push('verifications : ' + e.message); }
  // friction du prereglage (acier neuf, Di EN 10255) contre la reference independante
  try {
    const fs2 = newSb(); vm.runInContext(src, fs2);
    const fn = vm.runInContext('(function(){' + frSrc + ' return friction;})()', fs2);
    const r = fn(3, 27.2, 998.21, 0.0010016), ref = 50090.56 / 50;
    if (!(Math.abs(r.R - ref) / ref < 0.005)) f.push('friction prereglage : ' + r.R + ' au lieu de ' + ref);
  } catch (e) { f.push('friction : ' + e.message); }
  return f;
}
// calcPDC : texte produit (FR / EN)
function calcText(src, calcCode, o, lang) {
  const sb = newSb(); sb.lang = lang;
  vm.runInContext(src, sb);
  const els = { pdcResult: { textContent: '' }, pdcQ: { value: o.Q }, pdcDN: { value: o.dn }, pdcL: { value: o.L }, pdcFluid: { value: o.fluid || '1000' }, pdcT: { value: o.T == null ? '20' : o.T }, pdcMat: { value: o.mat } };
  sb.document = { getElementById: id => els[id] || null, addEventListener() {} };
  const wrap = '(function(){function $(id){return document.getElementById(id);}function isFr(){return lang!=="en";}function L(fr,en){return isFr()?fr:en;}function val(id){var e=$(id);if(!e||String(e.value).trim()==="")return NaN;return parseFloat(String(e.value).replace(",","."));}function bad(out,msg){out.textContent="⚠ "+msg;}\n' + calcCode + '\nwindow.calcPDC();})();';
  vm.runInContext(wrap, sb);
  return els.pdcResult.textContent;
}
function textChecks(src, calcCode) {
  const f = [];
  try {
    const t1 = calcText(src, calcCode, { Q: 3, dn: 25, L: 50, mat: 'steel_new' }, 'fr');
    if (t1.indexOf('Matériau : Acier noir neuf (DN, EN 10255), ε = 0.046 mm') < 0) f.push('ligne materiau FR');
    if (t1.indexOf('Ø intérieur : 27.2 mm (DN 25, EN 10255)') < 0) f.push('ligne Ø interieur acier');
    const m1 = /dP = (\d+) Pa/.exec(t1); if (!m1 || Math.abs(m1[1] - 50091) / 50091 > 0.005) f.push('dP acier DN25 : ' + (m1 && m1[1]));
    if (t1.indexOf('(turbulent)') < 0 || t1.indexOf('Zone critique') >= 0) f.push('regime turbulent');
    if (t1.indexOf('λ par Colebrook-White exact') < 0 || t1.indexOf('Swamee') >= 0) f.push('hypotheses');
    const t2 = calcText(src, calcCode, { Q: 2, dn: 20, L: 100, mat: 'copper' }, 'en');
    if (t2.indexOf('Material: Copper (enter inner Ø), ε = 0.0015 mm') < 0 || t2.indexOf('Inner Ø: 20.0 mm (as entered)') < 0) f.push('cuivre EN');
    const m2 = /dP = (\d+) Pa/.exec(t2); if (!m2 || Math.abs(m2[1] - 178234) / 178234 > 0.005) f.push('dP cuivre : ' + (m2 && m2[1]));
    const t3 = calcText(src, calcCode, { Q: 0.4, dn: 50, L: 100, mat: 'plastic' }, 'fr');
    if (t3.indexOf('transitoire — incertain') < 0 || t3.indexOf('Zone critique (2300 ≤ Re < 4000) : dP entre') < 0 || t3.indexOf('(loi laminaire) et') < 0 || t3.indexOf('(loi turbulente, retenue)') < 0) f.push('zone critique FR');
    const mm = /dP entre (\d+) Pa \(loi laminaire\) et (\d+) Pa/.exec(t3), dd = /\ndP = (\d+) Pa/.exec(t3);
    if (!mm || !dd || +mm[2] !== +dd[1] || !(+mm[1] < +mm[2])) f.push('plage laminaire-turbulent');
    const t4 = calcText(src, calcCode, { Q: 0.4, dn: 50, L: 100, mat: 'steel_new' }, 'en');
    if (t4.indexOf('Critical zone (2300 ≤ Re < 4000): dP between') < 0 || t4.indexOf('(transitional — uncertain)') < 0) f.push('zone critique EN');
    const t5 = calcText(src, calcCode, { Q: 20, dn: 200, L: 50, mat: 'steel_galv' }, 'en');
    if (t5.indexOf('DN outside the EN 10255 table') < 0 || t5.indexOf('Inner Ø: 200.0 mm') < 0) f.push('DN hors tableau');
    const t6 = calcText(src, calcCode, { Q: 0.05, dn: 20, L: 100, mat: 'steel_new' }, 'fr');
    if (t6.indexOf('(laminaire)') < 0 || t6.indexOf('Zone critique') >= 0) f.push('laminaire texte');
    const t8 = calcText(src, calcCode, { Q: 3, dn: 25, L: 50, mat: '' }, 'fr');
    if (t8.indexOf('Matériau : Acier noir neuf') < 0) f.push('materiau par defaut');
    const t7 = calcText(src, calcCode, { Q: 3, dn: 25, L: 50, mat: 'steel_old' }, 'fr'), m7 = /dP = (\d+) Pa/.exec(t7);
    if (!m7 || !(+m7[1] > +m1[1])) f.push('acier ancien plus rugueux que neuf');
  } catch (e) { f.push('calcPDC : ' + e.message); }
  return f;
}
const rowsSrc = a > 0 && b > a ? s.slice(a, b) : '';
function all(engSrc, calcCode, fr) { const x = engineChecks(engSrc, rowsSrc); const y = textChecks(engSrc, calcCode); return x.concat(y); }
if (eng && a > 0 && cs > 0) {
  const base = all(eng, calcSrc); base.forEach(x => console.log('ECART : ' + x)); bad += base.length; n += 1;
  // controles de presence dans la page
  const cnt = (h, x) => h.split(x).length - 1;
  ok(/id="pdcMat"/.test(s) && /id="rsMat"/.test(s), 'listes de materiaux absentes');
  for (const id of ['pdcMat', 'rsMat']) { const i = s.indexOf('id="' + id + '"'), j = s.indexOf('</select>', i), seg = s.slice(i, j); ok(cnt(seg, '<option') === 6, id + ' : 6 materiaux attendus'); for (const k of Object.keys(MATS)) ok(seg.indexOf('value="' + k + '"') > 0, id + ' : ' + k); }
  ok(cnt(s, "calcSegmentPDC(Q, di.di, L, fluid, tFl, matO.eps)") === 1, 'addReseauSegment : appel du moteur');
  ok(cnt(s, 'var ks = reseauKsum(cnt, D)') === 1, 'les singularites gardent le DN nominal');
  ok(cnt(s, 'window.pdcLambda(Re, 0.000046 / d).f') === 1, 'prereglage : lambda');
  ok(s.indexOf("inp:['pdcQ','pdcMat','pdcDN','pdcL','pdcFluid']") > 0, 'rapport : materiau');
  ok(s.indexOf('Colebrook-White / Swamee-Jain') < 0, 'ancienne mention Swamee-Jain restante');
  ok(s.indexOf("'PERTES DE CHARGE':'PRESSURE DROP'") > 0, 'traduction du module Validation');
  ok(/Pertes de charge lin/.test(s) && /Linear pressure drop/.test(s) && /Pérdidas de carga lin/.test(s), 'texte de limites (3 langues)');
    const MUT = [['rr / 3.7', 'rr / 3.0'], ['2.51 * x / Re', '3.5 * x / Re'], ['i < 100', 'i < 1'], ['Re < 4000 ?', 'Re < 3500 ?'], ['!(Re >= 2300)', '!(Re >= 2000)'], ['fLam = 64 / Re', 'fLam = 60 / Re'],
    ['steel_new:  { eps: 0.046', 'steel_new:  { eps: 0.05'], ['steel_galv: { eps: 0.15', 'steel_galv: { eps: 0.2'], ['steel_old:  { eps: 0.3', 'steel_old:  { eps: 0.25'], ['copper:     { eps: 0.0015', 'copper:     { eps: 0.003'], ['inox:       { eps: 0.0015', 'inox:       { eps: 0.003'], ['plastic:    { eps: 0.007', 'plastic:    { eps: 0.01'],
    ['steel_new:  { eps: 0.046,  dn: true', 'steel_new:  { eps: 0.046,  dn: false'], ['copper:     { eps: 0.0015, dn: false', 'copper:     { eps: 0.0015, dn: true'],
    ['25: 27.2', '25: 27.0'], ['40: 41.8', '40: 42.5'], ['50: 53.0', '50: 52.0'], ['80: 80.8', '80: 81.8'], ['150: 155.4', '150: 150.4'], ['8: 8.8', '8: 9.8'],
    ['(eps > 0) ? eps : 0.046', '(eps > 0) ? eps : 0.05'], ['dPLam:lm.fLam*q2', 'dPLam:lm.f*q2'], ['reg: Re < 4000', 'reg: Re < 3000'], ['PDC_MAT.hasOwnProperty(key) ? PDC_MAT[key] : PDC_MAT.steel_new', 'PDC_MAT.hasOwnProperty(key) ? PDC_MAT[key] : PDC_MAT.copper'], ['m.dn && PDC_EN10255', 'false && PDC_EN10255'], ['e/1000/Dm', 'e/100/Dm']];
  let killed = 0, total = 0;
  for (const [o, m] of MUT) {
    if (cnt(eng, o) < 1) { ok(false, 'ancre de mutation introuvable : ' + o); continue; }
    total++; if (all(eng.split(o).join(m), calcSrc).length) killed++; else ok(false, 'MUTANT SURVIVANT : ' + o + ' -> ' + m);
  }
  const MUT2 = [['mat.eps/1000/D', 'mat.eps/100/D'], ["lm.reg==='crit'", "lm.reg==='turb'"], ['(lm.fLam*q2).toFixed(0)', '(lm.f*q2).toFixed(0)'], ['di.di/1000', 'di.di/900'], ['pdcInnerD(matKey,dn)', 'pdcInnerD(matKey,dn+1)'], ["||'steel_new'", "||'copper'"]];
  for (const [o, m] of MUT2) {
    if (cnt(calcSrc, o) < 1) { ok(false, 'ancre calcPDC introuvable : ' + o); continue; }
    total++; if (all(eng, calcSrc.split(o).join(m)).length) killed++; else ok(false, 'MUTANT SURVIVANT (calcPDC) : ' + o + ' -> ' + m);
  }
  // mutation de la friction du prereglage : on altere le texte extrait
  { const sb = newSb(); vm.runInContext(eng, sb); const mut = frSrc.replace('window.pdcLambda(Re, 0.000046 / d).f', 'window.pdcLambda(Re, 0.00046 / d).f'); const fn = vm.runInContext('(function(){' + mut + ' return friction;})()', sb); const r = fn(3, 27.2, 998.21, 0.0010016); total++; if (Math.abs(r.R - 50090.56 / 50) / (50090.56 / 50) > 0.005) killed++; else ok(false, 'MUTANT SURVIVANT (prereglage)'); }
  n += total;
  if (bad) { console.log('ECHEC : ' + bad); process.exit(1); }
  console.log('TOUT EST BON : ' + n + ' verifications, ' + killed + ' mutations tuees');
} else { console.log('ECHEC'); process.exit(1); }
