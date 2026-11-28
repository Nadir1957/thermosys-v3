/* Test : OCR, reponse coupee : plafond releve, reflexion desactivee (2.5 Flash), avertissement si MAX_TOKENS. Usage (depuis files) : node tests/ocr_troncature_regression.js */
'use strict';
const fs=require('fs');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const cnt=(x,o)=>x.split(o).length-1;
const F=['api/ocr.js','dist/api/ocr.js'].filter(p=>fs.existsSync(p));
t('au moins un fichier ocr.js',F.length>=1);
const src=F.map(p=>fs.readFileSync(p,'utf8').replace(/\\r\\n/g,'\\n'));
if(F.length===2)t('api et dist\\api identiques',src[0]===src[1]);
src.forEach(function(s,i){const n=F[i];
 t(n+' : ancien plafond supprime',s.indexOf('maxOutputTokens: 2048')<0&&cnt(s,'maxOutputTokens: GEMINI_MAX_TOKENS')===1);
 t(n+' : reflexion desactivee seulement si 2.5 Flash',s.indexOf('thinkingConfig: { thinkingBudget: 0 }')>0&&s.indexOf('THINKING_OFF')>0);
 t(n+' : avertissement MAX_TOKENS',s.indexOf("finish === 'MAX_TOKENS'")>0&&s.indexOf('Résultat incomplet')>0&&s.indexOf('Incomplete result')>0);
 t(n+' : reponse avec finishReason et truncated',s.indexOf('finishReason: finish, truncated: cut')>0);
 t(n+' : texte inchange si la reponse est complete',s.indexOf(': textResult;')>0);
 const m=s.match(/const okId = [^\n]*\n\s*const GEMINI_MODEL = [^\n]*\n\s*const GEMINI_API_VERSION = [^\n]*\n[^\n]*\n\s*const mt = [^\n]*\n\s*const GEMINI_MAX_TOKENS = [^\n]*\n[^\n]*\n\s*const THINKING_OFF = [^\n]*\n/);
 t(n+' : bloc de reglages lisible',!!m);
 if(m){const run=env=>new Function('process','console',m[0]+';return {mt:GEMINI_MAX_TOKENS,off:THINKING_OFF,model:GEMINI_MODEL};')({env},{log(){}});
  t(n+' : defaut 8192, reflexion coupee',run({}).mt===8192&&run({}).off===true);
  t(n+' : plafond personnalise',run({GEMINI_MAX_TOKENS:'4096'}).mt===4096&&run({GEMINI_MAX_TOKENS:'20000'}).mt===20000);
  t(n+' : plafond invalide = defaut',run({GEMINI_MAX_TOKENS:'12'}).mt===8192&&run({GEMINI_MAX_TOKENS:'abc'}).mt===8192&&run({GEMINI_MAX_TOKENS:'99999999'}).mt===8192);
  t(n+' : modele 3.5 : reflexion non forcee',run({GEMINI_MODEL:'gemini-3.5-flash-lite'}).off===false);
  t(n+' : 2.5 flash-lite et 2.5 flash : reflexion coupee',run({GEMINI_MODEL:'gemini-2.5-flash-lite'}).off===true&&run({GEMINI_MODEL:'gemini-2.5-flash'}).off===true);
  t(n+' : GEMINI_THINKING=on reactive la reflexion',run({GEMINI_THINKING:'on'}).off===false&&run({GEMINI_THINKING:' ON '}).off===false);}
 // comportement de la partie reponse
 const a=s.indexOf('const finish ='),b=s.indexOf('truncated: cut });',a);t(n+' : bloc reponse trouve',a>0&&b>a);
 if(a>0&&b>a){const code=s.slice(a,b+'truncated: cut });'.length).replace('return res.status(200).json(','return (');
  const run=(parsed,textResult)=>new Function('parsed','textResult','GEMINI_MODEL','console',code)(parsed,textResult,'m',{log(){}});
  const r1=run({candidates:[{finishReason:'STOP'}]},'abc');t(n+' : reponse complete inchangee',r1.text==='abc'&&r1.truncated===false&&r1.finishReason==='STOP');
  const r2=run({candidates:[{finishReason:'MAX_TOKENS'}]},'abc');t(n+' : reponse coupee signalee',r2.truncated===true&&r2.text.indexOf('abc')===0&&r2.text.indexOf('incomplet')>0);
  const r3=run({},'abc');t(n+' : reponse sans finishReason',r3.text==='abc'&&r3.truncated===false);}
});
console.log('ocr_troncature : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
