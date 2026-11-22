// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v13, Europe de l'Est et Balkans)
// Usage : node patch_fournisseurs_v13.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v13"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v12">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v12.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  BG: ["Selon la région : trois sociétés de distribution régionales en monopole, dont ENERGO-PRO (nord-est du pays, plus de 1,2 million de clients). Les clients de la zone sont servis par le fournisseur régulé de leur région. Votre société figure sur votre facture.",
       "By region: three regional distribution companies, each a monopoly in its area, including ENERGO-PRO (north-east, over 1.2 million customers). Customers on the regulated market are served by their region’s supplier. Your company is shown on your bill.",
       "Según la región: tres empresas de distribución regionales, cada una en monopolio en su zona, entre ellas ENERGO-PRO (noreste, más de 1,2 millones de clientes). Los clientes del mercado regulado son atendidos por el suministrador de su región. Su empresa figura en la factura."],
  LV: ["Fournisseur au choix. Réseau : Sadales tīkls dessert plus de 790 000 clients sur 99 % du territoire (réseau d’environ 93 000 km).",
       "Free choice of supplier. Grid: Sadales tīkls serves more than 790,000 customers over 99% of the territory (about 93,000 km of network).",
       "Libre elección de suministrador. Red: Sadales tīkls atiende a más de 790 000 clientes en el 99 % del territorio (red de unos 93 000 km)."],
  CY: ["Réseau : l’EAC (Electricity Authority of Cyprus) assure la distribution, avec une unité de gestionnaire de réseau (DSO) distincte. Régulateur : CERA.",
       "Grid: EAC (Electricity Authority of Cyprus) runs distribution, with a separate distribution system operator (DSO) unit. Regulator: CERA.",
       "Red: la EAC (Electricity Authority of Cyprus) realiza la distribución, con una unidad de gestor de red (DSO) separada. Regulador: CERA."],
  RS: ["Réseau : Elektrodistribucija Srbije (depuis avril 2021, successeur d’EPS Distribucija). Les ménages et petits clients ont droit à la fourniture garantie à prix régulé par EPS (fournisseur de dernier recours). 79 fournisseurs licenciés, 11 actifs (fin 2024), EPS détient 98,2 % du marché libre.",
       "Grid: Elektrodistribucija Srbije (since April 2021, successor to EPS Distribucija). Households and small customers are entitled to guaranteed supply at regulated prices from EPS (supplier of last resort). 79 licensed suppliers, 11 active (end 2024); EPS holds 98.2% of the open market.",
       "Red: Elektrodistribucija Srbije (desde abril de 2021, sucesora de EPS Distribucija). Los hogares y pequeños clientes tienen derecho al suministro garantizado a precio regulado por EPS (suministrador de último recurso). 79 suministradores con licencia, 11 activos (finales de 2024); EPS tiene el 98,2 % del mercado libre."],
  MD: ["Selon la zone : Premier Energy Distribution (centre et sud, y compris Chisinau, environ 70 % du territoire) et RED-Nord (nord, y compris Bălți, environ 30 %). Fournisseurs universels : Premier Energy et FEE-Nord. Régulateur : ANRE.",
       "By area: Premier Energy Distribution (centre and south, including Chisinau, about 70% of the territory) and RED-Nord (north, including Bălți, about 30%). Universal suppliers: Premier Energy and FEE-Nord. Regulator: ANRE.",
       "Según la zona: Premier Energy Distribution (centro y sur, incluido Chisináu, cerca del 70 % del territorio) y RED-Nord (norte, incluido Bălți, cerca del 30 %). Suministradores universales: Premier Energy y FEE-Nord. Regulador: ANRE."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv13) { sc.__fv13 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv13 && typeof MutationObserver !== 'undefined') { el.__fv13 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v13">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
