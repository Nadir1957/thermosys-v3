// Thermosys - Test des lois de COP (pompe a chaleur air-air en chauffage, groupe froid en refroidissement)
// Compare hpCop et copFactor a des tableaux de constructeurs publies (Carrier 50VT-C et 50VR-A, taille 36, air-air ; Wolf FHA et Stiebel Eltron WPL 25, air-eau).
// Usage (depuis le dossier files) :  node tests\cop_lois_regression.js
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
if (!fs.existsSync(file)) { console.error('Fichier introuvable : ' + file); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');
let bad = 0, nb = 0;
function ok(c, m) { nb++; if (!c) { bad++; console.log('ECHEC : ' + m); } }
function grab(re, what) { const m = html.match(re); if (!m) { console.log('ECHEC : ' + what + ' introuvable'); process.exit(3); } return m[0]; }
const srcCF = grab(/function copFactor\(T, plr\) \{[\s\S]*?\n  \}/, 'copFactor');
const srcHP = grab(/function hpCop\(c, T\) \{[^\n]*\}/, 'hpCop');
function build(a, b) { return new Function(a + '\n' + b + '\nreturn {copFactor: copFactor, hpCop: hpCop};')(); }
// ---- donnees publiees (valeurs recopiees des fiches, Btuh/MBtuh -> kW : x 0,29307) ----
const K = 0.29307, f2c = F => (F - 32) / 1.8;
const heatF = [-10, 0, 10, 20, 30, 40, 50, 60];
const A = { cap: [8.55, 11.77, 15.57, 19.93, 25.40, 30.44, 36.14, 42.89], p: [2.10, 2.20, 2.30, 2.40, 2.54, 2.66, 2.80, 2.99] };
const B = { cap: [8.76, 12.00, 15.69, 20.46, 24.83, 29.88, 35.81, 43.10], integ: [8.06, 11.04, 14.41, 18.55, 21.75, 29.88, 35.81, 43.10], p: [2.10, 2.23, 2.34, 2.46, 2.55, 2.65, 2.77, 2.92] };
const coolF = [75, 85, 95, 105, 115, 125];
const C1 = { cap: [40.37, 37.29, 34.20, 31.11, 28.01, 24.89], p: [2.34, 2.64, 2.97, 3.36, 3.81, 4.32] };
const C2 = { cap: [39.95, 36.97, 34.00, 31.02, 28.01, 25.00], p: [2.45, 2.63, 2.83, 3.05, 3.30, 3.57] };
// Carrier 50VR-A36 deux etages, meme tableau : etage bas a 900 cfm (capacite MBtuh, puissance systeme kW)
const C2b = { cap: [39.95, 36.97, 34.00, 31.02, 28.01, 25.00], p: [2.45, 2.63, 2.83, 3.05, 3.30, 3.57] };
const LO = { cap: [28.14, 26.37, 24.54, 22.65, 20.65, 18.57], p: [1.57, 1.74, 1.94, 2.15, 2.40, 2.67] };
const WOLF = [[4.7, 3.5, 3.1], [5.2, 3.5, 2.8], [4.9, 4.3, 2.9], [5.0, 3.4, 2.6], [5.2, 3.5, 2.6]];   // COP A7, A2, A-7 (A-7 = puissance maximale)
const STIEBEL = [5.09, 4.14, 2.93];
function interp(x, xs, ys) { for (let i = 0; i < xs.length - 1; i++) if (x >= xs[i] && x <= xs[i + 1]) return ys[i] + (x - xs[i]) / (xs[i + 1] - xs[i]) * (ys[i + 1] - ys[i]); return NaN; }
function devHeat(m, capArr) {
  const cop = capArr.map((c, i) => c * K / (capArr === B.integ ? B.p[i] : (capArr === A.cap ? A.p[i] : B.p[i])));
  const ref = interp(44.6, heatF, cop), out = [];
  heatF.forEach((F, i) => { const T = f2c(F); out.push({ T, dev: (m.hpCop({ copH: 100 }, T) / 100 / (cop[i] / ref) - 1) * 100, ratio: cop[i] / ref }); });
  return out;
}
function devCool(m, D) {
  const e = D.cap.map((c, i) => c / D.p[i]), ref = e[2];
  return coolF.map((F, i) => ({ T: f2c(F), dev: (m.copFactor(f2c(F), 1) / (e[i] / ref) - 1) * 100 }));
}
function run(m, tag, strict) {
  const inR = (r, lo, hi) => r.filter(x => x.T >= lo && x.T <= hi);
  // chauffage, plage -18 a 16 C
  const lim = (rows, lo, hi, tol, name) => inR(rows, lo, hi).forEach(x => ok(Math.abs(x.dev) <= tol, tag + name + ' ' + x.T.toFixed(1) + ' C : ecart ' + x.dev.toFixed(1) + ' % > ' + tol + ' %'));
  lim(devHeat(m, A.cap), -18, 16, 11, 'chauffage A capacite totale');
  lim(devHeat(m, B.cap), -18, 16, 11, 'chauffage B capacite totale');
  lim(devHeat(m, B.integ), -18, 16, 13, 'chauffage B capacite integree (givrage)');
  // refroidissement
  lim(devCool(m, C2), 23, 53, 6, 'froid C2');
  lim(devCool(m, C2), 46, 47, 4, 'froid C2 a 46 C (serre)');
  lim(devCool(m, C1), 23, 47, 15, 'froid C1');
  lim(devCool(m, C1), 51, 53, 20.5, 'froid C1 haut');
  // plafond / plancher documentes
  const lowA = devHeat(m, A.cap)[0].dev, lowI = devHeat(m, B.integ)[0].dev;
  ok(lowA > 13 && lowA < 21, tag + 'a -23 C le plancher (0,4) surestime : ' + lowA.toFixed(1) + ' %');
  ok(lowI > 23 && lowI < 27, tag + 'a -23 C avec givrage : ' + lowI.toFixed(1) + ' %');
  // charge partielle : etage bas / etage haut a meme temperature exterieure (unite a deux etages, charge 0,70 a 0,74)
  [0, 2, 5].forEach(i => {
    const lo = LO.cap[i] / LO.p[i], hi = C2b.cap[i] / C2b.p[i], plr = LO.cap[i] / C2b.cap[i];
    const d = (m.copFactor(f2c(coolF[i]), plr) / m.copFactor(f2c(coolF[i]), 1) / (lo / hi) - 1) * 100;
    ok(d >= -8 && d <= 2, tag + 'charge partielle ' + f2c(coolF[i]).toFixed(1) + ' C, charge ' + plr.toFixed(2) + ' : ecart ' + d.toFixed(1) + ' %');
  });
  // temperature, etage bas (reference 95 F)
  const eLo = LO.cap.map((c, i) => c / LO.p[i]);
  coolF.forEach((F, i) => { const T = f2c(F), d = (m.copFactor(T, 1) / (eLo[i] / eLo[2]) - 1) * 100; if (T >= 23 && T <= 53) ok(Math.abs(d) <= 10, tag + 'froid etage bas ' + T.toFixed(1) + ' C : ecart ' + d.toFixed(1) + ' %'); });
  // forme de la loi de charge (unite a capacite variable)
  ok(m.copFactor(35, 0.75) === 1 && m.copFactor(35, 1) === 1, tag + 'g = 1 a partir de 75 % de charge');
  ok(Math.abs(m.copFactor(35, 0.5) - 1.15) < 1e-12 && Math.abs(m.copFactor(35, 0.25) - 0.95) < 1e-12 && Math.abs(m.copFactor(35, 0) - 0.6) < 1e-12 && Math.abs(m.copFactor(35, 0.125) - 0.775) < 1e-12, tag + 'g(0,5)=1,15 ; g(0,25)=0,95 ; g(0,125)=0,775 ; g(0)=0,6');
  // air-eau : la loi air-air surestime
  const c = { copH: 100 }, a2 = WOLF.map(r => r[1] / r[0]).concat(STIEBEL[1] / STIEBEL[0]), a7m = WOLF.map(r => r[2] / r[0]).concat(STIEBEL[2] / STIEBEL[0]);
  const mean = v => v.reduce((s, x) => s + x, 0) / v.length, mA2 = mean(a2), mA7 = mean(a7m);
  const d2 = (m.hpCop(c, 2) / 100 / mA2 - 1) * 100, d7 = (m.hpCop(c, -7) / 100 / mA7 - 1) * 100;
  ok(d2 > 15 && d2 < 20, tag + 'air-eau A2 : surestimation moyenne ' + d2.toFixed(1) + ' %');
  ok(d7 > 12 && d7 < 18, tag + 'air-eau A-7 : surestimation moyenne ' + d7.toFixed(1) + ' %');
}
const m0 = build(srcCF, srcHP);
run(m0, '', true);
// proprietes de forme
ok(Math.abs(m0.hpCop({ copH: 3.2 }, 7) - 3.2) < 1e-12, 'COP a 7 C = valeur saisie');
ok(m0.hpCop({ copH: 2 }, -40) === 1, 'plancher 1 (appoint electrique)');
ok(Math.abs(m0.hpCop({ copH: 3.2 }, 100) - 4.8) < 1e-12, 'plafond 1,5 x nominal');
ok(m0.hpCop({}, 7) === 3, 'COP par defaut 3');
ok(Math.abs(m0.copFactor(35, 1) - 1) < 1e-12, 'facteur 1 a 35 C pleine charge');
ok(m0.copFactor(-20, 1) === 1.5 && m0.copFactor(80, 1) === 0.6, 'bornes 0,6 et 1,5');
// mutations : chaque variante doit faire echouer au moins un controle
const muts = [
  [srcHP, srcHP.replace('0.025', '0.02'), 'hp pente 2,0 %'], [srcHP, srcHP.replace('0.025', '0.03'), 'hp pente 3,0 %'],
  [srcHP, srcHP.replace('(T - 7)', '(T - 10)'), 'hp reference 10 C'], [srcHP, srcHP.replace('Math.max(0.4,', 'Math.max(0.6,'), 'hp plancher 0,6'],
  [srcHP, srcHP.replace('Math.min(1.5,', 'Math.min(1.2,'), 'hp plafond 1,2'], [srcHP, srcHP.replace('Math.max(1,', 'Math.max(0.5,'), 'hp plancher COP 0,5'],
  [srcHP, srcHP.replace('1 + 0.025', '1 - 0.025'), 'hp signe'],
  [srcCF, srcCF.replace('0.025', '0.02'), 'froid pente 2,0 %'], [srcCF, srcCF.replace('0.025', '0.03'), 'froid pente 3,0 %'],
  [srcCF, srcCF.replace('(T - 35)', '(T - 32)'), 'froid reference 32 C'], [srcCF, srcCF.replace('Math.max(0.6,', 'Math.max(0.8,'), 'froid plancher 0,8'],
  [srcCF, srcCF.replace('Math.min(1.5,', 'Math.min(1.2,'), 'froid plafond 1,2'],
  [srcCF, srcCF.replace('1 + 0.15 *', '1 + 0.3 *'), 'charge partielle palier 75-50 %'], [srcCF, srcCF.replace('1.15 - 0.2 *', '1.15 - 0.4 *'), 'charge partielle palier 50-25 %'], [srcCF, srcCF.replace('0.6 + 0.35 *', '0.6 + 0.2 *'), 'charge partielle sous 25 %']
];
muts.forEach(x => {
  if (x[0] === x[1]) { ok(false, 'mutation sans effet : ' + x[2]); return; }
  const before = bad, snap = nb; let mm;
  const a = x[0] === srcHP ? srcCF : x[1], b = x[0] === srcHP ? x[1] : srcHP;
  mm = build(x[0] === srcHP ? srcCF : x[1], x[0] === srcHP ? x[1] : srcHP);
  const save = console.log; console.log = () => {};
  run(mm, '', false);
  // controles de forme sur le mutant
  const shape = [Math.abs(mm.hpCop({ copH: 3.2 }, 7) - 3.2) < 1e-12, mm.hpCop({ copH: 2 }, -40) === 1, Math.abs(mm.hpCop({ copH: 3.2 }, 100) - 4.8) < 1e-12, Math.abs(mm.copFactor(35, 1) - 1) < 1e-12, mm.copFactor(-20, 1) === 1.5 && mm.copFactor(80, 1) === 0.6, Math.abs(mm.copFactor(35, 0.5) - 1.15) < 1e-12, Math.abs(mm.copFactor(35, 0.25) - 0.95) < 1e-12, Math.abs(mm.copFactor(35, 0) - 0.6) < 1e-12, Math.abs(mm.copFactor(35, 0.125) - 0.775) < 1e-12, mm.copFactor(35, 0.75) === 1];
  console.log = save;
  const killed = bad > before || shape.some(v => !v);
  bad = before; nb = snap;                 // les echecs du mutant ne comptent pas comme echecs du test
  ok(killed, 'mutant survivant : ' + x[2]);
});
if (bad) { console.log('\n' + bad + ' ECHEC(S) sur ' + nb + ' verifications'); process.exit(1); }
console.log('TOUT EST BON : ' + nb + ' verifications, ' + muts.length + ' mutations tuees');
