// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v11, Afrique subsaharienne partie 1)
// Usage : node patch_fournisseurs_v11.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v11"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v10">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v10.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  ZA: ["Selon la zone, sans choix : selon l’endroit, l’électricité vient d’Eskom (entreprise d’État) ou de la municipalité (près de la moitié des clients chacun, données 2006 ; à revalider). Votre fournisseur figure sur votre facture. Régulateur : NERSA.",
       "By area, no choice: depending on where you live, power comes from Eskom (state utility) or from the municipality (about half of customers each, 2006 data; to be re-validated). Your supplier is shown on your bill. Regulator: NERSA.",
       "Según la zona, sin elección: según el lugar, la electricidad viene de Eskom (empresa estatal) o del municipio (cerca de la mitad de los clientes cada uno, datos de 2006; por revalidar). Su suministrador figura en la factura. Regulador: NERSA."],
  NG: ["Selon l’État, sans choix : 11 sociétés de distribution (DisCos) : Abuja (AEDC), Benin, Eko et Ikeja (Lagos), Enugu, Ibadan, Jos, Kaduna, Kano, Port Harcourt et Yola, chacune dans ses États. Régulateur : NERC (liste 2018, d’autres licences locales existent).",
       "By state, no choice: 11 distribution companies (DisCos): Abuja (AEDC), Benin, Eko and Ikeja (Lagos), Enugu, Ibadan, Jos, Kaduna, Kano, Port Harcourt and Yola, each in its own states. Regulator: NERC (2018 list; other local licences exist).",
       "Según el estado, sin elección: 11 empresas de distribución (DisCos): Abuja (AEDC), Benín, Eko e Ikeja (Lagos), Enugu, Ibadán, Jos, Kaduna, Kano, Port Harcourt y Yola, cada una en sus estados. Regulador: NERC (lista de 2018; existen otras licencias locales)."],
  KE: ["Kenya Power (KPLC) est le distributeur dominant (environ 95 % des ventes). Quelques distributeurs privés desservent de grands ensembles (Tatu City, Two Rivers). Les gros consommateurs (seuil 1 MVA) peuvent choisir leur fournisseur ; pas les ménages. Régulateur : EPRA.",
       "Kenya Power (KPLC) is the dominant distributor (about 95% of sales). A few private distributors serve large developments (Tatu City, Two Rivers). Large consumers (1 MVA threshold) may choose their supplier; households cannot. Regulator: EPRA.",
       "Kenya Power (KPLC) es el distribuidor dominante (cerca del 95 % de las ventas). Algunos distribuidores privados sirven grandes desarrollos (Tatu City, Two Rivers). Los grandes consumidores (umbral de 1 MVA) pueden elegir suministrador; los hogares no. Regulador: EPRA."],
  CM: ["Sans choix : ENEO Cameroon, concessionnaire du service public de production et de distribution d’électricité (capital : ACTIS 51 %, État 44 %, personnel 5 %). Transport : SONATREL. Régulateur : ARSEL.",
       "No choice: ENEO Cameroon, public-service concessionaire for electricity generation and distribution (shareholders: ACTIS 51%, State 44%, staff 5%). Transmission: SONATREL. Regulator: ARSEL.",
       "Sin elección: ENEO Cameroon, concesionaria del servicio público de generación y distribución de electricidad (capital: ACTIS 51 %, Estado 44 %, personal 5 %). Transporte: SONATREL. Regulador: ARSEL."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv11) { sc.__fv11 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv11 && typeof MutationObserver !== 'undefined') { el.__fv11 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v11">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
