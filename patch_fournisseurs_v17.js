// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v17, Asie centrale, Afrique et Caraibes)
// Usage : node patch_fournisseurs_v17.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v17"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v16">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v16.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
 "KZ": [
  "Réseau : 21 sociétés régionales de distribution (AIE). Depuis le 1er janvier 2025, la fourniture aux consommateurs est assurée par les sociétés régionales de réseau électrique (KEGOC, rapport 2024) : organisation en évolution, vérifiez sur votre facture. Tarifs de détail réglementés.",
  "Grid: 21 regional distribution companies (IEA). Since 1 January 2025, supply to consumers is performed by the regional electric grid companies (KEGOC, 2024 report): the set-up is changing, check your bill. Retail tariffs are regulated.",
  "Red: 21 empresas regionales de distribución (AIE). Desde el 1 de enero de 2025, el suministro a los consumidores lo realizan las empresas regionales de red eléctrica (KEGOC, informe 2024): la organización está cambiando, revise su factura. Tarifas minoristas reguladas."
 ],
 "UZ": [
  "Regional Electric Networks JSC (créée en 2019) distribue et vend l’électricité aux consommateurs finaux. Passage à des opérateurs privés en cours : Samarcande (Aksa, concession de 30 ans), Jizzak et Syrdaria prévus en 2026, Namangan et région de Tachkent en 2027 ; objectif : toutes les régions au 1er juillet 2027. Tarifs approuvés par la Commission tarifaire interministérielle.",
  "Regional Electric Networks JSC (created in 2019) distributes and sells electricity to end users. Transfer to private operators is under way: Samarkand (Aksa, 30-year concession), Jizzakh and Syrdarya planned for 2026, Namangan and Tashkent region for 2027; target: all regions by 1 July 2027. Tariffs are approved by the Interdepartmental Tariff Commission.",
  "Regional Electric Networks JSC (creada en 2019) distribuye y vende electricidad a los consumidores finales. Traspaso a operadores privados en curso: Samarcanda (Aksa, concesión de 30 años), Yizzaj y Sirdarió previstas en 2026, Namangán y la región de Taskent en 2027; objetivo: todas las regiones el 1 de julio de 2027. Tarifas aprobadas por la Comisión Tarifaria Interdepartamental."
 ],
 "SN": [
  "Senelec détient le monopole du transport, de la distribution et de la vente dans son périmètre (surtout urbain) et gère 6 des 10 zones de concession rurale ; 4 zones sont confiées à des concessionnaires d’électrification rurale. Régulateur : CRSE ; agence rurale : ASER. Tarifs harmonisés depuis décembre 2018 (fiche pays 2024).",
  "Senelec holds the monopoly on transmission, distribution and sales within its perimeter (mainly urban) and manages 6 of the 10 rural concession zones; 4 zones are assigned to rural electrification concessionaires. Regulator: CRSE; rural agency: ASER. Tariffs harmonised since December 2018 (country sheet, 2024).",
  "Senelec tiene el monopolio del transporte, la distribución y la venta en su perímetro (sobre todo urbano) y gestiona 6 de las 10 zonas de concesión rural; 4 zonas están asignadas a concesionarios de electrificación rural. Regulador: CRSE; agencia rural: ASER. Tarifas armonizadas desde diciembre de 2018 (ficha país, 2024)."
 ],
 "CI": [
  "CIE est le concessionnaire du service public (dispatching, transport, distribution et vente) en vertu d’une convention signée avec l’État ; l’abonnement des ménages se fait avec la CIE. CI-Energies (société d’État) assure la maîtrise d’œuvre des travaux ; régulateur : ANARE-CI.",
  "CIE is the public-service concessionaire (dispatching, transmission, distribution and sales) under a convention signed with the State; households subscribe with CIE. CI-Energies (state company) manages sector works; regulator: ANARE-CI.",
  "CIE es el concesionario del servicio público (despacho, transporte, distribución y venta) en virtud de un convenio firmado con el Estado; los hogares contratan con la CIE. CI-Energies (empresa estatal) dirige las obras del sector; regulador: ANARE-CI."
 ],
 "GH": [
  "Selon la zone, sans choix : ECG (sud et centre, 100 % État, environ 88 % de l’électricité vendue sur le marché réglementé) et NEDCo (nord, filiale de VRA). Régulateur : PURC. Un transfert de zones d’ECG à des concessionnaires privés est prévu mais pas encore en place (FMI, 2026).",
  "By area, no choice: ECG (south and centre, 100% state-owned, about 88% of electricity sold in the regulated market) and NEDCo (north, a VRA subsidiary). Regulator: PURC. Transfer of ECG areas to private concessionaires is planned but not yet in place (IMF, 2026).",
  "Según la zona, sin elección: ECG (sur y centro, 100 % estatal, alrededor del 88 % de la electricidad vendida en el mercado regulado) y NEDCo (norte, filial de VRA). Regulador: PURC. Está previsto traspasar zonas de ECG a concesionarios privados, pero aún no está en marcha (FMI, 2026)."
 ],
 "DO": [
  "Trois distributrices publiques par zone, sans choix : EDENorte (Santiago, Puerto Plata, La Vega, San Francisco, Valverde Mao ; 1 295 220 contrats), EDESur (Saint-Domingue, San Cristóbal, Baní, San Juan, Barahona ; 1 024 394) et EDEEste (est ; 899 924). Contrats actifs en septembre 2025 : 3 219 538 au total (ministère de l’Énergie et des Mines).",
  "Three public distributors by zone, no choice: EDENorte (Santiago, Puerto Plata, La Vega, San Francisco, Valverde Mao; 1,295,220 contracts), EDESur (Santo Domingo, San Cristóbal, Baní, San Juan, Barahona; 1,024,394) and EDEEste (east; 899,924). Active contracts in September 2025: 3,219,538 in total (Ministry of Energy and Mines).",
  "Tres distribuidoras públicas por zona, sin elección: EDENorte (Santiago, Puerto Plata, La Vega, San Francisco, Valverde Mao; 1 295 220 contratos), EDESur (Santo Domingo, San Cristóbal, Baní, San Juan, Barahona; 1 024 394) y EDEEste (este; 899 924). Contratos activos en septiembre de 2025: 3 219 538 en total (Ministerio de Energía y Minas)."
 ],
 "JM": [
  "JPS dessert toute l’île (licence jusqu’au 8 juillet 2027) : elle possède les réseaux de transport et de distribution et vend à environ 710 000 clients. Le 1er juillet 2025, l’État a annoncé qu’il ne renouvellerait pas la licence aux conditions actuelles. Régulateur : OUR (Electricity Act 2015).",
  "JPS serves the whole island (licence to 8 July 2027): it owns the transmission and distribution networks and sells to about 710,000 customers. On 1 July 2025 the Government announced it would not renew the licence on the current terms. Regulator: OUR (Electricity Act 2015).",
  "JPS abastece toda la isla (licencia hasta el 8 de julio de 2027): posee las redes de transporte y distribución y vende a unos 710 000 clientes. El 1 de julio de 2025 el Gobierno anunció que no renovará la licencia en las condiciones actuales. Regulador: OUR (Ley de Electricidad de 2015)."
 ],
 "TT": [
  "T&TEC (entreprise d’État, issue en 1946 de la fusion de sociétés indépendantes) est le seul revendeur d’électricité du pays et exploite le réseau de transport et de distribution ; plus d’un million de clients. La RIC fixe le cadre tarifaire de transport et distribution (décision 2023-2028).",
  "T&TEC (a state enterprise formed in 1946 from independent companies) is the country’s sole retailer of electricity and operates the transmission and distribution network; over one million customers. The RIC sets the transmission and distribution tariff framework (2023-2028 determination).",
  "T&TEC (empresa estatal formada en 1946 por la fusión de compañías independientes) es el único vendedor de electricidad del país y opera la red de transporte y distribución; más de un millón de clientes. La RIC fija el marco tarifario de transporte y distribución (determinación 2023-2028)."
 ],
 "TZ": [
  "Continent : TANESCO (entreprise d’État) produit, transporte, distribue et vend l’électricité. Zanzibar : ZECO achète en gros à TANESCO. Régulateur : EWURA. Les petits producteurs de 0,1 à 10 MW peuvent vendre directement aux consommateurs, mais très peu de projets existent (source ancienne, à revalider).",
  "Mainland: TANESCO (a state company) generates, transmits, distributes and sells electricity. Zanzibar: ZECO buys in bulk from TANESCO. Regulator: EWURA. Small producers of 0.1 to 10 MW may sell directly to consumers, but very few projects exist (older source, to re-validate).",
  "Continente: TANESCO (empresa estatal) genera, transporta, distribuye y vende electricidad. Zanzíbar: ZECO compra al por mayor a TANESCO. Regulador: EWURA. Los pequeños productores de 0,1 a 10 MW pueden vender directamente a los consumidores, pero existen muy pocos proyectos (fuente antigua, a revalidar)."
 ],
 "ET": [
  "EEU (entreprise d’État) assure la distribution et la vente d’électricité ainsi que l’électrification rurale hors réseau ; EEP produit et transporte. Régulateur : Ethiopian Energy Authority (licences). Source de 2020, à revalider.",
  "EEU (a state company) handles electricity distribution and sales as well as off-grid rural electrification; EEP generates and transmits. Regulator: Ethiopian Energy Authority (licences). 2020 source, to re-validate.",
  "EEU (empresa estatal) se encarga de la distribución y venta de electricidad y de la electrificación rural fuera de red; EEP genera y transporta. Regulador: Ethiopian Energy Authority (licencias). Fuente de 2020, a revalidar."
 ]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv17) { sc.__fv17 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv17 && typeof MutationObserver !== 'undefined') { el.__fv17 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v17">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
