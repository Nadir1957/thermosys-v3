// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v18, Asie, Europe de l'Est et Venezuela)
// Usage : node patch_fournisseurs_v18.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v18"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v17">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v17.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
 "KG": [
  "Depuis la réorganisation achevée en août 2022, une seule société, NESK (Réseau électrique national du Kirghizistan), assure la fourniture aux consommateurs dans tout le pays, via 7 entreprises régionales de réseaux (Tchouï, Och, Djalal-Abad, Talas, Issyk-Koul, Naryn, Batken). Les anciennes sociétés Severelectro, Vostokelectro, Oshelectro et Jalalabadelectro y ont été absorbées.",
  "Since the reorganisation completed in August 2022, a single company, NESK (National Electric Grid of Kyrgyzstan), supplies consumers across the country through 7 regional network enterprises (Chuy, Osh, Jalal-Abad, Talas, Issyk-Kul, Naryn, Batken). The former Severelectro, Vostokelectro, Oshelectro and Jalalabadelectro companies were absorbed into it.",
  "Desde la reorganización completada en agosto de 2022, una sola empresa, NESK (Red Eléctrica Nacional de Kirguistán), suministra a los consumidores de todo el país mediante 7 empresas regionales de redes (Chuy, Osh, Jalal-Abad, Talas, Issyk-Kul, Naryn, Batken). Las antiguas Severelectro, Vostokelectro, Oshelectro y Jalalabadelectro fueron absorbidas."
 ],
 "TJ": [
  "Barki Tojik, entreprise d’État, alimente tout le pays sauf la région autonome du Haut-Badakhchan ; la distribution a été séparée dans une société à part (enregistrée en 2021). Dans le Haut-Badakhchan, Pamir Energy (concession public-privé depuis 2002) produit et distribue. Tarifs fixés par le Comité antimonopole.",
  "Barki Tojik, a state company, supplies the whole country except the Gorno-Badakhshan Autonomous Region; distribution was separated into a distinct company (registered in 2021). In Gorno-Badakhshan, Pamir Energy (public-private concession since 2002) generates and distributes. Tariffs are set by the Antimonopoly Committee.",
  "Barki Tojik, empresa estatal, abastece a todo el país salvo la región autónoma de Alto Badajshán; la distribución se separó en una sociedad aparte (registrada en 2021). En Alto Badajshán, Pamir Energy (concesión público-privada desde 2002) genera y distribuye. Tarifas fijadas por el Comité Antimonopolio."
 ],
 "BD": [
  "Selon la zone, sans choix : DESCO (nord de Dacca, Tongi), DPDC (Dacca), BPDB (Chattogram, Mymensingh, Sylhet, Comilla), NESCO (Rajshahi, Rangpur), WZPDCL (Khulna, Barishal) et BREB / Palli Bidyut (zones rurales, 80 samitis, environ 78 % des consommateurs, 2022). Vérifiez sur votre facture.",
  "By area, no choice: DESCO (north Dhaka, Tongi), DPDC (Dhaka), BPDB (Chattogram, Mymensingh, Sylhet, Comilla), NESCO (Rajshahi, Rangpur), WZPDCL (Khulna, Barishal) and BREB / Palli Bidyut (rural areas, 80 samitis, about 78% of consumers, 2022). Check your bill.",
  "Según la zona, sin elección: DESCO (norte de Daca, Tongi), DPDC (Daca), BPDB (Chattogram, Mymensingh, Sylhet, Comilla), NESCO (Rajshahi, Rangpur), WZPDCL (Khulna, Barishal) y BREB / Palli Bidyut (zonas rurales, 80 samitis, alrededor del 78 % de los consumidores, 2022). Revise su factura."
 ],
 "IQ": [
  "Réseau public très déficient : pertes supérieures à 50 % de l’électricité produite, collecte des factures défaillante. Des groupes électrogènes individuels ou collectifs compensent le déficit. La réforme prévoit l’entrée d’investisseurs privés dans la distribution, pas encore effective (service économique de l’ambassade de France, mai 2026). Vérifiez sur votre facture.",
  "The public grid is very weak: losses above 50% of the electricity produced, poor bill collection. Individual or shared generators make up the shortfall. The reform plans to bring private investors into distribution, not yet effective (French embassy economic service, May 2026). Check your bill.",
  "La red pública es muy deficiente: pérdidas superiores al 50 % de la electricidad producida y cobro de facturas deficiente. Grupos electrógenos individuales o colectivos cubren el déficit. La reforma prevé la entrada de inversores privados en la distribución, aún no efectiva (servicio económico de la embajada de Francia, mayo de 2026). Revise su factura."
 ],
 "XK": [
  "Réseau : KEDS, seul gestionnaire de distribution, couvre tout le territoire (privé, consortium Çalik-Limak depuis 2013). Fourniture aux ménages : KESCO, qui détient l’obligation de service public (plus de 600 000 consommateurs). Régulateur : ERO. Les entreprises passent au marché ouvert à partir du 1er avril 2026.",
  "Grid: KEDS, the only distribution operator, covers the whole territory (private, Çalik-Limak consortium since 2013). Household supply: KESCO, which holds the public supply obligation (over 600,000 consumers). Regulator: ERO. Businesses move to the open market from 1 April 2026.",
  "Red: KEDS, único operador de distribución, cubre todo el territorio (privado, consorcio Çalik-Limak desde 2013). Suministro a los hogares: KESCO, que tiene la obligación de servicio público (más de 600 000 consumidores). Regulador: ERO. Las empresas pasan al mercado abierto a partir del 1 de abril de 2026."
 ],
 "BY": [
  "Sans choix : Belenergo, groupe d’État sous tutelle du ministère de l’Énergie, intègre production, transport, distribution et vente ; 6 sociétés régionales (oblenergos) exploitent la distribution. Tarifs résidentiels fixés par le Conseil des ministres ; pas de régulateur indépendant. Source de 2020, à revalider.",
  "No choice: Belenergo, a state group under the Ministry of Energy, integrates generation, transmission, distribution and sales; 6 regional companies (oblenergos) operate distribution. Residential tariffs are set by the Council of Ministers; no independent regulator. 2020 source, to re-validate.",
  "Sin elección: Belenergo, grupo estatal bajo el Ministerio de Energía, integra generación, transporte, distribución y venta; 6 empresas regionales (oblenergos) operan la distribución. Tarifas residenciales fijadas por el Consejo de Ministros; sin regulador independiente. Fuente de 2020, a revalidar."
 ],
 "VE": [
  "Corpoelec, entreprise d’État, a détenu le monopole du secteur pendant plus de 15 ans. Une réforme ouvrant le secteur à des concessions privées a reçu une première approbation de l’Assemblée nationale en juin 2026 ; son entrée en vigueur et son effet sur la distribution restent à vérifier.",
  "Corpoelec, a state company, held the sector monopoly for more than 15 years. A reform opening the sector to private concessions received initial approval from the National Assembly in June 2026; its entry into force and its effect on distribution remain to be checked.",
  "Corpoelec, empresa estatal, tuvo el monopolio del sector durante más de 15 años. Una reforma que abre el sector a concesiones privadas recibió aprobación inicial de la Asamblea Nacional en junio de 2026; su entrada en vigor y su efecto sobre la distribución quedan por verificar."
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
    var sc = $('scopCountry'); if (sc && !sc.__fv18) { sc.__fv18 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv18 && typeof MutationObserver !== 'undefined') { el.__fv18 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v18">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
