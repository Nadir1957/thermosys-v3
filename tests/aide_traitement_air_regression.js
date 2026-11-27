/* Test : AIDE rubrique 17 (groupe froid selon la charge, hiver, impression) en FR/EN/ES. Usage (depuis files) : node tests/aide_traitement_air_regression.js */
'use strict';
const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8').replace(/\r\n/g,'\n');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const fr=['Groupe froid selon la charge :','tout-ou-rien','Refroidissement sensible (hiver, charges internes)','en-tête THERMOSYS'];
const en=['Chiller vs load:','on-off','Sensible cooling (winter, internal gains)','THERMOSYS header'];
fr.forEach(x=>t('FR : '+x,s.indexOf(x)>0));en.forEach(x=>t('EN : '+x,s.indexOf(x)>0));
const m=s.match(/<script id="lang-es-aide-air">[^]*?<\/script>/);t('bloc ES present',!!m);
if(m){const D=new Function('window','var D;'+m[0].replace(/<\/?script[^>]*>/g,'').replace('var D=','D=')+';return D;');
 const w={};const body=m[0].replace(/<\/?script[^>]*>/g,'');const r=new Function('window',body+';return window.I18N3.dict.es;')(w);
 t('ES : 6 entrees',Object.keys(r).length===6);t('ES : cles = textes EN',Object.keys(r).every(k=>s.indexOf(k)>=0&&k!==r[k]));}
t('une seule fois chaque bloc FR',s.split('Groupe froid selon la charge :').length===2);
console.log('aide_traitement_air : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
