/* Thermosys - test du calcul TEWI (impact carbone) : formule EN 378, liste des PRG (AR4), seuils F-gas, mutations.
   Usage (depuis le dossier files) :  node tests\tewi_regression.js
   Limites : les facteurs d'emission des reseaux electriques par pays ne sont PAS verifies ici (controle de coherence seulement). */
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
const html = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
let ok = 0, ko = 0;
function chk(c, m) { if (c) ok++; else { ko++; console.log('ECHEC : ' + m); } }
function near(a, b, tol, m) { chk(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), m + ' (' + a + ' vs ' + b + ')'); }

// ---- extraction de calcTEWI (comptage d'accolades)
const i0 = html.indexOf('function calcTEWI() {');
chk(i0 > 0 && html.indexOf('function calcTEWI() {', i0 + 5) < 0, 'calcTEWI unique');
let d = 0, j = html.indexOf('{', i0), k = j;
for (; k < html.length; k++) { const c = html[k]; if (c === '{') d++; else if (c === '}') { d--; if (d === 0) break; } }
const SRC = html.slice(i0, k + 1);

function run(src, v, lang) {
  const out = { innerHTML: '' };
  const els = {
    tewi_ref: { value: String(v.gwp), options: [{ text: 'Test (GWP ' + v.gwp + ')' }], selectedIndex: 0 },
    tewi_charge: { value: String(v.ch) }, tewi_leak: { value: String(v.leak) }, tewi_life: { value: String(v.life) },
    tewi_recov: { value: String(v.rec) }, tewi_elec: { value: String(v.elec) }, tewi_kw: { value: String(v.kw || 22) },
    tewi_grid: { value: String(v.grid), options: [{ text: 'G' }], selectedIndex: 0 }, tewi_grid_custom: { value: '0.4' },
    tewiResult: out
  };
  const document = { getElementById: id => els[id] || null };
  const _fnum = (id, def) => { const e = document.getElementById(id); if (!e) return def; const x = parseFloat(String(e.value).replace(',', '.')); return isFinite(x) ? x : def; };
  const window = { lang: lang || 'fr' };
  new Function('document', '_fnum', 'window', src + '; calcTEWI();')(document, _fnum, window);
  return out.innerHTML;
}
function parse(h) {
  const num = lab => { const m = new RegExp('(?:' + lab + ')(?:</b>)?</td><td[^>]*>(?:<b>)?(-?[\\d.]+)(?:</b>)?</td><td[^>]*>(?:<b>)?(-?[\\d.]+)', 'i').exec(h); return m ? [parseFloat(m[1]), parseFloat(m[2])] : null; };
  return { leaks: num('Fuites exploitation|Operational leaks'), eol: num('Fin de vie|End of life'), direct: num('Total Direct'), indirect: num('Indirect \\(elec\\.\\)'), total: num('TOTAL TEWI') };
}
// reference independante (EN 378 : TEWI = GWP.m.L.n + GWP.m.(1-alpha) + n.E.beta), en tCO2eq
function ref(v) {
  const dl = v.gwp * v.ch * (v.leak / 100) * v.life / 1000, de = v.gwp * v.ch * (1 - Math.min(100, Math.max(0, v.rec)) / 100) / 1000, ind = v.elec * v.life * v.grid / 1000;
  return { dl, de, ind, tot: dl + de + ind };
}
function compare(src, tag, strict) {
  let bad = 0;
  const cases = [];
  const gw = [2088, 675, 698, 1430, 3922, 7, 1, 0], chs = [0.5, 5.5, 40, 300], lk = [0, 3, 10], lf = [10, 15, 20], rc = [0, 90, 100], el = [0, 8000, 60000], gr = [0.052, 0.587];
  for (let a = 0; a < 200; a++) cases.push({ gwp: gw[a % 8], ch: chs[(a * 3) % 4], leak: lk[(a * 5) % 3], life: lf[(a * 7) % 3], rec: rc[(a * 11) % 3], elec: el[(a * 13) % 3], grid: gr[a % 2] });
  cases.push({ gwp: 2088, ch: 5.5, leak: 3, life: 15, rec: 90, elec: 8000, grid: 0.587 });
  for (const v of cases) {
    const p = parse(run(src, v, v.gwp % 2 ? 'fr' : 'en')), r = ref(v);
    if (!p.total || !p.direct || !p.indirect || !p.leaks || !p.eol) { bad++; continue; }
    // l'affichage arrondit a 0,01 tCO2eq (et au kg) : tolerance 0,006 t
    const t = x => Math.abs(x) < 1e9;
    if (Math.abs(p.leaks[1] - r.dl) > 0.006 || Math.abs(p.eol[1] - r.de) > 0.006 || Math.abs(p.indirect[1] - r.ind) > 0.006 || Math.abs(p.total[1] - r.tot) > 0.012 ||
      Math.abs(p.direct[1] - (r.dl + r.de)) > 0.006 || Math.abs(p.total[0] - r.tot * 1000) > 12) bad++;
  }
  if (strict) chk(bad === 0, tag + ' : ' + bad + ' cas faux sur ' + cases.length);
  return bad;
}
compare(SRC, 'formule TEWI (200 cas, FR/EN)', true);

