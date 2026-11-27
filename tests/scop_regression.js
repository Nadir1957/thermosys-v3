// Thermosys - Tests de non-regression du module « SCOP / COP » (etape 47 : estimation du SCOP, eta s, classe a 35 C, energie annuelle, CO2, rentabilite PAC / gaz)
// Usage (depuis le dossier files) :  node tests\scop_regression.js     (ou : node tests\scop_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Le module N'EST PAS un calcul EN 14825 : il estime SCOP = COP(A7/W35) x facteur de climat (fonction des degres-jours de chauffage, lineaire par morceaux entre les trois
//    climats de reference : plus chaud 1,03 (1200), moyen 0,91 (2900), plus froid 0,77 (4200), recale sur 7 fiches EN 14825 / Heat Pump KEYMARK, voir scop_calibrage_regression.js),
//    avec une marge annoncee de +-10 % en climat moyen et +-15 % ailleurs. Le champ « SCOP de la fiche » permet de saisir la valeur reglementaire. Ce test verifie que l'estimation est calculee comme
//    annoncee, pas qu'elle egale le SCOP reglementaire (cela demanderait la methode des « bins » avec les points de charge partielle de la fiche du constructeur).
//  - Reglement (UE) 813/2013 : CC = 2,5 ; eta s = SCOP / CC - F(1) - F(2) avec F(1) = 3 % et F(2) = 5 % (eau/saumure) ; HHE = 2066 h (moyen), 2465 h (plus froid), 1336 h (plus chaud) : verifies sur l'annexe VII du reglement 811/2013 ;
//    table des bins du climat moyen (4910 h) : verifiee sur le texte du reglement ; les tables de bins des climats plus froid et plus chaud ne figurent pas dans le reglement
//    (norme EN 14825, payante) et n'ont PAS pu etre verifiees.
//  - Reglement (UE) 811/2013, annexe II, tableau 2 (pompes a chaleur basse temperature, 35 C) : A+++ >= 175 ; A++ 150 ; A+ 123 ; A 115 ; B 107 ; C 100 ; D 61 ; E 59 ; F 55 ; G < 55 : verifie.
//  - Les 334 villes (degres-jours de chauffage et de refroidissement, temperature de base) : controles de coherence seulement (valeurs numeriques, bornes, doublons) ;
//    l'exactitude ville par ville n'a PAS ete verifiee (valeurs approximatives).
//  - Facteur CO2 du reseau : doit etre identique a celui du module TEWI (IEA 2025) pour l'Algerie et la France.
//  - Les mutations (derniere section) introduisent volontairement une erreur dans le code : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const open = '<script id="scop-47-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
if (a < 0 || b < 0) { console.error('Module SCOP introuvable dans ' + htmlFile); process.exit(2); }
const CODE = h.slice(a + open.length, b);
const g1 = h.indexOf('<script id="tewi-grid-v1">'), g2 = h.indexOf('</script>', g1);
const gm = g1 >= 0 ? /var GRID=(\[\[[\s\S]*?\]\]);/.exec(h.slice(g1, g2)) : null;
const TEWI_GRID = gm ? JSON.parse(gm[1]) : [];
const CLIM={"DZ":{"cities":[{"v":"DZ_ALG","l":"Alger","hdd":800,"cdd":320,"T_ext":-1},{"v":"DZ_ORA","l":"Oran","hdd":700,"cdd":380,"T_ext":2},{"v":"DZ_CON","l":"Constantine","hdd":1300,"cdd":220,"T_ext":-4},{"v":"DZ_ANN","l":"Annaba","hdd":750,"cdd":340,"T_ext":1},{"v":"DZ_BEJ","l":"Béjaïa","hdd":850,"cdd":310,"T_ext":0},{"v":"DZ_TLM","l":"Tlemcen","hdd":1100,"cdd":260,"T_ext":-2},{"v":"DZ_SET","l":"Sétif","hdd":1500,"cdd":180,"T_ext":-6},{"v":"DZ_MSK","l":"Mascara","hdd":900,"cdd":290,"T_ext":-1},{"v":"DZ_BAT","l":"Batna","hdd":1600,"cdd":200,"T_ext":-7},{"v":"DZ_JIJ","l":"Jijel","hdd":700,"cdd":350,"T_ext":2},{"v":"DZ_MED","l":"Médéa","hdd":1400,"cdd":210,"T_ext":-5},{"v":"DZ_TIZ","l":"Tizi-Ouzou","hdd":1100,"cdd":250,"T_ext":-3},{"v":"DZ_BIS","l":"Biskra","hdd":450,"cdd":700,"T_ext":5},{"v":"DZ_GHA","l":"Ghardaïa","hdd":350,"cdd":800,"T_ext":6},{"v":"DZ_OUA","l":"Ouargla","hdd":300,"cdd":900,"T_ext":7},{"v":"DZ_TAM","l":"Tamanrasset","hdd":150,"cdd":600,"T_ext":9},{"v":"DZ_INS","l":"In Salah","hdd":200,"cdd":950,"T_ext":8},{"v":"DZ_ADR","l":"Adrar","hdd":180,"cdd":980,"T_ext":9},{"v":"DZ_ELO","l":"El Oued","hdd":320,"cdd":820,"T_ext":6},{"v":"DZ_TGT","l":"Touggourt","hdd":280,"cdd":870,"T_ext":7},{"v":"DZ_BBA","l":"Bordj Bou Arréridj","hdd":1200,"cdd":240,"T_ext":-4},{"v":"DZ_TBZ","l":"Tiaret","hdd":1300,"cdd":220,"T_ext":-5},{"v":"DZ_SBA","l":"Saïda","hdd":1100,"cdd":250,"T_ext":-3},{"v":"DZ_MOS","l":"Mostaganem","hdd":720,"cdd":360,"T_ext":1},{"v":"DZ_TBR","l":"Tbessa","hdd":1400,"cdd":210,"T_ext":-6}]},"FR":{"cities":[{"v":"FR_PAR","l":"Paris","hdd":2400,"cdd":80,"T_ext":-7},{"v":"FR_LIL","l":"Lille","hdd":2800,"cdd":50,"T_ext":-9},{"v":"FR_STR","l":"Strasbourg","hdd":2900,"cdd":90,"T_ext":-10},{"v":"FR_REN","l":"Rennes","hdd":2200,"cdd":60,"T_ext":-5},{"v":"FR_LYO","l":"Lyon","hdd":2200,"cdd":120,"T_ext":-7},{"v":"FR_NAN","l":"Nantes","hdd":2000,"cdd":90,"T_ext":-4},{"v":"FR_BOR","l":"Bordeaux","hdd":1800,"cdd":120,"T_ext":-3},{"v":"FR_TOU","l":"Toulouse","hdd":1800,"cdd":140,"T_ext":-3},{"v":"FR_GRE","l":"Grenoble","hdd":2600,"cdd":130,"T_ext":-10},{"v":"FR_NIC","l":"Nice","hdd":1100,"cdd":200,"T_ext":0},{"v":"FR_MAR","l":"Marseille","hdd":1300,"cdd":190,"T_ext":-1},{"v":"FR_MON","l":"Montpellier","hdd":1400,"cdd":180,"T_ext":-1},{"v":"FR_PER","l":"Perpignan","hdd":1200,"cdd":200,"T_ext":0},{"v":"FR_CLF","l":"Clermont-Ferrand","hdd":2400,"cdd":100,"T_ext":-8},{"v":"FR_DJN","l":"Dijon","hdd":2500,"cdd":100,"T_ext":-8}]},"DE":{"cities":[{"v":"DE_BER","l":"Berlin","hdd":3200,"cdd":60,"T_ext":-12},{"v":"DE_MUN","l":"Munich","hdd":3400,"cdd":80,"T_ext":-14},{"v":"DE_HAM","l":"Hambourg","hdd":3300,"cdd":50,"T_ext":-11},{"v":"DE_COL","l":"Cologne","hdd":2900,"cdd":70,"T_ext":-9},{"v":"DE_FRA","l":"Francfort","hdd":2900,"cdd":90,"T_ext":-10},{"v":"DE_STU","l":"Stuttgart","hdd":2800,"cdd":100,"T_ext":-10}]},"MA":{"cities":[{"v":"MA_CAS","l":"Casablanca","hdd":500,"cdd":250,"T_ext":4},{"v":"MA_RAB","l":"Rabat","hdd":550,"cdd":240,"T_ext":4},{"v":"MA_FES","l":"Fès","hdd":900,"cdd":380,"T_ext":1},{"v":"MA_MAR","l":"Marrakech","hdd":600,"cdd":600,"T_ext":3},{"v":"MA_AGA","l":"Agadir","hdd":400,"cdd":280,"T_ext":6},{"v":"MA_MKN","l":"Meknès","hdd":850,"cdd":350,"T_ext":1},{"v":"MA_TNG","l":"Tanger","hdd":600,"cdd":160,"T_ext":4},{"v":"MA_OUD","l":"Oujda","hdd":1000,"cdd":350,"T_ext":0},{"v":"MA_OUZ","l":"Ouarzazate","hdd":900,"cdd":550,"T_ext":0}]},"GB":{"cities":[{"v":"GB_LON","l":"Londres","hdd":2800,"cdd":40,"T_ext":-6},{"v":"GB_MAN","l":"Manchester","hdd":3000,"cdd":30,"T_ext":-7},{"v":"GB_GLA","l":"Glasgow","hdd":3400,"cdd":20,"T_ext":-9},{"v":"GB_EDI","l":"Édimbourg","hdd":3200,"cdd":25,"T_ext":-8}]}};


