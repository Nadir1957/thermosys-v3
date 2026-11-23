// Thermosys - Tests de non-regression du module « Electricite » (section des cables, IEC 60364-5-52)
// Usage (depuis le dossier files) :  node tests\electricity_regression.js
//   ou avec un autre fichier :       node tests\electricity_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// IMPORTANT - statut des references (rien n'est cache) :
//  [SOURCE] valeur comparee a une reproduction publique de la norme ou a un catalogue de fabricant (nom indique).
//  [VERROU] valeur non confirmee par une source ouverte dans ce test : elle est seulement verrouillee pour detecter une modification accidentelle.
//  Le texte officiel de l'IEC 60364-5-52 (payant) n'a pas pu etre consulte ; les tables B.52.4 et B.52.5 sont donc verifiees
//  par reproductions publiques et par deux fabricants concordants, pas par la norme elle-meme.
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');

function loadElec(file) {
  let h; try { h = fs.readFileSync(file, 'utf8'); } catch (e) { console.error('Fichier illisible : ' + file); process.exit(2); }
  const open = '<script id="elec-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
  if (a < 0 || b < 0) { console.error('Module electricite introuvable dans ' + file); process.exit(2); }
  const win = {};
  try { new Function('window', h.slice(a + open.length, b))(win); } catch (e) { console.error('Module illisible : ' + e.message); process.exit(2); }
  if (!win.ELEC) { console.error('Moteur ELEC non expose'); process.exit(2); }
  return win.ELEC;
}
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message + ' (module ancien ou incompatible)'); process.exit(1); });
const E = loadElec(htmlFile);
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function near(a, b, tol) { return Math.abs(a - b) <= tol; }
function tableEq(titre, mod, ref, cols) {
  let n = 0, bad = 0;
  Object.keys(ref).forEach(S => ref[S].forEach((v, k) => {
    if (v === null) { return; } n++;
    const got = mod[S] ? mod[S][cols ? cols[k] : k] : undefined;
    if (got !== v) { bad++; console.log('  ECART  ' + titre + ' S=' + S + ' colonne ' + (cols ? cols[k] : k) + ' : module ' + got + ', reference ' + v); }
  }));
  check(titre + ' (' + n + ' valeurs)', bad === 0, bad + ' ecart(s)');
}

// ───────── 1) Tables de courants admissibles ─────────
// Colonnes du module : A1 A2 B1 B2 C D1 D2
console.log('1) Tables de courants admissibles');
// [SOURCE] Electrical Installation Guide (Schneider), Fig. G20 = IEC 60364-5-52 B.52.4 ; cuivre PVC, 3 conducteurs charges
tableEq('Cuivre PVC 3 cond. (B.52.4)', E.CU3, {
  1.5: [13.5, 13, 15.5, 15, 17.5, 18, 19], 2.5: [18, 17.5, 21, 20, 24, 24, 24], 4: [24, 23, 28, 27, 32, 30, 33], 6: [31, 29, 36, 34, 41, 38, 41], 10: [42, 39, 50, 46, 57, 50, 54], 16: [56, 52, 68, 62, 76, 64, 70],
  25: [73, 68, 89, 80, 96, 82, 92], 35: [89, 83, 110, 99, 119, 98, 110], 50: [108, 99, 134, 118, 144, 116, 130], 70: [136, 125, 171, 149, 184, 143, 162], 95: [164, 150, 207, 179, 223, 169, 193], 120: [188, 172, 239, 206, 259, 192, 220],
  150: [216, 196, 262, 225, 299, 217, 246], 185: [245, 223, 296, 255, 341, 243, 278], 240: [286, 261, 346, 297, 403, 280, 320], 300: [328, 298, 394, 339, 464, 316, 359] });
