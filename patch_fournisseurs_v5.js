// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v5, etape 2 : Moyen-Orient et Asie)
// Usage : node patch_fournisseurs_v5.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v5"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v4">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v4.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  AE: ['Selon l’émirat, sans choix : DEWA (Dubaï), ADDC et AADC (Abou Dabi et Al Aïn, fusionnées sous la marque TAQA Distribution depuis janvier 2025), SEWA (Charjah), EtihadWE (Ajman, Umm al-Qaïwain, Ras al-Khaïmah, Fujaïrah).',
       'Depends on the emirate, no choice: DEWA (Dubai), ADDC and AADC (Abu Dhabi and Al Ain, merged under the TAQA Distribution brand since January 2025), SEWA (Sharjah), EtihadWE (Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah).',
       'Según el emirato, sin elección: DEWA (Dubái), ADDC y AADC (Abu Dabi y Al Ain, fusionadas bajo la marca TAQA Distribution desde enero de 2025), SEWA (Sarja), EtihadWE (Ajmán, Umm al Qaiwain, Ras al Jaima, Fuyaira).'],
  SA: ['Saudi Electricity Company (SEC), sans choix du fournisseur. Régulateur : ECRA. Transport : National Grid SA, filiale à 100 % de SEC.',
       'Saudi Electricity Company (SEC), no supplier choice. Regulator: ECRA. Transmission: National Grid SA, wholly owned by SEC.',
       'Saudi Electricity Company (SEC), sin elección de suministrador. Regulador: ECRA. Transporte: National Grid SA, filial 100 % de SEC.'],
  TR: ['Réseau : 21 sociétés de distribution, chacune en monopole dans sa région (BEDAŞ et AYEDAŞ à Istanbul, Başkent à Ankara, GDZ à Izmir, Uludağ à Bursa, Toroslar, Akdeniz, Aydem, SEDAŞ, etc.). La vente est assurée par le fournisseur désigné de la région ; le choix n’existe qu’au-dessus d’un seuil annuel fixé par l’EPDK (régulateur).',
       'Grid: 21 distribution companies, each a monopoly in its own region (BEDAŞ and AYEDAŞ in Istanbul, Başkent in Ankara, GDZ in Izmir, Uludağ in Bursa, Toroslar, Akdeniz, Aydem, SEDAŞ, etc.). Sales are made by the region’s designated supplier; choice exists only above an annual threshold set by EPDK (regulator).',
       'Red: 21 empresas de distribución, cada una en monopolio en su región (BEDAŞ y AYEDAŞ en Estambul, Başkent en Ankara, GDZ en Esmirna, Uludağ en Bursa, Toroslar, Akdeniz, Aydem, SEDAŞ, etc.). La venta la hace el suministrador designado de la región; la elección solo existe por encima de un umbral anual fijado por EPDK (regulador).'],
  KR: ['KEPCO domine la distribution d’électricité et la vente au détail n’est pas libéralisée (projet de libéralisation de 2016 retiré). Pas de choix du fournisseur pour les ménages.',
       'KEPCO dominates electricity distribution and retail sales are not liberalized (2016 liberalization proposal withdrawn). No supplier choice for households.',
       'KEPCO domina la distribución de electricidad y la venta minorista no está liberalizada (propuesta de liberalización de 2016 retirada). Sin elección de suministrador para los hogares.'],
  TH: ['Selon la zone, sans choix : MEA (Bangkok, Nonthaburi, Samut Prakan) et PEA (74 provinces hors zone MEA).',
       'By area, no choice: MEA (Bangkok, Nonthaburi, Samut Prakan) and PEA (74 provinces outside the MEA area).',
       'Según la zona, sin elección: MEA (Bangkok, Nonthaburi, Samut Prakan) y PEA (74 provincias fuera de la zona de MEA).'],
  PH: ['Selon la zone : distributeurs privés (Meralco autour de Manille), distributeurs municipaux et coopératives électriques (NEA). Pas de choix pour les ménages (choix réservé aux gros consommateurs, 750 kW et plus).',
       'By area: private distributors (Meralco around Manila), local-government distributors and electric cooperatives (NEA). No choice for households (choice limited to large users, 750 kW and above).',
       'Según la zona: distribuidores privados (Meralco en torno a Manila), distribuidores municipales y cooperativas eléctricas (NEA). Sin elección para los hogares (elección reservada a grandes consumidores, 750 kW o más).']
};
function runtime(D) {
  function $(id) { return document.getElementById(id); }
  function lg() { try { if (window.I18N3 && I18N3.get && I18N3.get() === 'es') return 2; } catch (e) {} return window.lang === 'fr' ? 0 : 1; }
  function apply() {
    var sc = $('scopCountry'), el = $('costFournisseur'); if (!sc || !el) return;
    var d = D[sc.value]; if (!d) return;
    var t = d[lg()]; if (el.textContent !== t) el.textContent = t;
  }
  function later() { setTimeout(apply, 250); setTimeout(apply, 800); }
  function hook() {
    var sc = $('scopCountry'); if (sc && !sc.__fv5) { sc.__fv5 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv5 && typeof MutationObserver !== 'undefined') { el.__fv5 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v5">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
const before = s.length;
s = s.slice(0, e) + '\n' + RT + s.slice(e);
const scripts = s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || [];
let ok = true;
scripts.forEach(function (x) { const body = x.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''); if (!body.trim() || /type="(application\/json|text\/template)"/.test(x)) return; try { new Function(body); } catch (er) { ok = false; console.log('Erreur de syntaxe : ' + er.message); } });
if (!ok) { console.log('ARRET : rien ecrit'); process.exit(1); }
fs.writeFileSync(f, s, 'utf8');
console.log('Pays mis a jour : ' + Object.keys(D).length);
console.log('Taille : ' + before + ' -> ' + s.length + ' octets');
console.log('Syntaxe JS : OK');