// valeur de reference pour le cas par defaut : R410A 5,5 kg, 3 %, 15 ans, 90 %, 8000 kWh, 0,587
{
  const p = parse(run(SRC, { gwp: 2088, ch: 5.5, leak: 3, life: 15, rec: 90, elec: 8000, grid: 0.587 }, 'fr'));
  near(p.leaks[1], 5.5 * 0.03 * 15 * 2088 / 1000, 0.003, 'fuites defaut'); near(p.eol[1], 1.15, 0.01, 'fin de vie defaut');
  near(p.indirect[1], 70.44, 0.001, 'indirect defaut'); near(p.total[1], 5.17 + 1.15 + 70.44, 0.002, 'total defaut');
}
// recuperation limitee a 0-100 %
{ const p = parse(run(SRC, { gwp: 1000, ch: 10, leak: 0, life: 10, rec: 150, elec: 0, grid: 0.5 })); near(p.eol[1], 0, 0.001, 'recuperation > 100 % ramenee a 100');
  const q = parse(run(SRC, { gwp: 1000, ch: 10, leak: 0, life: 10, rec: -20, elec: 0, grid: 0.5 })); near(q.eol[1], 10, 0.001, 'recuperation < 0 ramenee a 0'); }
// sens physique : monotonie
{ const a = parse(run(SRC, { gwp: 675, ch: 5, leak: 3, life: 15, rec: 90, elec: 8000, grid: 0.5 })).total[1], b = parse(run(SRC, { gwp: 675, ch: 5, leak: 6, life: 15, rec: 90, elec: 8000, grid: 0.5 })).total[1];
  chk(b > a, 'plus de fuite => TEWI plus grand'); }

// ---- mutations : le test doit echouer
const MUT = [
  ['fuites sans duree de vie', 'charge * leak * life * gwp', 'charge * leak * gwp'],
  ['fin de vie sans (1-recup)', 'charge * (1 - recov) * gwp', 'charge * recov * gwp'],
  ['indirect sans duree', 'elec * life * gridFactor', 'elec * gridFactor'],
  ['mauvais /1000', 'elec * life * gridFactor / 1000', 'elec * life * gridFactor / 100'],
  ['taux de fuite en % oublie', '_fnum(\'tewi_leak\', 3) / 100', '_fnum(\'tewi_leak\', 3)'],
  ['total sans indirect', 'var total = directTotal + indirect;', 'var total = directTotal;']
];
for (const m of MUT) {
  const c = SRC.split(m[1]).length - 1; chk(c === 1, 'mutation « ' + m[0] + ' » : ancre ' + c);
  if (c === 1) chk(compare(SRC.split(m[1]).join(m[2]), m[0], false) > 0, 'mutation « ' + m[0] + ' » non detectee');
}