// [SOURCE] Schneider Fig. G20 ; aluminium PVC, 3 conducteurs charges
tableEq('Aluminium PVC 3 cond. (B.52.4)', E.AL3, {
  16: [43, 41, 53, 48, 59, 50, 53], 25: [57, 53, 70, 62, 73, 64, 69], 35: [70, 65, 86, 77, 90, 77, 83], 50: [84, 78, 104, 92, 110, 91, 99], 70: [107, 98, 133, 116, 140, 112, 122], 95: [129, 118, 161, 139, 170, 132, 148],
  120: [149, 135, 186, 160, 197, 150, 169], 150: [170, 155, 204, 176, 227, 169, 189], 185: [194, 176, 230, 199, 259, 190, 214], 240: [227, 207, 269, 232, 305, 218, 250], 300: [261, 237, 306, 265, 351, 247, 282] });
// [SOURCE] ecalpro.com (IEC B.52.2) ; cuivre PVC, 2 conducteurs charges : A1 A2 B1 B2 C
tableEq('Cuivre PVC 2 cond. (B.52.2)', E.CU2, {
  1.5: [14.5, 14, 17.5, 16.5, 19.5], 2.5: [19.5, 18.5, 24, 23, 27], 4: [26, 25, 32, 30, 36], 6: [34, 32, 41, 38, 46], 10: [46, 43, 57, 52, 63], 16: [61, 57, 76, 69, 85], 25: [80, 75, 101, 90, 112], 35: [99, 92, 125, 111, 138],
  50: [119, 110, 151, 133, 168], 70: [151, 139, 192, 168, 213], 95: [182, 167, 232, 201, 258], 120: [210, 192, 269, 232, 299], 150: [240, 219, 300, 258, 344], 185: [273, 248, 341, 294, 392], 240: [320, 291, 400, 344, 461] });
// [SOURCE] Prysmian (A1, A2, B1..D2) et EUPEN (B1..D2), concordants ; cuivre XLPE, 3 conducteurs charges
tableEq('Cuivre XLPE 3 cond. (fabricants)', E.CUX3, {
  1.5: [17, 16.5, 20, 19.5, 22, 21, 23], 2.5: [23, 22, 28, 26, 30, 28, 30], 4: [31, 30, 37, 35, 40, 36, 39], 6: [40, 38, 48, 44, 52, 44, 49], 10: [54, 51, 66, 60, 71, 58, 65], 16: [73, 68, 88, 80, 96, 75, 84],
  25: [95, 89, 117, 105, 119, 96, 107], 35: [117, 109, 144, 128, 147, 115, 129], 50: [141, 130, 175, 154, 179, 135, 153], 70: [179, 164, 222, 194, 229, 167, 188], 95: [216, 197, 269, 233, 278, 197, 226], 120: [249, 227, 312, 268, 322, 223, 257],
  150: [285, 259, 342, 300, 371, 251, 287], 185: [324, 295, 384, 340, 424, 281, 324], 240: [380, 346, 450, 398, 500, 324, 375], 300: [435, 396, 514, 455, 576, 365, 419] });
// [SOURCE] EUPEN ; aluminium XLPE, 3 conducteurs charges : B1 B2 C D1 D2 (A1 et A2 : aucune table sourcee)
tableEq('Aluminium XLPE 3 cond. (EUPEN)', E.ALX3, {
  16: [null, null, 71, 64, 76, 59, 64], 25: [null, null, 93, 84, 90, 75, 82], 35: [null, null, 116, 103, 112, 90, 98], 50: [null, null, 140, 124, 136, 106, 117], 70: [null, null, 179, 156, 174, 130, 144], 95: [null, null, 217, 188, 211, 154, 172],
  120: [null, null, 251, 216, 245, 174, 197], 150: [null, null, 267, 240, 283, 197, 220], 185: [null, null, 300, 272, 323, 220, 250], 240: [null, null, 351, 318, 382, 253, 290], 300: [null, null, 402, 364, 440, 286, 326] });
