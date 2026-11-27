/* Test : fiches actionneurs (unite correcte, pas de pastille vide). Usage (depuis files) : node tests/actionneurs_fiche_regression.js */
'use strict';
const fs=require('fs');
const s=fs.readFileSync('dist/index.html','utf8').replace(/\r\n/g,'\n');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const i=s.indexOf('function actOk(v)'),j=s.indexOf('function showActDetail(idx)');
t('fonctions presentes',i>0&&j>i);
if(i>0&&j>i){
 const f=new Function(s.slice(i,j).replace(/\/\*[^]*?\*\//g,'')+';return {actOk,actF,actSub};')();
 t('2000 N reste 2000 N',f.actF({force:'2000 N'})==='2000 N');
 t('valeur sans unite -> Nm',f.actF({force:'10'})==='10 Nm');
 t('2 Nm reste 2 Nm',f.actF({force:'2 Nm'})==='2 Nm');
 t('masque -> vide',f.actF({force:'—'})===''&&f.actF({})===''&&f.actF({force:'-'})==='');
 t('pastille couple absente si masque',!f.actOk('—')&&f.actOk('24VAC'));
 t('sous-titre complet',f.actSub({cat:'Rotatif',alim:'24VAC',sig:'0-10V'})==='Rotatif — 24VAC — Signal: 0-10V');
 t('sous-titre masque',f.actSub({cat:'Non vérifié',alim:'—',sig:'—'})==='Non vérifié');
}
t('plus de " Nm</span>" force en dur',s.indexOf("force+' Nm</span>'")<0&&s.indexOf("a.couple)+' Nm</span>'")<0);
t('liste : plus de force+" Nm</div>"',s.indexOf("'+force+' Nm</div>")<0);
console.log('actionneurs_fiche : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
