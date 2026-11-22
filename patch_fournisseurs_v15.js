// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v15, Balkans et Malte)
// Usage : node patch_fournisseurs_v15.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v15"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v14">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v14.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  HR: ["Réseau : HEP-ODS (Operator distribucijskog sustava). Fournisseur : le service public est assuré par HEP Elektra ; le groupe HEP fournit 92 % des clients et 90 % de l’électricité vendue aux ménages relève du service universel (HERA, 2024). 8 fournisseurs enregistrés fin 2024.",
       "Grid: HEP-ODS (distribution system operator). Supply: the public service is provided by HEP Elektra; the HEP group supplies 92% of customers and 90% of electricity sold to households is under universal service (HERA, 2024). 8 registered suppliers at end 2024.",
       "Red: HEP-ODS (gestor del sistema de distribución). Suministro: el servicio público lo presta HEP Elektra; el grupo HEP suministra al 92 % de los clientes y el 90 % de la electricidad vendida a los hogares es servicio universal (HERA, 2024). 8 suministradores registrados a finales de 2024."],
  MT: ["Sans choix : Enemalta plc est l’unique gestionnaire de réseau de distribution et le seul titulaire d’une licence de fourniture aux clients finaux ; le marché de détail n’est pas ouvert (dérogation européenne jusqu’au 5 juillet 2027). Régulateur : REWS.",
       "No choice: Enemalta plc is the sole distribution system operator and the only licensed supplier to final customers; the retail market is not open (EU derogation until 5 July 2027). Regulator: REWS.",
       "Sin elección: Enemalta plc es el único gestor de la red de distribución y el único titular de licencia de suministro a clientes finales; el mercado minorista no está abierto (excepción europea hasta el 5 de julio de 2027). Regulador: REWS."],
  BA: ["Selon l’entité, quasi sans choix : trois entreprises publiques (EPBiH, EP HZHB, ERS en Republika Srpska) assurent distribution et fourniture, avec service universel à prix régulés pour ménages et petits clients. Seuls 0,2 % de la consommation sont fournis par des fournisseurs alternatifs (2023).",
       "By entity, almost no choice: three state utilities (EPBiH, EP HZHB, ERS in Republika Srpska) run distribution and supply, with universal service at regulated prices for households and small customers. Only 0.2% of consumption is supplied by alternative suppliers (2023).",
       "Según la entidad, casi sin elección: tres empresas públicas (EPBiH, EP HZHB, ERS en la República Srpska) realizan la distribución y el suministro, con servicio universal a precios regulados para hogares y pequeños clientes. Solo el 0,2 % del consumo lo suministran proveedores alternativos (2023)."],
  ME: ["Réseau : CEDIS (séparé juridiquement d’EPCG). Fournisseur : le marché de détail est entièrement fourni par EPCG (EPCG Snabdijevanje), malgré d’autres licences, aussi fournisseur de dernier recours et des clients vulnérables ; quatre modèles tarifaires au choix pour les ménages.",
       "Grid: CEDIS (legally unbundled from EPCG). Supply: the retail market is fully supplied by EPCG (EPCG Snabdijevanje) even though other suppliers are licensed, also supplier of last resort and of vulnerable customers; households can choose among four tariff models.",
       "Red: CEDIS (separado jurídicamente de EPCG). Suministro: el mercado minorista está totalmente abastecido por EPCG (EPCG Snabdijevanje), aunque hay otras licencias, también suministrador de último recurso y de clientes vulnerables; los hogares eligen entre cuatro modelos tarifarios."],
  MK: ["Réseau : Elektrodistribucija (séparée juridiquement). Le fournisseur universel, aussi fournisseur de dernier recours, est désigné par le gouvernement pour cinq ans (mandat renouvelé mi-2024) ; les ménages ont un tarif à quatre tranches. Depuis le 1er janvier 2024, l’ERC ne fixe plus le prix mais le contrôle. Régulateur : ERC.",
       "Grid: Elektrodistribucija (legally unbundled). The universal supplier, also supplier of last resort, is selected by the government for five years (second term from mid-2024); households have a four-block tariff. Since 1 January 2024, ERC no longer sets the price but checks it. Regulator: ERC.",
       "Red: Elektrodistribucija (separada jurídicamente). El suministrador universal, también de último recurso, es elegido por el Gobierno por cinco años (segundo mandato desde mediados de 2024); los hogares tienen tarifa de cuatro bloques. Desde el 1 de enero de 2024 la ERC ya no fija el precio, pero lo controla. Regulador: ERC."],
  AL: ["Réseau : OSHEE (société d’État à 100 %, gestionnaire de distribution). La majorité de la consommation relève du marché régulé, fourni par FSHU (fournisseur du service universel) ; les ménages sont 77 % de ses clients. Régulateur : ERE.",
       "Grid: OSHEE (100% state-owned distribution system operator). Most consumption is on the regulated market, supplied by FSHU (universal service supplier); households are 77% of its customers. Regulator: ERE.",
       "Red: OSHEE (gestor de distribución, 100 % estatal). La mayor parte del consumo está en el mercado regulado, abastecido por FSHU (suministrador del servicio universal); los hogares son el 77 % de sus clientes. Regulador: ERE."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv15) { sc.__fv15 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv15 && typeof MutationObserver !== 'undefined') { el.__fv15 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v15">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
