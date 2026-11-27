/* Test : PRG des melanges. Recalcule chaque melange affiche a partir de ses composants (annexe I, AR4 ; HFO anciens 4 et 7) et compare a la valeur affichee ;
   verifie aussi l'ecart avec les valeurs du reglement (HFO annexe II) et le texte de limites FR/EN/ES. Usage (depuis files) : node tests/prg_melanges_regression.js */
'use strict';
const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8').replace(/\r\n/g,'\n');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const A={R32:675,R125:3500,R134a:1430,R143a:4470,R152a:124},HFO4={yf:4,ze:7},HFO6={yf:0.501,ze:1.37};
const M={R404A:{R125:.44,R143a:.52,R134a:.04},R407C:{R32:.23,R125:.25,R134a:.52},R410A:{R32:.5,R125:.5},R507A:{R125:.5,R143a:.5},
 R448A:{R32:.26,R125:.26,yf:.20,R134a:.21,ze:.07},R449A:{R32:.243,R125:.247,yf:.253,R134a:.257},R452A:{R32:.11,R125:.59,yf:.30},R454B:{R32:.689,yf:.311},R452B:{R32:.67,R125:.07,yf:.26}};
const gw=(c,H)=>Object.keys(c).reduce((a,k)=>a+c[k]*(A[k]!==undefined?A[k]:H[k]),0);
const shown={};
Object.keys(M).forEach(k=>{const m=s.match(new RegExp(k+": \\{(?: maxTk: \\d+,)? gwp: (\\d+),"))||s.match(new RegExp(k+" \\(GWP (\\d+)\\)"));shown[k]=m?+m[1]:null;});
Object.keys(M).forEach(k=>{if(shown[k]===null){t(k+' : valeur affichee trouvee',false);return;}
 const a=gw(M[k],HFO4),b=gw(M[k],HFO6);
 t(k+' : '+shown[k]+' = melange AR4 recalcule ('+a.toFixed(1)+')',Math.abs(shown[k]-a)<=0.6);
 t(k+' : ecart avec le reglement (HFO annexe II) '+(shown[k]-b).toFixed(1)+' <= 4',Math.abs(shown[k]-b)<=4);});
['annexe II : R1234yf 0,501','Annex II: R1234yf 0.501','anexo II: R1234yf 0,501'].forEach(x=>t('texte : '+x,s.indexOf(x)>0));
t('plus de "non verifie" sur l\'annexe VI',s.indexOf('pour certains mélanges : non vérifié')<0&&s.indexOf('for some blends: not verified')<0&&s.indexOf('algunas mezclas: no verificado')<0);
console.log('prg_melanges : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