// Coherence physique (detecte une faute de frappe dans une table) : le courant admissible croit avec la section ; XLPE >= PVC ; cuivre >= aluminium
(function () {
  const sizes = E.SIZES; let bad = 0;
  const mono = (T, nom, col) => { let prev = 0; sizes.forEach(S => { const v = T[S] ? T[S][col] : null; if (v == null) { return; } if (v <= prev) { bad++; console.log('  ECART  non croissant ' + nom + ' S=' + S + ' col ' + col); } prev = v; }); };
  [['CU3', E.CU3, 7], ['AL3', E.AL3, 7], ['CUX3', E.CUX3, 7], ['ALX3', E.ALX3, 7], ['CU2', E.CU2, 5]].forEach(p => { for (let c = 0; c < p[2]; c++) { mono(p[1], p[0], c); } });
  sizes.forEach(S => { if (E.CUX3[S] && E.CU3[S]) { E.CU3[S].forEach((v, c) => { if (E.CUX3[S][c] < v) { bad++; console.log('  ECART  XLPE < PVC cuivre S=' + S + ' col ' + c); } }); } });
  sizes.forEach(S => { if (E.AL3[S] && E.CU3[S]) { E.AL3[S].forEach((v, c) => { if (v > E.CU3[S][c]) { bad++; console.log('  ECART  aluminium > cuivre S=' + S + ' col ' + c); } }); } });
  check('Coherence physique des tables (croissance, XLPE >= PVC, Cu >= Al)', bad === 0, bad + ' anomalie(s)');
})();

// ───────── 2) Facteurs de correction ─────────
console.log('2) Facteurs de correction');
// [SOURCE] Schneider Fig. G12 (= B.52.14) : temperature ambiante dans l'air, base 30 C
const REF_AIR = { PVC: [[10, 1.22], [15, 1.17], [20, 1.12], [25, 1.06], [30, 1], [35, 0.94], [40, 0.87], [45, 0.79], [50, 0.71], [55, 0.61], [60, 0.50]], XLPE: [[10, 1.15], [15, 1.12], [20, 1.08], [25, 1.04], [30, 1], [35, 0.96], [40, 0.91], [45, 0.87], [50, 0.82], [55, 0.76], [60, 0.71], [65, 0.65], [70, 0.58], [75, 0.50], [80, 0.41]] };
['PVC', 'XLPE'].forEach(m => check('Temperature air ' + m + ' (B.52.14)', JSON.stringify(E.KAIR[m]) === JSON.stringify(REF_AIR[m])));
// [VERROU] temperature du sol (B.52.15), base 20 C : valeurs non confirmees par une source ouverte lue dans cette session
const REF_GND = { PVC: [[10, 1.10], [15, 1.05], [20, 1], [25, 0.95], [30, 0.89], [35, 0.84], [40, 0.77], [45, 0.71], [50, 0.63], [55, 0.55], [60, 0.45]], XLPE: [[10, 1.07], [15, 1.04], [20, 1], [25, 0.96], [30, 0.93], [35, 0.89], [40, 0.85], [45, 0.80], [50, 0.76], [55, 0.71], [60, 0.65], [65, 0.60], [70, 0.53], [75, 0.46], [80, 0.38]] };
['PVC', 'XLPE'].forEach(m => check('Temperature sol ' + m + ' (B.52.15) [VERROU]', JSON.stringify(E.KGND[m]) === JSON.stringify(REF_GND[m])));
// [SOURCE] Schneider Fig. G14 : resistivite thermique du sol [rho, fourreau, enterre direct]
check('Resistivite du sol (Fig. G14)', JSON.stringify(E.KSOIL) === JSON.stringify([[0.5, 1.28, 1.88], [0.7, 1.20, 1.62], [1, 1.18, 1.5], [1.5, 1.1, 1.28], [2, 1.05, 1.12], [2.5, 1, 1], [3, 0.96, 0.90]]));
// [SOURCE] Schneider Fig. G16 (= B.52.17) regroupement : 1..9, 12, 16, 20 circuits
const REF_GRP = { bunch: [1, 0.80, 0.70, 0.65, 0.60, 0.57, 0.54, 0.52, 0.50, 0.45, 0.41, 0.38], wall: [1, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.70], ceil: [0.95, 0.81, 0.72, 0.68, 0.66, 0.64, 0.63, 0.62, 0.61], perf: [1, 0.88, 0.82, 0.77, 0.75, 0.73, 0.73, 0.72, 0.72], ladder: [1, 0.87, 0.82, 0.80, 0.80, 0.79, 0.79, 0.78, 0.78] };
Object.keys(REF_GRP).forEach(k => check('Regroupement ' + k + ' (B.52.17)', REF_GRP[k].every((v, i) => E.GRP[k][i] === v)));
// [SOURCE] B.52.18 enterre, plusieurs circuits : Schneider Fig. G18 et Prysmian. Cas 16 circuits a 0,5 m : Prysmian = 0,68 ;
// Schneider imprime 0,38 (faute de frappe evidente, incoherente avec sa propre colonne) ; l'ancienne valeur du module (0,66) etait celle de 20 circuits.
const REF_GGND = { 2: [0.75, 0.80, 0.85, 0.90, 0.90], 3: [0.65, 0.70, 0.75, 0.80, 0.85], 4: [0.60, 0.60, 0.70, 0.75, 0.80], 5: [0.55, 0.55, 0.65, 0.70, 0.80], 6: [0.50, 0.55, 0.60, 0.70, 0.80], 7: [0.45, 0.51, 0.59, 0.67, 0.76], 8: [0.43, 0.48, 0.57, 0.65, 0.75], 9: [0.41, 0.46, 0.55, 0.63, 0.74], 12: [0.36, 0.42, 0.51, 0.59, 0.71], 16: [0.32, 0.38, 0.47, 0.56, 0.68], 20: [0.29, 0.35, 0.44, 0.53, 0.66] };
(function () { let bad = 0; Object.keys(REF_GGND).forEach(n => REF_GGND[n].forEach((v, i) => { if (E.GGND[n][i] !== v) { bad++; console.log('  ECART  B.52.18 ' + n + ' circuits, colonne ' + i + ' : module ' + E.GGND[n][i] + ', reference ' + v); } })); check('Enterre plusieurs circuits (B.52.18), 55 valeurs', bad === 0, bad + ' ecart(s)'); })();

