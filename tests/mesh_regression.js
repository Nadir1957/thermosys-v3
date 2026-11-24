// Thermosys - Tests de non-regression du « Reseau maille » (solveur hydraulique, algorithme du gradient global)
// Usage (depuis le dossier files) :  node tests\mesh_regression.js
//   ou avec un autre fichier :       node tests\mesh_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// Statut des references (rien n'est cache) :
//  - Laminaire : solution analytique exacte de Hagen-Poiseuille (dP = 128 mu L Q / (pi D^4)).
//  - Turbulent : formule de Swamee-Jain (celle du module), recalculee ici independamment.
//  - Reseaux : un 2e solveur ecrit ici avec une autre methode (equations nodales, Newton, jacobien par differences finies,
//    elimination de Gauss) est compare au solveur du module sur 40 reseaux aleatoires a debits turbulents (graine fixe).
//  - Zone de transition (2000 < Re < 4000) : le module utilise un raccord cubique entre les deux regimes ; ce n'est PAS une loi
//    physique verifiee (l'ecoulement y est incertain). Le test verifie seulement la continuite et la monotonie.
//  - Non teste ici : l'interface, les exports CSV, les textes, les proprietes du fluide (fixes : eau 1000/0,001 ; glycol 1040/0,0028 et 1060/0,0038).
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
let S;
try {
  const open = '<script id="mesh-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
  if (a < 0 || b < 0) { throw new Error('module reseau maille introuvable'); }
  const src = h.slice(a + open.length, b);
  const noop = () => { }, win = {};
  const el = () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop, classList: { add: noop, remove: noop }, querySelectorAll: () => [], querySelector: () => null, innerHTML: '', value: '' });
  const doc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: el, head: { appendChild: noop }, body: { appendChild: noop }, addEventListener: noop, documentElement: { getAttribute: () => 'fr' } };
  win.window = win; win.document = doc; win.localStorage = { getItem: () => null, setItem: noop };
  new Function('window', 'document', 'localStorage', 'setInterval', 'setTimeout', 'clearTimeout', 'navigator', 'lang', src)(win, doc, win.localStorage, noop, noop, noop, {}, 'fr');
  S = win.__meshSolve;
  if (typeof S !== 'function') { throw new Error('solveur absent'); }
} catch (e) { console.error('Module illisible : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function rel(a, b) { return Math.abs(a / b - 1) * 100; }
const FL = { w: { rho: 1000, mu: 0.001 }, g30: { rho: 1040, mu: 0.0028 }, g40: { rho: 1060, mu: 0.0038 } };
const mk = (fl, nodes, pipes) => ({ fluid: fl, nodes: nodes, pipes: pipes.map(p => ({ a: p[0], b: p[1], L: p[2], D: p[3] / 1000, eps: p[4] / 1000, K: p[5] })) });
function sj(Re, e, D) { return 0.25 / Math.pow(Math.log10(e / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2); }

console.log('1) Tuyau seul : laminaire (Hagen-Poiseuille), turbulent (Swamee-Jain), singularites');
[['w', 0.2], ['g30', 0.5], ['g40', 0.3]].forEach(c => {
  const fl = FL[c[0]], D = 0.05, L = 100, Q = c[1] / 3600;
  const r = S(mk(fl, [{ type: 's', P: 400000, dem: 0 }, { type: 'd', P: 0, dem: Q }], [[0, 1, L, 50, 0.046, 0]]));
  const dpTh = 128 * fl.mu * L * Q / (Math.PI * Math.pow(D, 4));
  const Re = 4 * fl.rho * Q / (Math.PI * D * fl.mu);
  check(c[0] + ' ' + c[1] + ' m3/h : laminaire Re ' + Math.round(Re), Re < 2000, 'Re ' + Re);
  check(c[0] + ' ' + c[1] + ' m3/h : dP = Hagen-Poiseuille (0,01 %)', rel(r.pipes[0].dp, dpTh) < 0.01, 'module ' + r.pipes[0].dp.toFixed(2) + ' ref ' + dpTh.toFixed(2));
  check(c[0] + ' pression au noeud = source - dP', Math.abs(r.P[1] - (400000 - dpTh)) < 0.01 * dpTh / 100 + 0.01);
});
[['w', 10, 40, 50, 0], ['w', 25, 65, 100, 3], ['g30', 10, 40, 50, 1.5], ['g40', 6, 32, 40, 0.5], ['w', 60, 100, 300, 2], ['g30', 120, 150, 500, 4]].forEach(c => {
  const fl = FL[c[0]], D = c[2] / 1000, L = c[3], K = c[4], Q = c[1] / 3600;
  const r = S(mk(fl, [{ type: 's', P: 800000, dem: 0 }, { type: 'd', P: 0, dem: Q }], [[0, 1, L, c[2], 0.046, K]]));
  const A = Math.PI * D * D / 4, v = Q / A, Re = v * D * fl.rho / fl.mu, f = sj(Re, 0.000046, D);
  const dp = (f * L / D + K) * fl.rho * v * v / 2, tag = c.join('/') + ' : ';
  check(tag + 'Re turbulent', Re > 4000, 'Re ' + Math.round(Re));
  check(tag + 'dP (0,01 %)', rel(r.pipes[0].dp, dp) < 0.01, 'module ' + r.pipes[0].dp.toFixed(2) + ' ref ' + dp.toFixed(2));
  check(tag + 'vitesse', rel(r.pipes[0].v, v) < 1e-6);
  check(tag + 'debit retrouve', rel(r.pipes[0].q, Q) < 1e-6);
  check(tag + 'sens inverse : debit negatif', (() => { const r2 = S(mk(fl, [{ type: 'd', P: 0, dem: Q }, { type: 's', P: 800000, dem: 0 }], [[0, 1, L, c[2], 0.046, K]])); return r2.pipes[0].q < 0 && rel(Math.abs(r2.pipes[0].dp), dp) < 0.01; })());
});

console.log('2) Deux tuyaux en parallele : memes pertes de charge, debits qui s\'additionnent');
{
  const fl = FL.w, Q = 30 / 3600;
  const r = S(mk(fl, [{ type: 's', P: 500000, dem: 0 }, { type: 'd', P: 0, dem: Q }], [[0, 1, 200, 80, 0.046, 0], [0, 1, 300, 65, 0.046, 1]]));
  check('somme des debits = demande', rel(r.pipes[0].q + r.pipes[1].q, Q) < 1e-7);
  check('memes pertes de charge', rel(r.pipes[0].dp, r.pipes[1].dp) < 1e-5, r.pipes[0].dp + ' vs ' + r.pipes[1].dp);
  check('le tuyau le plus gros et le plus court prend plus de debit', r.pipes[0].q > r.pipes[1].q);
}

console.log('3) Reseau d\'exemple du module : bilans et fermetures');
{
  const fl = FL.w;
  const nodes = [{ type: 's', P: 300000, dem: 0 }, { type: 'd', P: 0, dem: 0 }, { type: 'd', P: 0, dem: 20 / 3600 }, { type: 'd', P: 0, dem: 25 / 3600 }, { type: 'd', P: 0, dem: 15 / 3600 }, { type: 'd', P: 0, dem: 10 / 3600 }];
  const r = S(mk(fl, nodes, [[0, 1, 300, 150, 0.046, 2], [1, 2, 200, 100, 0.046, 1], [1, 3, 250, 100, 0.046, 1], [2, 4, 250, 80, 0.046, 1], [3, 4, 200, 80, 0.046, 1], [2, 3, 150, 65, 0.046, 0.5], [4, 5, 150, 100, 0.046, 1]]));
  check('converge', !r.error, String(r.error));
  check('convergence rapide (moins de 10 iterations ; une erreur de jacobien ralentit sans changer le resultat)', r.iter < 10, r.iter + ' iterations');
  console.log('     (iterations reseau exemple : ' + r.iter + ')');
  check('bilan des debits aux noeuds < 1e-9 m3/s', r.balance < 1e-9, String(r.balance));
  check('energie par tuyau (P_a - P_b = dP) < 0,01 Pa', r.energy < 0.01, String(r.energy));
  check('debit fourni = demande totale (70 m3/h)', rel(r.supplied * 3600, 70) < 1e-6, String(r.supplied * 3600));
  const dpb = r.pipes.map(p => p.dp);
  check('fermeture de la maille A-B-C (dP_AB + dP_BC - dP_AC = 0)', Math.abs(dpb[1] + dpb[5] - dpb[2]) < 0.5, String(dpb[1] + dpb[5] - dpb[2]));
  check('fermeture de la maille B-C-D', Math.abs(dpb[3] - dpb[4] - dpb[5]) < 0.5, String(dpb[3] - dpb[4] - dpb[5]));
  check('pression minimale > 0 et < pression source', r.pmin > 0 && r.pmin < 300000, String(r.pmin));
}

console.log('4) Comparaison a un 2e solveur (equations nodales, Newton, jacobien numerique) sur 40 reseaux aleatoires');
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function indep(net) {
  const fl = net.fluid, N = net.nodes.length, free = [], pos = [];
  net.nodes.forEach((n, i) => { if (n.type === 's') { pos.push(-1); } else { pos.push(free.length); free.push(i); } });
  const n = free.length, P = net.nodes.map(x => x.P);
  const dpOf = (p, q) => { const D = p.D, A = Math.PI * D * D / 4, v = Math.abs(q) / A, Re = v * D * fl.rho / fl.mu; const f = sj(Math.max(Re, 1), p.eps, D); return Math.sign(q) * (f * p.L / D + p.K) * fl.rho * v * v / 2; };
  const qOf = (p, dh) => { let lo = 0, hi = 1; while (dpOf(p, hi) < Math.abs(dh)) { hi *= 2; } for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (dpOf(p, m) < Math.abs(dh)) { lo = m; } else { hi = m; } } return Math.sign(dh) * (lo + hi) / 2; };
  const resid = () => { const r = new Array(n).fill(0); net.nodes.forEach((x, i) => { if (pos[i] >= 0) { r[pos[i]] -= x.dem; } }); net.pipes.forEach(p => { const q = qOf(p, P[p.a] - P[p.b]); if (pos[p.a] >= 0) { r[pos[p.a]] -= q; } if (pos[p.b] >= 0) { r[pos[p.b]] += q; } }); return r; };
  for (let it = 0; it < 60; it++) {
    const r0 = resid(), nr = Math.sqrt(r0.reduce((s, x) => s + x * x, 0));
    if (nr < 1e-13) { break; }
    const J = [];
    for (let j = 0; j < n; j++) { const sv = P[free[j]], dh = 1; P[free[j]] += dh; const r1 = resid(); P[free[j]] = sv; J.push(r1.map((x, i) => (x - r0[i]) / dh)); }
    const A = []; for (let i = 0; i < n; i++) { A.push([]); for (let j = 0; j < n; j++) { A[i].push(J[j][i]); } A[i].push(-r0[i]); }
    for (let c = 0; c < n; c++) { let m = c; for (let r = c + 1; r < n; r++) { if (Math.abs(A[r][c]) > Math.abs(A[m][c])) { m = r; } } const t = A[c]; A[c] = A[m]; A[m] = t; for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) { A[r][k] -= f * A[c][k]; } } }
    const x = new Array(n); for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let k = i + 1; k < n; k++) { s -= A[i][k] * x[k]; } x[i] = s / A[i][i]; }
    for (let j = 0; j < n; j++) { P[free[j]] += x[j]; }
  }
  return { P: P, q: net.pipes.map(p => qOf(p, P[p.a] - P[p.b])) };
}
{
  const R = rng(12345); let nb = 0, worstP = 0, worstQ = 0;
  for (let t = 0; t < 40; t++) {
    const nn = 4 + Math.floor(R() * 5), fk = ['w', 'g30', 'g40'][t % 3];
    const nodes = [{ type: 's', P: 400000 + R() * 200000, dem: 0 }];
    for (let i = 1; i < nn; i++) { nodes.push({ type: 'd', P: 0, dem: (8 + R() * 25) / 3600 }); }
    const pipes = []; for (let i = 1; i < nn; i++) { pipes.push([Math.floor(R() * i), i, 80 + R() * 300, [50, 65, 80, 100, 125][Math.floor(R() * 5)], 0.046, Math.floor(R() * 4)]); }
    const extra = 1 + Math.floor(R() * 3);
    for (let e = 0; e < extra; e++) { const a = Math.floor(R() * nn); let b = Math.floor(R() * nn); if (a === b) { b = (a + 1) % nn; } pipes.push([a, b, 80 + R() * 300, [50, 65, 80, 100][Math.floor(R() * 4)], 0.046, Math.floor(R() * 3)]); }
    const net = mk(FL[fk], nodes, pipes), r = S(net);
    if (r.error) { check('reseau ' + t + ' converge', false, r.error); continue; }
    const minRe = Math.min.apply(null, r.pipes.map(p => p.Re));
    if (minRe < 4500) { continue; }
    const ref = indep(net); nb++;
    let eP = 0; net.nodes.forEach((x, i) => { eP = Math.max(eP, Math.abs(r.P[i] - ref.P[i]) / Math.max(1, Math.abs(ref.P[i] - nodes[0].P) + 1000)); });
    let eQ = 0; net.pipes.forEach((p, k) => { eQ = Math.max(eQ, Math.abs(r.q[k] - ref.q[k]) / (Math.abs(ref.q[k]) + 1e-5)); });
    worstP = Math.max(worstP, eP); worstQ = Math.max(worstQ, eQ);
    check('reseau ' + t + ' (' + fk + ', ' + nn + ' noeuds) pressions', eP < 1e-4, 'ecart relatif ' + eP.toExponential(2));
    check('reseau ' + t + ' debits', eQ < 1e-4, 'ecart relatif ' + eQ.toExponential(2));
    check('reseau ' + t + ' bilan des debits', r.balance < 1e-9);
  }
  check('au moins 25 reseaux comparables', nb >= 25, nb + ' reseaux');
}

