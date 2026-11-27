/* Test : textes vocaux du RAPPORT, module traitement d'air, FR/EN/ES. Usage (depuis files) : node tests/voix_air_regression.js */
'use strict';
const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8').replace(/\r\n/g,'\n');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const a=s.indexOf('function voiceReport()'),b=s.indexOf('voiceReportQueue = queue',a);t('voiceReport trouve',a>0&&b>a);
const body=s.slice(a,b);
const L=body.match(/^\s*airtreat:\s*'[^\n]*',?$/gm)||[];
t('3 textes airtreat (FR/EN/ES)',L.length===3);
const need=['Le C.O.P. du groupe froid peut suivre la charge','The chiller C.O.P. can follow the load','El C.O.P. de la enfriadora puede seguir la carga'];
need.forEach((x,i)=>t('texte '+i,L.some(l=>l.indexOf(x)>0)));
t('phrase hiver FR/EN/ES',/refroidissement sensible dû/.test(body)&&/sensible cooling caused/.test(body)&&/enfriamiento sensible debido/.test(body));
t('textes anciens conserves (8760 heures)',L.every(l=>/8760/.test(l)));
t('chaque ligne se termine proprement',L.every(l=>/\.',?$/.test(l)));
console.log('voix_air : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