// ───────── 3) Cas de dimensionnement calcules a la main ─────────
console.log('3) Cas de dimensionnement (calcul a la main a partir des tables ci-dessus)');
const base = { ph: 3, U: 400, mode: 'P', P: 15, I: 0, cos: 0.9, eta: 1, mat: 'Cu', ins: 'PVC', meth: 'C', grp: 'bunch', nc: 1, gsp: 0, Ta: 30, rs: 2.5, L: 20, dU: 5, dUpre: 0, Isc: 0, t: 0.1, curve: 'C', mu: 10, In: 0, S: 0, load: 'other', Id: 0, Icu: 0, mPE: 0 };
const run = o => E.size(Object.assign({}, base, o));
// Cas 1 : P = 15 kW, cos 0,9, 400 V triphase -> Ib = 15000/(racine3 x 400 x 0,9) = 24,06 A ; calibre normalise 25 A.
// Cuivre PVC methode C : 2,5 mm2 = 24 A (< 25) ; 4 mm2 = 32 A -> S = 4, Iz = 32.
let r = run({});
check('Cas 1 : Ib = 24,06 A', near(r.Ib, 24.056, 0.01), 'Ib = ' + r.Ib);
check('Cas 1 : calibre 25 A', r.In === 25);
check('Cas 1 : section 4 mm2 (limite : courant admissible)', r.S === 4 && r.bind === 'amp', 'S = ' + r.S + ', bind = ' + r.bind);
check('Cas 1 : Iz = 32 A', r.Iz === 32);
// Cas 2 : meme circuit en XLPE methode C : table fabricants 2,5 mm2 = 30 A >= 25 -> S = 2,5
r = run({ ins: 'XLPE' });
check('Cas 2 (XLPE, C) : section 2,5 mm2, Iz = 30 A', r.S === 2.5 && r.Iz === 30, 'S = ' + r.S + ', Iz = ' + r.Iz);
// Cas 3 : calibre 63 A, cuivre PVC B2, 40 C (0,87), 2 circuits groupes (0,80) -> k = 0,696 ; besoin 63/0,696 = 90,5 A ; B2 : 25 mm2 = 80 (<), 35 mm2 = 99 -> S = 35
r = run({ mode: 'I', I: 55, In: 63, meth: 'B2', Ta: 40, nc: 2, L: 10 });
check('Cas 3 : facteur total 0,696', near(r.kTot, 0.696, 0.001), 'kTot = ' + r.kTot);
check('Cas 3 : section 35 mm2', r.S === 35, 'S = ' + r.S);
// Cas 4 : 32 A sur 120 m, cuivre PVC C, disjoncteur courbe B (seuil magnetique 160 A), chute limite 3 % (12 V).
// rho(70 C) = 0,022147 ohm.mm2/m ; 10 mm2 : R = 0,2658 ohm -> 14,7 V = 3,68 % (> 3 %) ; 16 mm2 : R = 0,1661 ohm -> 9,21 V = 2,30 % -> S = 16.
// Le court-circuit minimal (443 A pour 16 mm2) depasse 160 A : il ne limite pas.
r = run({ mode: 'I', I: 32, In: 32, cos: 1, L: 120, dU: 3, curve: 'B' });
check('Cas 4 : section 16 mm2 limitee par la chute de tension', r.S === 16 && r.bind === 'drop', 'S = ' + r.S + ', bind = ' + r.bind);
check('Cas 4 : chute de tension 2,30 %', near(r.dPct, 2.30, 0.02), 'dPct = ' + r.dPct);
// Cas 5 : aluminium XLPE methode A1, 50 A -> pas de table sourcee : valeurs aluminium PVC (25 mm2 = 57 A >= 50)
r = run({ mat: 'Al', ins: 'XLPE', meth: 'A1', mode: 'I', I: 45, In: 50, L: 10 });
check('Cas 5 : Al XLPE A1 = repli prudent (aluminium PVC), 25 mm2, Iz = 57 A', r.S === 25 && r.Iz === 57, 'S = ' + r.S + ', Iz = ' + r.Iz);
check('Cas 5 : repli signale (xlpeFallback)', E.xlpeFallback('Al', 3, 'A1') === true && E.xlpeFallback('Al', 3, 'A2') === true && E.xlpeFallback('Al', 3, 'B1') === false && E.xlpeFallback('Cu', 3, 'C') === false && E.xlpeFallback('Cu', 2, 'C') === true);
// Cas 6 : monophase XLPE cuivre (2 conducteurs charges) : repli sur la table a 3 conducteurs (plus prudente)
r = run({ ph: 1, U: 230, mode: 'I', I: 28, In: 30, ins: 'XLPE', meth: 'C', cos: 1, L: 10 });
check('Cas 6 : monophase XLPE C, 30 A -> 2,5 mm2 (30 A, table a 3 conducteurs)', r.S === 2.5 && r.Iz === 30, 'S = ' + r.S + ', Iz = ' + r.Iz);
// Cas 7 : enterre D2, 16 circuits, ecart 0,5 m -> facteur 0,68 ; sol 2,5 K.m/W donc pas de correction de sol
r = run({ meth: 'D2', nc: 16, gsp: 4, mode: 'I', I: 20, In: 20, Ta: 20 });
check('Cas 7 : facteur de regroupement enterre 16 circuits a 0,5 m = 0,68', r.kG === 0.68 && r.kS === 1, 'kG = ' + r.kG + ', kS = ' + r.kS);

