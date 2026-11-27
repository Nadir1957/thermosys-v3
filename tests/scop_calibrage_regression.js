'use strict';
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','dist','index.html'),'utf8');
let bad=[];
// fiches reelles (COP A7/W35 EN 14511 ; SCOP 35 C moyen / plus chaud / plus froid) : DIN CERTCO / Heat Pump KEYMARK, tecalor, Stiebel Eltron, Ariston Aerotop (fiches EN 14825)
const SH=[['Daikin 011-1W0075',4.25,3.80,null,null],['TTL 3.5 ACS 011-1W0116',4.54,4.15,4.99,3.72],['tecalor TTL 13 E 011-1W0055',4.35,3.86,4.07,3.56],['Stiebel WPL 17 ICS classic',4.74,4.25,null,null],['Aerotop SG10',5.35,4.91,5.11,3.92],['Aerotop SG12',5.40,5.23,5.57,3.86],['Aerotop SG14',5.13,4.64,5.68,3.83]];
function load(h){
  const g=re=>{const m=re.exec(h);if(!m)throw new Error('introuvable : '+re);return m[0];};
  const code=[g(/var SCOP_SF=[^\n]*\n/),g(/function scopInterp[^\n]*\n/),g(/function factor\(hdd\)[^\n]*\n/),g(/function hhe\(hdd\)[^\n]*/),g(/var T35=[^\n]*\n/),g(/function cls\(e,t\)[^\n]*\n/)].join('\n');
  return new Function(code+'\nreturn {factor,hhe,cls,T35};')();
}
function checks(h,b){
  const ok=(c,m)=>{if(!c)b.push(m);};
  let F;try{F=load(h);}catch(e){b.push('chargement : '+e.message);return;}
  const near=(a,x,t)=>Math.abs(a-x)<=t;
  ok(near(F.factor(2900),0.91,1e-9)&&near(F.factor(1200),1.03,1e-9)&&near(F.factor(4200),0.77,1e-9),'facteur aux 3 climats de reference');
  ok(near(F.hhe(2900),2066,1e-6)&&near(F.hhe(1200),1336,1e-6)&&near(F.hhe(4200),2465,1e-6),'heures equivalentes aux 3 climats (reglement 811/2013 annexe VII)');
  let mono=true,pf=9,ph=-1;for(let x=0;x<=9000;x+=25){const f=F.factor(x),hh=F.hhe(x);if(f>pf+1e-12||hh<ph-1e-9)mono=false;pf=f;ph=hh;}
  ok(mono,'facteur non decroissant / heures non decroissantes avec les degres-jours');
  ok(F.factor(0)===1.03&&F.factor(9000)>=0.65&&F.factor(9000)<0.77,'bornes du facteur');
  ok(F.hhe(0)===0&&F.hhe(9000)<=3000&&F.hhe(600)>600&&near(F.hhe(600),668,1e-6),'heures : proportionnelles sous 1200, plafond 3000');
  // ecart du modele aux fiches
  let sum=0,n=0;
  for(const s of SH){const e=F.factor(2900)*s[1]/s[2]-1;sum+=e;n++;ok(Math.abs(e)<=0.07,'climat moyen '+s[0]+' : ecart '+(100*e).toFixed(1)+' %');
    if(s[3]){const w=F.factor(1200)*s[1]/s[3]-1;ok(Math.abs(w)<=0.12,'plus chaud '+s[0]+' : ecart '+(100*w).toFixed(1)+' %');const c=F.factor(4200)*s[1]/s[4]-1;ok(Math.abs(c)<=0.12,'plus froid '+s[0]+' : ecart '+(100*c).toFixed(1)+' %');}}
  ok(Math.abs(sum/n)<=0.03,'biais moyen climat moyen : '+(100*sum/n).toFixed(1)+' %');
  // classes (reglement 811/2013, annexe II, tableau 2)
  const T=[[175,'A+++'],[174.9,'A++'],[150,'A++'],[149.9,'A+'],[123,'A+'],[122.9,'A'],[115,'A'],[114.9,'B'],[107,'B'],[106.9,'C'],[100,'C'],[99.9,'D'],[61,'D'],[60.9,'E'],[59,'E'],[58.9,'F'],[55,'F'],[54.9,'G']];
  for(const [e,c] of T) ok(F.cls(e,F.T35)===c,'classe pour ηs='+e);
  ok(h.indexOf('E=cap*2000/used')<0&&h.indexOf('E=cap*hh/used')>0,'heures codees en dur');
  ok(h.indexOf('var etas=used/CC*100-3;')>0&&h.indexOf('var CC=2.5;')>0,'formule ηs');
  const cnt=(x)=>h.split(x).length-1;
  ok(cnt('calé sur des fiches EN 14825 / Heat Pump KEYMARK')===1,'note FR');
  ok(cnt('calibrated on EN 14825 / Heat Pump KEYMARK datasheets')===2,'note EN (texte + cle du dictionnaire)');
  ok(cnt('calibrado con fichas EN 14825 / Heat Pump KEYMARK')===1,'note ES');
  ok(h.indexOf('(\\d+) full-load-equivalent h, EN 14825\\): (\\S+) kWh')>0,'regex ES des heures');
  ok(h.indexOf('RE2020: $1')>0,'etiquette de zone RE2020');
  ok(cnt('recalé sur 7 fiches EN 14825 / Keymark')===1&&cnt('calibrated on 7 EN 14825 / Keymark datasheets')===1&&cnt('calibrado con 7 fichas EN 14825 / Keymark')===1,'textes de la page Validation (FR/EN/ES)');
}
checks(html,bad);
const M=[['[2900,0.91]','[2900,1.00]'],['[1200,1.03]','[1200,1.25]'],['[4200,0.77]','[4200,0.87]'],['[2900,2066]','[2900,2000]'],['[1200,1336]','[1200,1300]'],['[4200,2465]','[4200,2400]'],['if(hdd<=1200)return 1.03;','if(hdd<=1200)return 1.10;'],['Math.min(3000,','Math.min(4000,'],['Math.max(0.65,','Math.max(0.95,'],['[150,\'A++\']','[155,\'A++\']'],['[175,\'A+++\']','[170,\'A+++\']'],['E=cap*hh/used','E=cap*2000/used'],['used/CC*100-3','used/CC*100-5'],['var CC=2.5;','var CC=2.4;'],['calé sur des fiches EN 14825','calé sur des mesures'],['(\\d+) full-load-equivalent h, EN 14825','2000 full-load-equivalent h, EN 14825']];
let killed=0;
for(const [a,b] of M){const i=html.indexOf(a);if(i<0){bad.push('mutation sans ancre : '+a);continue;}const t=html.slice(0,i)+b+html.slice(i+a.length);const bb=[];checks(t,bb);if(bb.length)killed++;else bad.push('mutation survivante : '+a);}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : calibrage SCOP sur 7 fiches, classes 811/2013, heures EN 14825, '+killed+' mutations tuees');
