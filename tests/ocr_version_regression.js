/* Test : OCR, version d'API par defaut v1beta ; la reflexion n'est desactivee que sur v1beta (sinon erreur 400 de Google). Usage (depuis files) : node tests/ocr_version_regression.js */
'use strict';
const fs=require('fs');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const F=['api/ocr.js','dist/api/ocr.js'].filter(p=>fs.existsSync(p));
t('au moins un fichier ocr.js',F.length>=1);
const src=F.map(p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'));
if(F.length===2)t('api et dist/api identiques',src[0]===src[1]);
src.forEach(function(s,i){const n=F[i];
 const m=s.match(/const okId = [^\n]*\n\s*const GEMINI_MODEL = [^\n]*\n\s*const GEMINI_API_VERSION = [^\n]*\n[^\n]*\n\s*const mt = [^\n]*\n\s*const GEMINI_MAX_TOKENS = [^\n]*\n[^\n]*\n\s*const THINKING_OFF = [^\n]*\n/);
 t(n+' : bloc de reglages lisible',!!m);
 if(m){const run=env=>new Function('process','console',m[0]+';return {v:GEMINI_API_VERSION,off:THINKING_OFF};')({env},{log(){}});
  t(n+' : defaut v1beta, reflexion coupee',run({}).v==='v1beta'&&run({}).off===true);
  t(n+' : v1 force : reflexion JAMAIS envoyee (sinon erreur 400)',run({GEMINI_API_VERSION:'v1'}).off===false);
  t(n+' : v1beta explicite',run({GEMINI_API_VERSION:'v1beta'}).off===true);
  t(n+' : modele 3.5 : pas de reflexion forcee',run({GEMINI_MODEL:'gemini-3.5-flash-lite'}).off===false);
  t(n+' : GEMINI_THINKING=on',run({GEMINI_THINKING:'on'}).off===false);}
});
console.log('ocr_version : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