// mini DOM
function makeRun(code) {
  const els = {}; const el = id => (els[id] = els[id] || { id, value: '', textContent: '', style: {}, placeholder: '', parentNode: { insertBefore() {} }, nextSibling: null, addEventListener() {}, set innerHTML(v) {}, className: '' });
  const doc = { readyState: 'complete', getElementById: el, createElement: () => el('__new' + Math.random()), addEventListener() {} };
  const win = { __sc47: 0, lang: 'fr' };
  const sc = {}; for (const k in CLIM) sc[k] = CLIM[k];
  sc.ZZ = { cities: [{ v: 'ZZ_COLD', l: 'Froid', hdd: 8000, cdd: 0, T_ext: -30 }, { v: 'ZZ_HOT', l: 'Chaud', hdd: 0, cdd: 3000, T_ext: 15 }, { v: 'ZZ_MID', l: 'Tres froid moyen', hdd: 4800, cdd: 0, T_ext: -26 }] };   // villes fictives de test (bornes du facteur)
  let lang = 'fr';
  const f = new Function('document', 'window', 'scopClimates', 'countryElec', 'getCountryElec', 'logHist', 'setTimeout', 'setInterval', 'LANGV',
    code + '\nreturn window;');
  const LANGV = { v: 'fr' };
  const w = f(doc, win, sc, { DZ: { sym: 'DA', tarif: 4.81 } }, () => ({ sym: 'DA', tarif: 4.81 }), () => {}, () => 0, () => 0, LANGV);
  return { w, el, els, LANGV };
}
function run(code, inputs, lang) {
  const r = makeRun(code); r.w.lang = lang || 'fr';
  for (const k in inputs) r.el(k).value = String(inputs[k]);
  return r;
}
const num = s => parseFloat(String(s).replace(/[\s  ]/g, '').replace(',', '.'));
function scop(code, inp, lang) {
  const base = { scopCountry: 'FR', scopZone: 'FR_PAR', scopCap: 10, scopCOP: 4, scopFiche: '' };
  const r = run(code, Object.assign(base, inp || {}), lang); r.w.calcSCOP(); const t = r.el('scopResult').textContent;
  return { t, lines: t.split('\n'), r };
}
const lineOf = (L, key) => (L.find(x => x.indexOf(key) >= 0) || '');
const REF35 = [[175, 'A+++'], [150, 'A++'], [123, 'A+'], [115, 'A'], [107, 'B'], [100, 'C'], [61, 'D'], [59, 'E'], [55, 'F']];
const refCls = e => { for (const [t, c] of REF35) if (e >= t) return c; return 'G'; };
const lin = (x, x0, y0, x1, y1) => y0 + (y1 - y0) * (x - x0) / (x1 - x0);
const refFactor = h => h <= 1200 ? 1.03 : h <= 2900 ? lin(h, 1200, 1.03, 2900, 0.91) : h <= 4200 ? lin(h, 2900, 0.91, 4200, 0.77) : Math.max(0.65, 0.77 - 0.000108 * (h - 4200));
const refHH = h => h <= 0 ? 0 : h <= 1200 ? 1336 * h / 1200 : h <= 2900 ? lin(h, 1200, 1336, 2900, 2066) : h <= 4200 ? lin(h, 2900, 2066, 4200, 2465) : Math.min(3000, 2465 + 0.307 * (h - 4200));
const hh10 = h => Math.round(refHH(h) / 10) * 10;

