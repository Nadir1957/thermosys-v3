/* Thermosys - page Validation : cas de reference eau et eau glycolee (W1-W3, G1-G7), rejoues sur les vrais moteurs extraits de dist\index.html.
   Valeurs attendues figees ici (independantes du code) ; mutations : toute alteration du tableau glycol doit faire echouer un cas.
   Lancer : node tests\validation_cas_regression.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const file = process.argv[2] || path.join('dist', 'index.html');
const s = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
let n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log('ECHEC : ' + m); } }
const FROZEN = { W1: [998.21, 0.05], W2: [1.0016, 0.5], W3: [0.4660, 0.5], G1: [1057.0, 0.2], G2: [3.819, 5], G3: [1.322, 5], G4: [1.3835, 0.5], G5: [1031.2, 0.2], G6: [1010.5, 0.1], G7: [3.9465, 0.5] };
function scriptWith(marker) { const re = /<script[^>]*>([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(s))) if (m[1].indexOf(marker) >= 0 && m[1].length < 400000) return m[1]; return null; }
const gly = scriptWith('THERMOSYS_PDC_GLYCOL_V1'), eau = scriptWith('THERMOSYS_RESEAU_T_V1');
ok(!!gly && !!eau, 'modules glycol et eau introuvables');
const a = s.indexOf("['EAU GLYCOLÉE','W1'"), b = s.indexOf("\n];\nfunction run(){", a);
ok(a > 0 && b > a, 'lignes de cas introuvables dans la page Validation');
function evalRows(glySrc) {
  const sb = { console, Math, JSON, Object, Array, String, Number, isFinite, parseFloat, document: { getElementById: () => null, addEventListener() {} } };
  sb.window = sb; vm.createContext(sb);
  try { vm.runInContext(eau, sb); vm.runInContext(glySrc, sb); } catch (e) { return { err: String(e) }; }
  const rows = vm.runInContext('[' + s.slice(a, b) + ']', sb);
  return { rows };
}
function check(glySrc) {
  const r = evalRows(glySrc); if (r.err) return { fails: ['module : ' + r.err] };
  const fails = [];
  for (const c of r.rows) {
    const id = c[1], f = FROZEN[id];
    if (!f) { fails.push('cas inattendu ' + id); continue; }
    if (c[4] !== f[0] || c[5] !== f[1]) fails.push(id + ' : valeur attendue ou tolerance modifiee');
    let v; try { v = c[9](); } catch (e) { fails.push(id + ' : ' + e.message); continue; }
    const e = Math.abs(v - c[4]) / Math.abs(c[4]) * 100;
    if (!(isFinite(e) && e <= c[5] + 1e-9)) fails.push(id + ' : ecart ' + e.toFixed(2) + ' % > ' + c[5]);
  }
  if (r.rows.length !== Object.keys(FROZEN).length) fails.push('nombre de cas : ' + r.rows.length);
  return { fails, rows: r.rows };
}
if (gly && eau && a > 0) {
  const base = check(gly);
  base.fails.forEach(x => console.log('ECART : ' + x));
  n += 10; bad += base.fails.length;
  ok(/état du 27\/11\/2026/.test(s) && !/étape 56 — 30\/10\/2026/.test(s), 'ligne de version non mise a jour');
  ok(s.indexOf("'EAU GLYCOLÉE':'GLYCOL WATER'") > 0, 'traduction du titre de module absente');
  // mutations : chaque alteration de 8 % d'une colonne d'un melange utilise doit etre detectee
  let killed = 0, total = 0;
  const m = /var PGLY = (\{.*?\});\nwindow\.PGLY/s.exec(gly);
  ok(!!m, 'tableau PGLY introuvable');
  if (m) for (const k of ['EG40', 'EG30', 'PG30']) for (const col of [1, 2]) for (const sg of [1, -1]) {
    const P = JSON.parse(m[1]); P[k][1].forEach(r => { r[col] *= 1 + sg * 0.08; });
    const mut = gly.replace(m[1], () => JSON.stringify(P));
    if (mut === gly) { ok(false, 'mutation sans effet'); continue; }
    total++; const r = check(mut);
    if (r.fails.length) killed++; else ok(false, 'MUTANT SURVIVANT ' + k + ' col ' + col + ' ' + sg);
  }
  n += total;
  // mutations sur la valeur attendue : le test doit voir un changement de la ligne dans la page
  for (const id of Object.keys(FROZEN)) {
    const i = s.indexOf("'" + id + "'", a); const seg = s.slice(i, s.indexOf('\n', i));
    const nm = seg.replace(String(FROZEN[id][0]), String(FROZEN[id][0] * 1.1));
    ok(nm !== seg, 'valeur attendue de ' + id + ' non trouvee dans la ligne');
  }
  if (bad) { console.log('ECHEC : ' + bad); process.exit(1); }
  console.log('TOUT EST BON : ' + n + ' verifications, ' + killed + ' mutations tuees');
} else { console.log('ECHEC'); process.exit(1); }
