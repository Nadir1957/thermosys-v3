/* Test : OCR, modele Gemini reglable (GEMINI_MODEL / GEMINI_API_VERSION), valeurs par defaut inchangees. Usage (depuis files) : node tests/ocr_modele_regression.js */
'use strict';
const fs=require('fs');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const cnt=(x,o)=>x.split(o).length-1;
const F=['api/ocr.js','dist/api/ocr.js'].filter(p=>fs.existsSync(p));
t('au moins un fichier ocr.js',F.length>=1);
const src=F.map(p=>fs.readFileSync(p,'utf8').replace(/\\r\\n/g,'\\n'));
if(F.length===2)t('api et dist\\api identiques',src[0]===src[1]);
src.forEach(function(s,i){const n=F[i];
 t(n+' : constante modele',cnt(s,"const GEMINI_MODEL = ")===1&&s.indexOf("'gemini-2.5-flash'")>0);
 t(n+' : constante version',cnt(s,"const GEMINI_API_VERSION = ")===1&&s.indexOf("'v1beta'")>0);
 t(n+' : chemin construit avec les constantes',s.indexOf('`/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${aiKey}`')>0);
 t(n+' : plus de modele ecrit en dur dans le chemin',s.indexOf('/v1/models/gemini-2.5-flash:generateContent')<0);
 t(n+' : reponse avec le modele',s.indexOf('model: GEMINI_MODEL, finishReason')>0);
 t(n+' : validation de l\'identifiant',s.indexOf('/^[A-Za-z0-9._-]{1,64}$/')>0);
 t(n+' : cle lue depuis l\'environnement',s.indexOf('process.env.GEMINI_API_KEY')>0);
 // comportement : reproduit la logique de selection
 const m=s.match(/const okId = [^\n]*\n\s*const GEMINI_MODEL = [^\n]*\n\s*const GEMINI_API_VERSION = [^\n]*\n/);t(n+' : bloc de selection lisible',!!m);
 if(m){const run=env=>new Function('process',m[0]+';return [GEMINI_MODEL,GEMINI_API_VERSION];')({env});
  t(n+' : defaut',run({}).join('|')==='gemini-2.5-flash|v1beta');
  t(n+' : surcharge du modele',run({GEMINI_MODEL:'gemini-3.5-flash-lite'}).join('|')==='gemini-3.5-flash-lite|v1beta');
  t(n+' : surcharge de la version',run({GEMINI_MODEL:'x-1.2',GEMINI_API_VERSION:'v1beta'}).join('|')==='x-1.2|v1beta');
  t(n+' : identifiant dangereux refuse',run({GEMINI_MODEL:'../x?key=1'})[0]==='gemini-2.5-flash'&&run({GEMINI_MODEL:'a b'})[0]==='gemini-2.5-flash');
  t(n+' : espaces retires',run({GEMINI_MODEL:'  gemini-3.5-flash-lite  '})[0]==='gemini-3.5-flash-lite');
  t(n+' : valeur vide = defaut',run({GEMINI_MODEL:''})[0]==='gemini-2.5-flash');}
});
console.log('ocr_modele : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