// Cas 8 : 32 A sur 200 m, courbe C (seuil magnetique 10 x 32 = 320 A). Court-circuit minimal : 16 mm2 -> 133 A (< 320) ; 25 mm2 (PE 16, m = 1,5625) :
// 0,8 x 230,94 x 25 / (1,5 x 0,01851 x 2,5625 x 200) = 324,6 A (>= 320) -> S = 25, limite par la protection contre les courts-circuits.
r = run({ mode: 'I', I: 32, In: 32, cos: 1, L: 200 });
check('Cas 8 : section 25 mm2 limitee par le court-circuit minimal', r.S === 25 && r.bind === 'mag', 'S = ' + r.S + ', bind = ' + r.bind);
check('Cas 8 : Isc minimal 324,6 A et seuil 320 A', near(r.IscMin, 324.6, 0.2) && r.Imag === 320, 'IscMin = ' + r.IscMin + ', Imag = ' + r.Imag);

// ───────── 4) Formules independantes ─────────
console.log('4) Formules (recalculees ici de facon independante)');
// Chute de tension : dU = racine3 . Ib . (R cos + X sin) ; R = rho(theta) . L / S, rho20 = 0,01851 ohm.mm2/m, alpha = 0,00393, theta = 70 C (PVC), X = 0,08 mohm/m
(function () {
  const rho = 0.01851 * (1 + 0.00393 * (70 - 20)), L = 100, S = 16, Ib = 32, cos = 0.8;
  const attendu = Math.sqrt(3) * Ib * (rho * L / S * cos + 0.00008 * L * Math.sqrt(1 - cos * cos));
  const got = E.dropV({ mat: 'Cu', ins: 'PVC', L: L, ph: 3 }, S, Ib, cos);
  check('Chute de tension triphasee, 16 mm2, 100 m, 32 A, cos 0,8', near(got, attendu, 1e-6), got + ' V contre ' + attendu);
  const attMono = 2 * Ib * (rho * L / S * cos + 0.00008 * L * Math.sqrt(1 - cos * cos));
  check('Chute de tension monophasee', near(E.dropV({ mat: 'Cu', ins: 'PVC', L: L, ph: 1 }, S, Ib, cos), attMono, 1e-6));
  const attXl = Math.sqrt(3) * Ib * (0.01851 * (1 + 0.00393 * 70) * L / S);
  check('Chute de tension XLPE (90 C)', near(E.dropV({ mat: 'Cu', ins: 'XLPE', L: L, ph: 3 }, S, Ib, 1), attXl, 1e-6));
})();
// Courant de court-circuit minimal (methode conventionnelle TN) : 0,8 . U0 . S / (1,5 . rho20 . (1 + m) . L), m = S / S_PE
(function () {
  const U0 = 400 / Math.sqrt(3), S = 16, L = 100, m = 1;
  const attendu = 0.8 * U0 * S / (1.5 * 0.01851 * (1 + m) * L);
  check('Court-circuit minimal 16 mm2, 100 m (TN)', near(E.iscMin({ ph: 3, U: 400, mat: 'Cu', L: L, mPE: 0 }, S), attendu, 1e-6), E.iscMin({ ph: 3, U: 400, mat: 'Cu', L: L, mPE: 0 }, S) + ' A contre ' + attendu);
})();
// Conducteur de protection (IEC 60364-5-54, tableau 54.2)
(function () {
  const att = { 1.5: 1.5, 6: 6, 16: 16, 25: 16, 35: 16, 50: 25, 70: 35, 95: 50, 120: 70, 150: 95, 185: 95, 240: 120, 300: 150 };
  const bad = Object.keys(att).filter(S => E.peSize(+S) !== att[S]);
  check('Section du conducteur de protection (13 cas)', bad.length === 0, 'ecarts : ' + bad.join(','));
})();

console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