console.log('5) Zone de transition (2000 < Re < 4000) : continuite et monotonie de dP(Q)');
{
  const fl = FL.w, mkq = q => S(mk(fl, [{ type: 's', P: 900000, dem: 0 }, { type: 'd', P: 0, dem: q }], [[0, 1, 100, 50, 0.046, 0]])).pipes[0].dp;
  const Qre = Re => Re * Math.PI * 0.05 * fl.mu / (4 * fl.rho);
  let prev = 0, mono = true, jump = 0;
  for (let Re = 1000; Re <= 6000; Re += 25) { const d = mkq(Qre(Re)); if (d <= prev) { mono = false; } if (prev > 0) { jump = Math.max(jump, Math.abs(d / prev - 1) / (25 / Re)); } prev = d; }
  check('dP croit avec le debit de Re 1000 a 6000', mono);
  check('pas de saut de dP (pente locale bornee)', jump < 3.5, 'pente relative max ' + jump.toFixed(2));
}
console.log('6) Refus des cas singuliers');
{
  const r = S(mk(FL.w, [{ type: 'd', P: 0, dem: 0.001 }, { type: 'd', P: 0, dem: 0.001 }], [[0, 1, 100, 50, 0.046, 0]]));
  check('reseau sans source : erreur signalee', !!r.error, JSON.stringify(Object.keys(r)));
}
console.log(ko === 0 ? 'OK : ' + ok + ' verifications reussies.' : 'ECHEC : ' + ko + ' erreur(s) sur ' + (ok + ko) + '.');
process.exit(ko === 0 ? 0 : 1);
