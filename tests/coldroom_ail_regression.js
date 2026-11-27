/* Test : chambre froide, ail a -2,7 C (mesure publiee) et texte de limites FR/EN/ES. Usage (depuis files) : node tests/coldroom_ail_regression.js */
'use strict';
const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8').replace(/\r\n/g,'\n');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
t("ligne ail : Tf -2.7",/'Ail', 'Garlic', 0, 68, -2\.7,/.test(s));
t('FR : mesure publiee',s.indexOf('gousses épluchées gelant à −2,7 °C')>0);
t('EN : garlic settled',s.indexOf('garlic is settled at −2.7 °C')>0);
t('ES : ajo resuelto',s.indexOf('ajo resuelto en −2,7 °C')>0);
t('FR : plus de "sources divergent" pour l\'ail',s.indexOf('pour l’ail (−2,7 °C ASHRAE')<0);
t('EN : plus de "unresolved for garlic"',s.indexOf('unresolved for garlic')<0);
t('ES : plus de "sin resolver ... ajo"',s.indexOf('para el ajo (−2,7 o −0,8')<0);
t('pomme de terre reste a trancher (FR/EN/ES)',s.indexOf('les sources divergent encore : valeur ASHRAE conservée')>0&&s.indexOf('sources still disagree for potato')>0&&s.indexOf('siguen en desacuerdo para la patata')>0);
console.log('coldroom_ail : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
