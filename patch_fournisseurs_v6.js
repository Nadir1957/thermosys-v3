// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v6, pays restes en instance : JP, NO, UA)
// Usage : node patch_fournisseurs_v6.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v6"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v5">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v5.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  JP: ['Choix libre du fournisseur depuis avril 2016 : 810 détaillants autorisés (METI, avril 2026), les grandes compagnies régionales et leurs filiales fournissent encore l’essentiel. Réseau : 10 gestionnaires régionaux en monopole : Hokkaido, Tohoku, TEPCO Power Grid (Tokyo), Chubu, Hokuriku, Kansai, Chugoku, Shikoku, Kyushu, Okinawa. Les tarifs de base régulés subsistent.',
       'Free choice of supplier since April 2016: 810 licensed retailers (METI, April 2026); the large regional utilities and their affiliates still supply most customers. Grid: 10 regional operators with a monopoly: Hokkaido, Tohoku, TEPCO Power Grid (Tokyo), Chubu, Hokuriku, Kansai, Chugoku, Shikoku, Kyushu, Okinawa. Regulated basic tariffs still exist.',
       'Libre elección de suministrador desde abril de 2016: 810 comercializadores autorizados (METI, abril de 2026); las grandes compañías regionales y sus filiales siguen suministrando la mayor parte. Red: 10 operadores regionales en monopolio: Hokkaido, Tohoku, TEPCO Power Grid (Tokio), Chubu, Hokuriku, Kansai, Chugoku, Shikoku, Kyushu, Okinawa. Subsisten tarifas básicas reguladas.'],
  NO: ['Fournisseur au choix. Réseau : 73 gestionnaires locaux selon le régulateur NVE (74 avec Statnett, transport, chiffres 2024), chacun en monopole dans sa zone. Plus gros : Elvia (Oslo), Lede, Tensio… Vérifiez votre gestionnaire sur votre facture.',
       'Free choice of supplier. Grid: 73 local operators according to the regulator NVE (74 including Statnett, transmission; 2024 figures), each a monopoly in its area. Largest include Elvia (Oslo), Lede, Tensio… Check your operator on your bill.',
       'Libre elección de suministrador. Red: 73 operadores locales según el regulador NVE (74 con Statnett, transporte; cifras de 2024), cada uno en monopolio en su zona. Entre los mayores: Elvia (Oslo), Lede, Tensio… Compruebe su operador en la factura.'],
  UA: ['Fournisseur au choix : 356 fournisseurs actifs sur 1 410 licenciés (NEURC, 2025). Réseau : 32 gestionnaires régionaux (DTEK, Yasno/Kyivenergo et autres « oblenergo »), chacun en monopole dans sa zone. Vérifiez votre gestionnaire sur votre facture.',
       'Free choice of supplier: 356 active suppliers out of 1,410 licensed (NEURC, 2025). Grid: 32 regional operators (DTEK, Yasno/Kyivenergo and other oblenergos), each a monopoly in its area. Check your operator on your bill.',
       'Libre elección de suministrador: 356 suministradores activos de 1410 con licencia (NEURC, 2025). Red: 32 operadores regionales (DTEK, Yasno/Kyivenergo y otros «oblenergo»), cada uno en monopolio en su zona. Compruebe su operador en la factura.']
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
    var sc = $('scopCountry'); if (sc && !sc.__fv6) { sc.__fv6 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv6 && typeof MutationObserver !== 'undefined') { el.__fv6 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
// Retire de v4 les pays que v6 remplace (evite que deux scripts se repassent la main)
{
  const a4 = s.indexOf('<script id="fournisseurs-v4">');
  const e4 = s.indexOf('</script>', a4);
  const blk = s.slice(a4, e4);
  const k = blk.lastIndexOf('})(');
  const tail = blk.lastIndexOf(');');
  if (a4 < 0 || k < 0 || tail < k) { console.log('ARRET : structure v4 inattendue'); process.exit(1); }
  const d4 = JSON.parse(blk.slice(k + 3, tail));
  ['JP', 'NO', 'UA'].forEach(function (c) { delete d4[c]; });
  s = s.slice(0, a4) + blk.slice(0, k + 3) + JSON.stringify(d4) + blk.slice(tail) + s.slice(e4);
}
const RT = '<script id="fournisseurs-v6">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
