// Thermosys - Tests de non-regression du « Vase d'expansion » et de la « Pompe / HMT » (RESEAUX HVAC)
// Usage (depuis le dossier files) :  node tests\vase_pompe_regression.js
//   ou avec un autre fichier :       node tests\vase_pompe_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou fonction illisible.
//
// Statut des references (rien n'est cache) :
//  - Masse volumique de l'eau : table du module comparee a IAPWS-95 via CoolProp 8.0.0 (valeurs figees ci-dessous, a 0,2 MPa).
//  - Coefficient de dilatation de l'eau (10 C -> T) : compare au tableau de Reflex (60 C : 1,66 % ... 120 C : 6,03 %) et a Flamco (80 C : 2,89 %).
//    Remarque : le tableau de Caleffi donne des valeurs plus fortes (80 C : 3,6 %) : il est plus prudent que la physique ; il n'est pas utilise ici.
//  - Formule du volume de vase : Vn = (Ve + Vr) x (pfin + 1) / (pfin - p0), identique chez Reflex, Caleffi et Flamco
//    (EN 12828 : texte de la norme non consulte, formule relevee chez les fabricants). Reserve d'eau Vr = 0,5 % du volume, 3 L minimum.
//  - Pression finale : soupape moins 0,5 bar (soupape <= 5 bar) ou moins 10 % (au-dessus) : Reflex et Caleffi.
//  - Pression de gonflage p0 : les fabricants different : hauteur statique (Flamco), statique + 0,2 bar avec minimum 1 bar (Reflex),
//    statique + 0,3 bar (Caleffi). Le module retient statique + 0,3 bar, minimum 1 bar (prudent).
//  - Pompe : puissance hydraulique rho g Q H (formule exacte) ; marge moteur 25 % (KSB : 10 a 20 % suffisent pour l'eau claire ; le module est
//    donc prudent) ; serie de moteurs IEC arrondie vers le haut.
//  - NON couvert : eau glycolee (le module suppose de l'eau pure : le coefficient de dilatation avec antigel est 20 a 60 % plus fort) ;
//    texte de la norme EN 12828 (non consulte).
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
h = h.replace(/\r\n/g, '\n');
let E;
try {
  const END = "].join('\\n');\n};";
  const a0 = h.indexOf('function lerp(tbl,x){'); const a0e = h.indexOf('\n', a0);
  const a1 = h.indexOf('var MOT=['); const a1e = h.indexOf(END, a1);
  const a2 = h.indexOf('var RHO=[[0,999.84]'); const a2e = h.indexOf(END, a2);
  if (a0 < 0 || a1 < 0 || a1e < 0 || a2 < 0 || a2e < 0 || !(a1 < a2)) { throw new Error('reperes introuvables'); }
  const src = h.slice(a0, a0e) + '\n' + h.slice(a1, a1e + END.length) + '\n' + h.slice(a2, a2e + END.length);
  const els = {}; const get = id => els[id] || (els[id] = { value: '', textContent: '' });
  const f = new Function('$', 'num', 'L', 'window', src + '\nreturn { pompe: window.calcPompe, vase: window.calcVase, RHO: RHO, VASES: VASES, MOT: MOT };');
  const win = {};
  const num = (id, def) => { const e = els[id]; if (!e) { return def; } const v = parseFloat(String(e.value).replace(',', '.')); return isFinite(v) ? v : def; };
  E = f(get, num, (fr, en) => fr, win);
  E.set = (id, v) => { get(id).value = String(v); };
  E.out = id => get(id).textContent;
  if (typeof E.vase !== 'function' || typeof E.pompe !== 'function') { throw new Error('fonctions absentes'); }
} catch (e) { console.error('Fonctions illisibles : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function rel(a, b) { return Math.abs(a / b - 1) * 100; }

console.log('1) Masse volumique de l\'eau contre IAPWS-95 (CoolProp 8.0.0), tolerance 0,02 %');
const IAPWS = { 0: 999.893, 10: 999.75, 20: 998.252, 30: 995.693, 40: 992.26, 50: 988.078, 60: 983.239, 70: 977.808, 80: 971.835, 90: 965.355, 100: 958.395, 110: 950.975, 120: 943.107 };
function rhoMod(T) { const t = E.RHO; for (let i = 1; i < t.length; i++) { if (T <= t[i][0]) { const a = t[i - 1], b = t[i]; return a[1] + (b[1] - a[1]) * (T - a[0]) / (b[0] - a[0]); } } return t[t.length - 1][1]; }
Object.keys(IAPWS).forEach(T => check('rho(' + T + ' C)', rel(rhoMod(+T), IAPWS[T]) < 0.02, rhoMod(+T) + ' vs ' + IAPWS[T]));
console.log('2) Coefficient de dilatation 10 C -> T contre Reflex / Flamco (ecart <= 0,05 point)');
const REFLEX = { 60: 1.66, 70: 2.24, 80: 2.88, 90: 3.58, 100: 4.34, 110: 5.15, 120: 6.03 };
Object.keys(REFLEX).forEach(T => { const b = (rhoMod(10) / rhoMod(+T) - 1) * 100; check('n(10 -> ' + T + ' C) = ' + REFLEX[T] + ' %', Math.abs(b - REFLEX[T]) <= 0.05, b.toFixed(3)); });

function vase(o) {
  E.set('vaseVol', o.V); E.set('vaseT1', o.T1); E.set('vaseT2', o.T2); E.set('vasePs', o.Ps); E.set('vasePmax', o.Pm);
  E.vase(); const t = E.out('vaseResult');
  const m = /CALCULÉ : (\d+) L/.exec(t), c = /retenu : (\d+) L/.exec(t), p = /gonflage : ([0-9.]+) bar abs/.exec(t), f = /P finale : ([0-9.]+) bar abs/.exec(t);
  return { txt: t, Vn: m ? +m[1] : null, com: c ? +c[1] : null, Pi: p ? +p[1] : null, Pf: f ? +f[1] : null, imp: /IMPOSSIBLE/.test(t) };
}
function indep(o) {
  const beta = rhoMod(o.T1) / rhoMod(o.T2) - 1, Pi = Math.max(o.Ps + 0.3, 1) + 1, dp = o.Pm <= 5 ? 0.5 : 0.1 * o.Pm, Pf = o.Pm - dp + 1;
  const Ve = o.V * beta, Vr = Math.max(3, 0.005 * o.V);
  return { Vn: (Ve + Vr) / (1 - Pi / Pf), Pi: Pi, Pf: Pf, Ve: Ve, Vr: Vr };
}
console.log('3) Exemple de calcul a la main (Reflex : 200 L, 90 C, soupape 3 bar, p0 = 1,0 bar relatif, pfin = 2,5 bar)');
const ex = vase({ V: 200, T1: 10, T2: 90, Ps: 0.7, Pm: 3 });
check('exemple : pression de gonflage 2,0 bar abs', ex.Pi === 2.0, String(ex.Pi));
check('exemple : pression finale 3,50 bar abs', ex.Pf === 3.5, String(ex.Pf));
check('exemple : volume calcule 24 L (23,6 a la main)', ex.Vn === 24, String(ex.Vn));
check('exemple : vase commercial 24 L', ex.com === 24, String(ex.com));
console.log('4) 120 cas recalcules de facon independante (volume, temperature, hauteur statique, soupape)');
let nb = 0;
[100, 500, 2000, 8000].forEach(V => [[10, 70], [10, 90], [5, 110]].forEach(T => [0.5, 1.5, 3].forEach(Ps => [3, 6, 10].forEach(Pm => {
  const o = { V: V, T1: T[0], T2: T[1], Ps: Ps, Pm: Pm }, r = vase(o), i = indep(o), tag = 'V=' + V + ' T ' + T[0] + '-' + T[1] + ' Ps=' + Ps + ' Pm=' + Pm + ' : ';
  const imp = i.Pf <= i.Pi + 0.2;
  check(tag + 'impossible coherent', r.imp === imp, 'module ' + r.imp + ' attendu ' + imp);
  if (imp || r.imp) { return; }
  nb++;
  check(tag + 'volume calcule (arrondi superieur)', r.Vn === Math.ceil(i.Vn), 'module ' + r.Vn + ' attendu ' + Math.ceil(i.Vn) + ' (exact ' + i.Vn.toFixed(2) + ')');
  check(tag + 'vase commercial >= volume et plus petit possible', E.VASES.indexOf(r.com) >= 0 || r.com % 500 === 0, String(r.com));
  check(tag + 'vase commercial >= volume calcule', r.com >= i.Vn - 1e-9, r.com + ' < ' + i.Vn.toFixed(2));
  check(tag + 'pressions', Math.abs(r.Pi - i.Pi) < 0.051 && Math.abs(r.Pf - i.Pf) < 0.011, r.Pi + '/' + r.Pf + ' vs ' + i.Pi + '/' + i.Pf);
}))));
check('au moins 80 cas exploitables', nb >= 80, nb + ' cas');
console.log('5) Sens physique et cas impossible');
const base = { V: 500, T1: 10, T2: 80, Ps: 1.5, Pm: 3 };
const v0 = vase(base).Vn;
check('volume x2 -> vase plus grand', vase(Object.assign({}, base, { V: 1000 })).Vn > v0);
check('T max plus haute -> vase plus grand', vase(Object.assign({}, base, { T2: 95 })).Vn > v0);
check('hauteur statique plus grande -> vase plus grand', vase(Object.assign({}, base, { Ps: 1.8 })).Vn > v0);
check('statique 2,0 bar avec soupape 3 bar : impossible (pression finale trop proche)', vase(Object.assign({}, base, { Ps: 2.0 })).imp);
check('soupape plus haute -> vase plus petit', vase(Object.assign({}, base, { Pm: 5 })).Vn < v0);
check('soupape trop basse -> IMPOSSIBLE', vase(Object.assign({}, base, { Ps: 2.8, Pm: 3 })).imp);
check('entrees invalides refusees (T2 <= T1)', /invalides/.test(vase(Object.assign({}, base, { T2: 5 })).txt));
check('pression de gonflage minimale 2,0 bar abs (1 bar relatif)', vase(Object.assign({}, base, { Ps: 0.2 })).Pi === 2.0);

console.log('6) Pompe / HMT');
function pompe(Q, H, eta) { E.set('pompeQ', Q); E.set('pompeHMT', H); E.set('pompeEta', eta); E.pompe(); const t = E.out('pompeResult'); const g = re => { const m = re.exec(t); return m ? parseFloat(m[1]) : null; }; return { txt: t, ph: g(/hydraulique : ([0-9.]+) kW/), ps: g(/arbre[^:]*: ([0-9.]+) kW/), pel: g(/absorbée[^:]*: ([0-9.]+) kW/), mot: g(/Moteur recommandé[^:]*: ([0-9.]+) kW/) }; }
const IEC = [0.09, 0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315];
check('serie moteurs IEC identique', JSON.stringify(E.MOT) === JSON.stringify(IEC));
let nbp = 0;
[[1, 5], [10, 15], [25, 30], [80, 25], [200, 40], [500, 60]].forEach(p => [50, 65, 80].forEach(eta => {
  const r = pompe(p[0], p[1], eta), ph = p[0] * p[1] * 1000 * 9.81 / 3600 / 1000, ps = ph / (eta / 100), tag = 'Q=' + p[0] + ' H=' + p[1] + ' eta=' + eta + ' : ';
  check(tag + 'puissance hydraulique', r.ph !== null && Math.abs(r.ph - ph) <= 0.0006 + 0.001 * ph, r.ph + ' vs ' + ph.toFixed(4));
  check(tag + 'puissance a l\'arbre', r.ps !== null && Math.abs(r.ps - ps) <= 0.0006 + 0.001 * ps, r.ps + ' vs ' + ps.toFixed(4));
  check(tag + 'puissance electrique (moteur 0,90)', r.pel !== null && Math.abs(r.pel - ps / 0.9) <= 0.0006 + 0.001 * ps, r.pel + ' vs ' + (ps / 0.9).toFixed(4));
  const need = ps * 1.25, exp = IEC.find(x => x >= need - 1e-9);
  check(tag + 'moteur = serie IEC superieure a 1,25 x arbre', r.mot === exp, r.mot + ' vs ' + exp);
  check(tag + 'marge moteur >= 20 % (KSB : 10 a 20 % suffisent)', r.mot === null || r.mot >= ps * 1.2, String(r.mot));
  nbp++;
}));
check('18 cas de pompe', nbp === 18);
check('exemple 10 m3/h, 15 m : 0,409 kW hydrauliques', Math.abs(pompe(10, 15, 65).ph - 0.409) < 0.001);
check('entrees invalides refusees (rendement > 100)', /invalides/.test(pompe(10, 15, 120).txt));
console.log(ko === 0 ? 'OK : ' + ok + ' verifications reussies.' : 'ECHEC : ' + ko + ' erreur(s) sur ' + (ok + ko) + '.');
process.exit(ko === 0 ? 0 : 1);
