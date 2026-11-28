/* Test : calcul horaire sur six climats supplementaires (18 maisons), derive par rapport aux valeurs enregistrees et ecart avec EnergyPlus 23.2.
   Fichiers meteo (.epw decompresses) a placer dans tests\meteo\ : Paris-De.Gaulle, Madrid-Getafe, Tryvannshogda, Singapore-Seletar, Shanghai-Pudong, Toluca-Mateos (TMYx 2011-2025, climate.onebuilding.org).
   Chiffres EnergyPlus calcules le 28/11/2026 (meme protocole que hourly_regression.js : convection exterieure DOE-2 avec vent, convection interieure et fenetres fixes).
   Usage (depuis files) : node tests/hourly_climats_regression.js */
'use strict';
const fs=require('fs'),path=require('path');
const htmlFile=process.argv[2]||path.join('dist','index.html');
const meteoDir=path.join(__dirname,'meteo');
function loadEngine(file) {
  const h = fs.readFileSync(file, 'utf8');
  const a = h.indexOf('<script id="hourly-module">'), b = h.indexOf('</script>', a);
  if (a < 0 || b < 0) { throw new Error('module horaire introuvable dans ' + file); }
  let src = h.slice(a + '<script id="hourly-module">'.length, b);
  const mark = '/* ---- installation ---- */';
  if (src.indexOf(mark) < 0) { throw new Error('marqueur d\'installation introuvable'); }
  src = src.replace(mark, 'window.__HX={parseEPW:parseEPW,wxStats:wxStats,buildCfg:buildCfg,simulate:simulate,summarize:summarize,defaults:defaults,bestestCfg:bestestCfg,CHK:CHK};\n' + mark);
  const win = {}, noop = () => { };
  const doc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop }), head: { appendChild: noop }, body: { appendChild: noop }, addEventListener: noop };
  const ls = { getItem: () => null, setItem: noop };
  win.window = win; win.document = doc; win.localStorage = ls;
  new Function('window', 'document', 'localStorage', 'setInterval', 'setTimeout', 'clearTimeout', 'navigator', src)(win, doc, ls, noop, noop, noop, {});
  return win.__HX;
}


