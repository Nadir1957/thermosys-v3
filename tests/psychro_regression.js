// Thermosys - Tests de non-regression de la « Psychrometrie » (air humide) contre CoolProp, Murphy-Koop et l'atmosphere standard
// Usage (depuis le dossier files) :  node tests\psychro_regression.js
//   ou avec un autre fichier :       node tests\psychro_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou moteur illisible.
//
// Statut des references (rien n'est cache) :
//  - Air humide : CoolProp 8.0.0 (HAPropsSI, equations IAPWS avec facteur d'augmentation), 140 etats : 4 pressions (niveau de la mer,
//    1000, 2000 et 3000 m) x 7 temperatures (-10 a 50 C) x 5 humidites relatives. Valeurs figees ci-dessous.
//  - ECART CONNU, NON CORRIGE : le moteur utilise la loi des gaz parfaits (pas de facteur d'augmentation de la vapeur d'eau). Il en
//    resulte une teneur en eau W plus basse de 0,33 a 0,62 % que CoolProp, et une enthalpie plus basse jusqu'a 1,6 kJ/kg pour l'air
//    sature a 50 C. L'ASHRAE indique que les relations de gaz parfaits donnent des ecarts de cet ordre. Les tolerances ci-dessous
//    (W 0,7 % ; h 1,6 kJ/kg) en tiennent compte : elles ne disent PAS que le moteur est exact a mieux de 0,7 %.
//  - Pression de saturation : au-dessus de 0 C comparee a CoolProp (IAPWS) ; au-dessous de 0 C (sublimation) comparee a la formule de
//    Murphy et Koop (2005) calculee dans ce test.
//  - Pression selon l'altitude : valeurs de l'atmosphere standard internationale (OACI/ISO 2533), figees ci-dessous.
//  - Temperature humide : le module utilise l'equation du psychrometre ASHRAE ; comparee a la temperature humide thermodynamique de CoolProp.
//  - Procedes (melange, humidification adiabatique, batterie, vapeur) : bilans recalcules independamment ; melange et humidification
//    adiabatique compares a CoolProp.
//  - Trois autres modules recopient une partie de ce moteur (traitement d'air, calcul horaire : identiques ; chambre froide : formule de Magnus, ecart <= 0,3 %).
//    Quand le point de rosee est sous 0 C, la chambre froide le calcule sur l'eau liquide et non sur la glace : ecart constate jusqu'a 3,7 K (non corrige).
//  - Non teste : l'interface, le diagramme, les textes.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
let PSY;
try {
  const a = h.indexOf('/* Thermosys - PSYCHRO : moteur psychrometrique'), endMark = "})(typeof window !== 'undefined' ? window : globalThis);", b = h.indexOf(endMark, a);
  if (a < 0 || b < 0) { throw new Error('moteur psychrometrique introuvable'); }
  const win = {};
  new Function('window', h.slice(a, b + endMark.length))(win);
  PSY = win.PSY;
  if (!PSY || typeof PSY.state !== 'function') { throw new Error('moteur absent'); }
} catch (e) { console.error('Moteur illisible : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function rel(a, b) { return Math.abs(a / b - 1) * 100; }

console.log('1) Pression de saturation de la vapeur d\'eau');
const PS = [[0, 611.2105], [5, 872.5751], [10, 1228.199], [15, 1705.793], [20, 2339.318], [25, 3169.929], [30, 4246.971], [40, 7384.938], [50, 12351.95], [60, 19946.43], [70, 31200.93], [80, 47414.47], [90, 70181.77], [100, 101418.0]];
PS.forEach(r => check('psat ' + r[0] + ' C (liquide, IAPWS 0,1 %)', rel(PSY.psat(r[0]), r[1]) < 0.1, 'module ' + PSY.psat(r[0]).toFixed(3) + ' ref ' + r[1]));
const MK = T => { const K = T + 273.15; return Math.exp(9.550426 - 5723.265 / K + 3.53068 * Math.log(K) - 0.00728332 * K); };
check('formule de Murphy-Koop : 611,15 Pa a 0 C (controle de la reference)', Math.abs(MK(0) - 611.15) < 1, String(MK(0)));
[-40, -30, -20, -10, -5, -1].forEach(T => check('psat ' + T + ' C (glace, Murphy-Koop 0,3 %)', rel(PSY.psat(T), MK(T)) < 0.3, 'module ' + PSY.psat(T).toFixed(3) + ' ref ' + MK(T).toFixed(3)));
check('psat croit avec la temperature', (() => { let p = 0; for (let T = -40; T <= 100; T += 5) { const x = PSY.psat(T); if (!(x > p)) { return false; } p = x; } return true; })());
check('psat continu autour de 0 C (< 2 %)', rel(PSY.psat(0.001), PSY.psat(-0.001)) < 2);

console.log('2) Etats de l\'air humide contre CoolProp (140 etats : P, T, HR -> W, h, v, point de rosee, temperature humide)');
const REF = [[101325,-10,10.0,0.0001602476,-9.65834,0.7451136,-33.60751,-13.00396],[101325,-10,30.0,0.0004809907,-8.862377,0.7454968,-22.89652,-12.31964],[101325,-10,50.0,0.0008020648,-8.065627,0.7458803,-17.58281,-11.64485],[101325,-10,80.0,0.001284297,-6.869024,0.7464563,-12.48994,-10.65069],[101325,-10,100.0,0.001606201,-6.070301,0.7468407,-10.0,-10.0],[101325,0,10.0,0.0003769362,0.9424692,0.7738057,-25.35339,-5.593178],[101325,0,30.0,0.001132181,2.830731,0.7747425,-13.87318,-4.263324],[101325,0,50.0,0.001889261,4.723437,0.7756814,-8.163785,-2.98447],[101325,0,80.0,0.003028337,7.570864,0.7770936,-2.682834,-1.158428],[101325,0,100.0,0.003790035,9.474751,0.7780377,-1.465689e-07,1.705303e-13],[101325,10,10.0,0.0007578614,11.96659,0.8027216,-18.18288,1.444558],[101325,10,30.0,0.002279139,15.79832,0.804678,-6.010201,3.54808],[101325,10,50.0,0.003807867,19.64837,0.8066434,0.06420459,5.528289],[101325,10,80.0,0.006115051,25.45808,0.8096083,6.713492,8.287834],[101325,10,100.0,0.007662649,29.3545,0.8115962,10.0,10.0],[101325,20,10.0,0.001445181,23.78473,0.832074,-11.18179,7.579765],[101325,20,30.0,0.004355786,31.1698,0.8359498,1.917338,10.84051],[101325,20,50.0,0.007293698,38.62284,0.8398598,9.274426,13.77647],[101325,20,80.0,0.01175261,49.93196,0.8457905,16.44792,17.67736],[101325,20,100.0,0.0147605,57.55917,0.8497886,20.0,20.0],[101325,30,10.0,0.002629291,36.90153,0.862168,-4.346908,13.21326],[101325,30,30.0,0.007955134,50.51329,0.8695017,10.55331,17.96148],[101325,30,50.0,0.01337259,64.35568,0.8769559,18.45083,22.00088],[101325,30,80.0,0.02167577,85.56485,0.8883703,26.1704,27.09063],[101325,30,100.0,0.02733286,100.0105,0.89614,30.0,30.0],[101325,40,10.0,0.004588159,52.06135,0.8934676,2.640925,18.54756],[101325,40,30.0,0.0139706,76.21408,0.9068118,19.13529,25.08884],[101325,40,50.0,0.02363833,101.0924,0.9205474,27.59277,30.30606],[101325,40,80.0,0.03870394,139.8443,0.9419242,35.88062,36.5518],[101325,40,100.0,0.04914449,166.688,0.9567195,40.0,40.0],[101325,50,10.0,0.007716365,70.33175,0.9266587,10.10302,23.75977],[101325,50,30.0,0.02373812,111.8705,0.9501679,27.66219,32.33265],[101325,50,50.0,0.04059652,155.5574,0.9748692,36.69925,38.73124],[101325,50,80.0,0.067602,225.4984,1.014368,45.57807,46.06004],[101325,50,100.0,0.08686289,275.3532,1.042492,50.0,50.0],[89875,-10,10.0,0.0001805862,-9.574101,0.840138,-33.60633,-13.28755],[89875,-10,30.0,0.0005420734,-8.676979,0.8406251,-22.89587,-12.53521],[89875,-10,50.0,0.0009039809,-7.778852,0.8411126,-17.58243,-11.79528],[89875,-10,80.0,0.001447632,-6.429774,0.841845,-12.48981,-10.70875],[89875,-10,100.0,0.001810594,-5.529128,0.8423338,-10.0,-10.0],[89875,0,10.0,0.000424813,1.0936,0.872514,-25.35222,-6.030044],[89875,0,30.0,0.001276182,3.222297,0.873705,-13.87253,-4.582283],[89875,0,50.0,0.002129884,5.356664,0.874899,-8.163408,-3.198264],[89875,0,80.0,0.003414831,8.568894,0.8766956,-2.682711,-1.236167],[89875,0,100.0,0.004274407,10.71754,0.8778971,-3.291842e-08,1.136868e-13],[89875,10,10.0,0.0008542269,12.23863,0.9051766,-18.18155,0.8441191],[89875,10,30.0,0.00256974,16.5598,0.9076646,-6.009398,3.123646],[89875,10,50.0,0.004294729,20.90432,0.9101655,0.06467528,5.252189],[89875,10,80.0,0.006900156,27.46534,0.9139413,6.713647,8.191404],[89875,10,100.0,0.008649184,31.86911,0.916475,10.0,10.0],[89875,20,10.0,0.001629217,24.27913,0.9383961,-11.18045,6.855191],[89875,20,30.0,0.004913394,32.61242,0.9433277,1.918116,10.36361],[89875,20,50.0,0.008232347,41.03247,0.9483089,9.27488,13.48508],[89875,20,80.0,0.0132772,53.82826,0.9558757,16.44806,17.58333],[89875,20,100.0,0.01668555,62.47133,0.9609847,20.0,20.0],[89875,30,10.0,0.002964896,37.7851,0.9725608,-4.345601,12.40378],[89875,30,30.0,0.008980308,53.15988,0.9819014,10.55402,17.47608],[89875,30,50.0,0.01511265,68.82956,0.9914165,18.45122,21.72499],[89875,30,80.0,0.024538,92.90612,1.006028,26.17051,27.00843],[89875,30,100.0,0.03097805,109.3518,1.016002,30.0,30.0],[89875,40,10.0,0.005175913,53.59895,1.008263,2.642083,17.69624],[89875,40,30.0,0.01579056,80.92471,1.025286,19.1358,24.63133],[89875,40,50.0,0.02677072,109.1815,1.042877,27.59299,30.06423],[89875,40,80.0,0.0439687,153.4201,1.070395,35.88065,36.48455],[89875,40,100.0,0.05594972,184.2259,1.089541,40.0,40.0],[89875,50,10.0,0.008710312,72.93254,1.046379,10.10369,22.90734],[89875,50,30.0,0.02688395,120.052,1.076448,27.6622,31.92523],[89875,50,50.0,0.0461361,169.9441,1.108257,36.69904,38.52931],[89875,50,80.0,0.07725629,250.5452,1.159585,45.5779,46.00671],[89875,50,100.0,0.09966541,308.552,1.196483,50.0,50.0],[79495,-10,10.0,0.0002040891,-9.485155,0.9499462,-33.60526,-13.59747],[79495,-10,30.0,0.0006126693,-8.471111,0.9505688,-22.89529,-12.7698],[79495,-10,50.0,0.001021786,-7.455777,0.9511922,-17.58209,-11.95828],[79495,-10,80.0,0.001636471,-5.930354,0.9521286,-12.4897,-10.77125],[79495,-10,100.0,0.002046936,-4.911786,0.9527538,-10.0,-10.0],[79495,0,10.0,0.0004801438,1.260449,0.9865902,-25.35115,-6.496389],[79495,0,30.0,0.001442659,3.667154,0.9881129,-13.87195,-4.919493],[79495,0,50.0,0.002408155,6.081129,0.98964,-8.163067,-3.422181],[79495,0,80.0,0.003862021,9.715801,0.9919389,-2.682599,-1.316503],[79495,0,100.0,0.004835032,12.1481,0.993477,-4.679293e-09,0.0],[79495,10,10.0,0.0009656139,12.5458,1.023603,-18.18036,-0.419877],[79495,10,30.0,0.002905865,17.43326,1.026785,-6.008674,2.681583],[79495,10,50.0,0.004858241,22.35068,1.029986,0.06509881,4.96807],[79495,10,80.0,0.007809788,29.78361,1.034823,6.713786,8.093752],[79495,10,100.0,0.009792978,34.77718,1.038072,10.0,10.0],[79495,20,10.0,0.001842004,24.84398,1.061329,-11.17925,6.102789],[79495,20,30.0,0.005558941,34.27572,1.067641,1.918811,9.878052],[79495,20,50.0,0.009320439,43.81886,1.074025,9.275282,13.19319],[79495,20,80.0,0.01504801,58.34687,1.08374,16.44819,17.49092],[79495,20,100.0,0.01892448,68.17743,1.090311,20.0,20.0],[79495,30,10.0,0.003353127,38.80089,1.100267,-4.344444,11.5752],[79495,30,30.0,0.01016903,56.22227,1.112235,10.55462,16.99212],[79495,30,50.0,0.01713516,74.02315,1.124458,18.45154,21.45504],[79495,30,80.0,0.02787709,101.4639,1.143289,26.17061,26.92952],[79495,30,100.0,0.03524126,120.2702,1.156186,30.0,30.0],[79495,40,10.0,0.0058564,55.37321,1.141176,2.643049,16.83643],[79495,40,30.0,0.01790642,86.39517,1.163029,19.13617,24.1837],[79495,40,50.0,0.03042808,118.62,1.185714,27.59312,29.8321],[79495,40,80.0,0.05015726,169.3717,1.221411,35.88065,36.42106],[79495,40,100.0,0.06398664,204.9316,1.246401,40.0,40.0],[79495,50,10.0,0.009862588,75.94204,1.185186,10.10409,22.05749],[79495,50,30.0,0.03055689,129.5987,1.223904,27.66199,31.53302],[79495,50,50.0,0.05265274,186.8622,1.265185,36.69868,38.33827],[79495,50,80.0,0.08875256,280.3644,1.332514,45.57766,45.9569],[79495,50,100.0,0.115045,348.4268,1.38147,50.0,50.0],[70108,-10,10.0,0.0002313385,-9.38983,1.077259,-33.6043,-13.93555],[70108,-10,30.0,0.0006945322,-8.240192,1.078059,-22.89476,-13.02443],[70108,-10,50.0,0.001158416,-7.08889,1.078861,-17.58178,-12.1343],[70108,-10,80.0,0.001855539,-5.358809,1.080066,-12.4896,-10.83823],[70108,-10,100.0,0.002321155,-4.203332,1.08087,-10.0,-10.0],[70108,0,10.0,0.0005443018,1.446662,1.118866,-25.35019,-6.993063],[70108,0,30.0,0.001635769,4.175911,1.120824,-13.87143,-5.274692],[70108,0,50.0,0.00273107,6.914541,1.122789,-8.162759,-3.655555],[70108,0,80.0,0.004381255,11.04018,1.125748,-2.682498,-1.398997],[70108,0,100.0,0.00548623,13.80248,1.12773,-7.730705e-11,0.0],[70108,10,10.0,0.001094796,12.89529,1.160949,-18.17928,-1.055338],[70108,10,30.0,0.003295992,18.44027,1.165043,-6.008023,2.223097],[70108,10,50.0,0.005512796,24.02392,1.169165,0.06547813,4.677304],[70108,10,80.0,0.008867634,32.47278,1.175401,6.71391,7.995535],[70108,10,100.0,0.01112419,38.1549,1.179594,10.0,10.0],[70108,20,10.0,0.002088871,25.49299,1.203952,-11.17817,5.32361],[70108,20,30.0,0.006308992,36.20193,1.212079,1.919425,9.386037],[70108,20,50.0,0.01058658,47.05481,1.220313,9.275634,12.90252],[70108,20,80.0,0.01711331,63.61049,1.232868,16.4483,17.4007],[70108,20,100.0,0.02153981,74.83631,1.241378,20.0,20.0],[70108,30,10.0,0.003803803,39.97416,1.248517,-4.343432,10.72962],[70108,30,30.0,0.01155272,59.78097,1.263948,10.55514,16.51212],[70108,30,50.0,0.01949596,80.07938,1.279755,18.45181,21.19248],[70108,30,80.0,0.03179148,111.4899,1.3042,26.17067,26.85424],[70108,30,100.0,0.04025375,133.1013,1.321009,30.0,30.0],[70108,40,10.0,0.0066471,57.4293,1.295626,2.643823,15.97105],[70108,40,30.0,0.02037686,92.77673,1.323864,19.13641,23.74814],[70108,40,50.0,0.03471979,129.6899,1.353333,27.59315,29.61054],[70108,40,80.0,0.05747683,188.2326,1.40003,35.8806,36.36145],[70108,40,100.0,0.0735452,229.5513,1.432961,40.0,40.0],[70108,50,10.0,0.01120353,79.43909,1.346742,10.10421,21.21353],[70108,50,30.0,0.03486674,140.7954,1.396951,27.66156,31.15746],[70108,50,50.0,0.0603674,206.885,1.450982,36.69814,38.15842],[70108,50,80.0,0.1025607,316.1744,1.540229,45.57734,45.91057],[70108,50,100.0,0.1337133,396.8223,1.606016,50.0,50.0]];
let wMax = 0, hMax = 0, vMax = 0, dMax = 0, bMax = 0;
REF.forEach(r => {
  const s = PSY.state(r[1], 'rh', r[2], r[0]), tag = r[0] + ' Pa ' + r[1] + ' C ' + r[2] + ' % : ';
  check(tag + 'etat calcule', !!s && (!s.err || s.err === 'sat'), JSON.stringify(s && s.err));
  if (!s || (s.err && s.err !== 'sat')) { return; }
  wMax = Math.max(wMax, rel(s.W, r[3])); hMax = Math.max(hMax, Math.abs(s.h - r[4])); vMax = Math.max(vMax, rel(s.v, r[5])); dMax = Math.max(dMax, Math.abs(s.Td - r[6])); bMax = Math.max(bMax, Math.abs(s.Twb - r[7]));
  check(tag + 'W (0,7 %)', rel(s.W, r[3]) < 0.7, 'module ' + s.W + ' ref ' + r[3]);
  check(tag + 'h (1,6 kJ/kg)', Math.abs(s.h - r[4]) < 1.6, 'module ' + s.h.toFixed(3) + ' ref ' + r[4]);
  check(tag + 'v (0,1 %)', rel(s.v, r[5]) < 0.1, 'module ' + s.v + ' ref ' + r[5]);
  check(tag + 'point de rosee (0,05 K)', Math.abs(s.Td - r[6]) < 0.05, 'module ' + s.Td.toFixed(3) + ' ref ' + r[6].toFixed(3));
  check(tag + 'temperature humide (0,7 K)', Math.abs(s.Twb - r[7]) < 0.7, 'module ' + s.Twb.toFixed(3) + ' ref ' + r[7].toFixed(3));
});
console.log('     (ecarts maximaux observes : W ' + wMax.toFixed(2) + ' %, h ' + hMax.toFixed(2) + ' kJ/kg, v ' + vMax.toFixed(3) + ' %, point de rosee ' + dMax.toFixed(3) + ' K, temperature humide ' + bMax.toFixed(2) + ' K)');
check('au moins 130 etats compares', REF.length >= 130);

console.log('3) Pression selon l\'altitude (atmosphere standard)');
[[0, 101325], [1000, 89874.6], [2000, 79495.2], [3000, 70108.5], [4000, 61640.2], [5000, 54019.9]].forEach(r => check('altitude ' + r[0] + ' m (0,05 %)', rel(PSY.pAlt(r[0]), r[1]) < 0.05, 'module ' + PSY.pAlt(r[0]).toFixed(1) + ' ref ' + r[1]));

console.log('4) Coherence entre les modes de saisie (HR, temperature humide, point de rosee, enthalpie, W)');
{
  let n = 0;
  [-5, 5, 15, 25, 35].forEach(T => [20, 50, 80].forEach(RH => [101325, 79495].forEach(P => {
    const s0 = PSY.state(T, 'rh', RH, P), tag = T + ' C ' + RH + ' % ' + P + ' Pa : ';
    const sT = PSY.state(T, 'twb', s0.Twb, P), sD = PSY.state(T, 'td', s0.Td, P), sH = PSY.state(T, 'h', s0.h, P), sW = PSY.state(T, 'w', s0.W, P), sG = PSY.state(T, 'wg', s0.W * 1000, P);
    n++;
    check(tag + 'temperature humide -> meme W', Math.abs(sT.W - s0.W) < 1e-8, sT.W + ' vs ' + s0.W);
    check(tag + 'point de rosee -> meme W', Math.abs(sD.W - s0.W) < 2e-7, sD.W + ' vs ' + s0.W);
    check(tag + 'enthalpie -> meme W', Math.abs(sH.W - s0.W) < 1e-9);
    check(tag + 'W et g/kg -> memes etats', Math.abs(sW.h - s0.h) < 1e-9 && Math.abs(sG.h - s0.h) < 1e-9);
    check(tag + 'h = 1,006 T + W (2501 + 1,86 T)', Math.abs(s0.h - (1.006 * T + s0.W * (2501 + 1.86 * T))) < 1e-9);
    check(tag + 'v = 0,287042 (T+273,15)(1+1,607858 W)/P', rel(s0.v, 0.287042 * (T + 273.15) * (1 + 1.607858 * s0.W) / (P / 1000)) < 1e-9);
    check(tag + 'rho = (1+W)/v', rel(s0.rho, (1 + s0.W) / s0.v) < 1e-9);
    check(tag + 'HR retrouvee a partir de W', Math.abs(100 * s0.pv / s0.ps - RH) < 1e-6, String(100 * s0.pv / s0.ps));
    check(tag + 'pv = P W / (0,621945 + W)', rel(s0.pv, P * s0.W / (0.621945 + s0.W)) < 1e-9);
    check(tag + 'Td <= Twb <= T', s0.Td <= s0.Twb + 1e-6 && s0.Twb <= T + 1e-6, s0.Td + ' ' + s0.Twb);
    check(tag + 'degre de saturation mu = W / Ws', rel(s0.mu, s0.W / s0.Ws * 100) < 1e-9);
  })));
  check('au moins 25 combinaisons', n >= 25);
}

console.log('5) Erreurs de saisie et saturation');
check('temperature humide > T refusee', PSY.state(20, 'twb', 25, 101325).err === 'twb');
check('point de rosee > T refuse', PSY.state(20, 'td', 25, 101325).err === 'td');
check('HR > 100 % a haute temperature : hors domaine ou sursaturation signalee', (() => { const s = PSY.state(20, 'rh', 130, 101325); return !!s.err; })());
check('pression de vapeur >= P : hors domaine', PSY.state(110, 'rh', 100, 101325).err === 'range');
check('mode inconnu', PSY.state(20, 'xx', 1, 101325).err === 'mode');
check('W negatif refuse', PSY.state(20, 'wg', -1, 101325).err === 'neg');
check('saturation : sat signalee pour W > Ws', PSY.state(20, 'wg', 20, 101325).err === 'sat');

console.log('6) Procedes de traitement');
{
  const P = 101325, A = PSY.state(26, 'rh', 50, P), flow = 2000, m = flow / 3600 / A.v;
  const s = PSY.sensible(A, 40, P), pw = PSY.powers(A, s.B, flow);
  check('chauffage sensible : W constant', Math.abs(s.B.W - A.W) < 1e-12 && s.flags.length === 0);
  check('chauffage sensible : T finale', Math.abs(s.B.T - 40) < 1e-9);
  check('chauffage sensible : Q = m (h2 - h1) (recalcul)', rel(pw.Q, m * (s.B.h - A.h)) < 1e-9);
  check('chauffage sensible : Q = m cp_humide dT (0,3 %)', rel(pw.Q, m * (1.006 + 1.86 * A.W) * 14) < 0.3, pw.Q + ' vs ' + m * (1.006 + 1.86 * A.W) * 14);
  check('chauffage sensible : Qs = Q, Ql = 0, pas d\'eau', Math.abs(pw.Qs - pw.Q) < 1e-9 && Math.abs(pw.Ql) < 1e-9 && Math.abs(pw.water) < 1e-12);
  const fog = PSY.sensible(A, 5, P);
  check('refroidissement sous le point de rosee : brouillard signale, air sature', fog.flags.indexOf('fog') >= 0 && Math.abs(fog.B.RH - 100) < 0.01);

  const coil = PSY.coil(A, 8, 0.85, P), B = coil.B, pc = PSY.powers(A, B, flow);
  check('batterie froide : T finale = T + beta (Tadp - T)', Math.abs(B.T - (26 + 0.85 * (8 - 26))) < 1e-9);
  check('batterie froide : W finale = W + beta (Ws(ADP) - W)', Math.abs(B.W - (A.W + 0.85 * (PSY.wSat(8, P) - A.W))) < 1e-12);
  check('batterie froide : deshumidification (eau condensee > 0)', pc.water < 0 && B.W < A.W);
  const qIndep = m * ((B.h - A.h) - (B.W - A.W) * 4.186 * B.T);
  check('batterie froide : puissance = bilan d\'enthalpie moins enthalpie du condensat', rel(pc.Q, qIndep) < 1e-9, pc.Q + ' vs ' + qIndep);
  check('batterie froide : froid retire (Q < 0) et SHR entre 0 et 1', pc.Q < 0 && pc.shr > 0 && pc.shr < 1, String(pc.shr));
  check('batterie froide : condensat = m (W1 - W2) en kg/h', rel(-pc.water, m * (A.W - B.W) * 3600) < 1e-9);
  const dry = PSY.coil(A, 22, 0.9, P);
  check('batterie : ADP au-dessus du point de rosee -> refroidissement sensible (flag dry, W inchange)', dry.flags.indexOf('dry') >= 0 && Math.abs(dry.B.W - A.W) < 1e-12 && dry.B.T < A.T);

  const AD = [[101325, 30, 20.0, 15.68921],[101325, 35, 30.0, 21.51575],[101325, 20, 40.0, 12.34579]];
  AD.forEach(r => {
    const a = PSY.state(r[1], 'rh', r[2], r[0]), ad = PSY.adiabatic(a, 0.8, r[0]);
    check('humidification adiabatique ' + r[1] + ' C ' + r[2] + ' % : temperature humide conservee (0,15 K, CoolProp)', Math.abs(ad.B.Twb - r[3]) < 0.15, ad.B.Twb + ' vs ' + r[3]);
    check('humidification adiabatique ' + r[1] + ' C : T baisse, W monte', ad.B.T < a.T && ad.B.W > a.W);
    check('humidification adiabatique ' + r[1] + ' C : efficacite 80 % sur W', Math.abs((ad.B.W - a.W) / (PSY.wSat(a.Twb, r[0]) - a.W) - 0.8) < 1e-9);
    const sat = PSY.adiabatic(a, 1, r[0]);
    check('humidification adiabatique ' + r[1] + ' C : efficacite 100 % -> saturation (HR > 99,5 %)', sat.B.RH > 99.5, String(sat.B.RH));
  });

  const MIX = [[101325, 5, 80.0, 1000, 30, 50.0, 3000, 23.82891, 0.01111248, 52.24151],[101325, -5, 90.0, 500, 25, 60.0, 500, 10.13581, 0.007092907, 28.05852],[101325, 35, 40.0, 200, 12, 95.0, 800, 16.64101, 0.009498824, 40.77647],[89875, 5, 80.0, 1000, 30, 50.0, 3000, 23.83888, 0.01255612, 55.95238],[89875, -5, 90.0, 500, 25, 60.0, 500, 10.15309, 0.008010799, 30.41808],[89875, 35, 40.0, 200, 12, 95.0, 800, 16.64621, 0.01072729, 43.91973]];
  MIX.forEach(r => {
    const a = PSY.state(r[1], 'rh', r[2], r[0]), b = PSY.state(r[4], 'rh', r[5], r[0]), mx = PSY.mix(a, r[3], b, r[6], r[0]), tag = 'melange ' + r.slice(0, 7).join('/') + ' : ';
    check(tag + 'W = moyenne ponderee (bilan d\'eau)', Math.abs(mx.W - (r[3] * a.W + r[6] * b.W) / (r[3] + r[6])) < 1e-12);
    check(tag + 'h = moyenne ponderee (bilan d\'energie)', Math.abs(mx.h - (r[3] * a.h + r[6] * b.h) / (r[3] + r[6])) < 1e-9);
    check(tag + 'T vs CoolProp (0,02 K)', Math.abs(mx.T - r[7]) < 0.02, mx.T + ' vs ' + r[7]);
    check(tag + 'W vs CoolProp (0,6 %, ecart gaz parfaits)', rel(mx.W, r[8]) < 0.6, mx.W + ' vs ' + r[8]);
    check(tag + 'h vs CoolProp (0,3 kJ/kg)', Math.abs(mx.h - r[9]) < 0.3, mx.h + ' vs ' + r[9]);
    check(tag + 'T entre les deux entrees', mx.T >= Math.min(a.T, b.T) - 1e-9 && mx.T <= Math.max(a.T, b.T) + 1e-9);
  });

  const AS = PSY.state(20, 'rh', 30, P), st = PSY.steam(AS, 60, P);
  check('humidification vapeur : HR visee atteinte (0,05 %)', Math.abs(st.B.RH - 60) < 0.05, String(st.B.RH));
  check('humidification vapeur : bilan d\'enthalpie h2 = h1 + dW x 2676', Math.abs(st.B.h - (AS.h + (st.B.W - AS.W) * 2676)) < 1e-6);
  check('humidification vapeur : T monte legerement', st.B.T > AS.T && st.B.T < AS.T + 3, String(st.B.T));
  check('humidification vapeur : deja humide -> flag', PSY.steam(AS, 20, P).flags.indexOf('already') >= 0);
}

console.log('7) Sens physique');
{
  const P = 101325;
  check('W croit avec HR a T constante', PSY.state(25, 'rh', 70, P).W > PSY.state(25, 'rh', 40, P).W);
  check('W croit avec T a HR constante', PSY.state(30, 'rh', 50, P).W > PSY.state(20, 'rh', 50, P).W);
  check('Ws decroit avec la pression', PSY.wSat(20, 70000) > PSY.wSat(20, 101325));
  check('volume massique croit avec T et W', PSY.state(30, 'rh', 50, P).v > PSY.state(20, 'rh', 50, P).v && PSY.state(25, 'rh', 80, P).v > PSY.state(25, 'rh', 20, P).v);
  check('masse volumique decroit avec l\'altitude', PSY.state(20, 'rh', 50, PSY.pAlt(2000)).rho < PSY.state(20, 'rh', 50, P).rho);
  check('air standard 20 C / 50 % : W entre 7,2 et 7,4 g/kg, h entre 38 et 39 kJ/kg', (() => { const s = PSY.state(20, 'rh', 50, P); return s.W > 0.0072 && s.W < 0.0074 && s.h > 38 && s.h < 39; })());
  check('saturation a 20 C : Ws entre 14,6 et 14,8 g/kg', PSY.wSat(20, P) > 0.0146 && PSY.wSat(20, P) < 0.0148);
}

console.log('8) Copies du moteur dans d\'autres modules (traitement d\'air, chambre froide, calcul horaire) : coherence avec le moteur PSYCHRO');
{
  const cut = (from, to, after) => { const a0 = after ? h.indexOf(after) : 0, a = h.indexOf(from, a0), b = a < 0 ? -1 : h.indexOf(to, a); if (a < 0 || b < 0) { return null; } return h.slice(a, b); };
  const P = 101325;
  // Traitement d'air : copie du moteur H-W
  try {
    const src = cut('var P0 = 101325, HS = 2676, HW = 4.186;', 'function treat(', '<script id="airtreat-module">');
    if (!src) { throw new Error('bloc introuvable'); }
    const AT = new Function(src + '\nreturn { pAlt: pAlt, psat: psat, sRH: sRH, wSat: wSat, mix: mix };')();
    let eW = 0, eH = 0, eT = 0, eV = 0;
    for (let T = -20; T <= 45; T += 5) { [20, 50, 90].forEach(RH => { const A = AT.sRH(T, RH, P), S = PSY.state(T, 'rh', RH, P); eW = Math.max(eW, Math.abs(A.W / S.W - 1)); eH = Math.max(eH, Math.abs(A.h - S.h)); eT = Math.max(eT, Math.abs(A.Td - S.Td)); eV = Math.max(eV, Math.abs(A.v / S.v - 1)); }); }
    check('traitement d\'air : W identique au moteur PSYCHRO (1e-6)', eW < 1e-6, String(eW));
    check('traitement d\'air : h identique (1e-6 kJ/kg)', eH < 1e-6, String(eH));
    check('traitement d\'air : point de rosee identique (0,01 K)', eT < 0.01, String(eT));
    check('traitement d\'air : volume massique identique (1e-9)', eV < 1e-9, String(eV));
    [-15, 0, 12, 30].forEach(T => check('traitement d\'air : psat ' + T + ' C identique', Math.abs(AT.psat(T) / PSY.psat(T) - 1) < 1e-12));
    [0, 1000, 2500, 4000].forEach(z => check('traitement d\'air : pression a ' + z + ' m identique', Math.abs(AT.pAlt(z) / PSY.pAlt(z) - 1) < 1e-9));
    const A1 = PSY.state(5, 'rh', 80, P), B1 = PSY.state(30, 'rh', 50, P), m1 = AT.mix(AT.sRH(5, 80, P), 1000, AT.sRH(30, 50, P), 3000, P), m2 = PSY.mix(A1, 1000, B1, 3000, P);
    check('traitement d\'air : melange identique (0,01 K)', Math.abs(m1.T - m2.T) < 0.01 && Math.abs(m1.W - m2.W) < 1e-8);
  } catch (e) { check('traitement d\'air : bloc lisible', false, e.message); }
  // Calcul horaire : copie minimale
  try {
    const src = cut('function psat(T) { // Pa, T en C', '/* ---------- geometrie solaire');
    if (!src) { throw new Error('bloc introuvable'); }
    const HO = new Function(src + '\nreturn { psat: psat, pAlt: pAlt, wFromRH: wFromRH, wFromWB: wFromWB };')();
    [-20, -5, 0, 15, 40].forEach(T => check('calcul horaire : psat ' + T + ' C identique', Math.abs(HO.psat(T) / PSY.psat(T) - 1) < 1e-12));
    [0, 500, 1500, 3000].forEach(z => check('calcul horaire : pression a ' + z + ' m (0,001 %)', rel(HO.pAlt(z), PSY.pAlt(z)) < 0.001));
    [[30, 20], [25, 10], [10, -2]].forEach(c => check('calcul horaire : W a partir de la temperature humide ' + c.join('/') + ' identique', Math.abs(HO.wFromWB(c[0], c[1], P) - PSY.wFromTwb(c[0], c[1], P)) < 1e-12));
    [[5, 40], [20, 60], [35, 30]].forEach(c => check('calcul horaire : W a partir de HR ' + c.join('/') + ' identique', Math.abs(HO.wFromRH(c[0], c[1], P) - PSY.state(c[0], 'rh', c[1], P).W) < 1e-12));
  } catch (e) { check('calcul horaire : bloc lisible', false, e.message); }
  // Chambre froide : formule de Magnus, ecarts connus
  try {
    const src = cut('/* ============ PSYCHROMETRIE ============ */', '/* ============ BASE DE DONNEES PRODUITS');
    if (!src) { throw new Error('bloc introuvable'); }
    const CR = new Function(src + '\nreturn { psat: psat, wRatio: wRatio, enth: enth, rho: rho, dewPt: dewPt };')();
    let eP = 0, eW = 0, eH = 0, eR = 0, eD = 0, eDneg = 0;
    for (let T = -30; T <= 40; T += 2.5) { [30, 60, 90].forEach(RH => { const S = PSY.state(T, 'rh', RH, P); eP = Math.max(eP, rel(CR.psat(T), PSY.psat(T))); eW = Math.max(eW, rel(CR.wRatio(T, RH), S.W)); eH = Math.max(eH, Math.abs(CR.enth(T, RH) - S.h)); eR = Math.max(eR, rel(CR.rho(T, RH), S.rho)); if (S.Td >= 1) { eD = Math.max(eD, Math.abs(CR.dewPt(T, RH) - S.Td)); } else if (S.Td < 0) { eDneg = Math.max(eDneg, Math.abs(CR.dewPt(T, RH) - S.Td)); } }); }
    check('chambre froide (Magnus) : psat a 0,3 % du moteur PSYCHRO de -30 a 40 C', eP < 0.3, eP.toFixed(3) + ' %');
    check('chambre froide : teneur en eau a 0,3 %', eW < 0.3, eW.toFixed(3) + ' %');
    check('chambre froide : enthalpie a 0,3 kJ/kg', eH < 0.3, eH.toFixed(3));
    check('chambre froide : masse volumique a 0,02 %', eR < 0.02, eR.toFixed(4) + ' %');
    check('chambre froide : point de rosee a 0,05 K quand il est au-dessus de 1 C', eD < 0.05, eD.toFixed(3));
    console.log('     (chambre froide : quand le point de rosee est sous 0 C, il est calcule sur l\'eau liquide et non sur la glace : ecart jusqu\'a ' + eDneg.toFixed(1) + ' K par rapport au point de givre du moteur PSYCHRO ; il sert a l\'air exterieur et a la paroi, ou le givrage n\'est pas le sujet)');
    check('chambre froide : l\'ecart sous 0 C reste borne (< 4 K, constat documente)', eDneg < 4, eDneg.toFixed(2));
  } catch (e) { check('chambre froide : bloc lisible', false, e.message); }
}
console.log(ko === 0 ? 'OK : ' + ok + ' verifications reussies.' : 'ECHEC : ' + ko + ' erreur(s) sur ' + (ok + ko) + '.');
process.exit(ko === 0 ? 0 : 1);