// ---- liste des PRG : valeurs de reference (AR4 / Reglement UE 517/2014 ; melanges = somme ponderee AR4)
const sel = /<select class="fsel" id="tewi_ref">([\s\S]*?)<\/select>/.exec(html);
chk(!!sel, 'liste tewi_ref'); const opts = [];
if (sel) { const re = /<option value="([\d.]+)">([^<]*)<\/option>/g; let m; while ((m = re.exec(sel[1]))) opts.push([parseFloat(m[1]), m[2]]); }
const REF = { 'R410A': 2088, 'R32': 675, 'R454B': 466, 'R452B': 698, 'R448A': 1387, 'R449A': 1397, 'R407C': 1774, 'R404A': 3922, 'R1234ze': 7, 'R1234yf': 4, 'R290': 3, 'R744': 1, 'NH3': 0, 'R134a': 1430 };
chk(opts.length === 14, '14 fluides attendus : ' + opts.length);
for (const [name, g] of Object.entries(REF)) { const o = opts.find(x => x[1].indexOf(name) === 0); chk(!!o && o[0] === g, 'PRG ' + name + ' attendu ' + g + ' trouve ' + (o ? o[0] : 'absent')); }
for (const o of opts) { const m = /GWP ([\d.]+)/.exec(o[1]); chk(!!m && parseFloat(m[1]) === o[0], 'libelle coherent avec la valeur : ' + o[1]); }
// composition AR4 des melanges (R32 675, R125 3500, R134a 1430, R143a 4470, R1234yf 4, R1234ze 7)
const AR4 = { R32: 675, R125: 3500, R134a: 1430, R143a: 4470, R1234yf: 4, R1234ze: 7 };
const comp = { R410A: { R32: .5, R125: .5 }, R407C: { R32: .23, R125: .25, R134a: .52 }, R404A: { R125: .44, R143a: .52, R134a: .04 }, R454B: { R32: .689, R1234yf: .311 }, R452B: { R32: .67, R125: .07, R1234yf: .26 }, R448A: { R32: .26, R125: .26, R134a: .21, R1234yf: .20, R1234ze: .07 }, R449A: { R32: .24, R125: .25, R134a: .26, R1234yf: .25 } };
for (const [n, c] of Object.entries(comp)) { let g = 0; for (const [f, x] of Object.entries(c)) g += AR4[f] * x; const o = opts.find(x => x[1].indexOf(n) === 0); chk(o && Math.abs(o[0] - g) <= 0.012 * g, 'melange ' + n + ' : somme AR4 ' + g.toFixed(0) + ' vs liste ' + (o && o[0])); }

// ---- facteurs d'emission des reseaux : coherence seulement (NON verifies)
const gs = /<select class="fsel" id="tewi_grid"[^>]*>([\s\S]*?)<\/select>/.exec(html), grids = [];
if (gs) { const re = /<option value="([^"]+)">([^<]*)<\/option>/g; let m; while ((m = re.exec(gs[1]))) if (m[1] !== 'custom') grids.push([parseFloat(m[1]), m[2]]); }
chk(grids.length === 17, '17 pays attendus : ' + grids.length);
for (const g of grids) chk(isFinite(g[0]) && g[0] > 0.01 && g[0] < 1.0, 'facteur plausible ' + g[1]);

// ---- seuils F-gas (Reglement UE 2024/573, art. 5) dans l'enveloppe d'affichage
const W = html.indexOf('6. TEWI (wrapper'); chk(W > 0, 'enveloppe F-gas presente');
const wsrc = html.slice(W, W + 4500);
chk(/teq>=500/.test(wsrc) && /teq>=50\?/.test(wsrc) && /teq>=5\?/.test(wsrc), 'seuils 500 / 50 / 5 tCO2eq');
chk(/tous les 3 mois/.test(wsrc) && /tous les 6 mois/.test(wsrc) && /tous les 12 mois/.test(wsrc), 'periodicites 3 / 6 / 12 mois');
chk(/10 tCO2e/.test(wsrc), 'seuil 10 tCO2e pour equipement hermetiquement scelle');
chk(/Règlement \(UE\) 2024\/573/.test(wsrc), 'reference reglement');
chk(/PRG ≥ 2500/.test(wsrc), 'interdiction PRG >= 2500 mentionnee (formulation prudente)');
// mention de l'edition des PRG a l'ecran
chk(/PRG AR4|GWP AR4/.test(html.slice(html.indexOf('id="tewi_ref"') - 300, html.indexOf('id="tewi_ref"') + 2500)), 'edition AR4 indiquee pres de la liste');

console.log(ko ? 'KO : ' + ko + ' echec(s), ' + ok + ' verifications reussies' : 'OK : ' + ok + ' verifications TEWI reussies');
process.exit(ko ? 1 : 0);
