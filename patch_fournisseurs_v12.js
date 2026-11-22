// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v12, Oceanie et Europe, partie 1)
// Usage : node patch_fournisseurs_v12.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v12"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v11">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v11.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  AU: ["Le réseau dépend de l’État ou de la zone : Nouvelle-Galles du Sud : Ausgrid (Sydney), Endeavour Energy (ouest de Sydney), Essential Energy (régions) ; Queensland : Energex (sud-est), Ergon Energy (régions) ; ACT : Evoenergy ; Australie-Méridionale : SA Power Networks ; Tasmanie : TasNetworks. Pour les autres États, voyez votre facture. Le fournisseur (détaillant) est distinct du réseau.",
       "The grid depends on state and area: New South Wales: Ausgrid (Sydney), Endeavour Energy (western Sydney), Essential Energy (regions); Queensland: Energex (south-east), Ergon Energy (regions); ACT: Evoenergy; South Australia: SA Power Networks; Tasmania: TasNetworks. For other states, check your bill. The retailer is separate from the network.",
       "La red depende del estado y la zona: Nueva Gales del Sur: Ausgrid (Sídney), Endeavour Energy (oeste de Sídney), Essential Energy (regiones); Queensland: Energex (sureste), Ergon Energy (regiones); ACT: Evoenergy; Australia Meridional: SA Power Networks; Tasmania: TasNetworks. Para otros estados, consulte su factura. El comercializador es independiente de la red."],
  NZ: ["Fournisseur au choix : 62 détaillants sur le marché de gros (dont 4 grands « gentailers »). Réseau : 29 sociétés de lignes, propriétaires des réseaux (souvent détenues par des fondations de consommateurs ou des communes). Votre société de lignes figure sur votre facture.",
       "Free choice of retailer: 62 retailers in the wholesale market (including 4 large gentailers). Grid: 29 lines companies own the networks (often owned by consumer trusts or local councils). Your lines company is shown on your bill.",
       "Libre elección de comercializador: 62 comercializadores en el mercado mayorista (incluidos 4 grandes «gentailers»). Red: 29 empresas de líneas son propietarias de las redes (a menudo de fideicomisos de consumidores o municipios). Su empresa de líneas figura en la factura."],
  EE: ["Fournisseur au choix. Réseau : 33 gestionnaires de distribution (fin 2023) ; le plus grand, Elektrilevi, représente 88 % des volumes distribués.",
       "Free choice of supplier. Grid: 33 distribution operators (end 2023); the largest, Elektrilevi, accounts for 88% of sales volume.",
       "Libre elección de suministrador. Red: 33 gestores de distribución (finales de 2023); el mayor, Elektrilevi, representa el 88 % del volumen de ventas."],
  LT: ["Fournisseur au choix : 38 fournisseurs indépendants licenciés fin 2024 ; Ignitis est le fournisseur public. Réseau : 4 gestionnaires de distribution licenciés par le régulateur NERC, dont le principal est ESO (Energijos skirstymo operatorius).",
       "Free choice of supplier: 38 independent licensed suppliers at end 2024; Ignitis is the public supplier. Grid: 4 distribution operators licensed by the regulator NERC, the main one being ESO (Energijos skirstymo operatorius).",
       "Libre elección de suministrador: 38 suministradores independientes con licencia a finales de 2024; Ignitis es el suministrador público. Red: 4 gestores de distribución con licencia del regulador NERC, el principal es ESO (Energijos skirstymo operatorius)."],
  SI: ["Fournisseur au choix. Réseau : SODO, gestionnaire du réseau de distribution, avec cinq sociétés régionales qui exploitent les réseaux : Elektro Ljubljana, Elektro Maribor, Elektro Celje, Elektro Gorenjska et Elektro Primorska.",
       "Free choice of supplier. Grid: SODO, the distribution system operator, with five regional companies running the networks: Elektro Ljubljana, Elektro Maribor, Elektro Celje, Elektro Gorenjska and Elektro Primorska.",
       "Libre elección de suministrador. Red: SODO, gestor de la red de distribución, con cinco empresas regionales que explotan las redes: Elektro Ljubljana, Elektro Maribor, Elektro Celje, Elektro Gorenjska y Elektro Primorska."],
  RO: ["Fournisseur au choix : 141 fournisseurs d’électricité et 69 opérateurs de réseau enregistrés sur la plateforme de changement de fournisseur de l’ANRE. Fin 2024, 68 % des foyers étaient en marché concurrentiel, 32 % en service universel ou de dernier recours. Votre opérateur de réseau figure sur votre facture.",
       "Free choice of supplier: 141 electricity suppliers and 69 network operators registered on the ANRE switching platform. At end 2024, 68% of households were on the competitive market, 32% on universal or last-resort service. Your network operator is shown on your bill.",
       "Libre elección de suministrador: 141 suministradores de electricidad y 69 operadores de red registrados en la plataforma de cambio de la ANRE. A finales de 2024, el 68 % de los hogares estaba en el mercado competitivo y el 32 % en servicio universal o de último recurso. Su operador de red figura en la factura."],
  GR: ["Fournisseur au choix. Réseau : la distribution est assurée par HEDNO (DEDDIE), gestionnaire du réseau appartenant à PPC (DEI) ; d’autres réseaux locaux existent (par exemple celui de l’aéroport d’Athènes).",
       "Free choice of supplier. Grid: distribution is carried out by HEDNO (DEDDIE), operator of the network owned by PPC; some other local networks exist (for example Athens airport).",
       "Libre elección de suministrador. Red: la distribución la realiza HEDNO (DEDDIE), gestor de la red propiedad de PPC; existen otras redes locales (por ejemplo, el aeropuerto de Atenas)."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv12) { sc.__fv12 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv12 && typeof MutationObserver !== 'undefined') { el.__fv12 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v12">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
