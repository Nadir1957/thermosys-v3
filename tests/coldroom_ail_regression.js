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
t('pomme de terre resolue (FR/EN/ES)',s.indexOf('bulletin technique 1133 de l’USDA')>0&&s.indexOf('potato is settled at −1.7 °C')>0&&s.indexOf('la patata queda resuelta en −1,7 °C')>0);
t('lignes pomme de terre : Tf -1.7',/'Pomme de terre de consommation', 'Table potatoes', 5, 92, -1\.7,/.test(s)&&/'Pomme de terre de semence', 'Seed potatoes', 3, 92, -1\.7,/.test(s));
console.log('coldroom_ail : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
