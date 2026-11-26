// Thermosys - Tests du calcul d'epaisseur d'isolant anti-condensation (point de rosee)
// Usage (depuis le dossier files) :  node tests\isolation_regression.js
// References figees : point de rosee CoolProp 8.0.0 (45 etats) ; coefficient de convection naturelle (Churchill et Chu, proprietes de l'air CoolProp).
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const mm = /<script id="isolation-48-module">([\s\S]*?)<\/script>/.exec(html);
if (!mm) { console.log('ECHEC : module introuvable'); process.exit(1); }
const SRC = mm[1];
const DEW = [[5,30,-9.921],[5,50,-4.033],[5,70,-0.009],[5,90,3.499],[5,100,5],[10,30,-6.01],[10,50,0.064],[10,70,4.788],[10,90,8.437],[10,100,10],[15,30,-2.14],[15,50,4.674],[15,70,9.58],[15,90,13.375],[15,100,15],[20,30,1.917],[20,50,9.274],[20,70,14.368],[20,90,18.311],[20,100,20],[25,30,6.242],[25,50,13.867],[25,70,19.152],[25,90,23.245],[25,100,25],[30,30,10.553],[30,50,18.451],[30,70,23.931],[30,90,28.178],[30,100,30],[35,30,14.851],[35,50,23.026],[35,70,28.705],[35,90,33.11],[35,100,35],[40,30,19.135],[40,50,27.593],[40,70,33.474],[40,90,38.04],[40,100,40],[45,30,23.406],[45,50,32.151],[45,70,38.238],[45,90,42.968],[45,100,45]], HNAT = [[0.05,1,30,2.386710414470183],[0.05,3,30,3.127096117014754],[0.05,6,30,3.7369623292733043],[0.05,10,30,4.279853951586122],[0.05,20,30,5.183521596952662],[0.08,1,30,2.1120164550210894],[0.08,3,30,2.8118834590136235],[0.08,6,30,3.3923087890853543],[0.08,10,30,3.911447538995435],[0.08,20,30,4.780088975043668],[0.15,1,30,1.8496002125467104],[0.15,3,30,2.508167465065218],[0.15,6,30,3.05854712005688],[0.15,10,30,3.553406846595911],[0.15,20,30,4.386146370523808],[0.3,1,30,1.6538536701336577],[0.3,3,30,2.279632010321315],[0.3,6,30,2.8061309335053477],[0.3,10,30,3.2816660026638775],[0.3,20,30,4.085758402667347]];
function load(src) { const w = {}; new Function('window', 'document', 'setInterval', src)(w, { getElementById() { return null; } }, function () {}); return w.__di48; }
const base = { d: 60.3, tf: 7, ta: 30, rh: 70, lam: 0.036, em: 0.9 };
function suite(G) {
  const f = []; const ok = (c, m) => { if (!c) f.push(m); };
  // 1. point de rosee contre CoolProp
  DEW.forEach(r => { const td = G.dewOfPv(G.psat(r[0]) * r[1] / 100); ok(Math.abs(td - r[2]) <= 0.03, 'rosee ' + r + ' : ' + td.toFixed(3)); });
  // 2. convection naturelle contre Churchill-Chu avec proprietes CoolProp (3 %)
  HNAT.forEach(r => { const h = G.hNat(r[0], r[2] - r[1], r[2]); ok(Math.abs(h / r[3] - 1) <= 0.03, 'hNat ' + r + ' : ' + h.toFixed(3)); });
  // 3. rayonnement
  ok(Math.abs(G.hRad(20, 30, 0.9) - 0.9 * 5.67e-8 * (293.15 + 303.15) * (293.15 ** 2 + 303.15 ** 2)) < 1e-9, 'hRad formule');
  ok(Math.abs(G.hRad(24, 30, 0.9) - 5.5) < 0.1 && G.hRad(24, 30, 0.5) < G.hRad(24, 30, 0.9), 'hRad ordre de grandeur et emissivite');
  // 4. solution : la surface est au point de rosee, bilan thermique ferme, 2e methode
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  for (let i = 0; i < 150; i++) {
    const p = { d: 15 + rnd() * 400, tf: -10 + rnd() * 18, ta: 22 + rnd() * 20, rh: 40 + rnd() * 55, lam: 0.025 + rnd() * 0.05, em: 0.1 + rnd() * 0.9 }; if (i % 3 === 0) p.hc = 2 + rnd() * 12;
    const o = G.compute(p); if (o.err) { ok(o.err === 'range' || o.err === 'tf', 'erreur inattendue ' + o.err); continue; }
    ok(o.t >= 0, 'epaisseur positive');
    if (o.t > 0) {
      ok(Math.abs(o.ts - o.td) < 1e-6, 'surface au point de rosee ' + (o.ts - o.td));
      const D1 = p.d / 1000, D2 = o.d2, hr = G.hRad(o.td, p.ta, p.em), hc = p.hc > 0 ? p.hc : G.hNat(D2, o.td, p.ta), Ri = Math.log(D2 / D1) / (2 * Math.PI * p.lam);
      const q1 = (o.ts - p.tf) / Ri, q2 = (p.ta - o.ts) * (hc + hr) * Math.PI * D2; ok(Math.abs(q1 / q2 - 1) < 1e-6, 'bilan thermique ' + (q1 / q2));
      ok(Math.abs(o.t - (D2 - D1) / 2 * 1000) < 1e-9, 'epaisseur = (D2 - D1) / 2');
      // 2e methode : balayage fin puis secante
      let a = D1 * 1.001, b = D1 + 0.5; const fn = x => G.tsOf(D1, x, p.lam, (p.hc > 0 ? p.hc : G.hNat(x, o.td, p.ta)) + hr, p.ta, p.tf) - o.td;
      let fa = fn(a), fb = fn(b); for (let k = 0; k < 200 && Math.abs(b - a) > 1e-13; k++) { const c = (a + b) / 2, fc = fn(c); if ((fc < 0) === (fa < 0)) { a = c; fa = fc; } else { b = c; fb = fc; } }
      ok(Math.abs((a + b) / 2 - D2) < 1e-8, '2e methode ' + (a + b) / 2 + ' vs ' + D2);
    } else { ok(Math.abs(o.ts - G.tsOf(p.d / 1000, o.d2, p.lam, o.hc + o.hr, p.ta, p.tf)) < 1e-9, 'surface nue coherente'); }
  }
  // 5. physique : monotonie
  const t = q => G.compute(Object.assign({}, base, q)).t;
  ok(t({ rh: 85 }) > t({ rh: 70 }) && t({ rh: 70 }) > t({ rh: 55 }), 'plus d\'humidite => plus d\'isolant');
  ok(t({ tf: 2 }) > t({ tf: 7 }) && t({ tf: 7 }) > t({ tf: 12 }), 'fluide plus froid => plus d\'isolant');
  ok(t({ ta: 35 }) > t({ ta: 30 }), 'ambiance plus chaude (meme humidite relative) => plus d\'isolant');
  ok(t({ lam: 0.045 }) > t({ lam: 0.036 }) && t({ lam: 0.036 }) > t({ lam: 0.03 }), 'isolant moins performant => plus epais');
  ok(t({ hc: 3 }) > t({ hc: 9 }), 'convection plus forte => moins d\'isolant');
  ok(t({}) > t({ hc: 9 }) + 2, 'convection naturelle automatique : le defaut de 9 W/m2K sous-estimait l\'epaisseur de plus de 2 mm');
  ok(Math.abs(t({}) - 9.83) < 0.05 && Math.abs(t({ hc: 9 }) - 6.30) < 0.05, 'cas de reference 60,3 mm / 7 C / 30 C / 70 % : 9,83 mm auto, 6,30 mm avec h = 9');
  ok(t({ tf: 20, ta: 25, rh: 40 }) === 0, 'surface nue deja suffisante');
  ok(t({ tf: 24.5 }) === 0 && t({ tf: 24 }) === 0 && t({ tf: 23.5 }) > 0.2, 'limite surface nue : fluide a 24,5 C => aucune isolation, 23,5 C => isolation');
  { const c = G.compute({ d: 60.3, tf: -30, ta: 35, rh: 90, lam: 0.045, em: 0.9 }); ok(!c.err && c.t > 90 && c.t < 110, 'cas tres froid : environ 100 mm sans erreur de plage : ' + (c.err || c.t)); }
  // 5b. comparaison avec un tableau publie par un fabricant (die Kaelte / Armacell) : tuyau 33,7 mm, fluide 6 C, ambiance 22 C, coefficient d'echange total alpha_a = 9 W/m2K,
  //     epaisseurs publiees 2,9 / 5,5 / 10,2 / 15,7 mm pour 55 / 65 / 75 / 85 % ; lambda non indique dans la source : 0,040 W/mK suppose, tolerance 15 %
  { const pub = { 55: 2.9, 65: 5.5, 75: 10.2, 85: 15.7 }; Object.keys(pub).forEach(rh => { const Td = G.dewOfPv(G.psat(22) * rh / 100), hr = G.hRad(Td, 22, 0.9); const o = G.compute({ d: 33.7, tf: 6, ta: 22, rh: +rh, lam: 0.040, em: 0.9, hc: 9 - hr }); ok(!o.err && Math.abs(o.t / pub[rh] - 1) <= 0.15, 'tableau publie ' + rh + ' % : ' + (o.err || o.t.toFixed(2)) + ' vs ' + pub[rh]);
    const old = G.compute({ d: 33.7, tf: 6, ta: 22, rh: +rh, lam: 0.040, em: 0.9, hc: 9 }); ok(old.t < pub[rh] * 0.85, 'l\'ancien calcul (9 + rayonnement) restait trop bas : ' + old.t.toFixed(2)); }); }
  // 6. validations
  [{ d: 0 }, { d: -5 }, { d: NaN }, { rh: 0 }, { rh: 101 }, { lam: 0 }, { lam: -1 }, { em: 0 }, { em: 1.2 }, { tf: NaN }, { ta: NaN }].forEach(q => ok(G.compute(Object.assign({}, base, q)).err === 'in', 'entree invalide ' + JSON.stringify(q)));
  ok(G.compute(Object.assign({}, base, { hc: -1 })).err === 'h', 'h negatif'); ok(G.compute(Object.assign({}, base, { hc: NaN })).err === 'h', 'h NaN');
  ok(G.compute(Object.assign({}, base, { tf: 30 })).err === 'tf' && G.compute(Object.assign({}, base, { tf: 35 })).err === 'tf', 'fluide >= ambiance');
  ok(G.compute(Object.assign({}, base, { ta: 70 })).err === 'T' && G.compute(Object.assign({}, base, { ta: -50, tf: -60 })).err === 'T' && G.compute(Object.assign({}, base, { tf: -120, ta: 10 })).err === 'T', 'domaine des temperatures');
  ok(G.compute(Object.assign({}, base, { rh: 100 })).err === 'range', '100 % d\'humidite : epaisseur infinie');
  ok(G.compute(Object.assign({}, base, { hc: 0 })).auto === true && G.compute(Object.assign({}, base, { hc: undefined })).auto === true && G.compute(Object.assign({}, base, { hc: null })).auto === true, 'h vide ou 0 => automatique');
  // 7. rendu trilingue
  [0, 1, 2].forEach(i => { const h = G.render(G.compute(base), i); ok(/Churchill/.test(h) && /9,8 mm|9\.8 mm/.test(h) && !/undefined|NaN/.test(h), 'rendu ' + i); ok(i === 1 ? /9\.8 mm/.test(h) : /9,8 mm/.test(h), 'format decimal ' + i); ok(/marge|margin|margen/.test(h), 'avertissement sans marge ' + i); });
  ok(/automatique/.test(G.render(G.compute(base), 0)) && /automatic/.test(G.render(G.compute(base), 1)) && /autom/.test(G.render(G.compute(base), 2)), 'mention automatique x3');
  ok(/Aucune/.test(G.render(G.compute({ d: 60.3, tf: 20, ta: 25, rh: 40, lam: 0.036, em: 0.9 }), 0)), 'rendu sans isolant');
  ['in', 'h', 'T', 'tf', 'range'].forEach(e => [0, 1, 2].forEach(i => ok(G.render({ err: e }, i).length > 20, 'message ' + e + i)));
  return f;
}
const b0 = suite(load(SRC));
if (b0.length) { console.log(b0.slice(0, 12).join('\n')); console.log('ECHECS : ' + b0.length); process.exit(1); }
const MUT = [
  ['1.458e-6 * Math.pow(K, 1.5) / (K + 110.4)', '1.658e-6 * Math.pow(K, 1.5) / (K + 110.4)'], ['2.334e-3 * Math.pow(K, 1.5) / (K + 164.54)', '2.534e-3 * Math.pow(K, 1.5) / (K + 164.54)'],
  ['rho = 101325 / (287.05 * K)', 'rho = 101325 / (300 * K)'], ['Pr = 0.71;', 'Pr = 0.9;'], ['9.81 * (1 / K)', '9.0 * (1 / K)'], ['0.387 * Math.pow(Ra, 1 / 6)', '0.40 * Math.pow(Ra, 1 / 6)'],
  ['Math.pow(0.559 / Pr, 9 / 16)', 'Math.pow(0.659 / Pr, 9 / 16)'], ['0.60 + 0.387', '0.50 + 0.387'], ['return Nu * kk / D;', 'return Nu * kk / (D * 1.1);'],
  ['var s = 5.67e-8,', 'var s = 5.0e-8,'], ['return e * s * (a + b) * (a * a + b * b);', 'return s * (a + b) * (a * a + b * b);'], ['Math.log(D2 / D1) / (2 * Math.PI * lam)', 'Math.log(D2 / D1) / (Math.PI * lam)'],
  ['1 / (h * Math.PI * D2)', '1 / (h * Math.PI * D1)'], ['return Ta - q * Ra;', 'return Tf + q * Ra;'], ['psat(p.ta) * p.rh / 100', 'psat(p.ta) * p.rh / 90'], ['hr = hRad(Td, p.ta, p.em)', 'hr = hRad(p.tf, p.ta, p.em)'],
  ['var auto = !(p.hc > 0)', 'var auto = false'], ['o.t = (D2 - D1) / 2 * 1000', 'o.t = (D2 - D1) * 1000'], ['if (ts(m) < Td) { lo = m; } else { hi = m; }', 'if (ts(m) < Td - 0.5) { lo = m; } else { hi = m; }'],
  ['p.rh <= 100', 'p.rh <= 150'], ['p.em <= 1', 'p.em <= 5'], ['p.hc >= 0)', 'p.hc >= -5)'], ['p.tf >= p.ta', 'p.tf > p.ta + 5'], ['p.ta < -40 || p.ta > 60', 'p.ta < -40 || p.ta > 90'], ['hi = D1 + 0.5', 'hi = D1 + 0.05'], ['ts(lo) >= Td', 'ts(lo) >= Td + 1']
];
let surv = 0;
MUT.forEach(m => { if (SRC.indexOf(m[0]) < 0) { console.log('MUTATION NON APPLICABLE : ' + m[0]); surv++; return; } let r; try { r = suite(load(SRC.replace(m[0], m[1]))); } catch (e) { r = ['crash']; } if (!r.length) { console.log('MUTANT SURVIVANT : ' + m[0] + ' -> ' + m[1]); surv++; } });
if (surv) { console.log('ECHEC : ' + surv + ' mutation(s) non detectee(s)'); process.exit(1); }
console.log('TOUT EST BON : suite complete OK, ' + MUT.length + ' mutations toutes detectees');
