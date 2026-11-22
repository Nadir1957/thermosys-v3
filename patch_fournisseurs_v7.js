// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v7, Moyen-Orient et Asie, suite)
// Usage : node patch_fournisseurs_v7.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v7"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v6">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v6.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  QA: ["Un seul opérateur, sans choix : Kahramaa (Qatar General Electricity & Water Corporation), seul propriétaire et exploitant du transport et de la distribution d’électricité et d’eau.",
       "Single operator, no choice: Kahramaa (Qatar General Electricity & Water Corporation), the sole owner and operator of electricity and water transmission and distribution.",
       "Un único operador, sin elección: Kahramaa (Qatar General Electricity & Water Corporation), único propietario y operador del transporte y la distribución de electricidad y agua."],
  JO: ["Selon la région, sans choix : JEPCO (centre du pays), IDECO (nord), EDCO (sud), trois sociétés de distribution privées. Transport et acheteur unique : NEPCO (État).",
       "By region, no choice: JEPCO (centre), IDECO (north), EDCO (south), three privately owned distribution companies. Transmission and single buyer: NEPCO (state).",
       "Según la región, sin elección: JEPCO (centro), IDECO (norte), EDCO (sur), tres empresas de distribución privadas. Transporte y comprador único: NEPCO (Estado)."],
  MY: ["Selon la région, sans choix : TNB (Malaisie péninsulaire), SESB (Sabah), SEB / Sarawak Energy (Sarawak). Régulateur : Suruhanjaya Tenaga (Commission de l’énergie).",
       "By region, no choice: TNB (Peninsular Malaysia), SESB (Sabah), SEB / Sarawak Energy (Sarawak). Regulator: Energy Commission (Suruhanjaya Tenaga).",
       "Según la región, sin elección: TNB (Malasia peninsular), SESB (Sabah), SEB / Sarawak Energy (Sarawak). Regulador: Comisión de Energía (Suruhanjaya Tenaga)."],
  PK: ["Selon la zone, sans choix : dix sociétés de distribution suivies par le régulateur NEPRA : PESCO, IESCO, GEPCO, FESCO, LESCO, MEPCO, QESCO, SEPCO, HESCO et K-Electric (société privée). TESCO existe aussi. Vérifiez votre société sur votre facture.",
       "By area, no choice: ten distribution companies tracked by the regulator NEPRA: PESCO, IESCO, GEPCO, FESCO, LESCO, MEPCO, QESCO, SEPCO, HESCO and K-Electric (private). TESCO also exists. Check your company on your bill.",
       "Según la zona, sin elección: diez empresas de distribución seguidas por el regulador NEPRA: PESCO, IESCO, GEPCO, FESCO, LESCO, MEPCO, QESCO, SEPCO, HESCO y K-Electric (privada). También existe TESCO. Compruebe su empresa en la factura."],
  ID: ["PLN est le principal fournisseur des consommateurs finaux et exploite la distribution. Dans une zone d’activité donnée, un seul titulaire de permis peut distribuer (exemples : zones industrielles desservies par des opérateurs privés). Pas de choix du fournisseur pour les ménages.",
       "PLN is the main supplier to end-consumers and runs distribution. In a given business area only one permit holder may distribute (for example industrial estates served by private operators). No supplier choice for households.",
       "PLN es el principal suministrador de los consumidores finales y gestiona la distribución. En una zona de actividad solo un titular de permiso puede distribuir (por ejemplo, polígonos industriales servidos por operadores privados). Sin elección de suministrador para los hogares."],
  IR: ["Selon la région, sans choix : TAVANIR (holding d’État) ; 16 sociétés régionales d’électricité (transport) et 39 sociétés de distribution régionales, dont plusieurs à Téhéran (chiffres 2017 ; à revalider).",
       "By region, no choice: TAVANIR (state holding); 16 regional electric companies (transmission) and 39 regional distribution companies, several in Tehran (2017 figures; to be re-validated).",
       "Según la región, sin elección: TAVANIR (holding estatal); 16 empresas eléctricas regionales (transporte) y 39 empresas de distribución regionales, varias en Teherán (cifras de 2017; por revalidar)."],
  VN: ["Sans choix : EVN (groupe d’État) et ses cinq sociétés de distribution : Nord (NPC), Centre (CPC), Sud (SPC), Hanoï et Hô-Chi-Minh-Ville.",
       "No choice: EVN (state group) and its five distribution companies: North (NPC), Central (CPC), South (SPC), Hanoi and Ho Chi Minh City.",
       "Sin elección: EVN (grupo estatal) y sus cinco empresas de distribución: Norte (NPC), Centro (CPC), Sur (SPC), Hanói y Ciudad Ho Chi Minh."],
  LK: ["Selon la zone, sans choix : 5 distributeurs agréés par le régulateur PUCSL : 4 régions du CEB (Ceylon Electricity Board) et LECO (Lanka Electricity Company).",
       "By area, no choice: 5 distribution licensees under the regulator PUCSL: 4 CEB (Ceylon Electricity Board) regions and LECO (Lanka Electricity Company).",
       "Según la zona, sin elección: 5 distribuidores con licencia del regulador PUCSL: 4 regiones del CEB (Ceylon Electricity Board) y LECO (Lanka Electricity Company)."],
  OM: ["Sans choix : réseau principal et Dhofar sous la structure NAMA (NAMA Supply ; NAMA Dhofar Services pour le Dhofar) ; zones rurales hors réseau : RAECO. Régulateur : APSR. Vérifiez votre distributeur sur votre facture.",
       "No choice: main grid and Dhofar under the NAMA structure (NAMA Supply; NAMA Dhofar Services for Dhofar); rural off-grid areas: RAECO. Regulator: APSR. Check your distributor on your bill.",
       "Sin elección: red principal y Dhofar bajo la estructura NAMA (NAMA Supply; NAMA Dhofar Services para Dhofar); zonas rurales fuera de red: RAECO. Regulador: APSR. Compruebe su distribuidor en la factura."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv7) { sc.__fv7 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv7 && typeof MutationObserver !== 'undefined') { el.__fv7 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v7">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
