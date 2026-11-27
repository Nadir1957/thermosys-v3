'use strict';
// Thermosys - en-tete d'impression : nom THERMOSYS, titre du module, date et adresse sur toutes les impressions de page (invisible a l'ecran).
const fs=require('fs'),path=require('path'),vm=require('vm');
const f=process.argv[2]||path.join(__dirname,'..','dist','index.html');
const raw=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const cnt=(h,x)=>h.split(x).length-1;
let nb=0;
function run(s,lang,title){
  const m=/<script id="print-header">\n([\s\S]*?)\n<\/script>/.exec(s);if(!m)return null;
  const el={textContent:''},h={};
  const kids=title===null?[]:[{nodeType:1,textContent:'SI'},{nodeType:3,textContent:' '+title+' '},{nodeType:1,textContent:'Impérial'}];
  const doc={getElementById:id=>id==='phdrSub'?el:null,querySelector:q=>q==='.page.active'?{querySelector:z=>z==='.ptitle'?(title===null?null:{childNodes:kids}):null}:null};
  const win={lang:lang,addEventListener:(n,fn)=>{h[n]=fn;}};
  vm.runInNewContext(m[1],{window:win,document:doc,Date:Date});
  if(!h.beforeprint)return null;h.beforeprint();return el.textContent;
}
function checks(s,bad){
  const ok=(c,m)=>{nb++;if(!c)bad.push(m);};
  ok(cnt(s,'<div class="phdr"><b>THERMOSYS</b><span id="phdrSub"></span></div>')===1,'en-tete present une fois');
  ok(/\.phdr\{display:none\}@media print\{\.phdr\{display:block!important;/.test(s),'cache a l\'ecran, visible a l\'impression');
  const i1=s.indexOf('<div class="phdr">'),i2=s.indexOf('<div class="hbar">');ok(i1>0&&i2>i1&&i2-i1<2500,'en-tete place avant la barre du haut');
  const fr=run(s,'fr','TRAITEMENT D\'AIR — CTA, ROOFTOP ET SALLES PROPRES'),en=run(s,'en','AIR TREATMENT — AHU, ROOFTOP AND CLEANROOMS'),no=run(s,'fr',null);
  ok(fr&&/^Poste de travail génie climatique — TRAITEMENT D'AIR — CTA, ROOFTOP ET SALLES PROPRES — \d{2}\/\d{2}\/\d{4} — thermosys-v3\.vercel\.app$/.test(fr),'texte FR : '+fr);
  ok(en&&/^HVAC engineering workstation — AIR TREATMENT — AHU, ROOFTOP AND CLEANROOMS — \d{2}\/\d{2}\/\d{4} — thermosys-v3\.vercel\.app$/.test(en),'texte EN : '+en);
  ok(fr&&fr.indexOf('Impérial')<0&&fr.indexOf(' SI ')<0,'les boutons SI/Impérial ne sont pas repris');
  ok(no&&/^Poste de travail génie climatique — \d{2}\/\d{2}\/\d{4}/.test(no),'sans titre de module : '+no);
}
const bad=[];checks(raw,bad);
const muts=[["window.addEventListener('beforeprint', fill);","window.addEventListener('afterprint', fill);"],['.phdr{display:none}@media print','@media print'],['.phdr{display:block!important;','.phdr{display:none!important;'],
 ["(en ? 'HVAC engineering workstation' : 'Poste de travail génie climatique')","(en ? 'Poste de travail génie climatique' : 'HVAC engineering workstation')"],["if (t.childNodes[i].nodeType === 3)","if (t.childNodes[i].nodeType === 1)"],
 ["' — thermosys-v3.vercel.app'","''"],["window.lang === 'en'","window.lang === 'fr'"],['<div id="app" style="display:none">\n<div class="phdr">','<div id="app" style="display:none">\n<div class="phdrx">']];
let killed=0;
if(!bad.length)for(const [a,b] of muts){if(cnt(raw,a)<1){bad.push('mutation inapplicable : '+a.slice(0,50));continue;}const t=raw.split(a).join(b);const bb=[];const save=nb;checks(t,bb);nb=save;if(bb.length)killed++;else bad.push('mutation survivante : '+a.slice(0,60));}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : '+nb+' verification(s) reussie(s) (dont '+killed+'/'+muts.length+' mutations detectees), 0 echec(s).');