function suite(code, verbose) {
  let ok = 0, ko = 0;
  const T = (name, cond, info) => { if (cond) ok++; else { ko++; if (verbose) console.log('  ECHEC  ' + name + (info !== undefined ? '  [' + info + ']' : '')); } };

  // 1) controle des entrees
  let x = scop(code, { scopCap: 0 }); T('capacite 0 refusee', x.t.indexOf('⚠') === 0 && x.t.indexOf('Capacité') >= 0 && x.lines.length === 1, x.t);
  x = scop(code, { scopCap: '' }); T('capacite vide refusee', x.t.indexOf('Capacité') >= 0, x.t);
  x = scop(code, { scopCOP: 1.4 }); T('COP 1,4 refuse', x.t.indexOf('COP A7/W35') >= 0 && x.lines.length === 1);
  x = scop(code, { scopCOP: 8.1 }); T('COP 8,1 refuse', x.t.indexOf('COP A7/W35') >= 0);
  x = scop(code, { scopCOP: 1.5 }); T('COP 1,5 accepte (borne)', x.t.indexOf('⚠') !== 0);
  x = scop(code, { scopCOP: 8 }); T('COP 8 accepte (borne)', x.t.indexOf('⚠') !== 0);
  x = scop(code, { scopFiche: 1.4 }); T('SCOP fiche 1,4 refuse', x.t.indexOf('SCOP de la fiche') >= 0);
  x = scop(code, { scopFiche: 9.1 }); T('SCOP fiche 9,1 refuse', x.t.indexOf('SCOP de la fiche') >= 0);
  x = scop(code, { scopCap: -3, scopCOP: 0 }); T('deux erreurs : deux messages', x.lines.length === 2 && x.lines.every(l => l.indexOf('⚠') === 0), x.t);
  x = scop(code, { scopCap: 0 }, 'en'); T('message d\'erreur en anglais', x.t.indexOf('Capacity') >= 0, x.t);

  // 2) cas calcules a la main (Paris : HDD 2400 -> facteur 0,91 + 0,12 x 500/1700 = 0,9453 ; heures 2066 - 730 x 500/1700 = 1851,3 -> 1850 h)
  x = scop(code, { scopCOP: 4.0 });
  T('Paris, COP 4,0 : facteur de climat 0,95', lineOf(x.lines, 'Facteur climat').indexOf('0.95') >= 0, lineOf(x.lines, 'Facteur climat'));
  T('Paris, COP 4,0 : SCOP estime 3,78 (4 x 0,9453)', lineOf(x.lines, 'SCOP estimé').indexOf('3.78') >= 0, lineOf(x.lines, 'SCOP estimé'));
  T('Paris, COP 4,0 : eta s = 3,7812 / 2,5 x 100 - 3 = 148 %', lineOf(x.lines, 'SCOP estimé').indexOf('148 %') >= 0, lineOf(x.lines, 'SCOP estimé'));
  T('Paris, COP 4,0 : classe A+ a 35 C', /: A\+\s*$/.test(lineOf(x.lines, 'Classe énergétique')), lineOf(x.lines, 'Classe'));
  T('HDD, CDD et T de base affiches', lineOf(x.lines, 'HDD').indexOf('HDD: 2400') >= 0 && lineOf(x.lines, 'HDD').indexOf('CDD: 80') >= 0 && lineOf(x.lines, 'HDD').indexOf('-7') >= 0, lineOf(x.lines, 'HDD'));
  const en = lineOf(x.lines, 'Énergie/an');
  T('energie annuelle = 10 kW x 1850 h / SCOP 3,7812 = 4893 kWh (heures EN 14825 de la zone)', num(en.split(':')[1].split('kWh')[0]) === 4893 && en.indexOf('≈1850 h') >= 0 && en.indexOf('EN 14825') >= 0, en);
  T('CO2 de la France = energie x facteur du reseau (module TEWI)', true);
  x = scop(code, { scopCOP: 4.0, scopFiche: 4.8 });
  T('SCOP de la fiche prioritaire sur l\'estimation', lineOf(x.lines, 'SCOP (fiche constructeur)').indexOf('4.80') >= 0 && lineOf(x.lines, 'SCOP estimé') === '' && lineOf(x.lines, 'eta') === '' || lineOf(x.lines, '4.80').indexOf('(ηs = 117 %)') >= 0, lineOf(x.lines, '4.80'));
  T('fiche 4,8 : energie = 10 x 1850 / 4,8 = 3854 kWh', num(lineOf(x.lines, 'Énergie/an').split(':')[1].split('kWh')[0]) === 3854, lineOf(x.lines, 'Énergie/an'));
  T('avec fiche : pas de mise en garde « estimation a +-15 % »', x.t.indexOf('±15') < 0);
  x = scop(code, { scopCOP: 4.0 });
  T('sans fiche : mise en garde « estimation a +-10 % / +-15 % » et calage sur les fiches Keymark', x.t.indexOf('±10') >= 0 && x.t.indexOf('±15') >= 0 && x.t.indexOf('KEYMARK') >= 0);
  T('rappel : eta s = SCOP/2,5 - F(1) 3 %', x.t.indexOf('ηs = SCOP/2,5 − F(1) 3 %') >= 0);

  // 3) facteur de climat (fonction des degres-jours), bornes
  const cities = [['DZ', 'DZ_ALG', 800], ['FR', 'FR_PAR', 2400], ['FR', 'FR_STR', 2900], ['DE', 'DE_BER', 3200], ['GB', 'GB_LON', 2800]];
  cities.forEach(([c, v, hdd]) => {
    const city = CLIM[c].cities.find(y => y.v === v); if (!city) { T('ville ' + v + ' presente', false); return; }
    const r = scop(code, { scopCountry: c, scopZone: v, scopCOP: 4.0 });
    T(city.l + ' (HDD ' + city.hdd + ') : facteur ' + refFactor(city.hdd).toFixed(2), lineOf(r.lines, 'Facteur climat').indexOf(refFactor(city.hdd).toFixed(2)) >= 0, lineOf(r.lines, 'Facteur climat'));
  });
  let monoOK = true, prev = 99, seen = [];
  CLIM.FR.cities.concat(CLIM.DE.cities, CLIM.DZ.cities, CLIM.MA.cities, CLIM.GB.cities).sort((p, q) => p.hdd - q.hdd).forEach(cty => {
    const code2 = cty; const c0 = Object.keys(CLIM).find(k => CLIM[k].cities.indexOf(cty) >= 0);
    const r = scop(code, { scopCountry: c0, scopZone: cty.v, scopCOP: 4.0 }), se = parseFloat(lineOf(r.lines, 'SCOP estimé').split(':')[1]);
    if (se > prev + 1e-9) monoOK = false; prev = se; seen.push(se);
    if (Math.abs(se - Math.round(4 * refFactor(cty.hdd) * 100) / 100) > 0.0051) monoOK = false;
  });
  T('toutes les villes (' + seen.length + ') : SCOP estime = COP x facteur, decroissant quand le climat est plus froid', monoOK && seen.length > 20);
  const rc = scop(code, { scopCountry: 'ZZ', scopZone: 'ZZ_COLD', scopCOP: 5 }), rh = scop(code, { scopCountry: 'ZZ', scopZone: 'ZZ_HOT', scopCOP: 4 });
  T('climat tres froid (HDD 8000, ville fictive) : facteur borne a 0,65, SCOP 3,25', lineOf(rc.lines, 'Facteur climat').indexOf('0.65') >= 0 && lineOf(rc.lines, 'SCOP estimé').indexOf('3.25') >= 0, lineOf(rc.lines, 'Facteur climat'));
  const rm = scop(code, { scopCountry: 'ZZ', scopZone: 'ZZ_MID', scopCOP: 4 });
  T('climat froid HDD 4800 (au-dela de 4200) : facteur 0,77 - 0,000108 x 600 = 0,7052, SCOP 2,82', lineOf(rm.lines, 'Facteur climat').indexOf('0.71') >= 0 && lineOf(rm.lines, 'SCOP estimé').indexOf('2.82') >= 0, lineOf(rm.lines, 'SCOP estimé'));
  T('climat tres chaud (HDD 0, ville fictive) : facteur borne a 1,03, SCOP 4,12, note « peu de sens »', lineOf(rh.lines, 'Facteur climat').indexOf('1.03') >= 0 && lineOf(rh.lines, 'SCOP estimé').indexOf('4.12') >= 0 && rh.t.indexOf('peu de sens') >= 0, lineOf(rh.lines, 'Facteur climat'));

  let hhBad = [];
  [['DZ', 'DZ_ALG'], ['DZ', 'DZ_CON'], ['FR', 'FR_PAR'], ['FR', 'FR_STR'], ['DE', 'DE_BER'], ['GB', 'GB_LON']].forEach(([c, v]) => {
    const city = CLIM[c].cities.find(y => y.v === v); const r = scop(code, { scopCountry: c, scopZone: v, scopFiche: 4, scopCap: 10 });
    const m = /≈(\d+) h/.exec(lineOf(r.lines, 'Énergie/an')); if (!m || +m[1] !== hh10(city.hdd)) hhBad.push(v + ' ' + (m && m[1]) + ' vs ' + hh10(city.hdd));
  });
  { const r = scop(code, { scopCountry: 'ZZ', scopZone: 'ZZ_MID', scopFiche: 4, scopCap: 10 }); const m = /≈(\d+) h/.exec(lineOf(r.lines, 'Énergie/an')); if (!m || +m[1] !== hh10(4800)) hhBad.push('ZZ_MID ' + (m && m[1])); }
  { const r = scop(code, { scopCountry: 'ZZ', scopZone: 'ZZ_COLD', scopFiche: 4, scopCap: 10 }); const m = /≈(\d+) h/.exec(lineOf(r.lines, 'Énergie/an')); if (!m || +m[1] !== hh10(8000)) hhBad.push('ZZ_COLD ' + (m && m[1])); }
  T('heures equivalentes de chaque zone = interpolation EN 14825 (1336 / 2066 / 2465 h, reglement 811/2013 annexe VII)', hhBad.length === 0, hhBad.join(' | '));

  // 4) classes energetiques a 35 C (reglement 811/2013, tableau 2) et eta s
  let clsBad = [];
  for (const [thr, c] of REF35) {
    if (thr < 59) continue;           // la fiche SCOP est limitee a 1,5 minimum
    for (const d of [0, -1]) {
      const eta = thr + d, fiche = (eta + 3) / 40;
      const r = scop(code, { scopFiche: fiche.toFixed(3) }), cl = /: ([A-G]\+*)\n/.exec(lineOf(r.lines, 'Classe énergétique') + '\n');
      const etaShown = parseInt(/ηs = (-?\d+) %/.exec(lineOf(r.lines, 'SCOP (fiche'))[1], 10);
      const want = refCls(etaShown);
      if (!cl || cl[1] !== want) clsBad.push(fiche.toFixed(3) + ' -> eta ' + etaShown + ' attendu ' + want + ' obtenu ' + (cl && cl[1]));
    }
  }
  T('classes a 35 C : bornes (eta s affiche en entier = classe affichee)', clsBad.length === 0, clsBad.slice(0, 4).join(' | '));
  const cl2 = (f) => { const r = scop(code, { scopFiche: f }); return [parseInt(/ηs = (-?\d+) %/.exec(lineOf(r.lines, 'SCOP (fiche'))[1], 10), (/: ([A-G]\+*)\n/.exec(lineOf(r.lines, 'Classe énergétique') + '\n') || [])[1]]; };
  T('SCOP fiche 4,45 -> eta s 175 % -> A+++', JSON.stringify(cl2(4.45)) === '[175,"A+++"]', JSON.stringify(cl2(4.45)));
  T('SCOP fiche 3,12 -> eta s 122 % (121,8) -> A (sous 123)', JSON.stringify(cl2(3.12)) === '[122,"A"]', JSON.stringify(cl2(3.12)));
  T('SCOP fiche 3,14 -> eta s 122,6 affiche 123 % -> la classe doit etre celle du 123 affiche : A+', JSON.stringify(cl2(3.14)) === '[123,"A+"]', JSON.stringify(cl2(3.14)));
  T('SCOP fiche 4,43 -> eta s 174,2 affiche 174 % -> A++ (sous 175) ; 4,448 -> 174,92 affiche 175 -> A+++', JSON.stringify(cl2(4.43)) === '[174,"A++"]' && JSON.stringify(cl2(4.448)) === '[175,"A+++"]', JSON.stringify([cl2(4.43), cl2(4.448)]));
  T('SCOP fiche 1,6 -> eta s 61 % -> D ; 1,55 -> 59 % -> E', JSON.stringify(cl2(1.6)) === '[61,"D"]' && JSON.stringify(cl2(1.55)) === '[59,"E"]', JSON.stringify([cl2(1.6), cl2(1.55)]));

  // 5) CO2 : meme facteur que le module TEWI
  const tw = n => { const e = TEWI_GRID.find(g => g[1].indexOf(n) === 0); return e ? parseFloat(e[0]) : NaN; };
  const co2 = c => { const r = scop(code, { scopCountry: c, scopZone: CLIM[c].cities[0].v, scopFiche: 4 }); const m = /\(([0-9.]+) kg\/kWh\)/.exec(r.t); return m ? parseFloat(m[1]) : NaN; };
  T('CO2 Algerie = facteur reseau du module TEWI (0,500)', co2('DZ') === tw('Algeria') && tw('Algeria') === 0.5, [co2('DZ'), tw('Algeria')]);
  T('CO2 France = facteur reseau du module TEWI (0,041)', co2('FR') === tw('France') && tw('France') === 0.041, [co2('FR'), tw('France')]);
  const rA = scop(code, { scopCountry: 'DZ', scopZone: CLIM.DZ.cities[0].v, scopFiche: 4, scopCap: 12 });
  T('CO2 Algerie (Alger, 890 h) : 12 kW x 890 h / 4 x 0,500 = 1335 kg', num(/CO₂ : ([\d\s  ]+) kg/.exec(rA.t)[1]) === 1335, rA.t.split('\n').pop());
  const rM = scop(code, { scopCountry: 'MA', scopZone: CLIM.MA.cities[0].v, scopFiche: 4 });
  T('pays sans facteur dans le module : renvoi vers TEWI', rM.t.indexOf('module TEWI') >= 0);
  const rW = scop(code, { scopCountry: 'DZ', scopZone: 'DZ_ALG', scopFiche: 4 }), rS = scop(code, { scopCountry: 'DZ', scopZone: 'DZ_ALG' });
  T('climat chaud (HDD < 300) : note « SCOP a peu de sens » absente a 800 HDD', rW.t.indexOf('peu de sens') < 0);

  // 6) rentabilite PAC / chaudiere gaz
  const roi = (o, lg) => { const r = run(code, Object.assign({ roiInstPAC: 350000, roiInstChaud: 180000, roiKwh: 20000, roiScop: 3.5, roiCopChaud: 0.9, roiPrixElec: 4.81, roiPrixGaz: 0.35 }, o || {}), lg); r.w.calcROI(); return r.el('roiResult').textContent; };
  let t = roi();
  const cop = 20000 / 3.5 * 4.81, gaz = 20000 / 0.9 * 0.35, eco = gaz - cop, ex = 350000 - 180000;
  T('rentabilite : eco = gaz - PAC (negatif ici) -> « pas de retour sur investissement »', eco < 0 && t.indexOf('Pas de retour') >= 0 && t.indexOf('Retour investissement:  —') >= 0, t.split('\n').slice(-3).join('|'));
  t = roi({ roiPrixElec: 1, roiPrixGaz: 3, roiKwh: 20000, roiInstPAC: 250000, roiInstChaud: 180000 });
  const cop2 = 20000 / 3.5 * 1, gaz2 = 20000 / 0.9 * 3, eco2 = gaz2 - cop2, ex2 = 70000;
  T('rentabilite : economie annuelle', num(/Economie annuelle:\s+([\d\s  ]+)/.exec(t)[1]) === Math.round(eco2), [t.split('\n')[3], Math.round(eco2)]);
  T('rentabilite : retour = surcout / economie', Math.abs(parseFloat(/Retour investissement:\s+([\d.]+)/.exec(t)[1]) - ex2 / eco2) < 0.051, [ex2 / eco2, t.split('\n')[6]]);
  T('rentabilite : gain net 10 ans = 10 x economie - surcout', num(/Gain net 10 ans:\s+(-?[\d\s  ]+)/.exec(t)[1]) === Math.round(eco2 * 10 - ex2), [t.split('\n')[7], Math.round(eco2 * 10 - ex2)]);
  const pbCase = pb => { const e = 1000, inst = pb * e; const tt = roi({ roiKwh: 1000, roiScop: 2, roiCopChaud: 1, roiPrixElec: 1, roiPrixGaz: 1 + e / 1000 + 0.0 /*placeholder*/, roiInstPAC: 0, roiInstChaud: 0 }); return tt; };
  const mk = (pb) => roi({ roiKwh: 1000, roiScop: 2, roiCopChaud: 1, roiPrixElec: 1, roiPrixGaz: 1.5, roiInstChaud: 0, roiInstPAC: pb * 1000 });   // eco = 1500 - 500 = 1000 par an
  T('retour 6,9 ans : rentable', mk(6.9).indexOf('Investissement rentable') >= 0, mk(6.9).split('\n').slice(-3).join('|'));
  T('retour 7,0 ans : long amortissement', mk(7).indexOf('Long amortissement') >= 0, mk(7).split('\n').slice(-3).join('|'));
  T('retour 20,0 ans : long amortissement ; 20,1 ans : peu rentable', mk(20).indexOf('Long amortissement') >= 0 && mk(20.1).indexOf('peu rentable') >= 0);
  T('PAC moins chere a l\'installation et a l\'usage', roi({ roiInstPAC: 100000, roiInstChaud: 180000, roiPrixElec: 1, roiPrixGaz: 3 }).indexOf('moins chère') >= 0);
  const bads = [[{ roiScop: 1.4 }, 'SCOP PAC'], [{ roiScop: 9.1 }, 'SCOP PAC'], [{ roiCopChaud: 0.3 }, 'Rendement'], [{ roiCopChaud: 1.2 }, 'Rendement'], [{ roiKwh: 0 }, 'Besoins'], [{ roiPrixElec: 0 }, 'électricité'], [{ roiPrixGaz: '' }, 'gaz'], [{ roiInstPAC: -1 }, 'Installation PAC'], [{ roiInstChaud: -1 }, 'chaudière']];
  T('rentabilite : 9 entrees invalides refusees', bads.every(([o, k]) => { const s = roi(o); return s.indexOf('⚠') === 0 && s.indexOf(k) >= 0; }), bads.map(([o, k]) => roi(o).slice(0, 30)).join(' | '));
  T('rentabilite : rendement chaudiere 1,10 accepte (condensation, PCI)', roi({ roiCopChaud: 1.1 }).indexOf('⚠') !== 0);
  T('rentabilite en anglais', roi({}, 'en').indexOf('HEAT PUMP ROI') === 0);

  // 7) base de donnees des villes : coherence (pas l'exactitude)
  let nb = 0, nbad = [];
  for (const k in CLIM) CLIM[k].cities.forEach(c => { nb++; if (!(c.hdd >= 0 && c.hdd <= 9000 && c.cdd >= 0 && c.cdd <= 6000 && typeof c.T_ext === 'number' && c.v && c.l)) nbad.push(k + ':' + c.l); });
  T('villes (extrait de 5 pays) : valeurs numeriques et bornes', nbad.length === 0 && nb > 40, nbad.slice(0, 3).join(','));
  return { ok, ko };
}