const VARIANTES={std:{},iso:{wins:8,rins:10},ouest:{aw0:3,aw1:8,aw2:3,aw3:3,wabs:0.3,rabs:0.3}};
const BORNES_INTL={chauffage:[-1,10],froid:[0,9],pointeChauffage:[-16,3],pointeFroid:[-2,13]};
const BORNES_TOLUCA={chauffage:[12,34],froid:[0,9],pointeChauffage:[-5,3],pointeFroid:[-2,13]};
const CAS=[
  { ville: 'Shanghai', v: 'std', app: [6482, 4158, 7.49, 4.26], ep: [6114, 3861, 7.97, 4.07], b: BORNES_INTL },
  { ville: 'Shanghai', v: 'iso', app: [1311, 1781, 3.25, 2.04], ep: [1250, 1666, 3.81, 2.06], b: BORNES_INTL },
  { ville: 'Shanghai', v: 'ouest', app: [8754, 2594, 7.92, 3.64], ep: [8411, 2442, 8.39, 3.41], b: BORNES_INTL },
  { ville: 'Madrid', v: 'std', app: [8351, 4026, 7.60, 5.03], ep: [7675, 3886, 7.81, 4.75], b: BORNES_INTL },
  { ville: 'Madrid', v: 'iso', app: [1872, 2020, 3.70, 2.60], ep: [1770, 1882, 4.26, 2.37], b: BORNES_INTL },
  { ville: 'Madrid', v: 'ouest', app: [11822, 1660, 8.25, 3.90], ep: [11083, 1628, 8.42, 3.72], b: BORNES_INTL },
  { ville: 'Paris', v: 'std', app: [14715, 414, 9.19, 3.48], ep: [14269, 388, 9.53, 3.23], b: BORNES_INTL },
  { ville: 'Paris', v: 'iso', app: [5437, 120, 5.08, 1.90], ep: [5418, 102, 5.84, 1.70], b: BORNES_INTL },
  { ville: 'Paris', v: 'ouest', app: [17572, 67, 9.46, 2.23], ep: [17122, 59, 9.79, 2.02], b: BORNES_INTL },
  { ville: 'Toluca', v: 'std', app: [3457, 0, 5.29, 0.00], ep: [2622, 0, 5.31, 0.00], b: BORNES_TOLUCA },
  { ville: 'Toluca', v: 'iso', app: [417, 0, 2.18, 0.00], ep: [338, 0, 2.25, 0.00], b: BORNES_TOLUCA },
  { ville: 'Toluca', v: 'ouest', app: [10120, 0, 6.36, 0.00], ep: [8910, 0, 6.30, 0.00], b: BORNES_TOLUCA },
  { ville: 'Tryvannshogda', v: 'std', app: [32521, 7, 12.04, 0.70], ep: [31442, 5, 12.24, 0.67], b: BORNES_INTL },
  { ville: 'Tryvannshogda', v: 'iso', app: [15033, 0, 6.68, 0.00], ep: [14955, 0, 7.31, 0.00], b: BORNES_INTL },
  { ville: 'Tryvannshogda', v: 'ouest', app: [36618, 0, 12.16, 0.00], ep: [35613, 0, 12.31, 0.00], b: BORNES_INTL },
  { ville: 'Singapore', v: 'std', app: [0, 24876, 0.00, 4.97], ep: [0, 23733, 0.00, 4.73], b: BORNES_INTL },
  { ville: 'Singapore', v: 'iso', app: [0, 15057, 0.00, 3.23], ep: [0, 14620, 0.00, 3.13], b: BORNES_INTL },
  { ville: 'Singapore', v: 'ouest', app: [0, 18123, 0.00, 4.29], ep: [0, 17375, 0.00, 4.09], b: BORNES_INTL }
];
const SEUIL_KWH=1000,TOL_DERIVE=0.01;
let ok=0,ko=0,ignores=0;
function check(nom,bon,detail){if(bon){ok++;console.log('  OK      '+nom+(detail?'  '+detail:''));}else{ko++;console.log('  ECHEC   '+nom+(detail?'  '+detail:''));}}
function trouveMeteo(m){if(!fs.existsSync(meteoDir)){return null;}const f=fs.readdirSync(meteoDir).filter(n=>/\.epw$/i.test(n)&&new RegExp(m,'i').test(n))[0];return f?path.join(meteoDir,f):null;}
const pct=(a,b)=>(b===0?0:(a/b-1)*100);const f1=x=>(x>=0?'+':'')+x.toFixed(1)+' %';
let HX;try{HX=loadEngine(htmlFile);}catch(e){console.log('ARRET : '+e.message);process.exit(2);}
console.log('Fichier teste : '+htmlFile+'\n');
const cache={};
function meteo(v){if(cache[v]!==undefined){return cache[v];}const p=trouveMeteo(v);if(!p){return(cache[v]=null);}const wx=HX.parseEPW(fs.readFileSync(p,'utf8'));wx.st=HX.wxStats(wx);return(cache[v]=wx);}
CAS.forEach(function(c){
  const wx=meteo(c.ville),nom=c.ville+' / '+c.v;
  if(!wx){ignores++;console.log('  IGNORE  '+nom+' : fichier meteo absent de tests\meteo');return;}
  const o=Object.assign(HX.defaults(),VARIANTES[c.v]);
  const sm=HX.summarize(wx,HX.simulate(wx,HX.buildCfg(o,wx.st.mean),{dt:900,passes:2}));
  const val=[sm.tH,sm.tC,sm.pH,sm.pC],noms=['chauffage','froid','pointe chauffage','pointe froid'];
  let derive=true;
  val.forEach(function(x,i){const ref=c.app[i],tol=Math.max(Math.abs(ref)*TOL_DERIVE,i<2?2:0.02);if(Math.abs(x-ref)>tol){derive=false;console.log('     derive : '+noms[i]+' '+x.toFixed(2)+' au lieu de '+ref);}});
  check(nom+' : valeurs inchangees',derive,'['+val.map((x,i)=>i<2?x.toFixed(0):x.toFixed(2)).join(' ; ')+']');
  const B=c.b;
  [['chauffage',0,B.chauffage,c.ep[0]>=SEUIL_KWH],['froid',1,B.froid,c.ep[1]>=SEUIL_KWH],['pointe chauffage',2,B.pointeChauffage,c.ep[2]>0.5],['pointe froid',3,B.pointeFroid,c.ep[3]>0.5]].forEach(function(q){
    if(!q[3]){return;}const e=pct(val[q[1]],c.ep[q[1]]);
    check(nom+' : '+q[0]+' vs EnergyPlus',e>=q[2][0]&&e<=q[2][1],f1(e)+'  (admis '+q[2][0]+' a '+q[2][1]+' %)');
  });
});
console.log('\nResultat : '+ok+' reussis, '+ko+' echecs, '+ignores+' ignores (meteo absente)');
if(ko>0){console.log('ECHEC : le module horaire ne se comporte plus comme documente. Ne pas deployer avant d\'en comprendre la cause.');process.exit(1);}
if(ignores>0){console.log('ATTENTION : des fichiers meteo manquent, la verification est incomplete.');process.exit(3);}
console.log('TOUT EST CONFORME.');
