/* Test : OCR, nettoyage des repetitions v3 (cas reel RXS20CVMB). Usage (depuis files) : node tests/ocr_repetitions3_regression.js */
'use strict';
const fs=require('fs');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const F=['api/ocr.js','dist/api/ocr.js'].filter(p=>fs.existsSync(p));
t('au moins un fichier ocr.js',F.length>=1);
const src=F.map(p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'));
if(F.length===2)t('api et dist/api identiques',src[0]===src[1]);
const SAMPLE=[
"Voici l'extraction OCR stricte et exhaustive de tout le texte visible sur l'image :","",
"**En-tête principal :**","* MODEL: RXS20CVMB","* REFRIGERANT: R410A","* REFRIGERANT QUANTITY: 0.80 kg","* NET WEIGHT: 30 kg","",
"**Section 1 (Indoor Unit Model FTX20CVMB) :**","* INDOOR UNIT MODEL: FTX20CVMB","* OPERATION MODE (COOLING): COOLING","* TOTAL INPUT (COOLING): 0.500 kW","* TOTAL CURRENT (HEATING): 3.5 A","* MAXIMUM CURRENT: 12 A","",
"**Section 2 (Colonne 2, Ligne 1) :**","* INDOOR UNIT MODEL: (vide)","* OPERATION MODE (COOLING): COOLING","* TOTAL INPUT (COOLING): kW","* TOTAL CURRENT (HEATING): A","* MAXIMUM CURRENT: A","",
"**Section 3 (Colonne 1, Ligne 2) :**","* TOTAL INPUT (COOLING): kW","",
"**Section 4 (Colonne 2, Ligne 2) :**","**Section 5 (Colonne 1, Ligne 3) :**","",
"**Pied de page :**","* Fabricant: DAIKIN INDUSTRIES, LTD."].join('\n');
src.forEach(function(s,i){const n=F[i];
 const a=s.indexOf('const dedupeOcr = '),b=s.indexOf('const cleaned = dedupeOcr(textResult);',a);t(n+' : fonction trouvee',a>0&&b>a);
 if(!(a>0&&b>a))return;
 const D=new Function(s.slice(a,b)+';return dedupeOcr;')();
 const r=D(SAMPLE);
 t(n+' : phrase d\'introduction retiree',r.indexOf('Voici')<0&&r.indexOf('**En-tête principal :**')===0);
 t(n+' : valeurs lisibles conservees',['MODEL: RXS20CVMB','REFRIGERANT QUANTITY: 0.80 kg','NET WEIGHT: 30 kg','INDOOR UNIT MODEL: FTX20CVMB','TOTAL INPUT (COOLING): 0.500 kW','TOTAL CURRENT (HEATING): 3.5 A','MAXIMUM CURRENT: 12 A','Fabricant: DAIKIN INDUSTRIES, LTD.'].every(x=>r.indexOf(x)>0));
 t(n+' : lignes vides repetees supprimees',r.indexOf('(vide)')<0&&r.indexOf(': kW')<0&&r.indexOf(': A\n')<0&&!/: A$/m.test(r));
 t(n+' : titres de section vides supprimes',r.indexOf('Section 2')<0&&r.indexOf('Section 3')<0&&r.indexOf('Section 4')<0&&r.indexOf('Section 5')<0);
 t(n+' : titres utiles conserves',r.indexOf('Section 1')>0&&r.indexOf('Pied de page')>0);
 t(n+' : une seule fois OPERATION MODE (COOLING)',r.split('OPERATION MODE (COOLING)').length===2);
 t(n+' : texte sans repetition inchange',D('* MODEL: X\n* POWER: 230 V')==='* MODEL: X\n* POWER: 230 V');
 t(n+' : phrase d\'intro seule sans liste conservee',D('Voici le texte')==='Voici le texte');
 t(n+' : libelle repete avec autre valeur lisible conserve',D('* FUSE: 15 A\n* FUSE: 16 A').split('\n').length===2);
});
console.log('ocr_repetitions3 : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