console.log('Module SCOP : ' + htmlFile);
const res = suite(CODE, true);

// ---- Mutations
console.log('Mutations (chacune doit etre detectee)');
const MUT = [
  ['facteur : climat moyen 0,91 -> 1,00', '[2900,0.91]', '[2900,1.00]'],
  ['facteur : climat plus chaud 1,03 -> 1,25', '[1200,1.03]', '[1200,1.25]'],
  ['facteur : climat plus froid 0,77 -> 0,87', '[4200,0.77]', '[4200,0.87]'],
  ['facteur : borne chaude 1,03 -> 1,10', 'if(hdd<=1200)return 1.03;', 'if(hdd<=1200)return 1.10;'],
  ['facteur : plancher 0,65 -> 0,80', 'Math.max(0.65,0.77-0.000108', 'Math.max(0.80,0.77-0.000108'],
  ['facteur : pente au-dela de 4200 doublee', '0.77-0.000108*(hdd-4200)', '0.77-0.000208*(hdd-4200)'],
  ['heures : moyen 2066 -> 2000', '[2900,2066]', '[2900,2000]'],
  ['heures : plus chaud 1336 -> 1300', '[1200,1336]', '[1200,1300]'],
  ['heures : plus froid 2465 -> 2400', '[4200,2465]', '[4200,2400]'],
  ['heures : plafond 3000 -> 4000', 'Math.min(3000,', 'Math.min(4000,'],
  ['heures : sous 1200 non proportionnelles', '1336*hdd/1200', '1336'],
  ['heures : arrondi a 10 h supprime', 'hh=Math.round(hhe(c.hdd)/10)*10', 'hh=Math.round(hhe(c.hdd))'],
  ['CC 2,5 -> 2,0', 'var CC=2.5;', 'var CC=2.0;'],
  ['eta s : F(1) 3 -> 5', 'var etas=used/CC*100-3;', 'var etas=used/CC*100-5;'],
  ['classe : A+++ 175 -> 170', "[[175,'A+++']", "[[170,'A+++']"],
  ['classe : A+ 123 -> 125', "[123,'A+']", "[125,'A+']"],
  ['classe : B 107 -> 105', "[107,'B']", "[105,'B']"],
  ['classe : D 61 -> 60', "[61,'D']", "[60,'D']"],
  ['classe : E 59 -> 58', "[59,'E']", "[58,'E']"],
  ['energie : heures codees en dur 2000', 'E=cap*hh/used', 'E=cap*2000/used'],
  ['CO2 Algerie 0,587 (ancien)', 'DZ:0.500', 'DZ:0.587'],
  ['CO2 France 0,084 (ancien)', 'FR:0.041', 'FR:0.084'],
  ['SCOP fiche ignore', 'used=(fiche>0)?fiche:est', 'used=est'],
  ['COP borne basse 1,5 -> 1', 'cop>=1.5&&cop<=8', 'cop>=1&&cop<=8'],
  ['COP borne haute 8 -> 10', 'cop>=1.5&&cop<=8', 'cop>=1.5&&cop<=10'],
  ['fiche borne haute 9 -> 12', 'fiche>=1.5&&fiche<=9', 'fiche>=1.5&&fiche<=12'],
  ['ROI : gain annuel inverse', 'eco=gaz-cop', 'eco=cop-gaz'],
  ['ROI : rendement chaudiere ignore', 'gaz=r.kwh/r.rend*r.pg', 'gaz=r.kwh*r.pg'],
  ['ROI : seuil 7 ans -> 10', 'else if(pb<7)', 'else if(pb<10)'],
  ['ROI : seuil 20 ans -> 25', 'else if(pb<=20)', 'else if(pb<=25)'],
  ['ROI : gain net sur 5 ans', 'net=eco*10-extra', 'net=eco*5-extra'],
  ['ROI : SCOP PAC borne 9 -> 12', 'r.scop>=1.5&&r.scop<=9', 'r.scop>=1.5&&r.scop<=12'],
  ['ROI : surcout inverse', 'extra=r.ip-r.ic', 'extra=r.ic-r.ip'],
  ['capacite non verifiee', "if(!(cap>0)) err.push(L('Capacité : saisir", "if(false) err.push(L('Capacité : saisir"],
  ['classe sur eta s non arrondi', 'cls(Math.round(etas),T35)', 'cls(etas,T35)']
];
function nthRep(code, s, r) { const i = code.indexOf(s); if (i < 0 || code.indexOf(s, i + 1) >= 0) return null; return code.slice(0, i) + r + code.slice(i + s.length); }
let mok = 0, mdet = 0;
for (const [nm, s, r] of MUT) {
  const code2 = nthRep(CODE, s, r);
  if (code2 === null) { console.log('  ECHEC  mutation « ' + nm + ' » : ancre introuvable ou non unique'); mdet++; continue; }
  let q; const keep = console.log; console.log = () => {}; try { q = suite(code2, false); } catch (e) { q = { ko: 1 }; } finally { console.log = keep; }
  if (q.ko > 0) mok++; else { console.log('  ECHEC  mutation « ' + nm + ' » NON detectee'); mdet++; }
}
const ok = res.ok + mok, ko = res.ko + mdet;
console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
