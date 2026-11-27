/* Test : traduction EN du message d'initialisation du journal, independante des chiffres. Usage (depuis files) : node tests/journal_init_en_regression.js */
'use strict';
const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8').replace(/\r\n/g,'\n');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const m=s.match(/\[(\/Thermosys v3 initialisé — [^\n]*?\/g),'(Thermosys v3 initialized[^\n]*?)'\]/);
t('regle presente',!!m);
if(m){
 const re=new RegExp(m[1].slice(1,-2).replace(/\\\\/g,'\\'),'g');
 const en=(a,b,c,d)=>('Thermosys v3 initialisé — '+a+' équipements | '+b+' constructeurs | '+c+' vannes | '+d+' normes').replace(re,m[2]);
 t('80/38/53/50',en(80,38,53,50)==='Thermosys v3 initialized — 80 items | 38 manufacturers | 53 valves | 50 standards');
 t('chiffres quelconques',en(1,2,3,4)==='Thermosys v3 initialized — 1 items | 2 manufacturers | 3 valves | 4 standards');
 t('ancien 55 vannes aussi',en(80,38,55,50).indexOf('55 valves')>0);
 t('ordre des groupes',/\$1 items \| \$2 manufacturers \| \$3 valves \| \$4 standards/.test(m[2]));
}
t('message FR source',s.indexOf('initialisé — ')>0);
console.log('journal_init_en : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
