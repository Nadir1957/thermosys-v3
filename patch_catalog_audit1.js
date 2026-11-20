// Thermosys - audit du catalogue, vague 1 : valeurs corrigees d'apres les fiches officielles
// (IMI TA-COMPACT-P et STAD, Danfoss VB 2, Belimo R2 et PIQCV, Honeywell V5013N et VBN2, Siemens VXF32)
// Les corrections sont appliquees au demarrage sur les donnees du catalogue (aucun texte obfusque modifie).
// Usage : node patch_catalog_audit1.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="catalog-fix"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }

const IIFE_OLD = 'BRANDS=(function(a){a=a.filter(';
const IIFE_NEW = 'BRANDS=(function(a){try{window.__catFix&&window.__catFix();}catch(e){}a=a.filter(';
const nIife = s.split(IIFE_OLD).length - 1;
if (nIife !== 1) { console.log('ARRET : ancre BRANDS introuvable ou multiple (' + nIife + ') - appliquez d\'abord patch_brands.js'); process.exit(1); }

/* ------------------------------------------------------------------ */
/* Code execute au demarrage : corrige VALVES et PRODS en place         */
/* ------------------------------------------------------------------ */
const FIX = `window.__catFix=function(){
var DEFAULT_KVS=['Kvs max','Kvs','Kvs dispo'];
function setKvsText(d,txt){if(!d)return;DEFAULT_KVS.forEach(function(k){if(k in d)d[k]=txt;});}
function V(b,m,o){var A=(typeof VALVES!=='undefined')?VALVES:[];for(var i=0;i<A.length;i++){var v=A[i];if(v.br!==b||v.m!==m)continue;
 if(o.m)v.m=o.m;if('kvs' in o)v.kvs=o.kvs;if('pn' in o)v.pn=o.pn;if('tmax' in o)v.tmax=o.tmax;
 v.detail=v.detail||{};var d=v.detail;
 if(o.kvsTxt)setKvsText(d,o.kvsTxt);
 if(o.dnpn&&('DN/PN' in d))d['DN/PN']=o.dnpn;
 if(o.t){['T° fluide max','T° max'].forEach(function(k){if(k in d)d[k]=o.t;});}
 if(o.det){Object.keys(o.det).forEach(function(k){if(o.det[k]===null)delete d[k];else d[k]=o.det[k];});}
 return;}}
function P(id,fn){var A=(typeof PRODS!=='undefined')?PRODS:[];for(var i=0;i<A.length;i++){if(A[i].id===id){fn(A[i]);return;}}}

/* --- IMI STAD / Tour&Andersson STAD : Kv reel (fiche IMI STAD PN25) --- */
var STAD={15:2.56,20:5.39,25:8.59,32:14.2,40:19.3,50:32.3};
[15,20,25,32,40,50].forEach(function(dn){V('IMI Hydronic','STAD DN'+dn,{kvs:STAD[dn],kvsTxt:STAD[dn]+' m³/h',det:{'Corps':'AMETAL'}});});
[20,32].forEach(function(dn){V('Tour&Andersson','STAD DN'+dn,{kvs:STAD[dn],kvsTxt:STAD[dn]+' m³/h',det:{'Corps':'AMETAL'}});});

/* --- Danfoss VB 2 : fiche VM 2 / VB 2 (DN15 0,25 a 4 ; DN20 6,3 ; DN25 10 ; DN32 16 ; DN40 25 ; DN50 40 ; PN25 ; 150 C) --- */
var VB2={15:null,20:6.3,25:10,32:16,40:25,50:40};
[15,20,25,32,40,50].forEach(function(dn){
 var o={pn:25,tmax:150,dnpn:'DN'+dn+'/PN25',t:'150°C',det:{'Connexion':'Brides PN25'}};
 if(dn===15){o.kvsTxt='0.25/0.40/0.63/1.0/1.6/2.5/4.0 m³/h';}else{o.kvs=VB2[dn];o.kvsTxt=VB2[dn]+' m³/h';}
 V('Danfoss','VB2 DN'+dn,o);});

/* --- Belimo R2 : vraies references (fiche R2..xx-S..) --- */
V('Belimo','R214-N DN15',{m:'R2015-P63-S1 DN15',kvs:0.63,kvsTxt:'0.25/0.40/0.63/1.0/1.6/2.5/4.0/6.3 m³/h',det:{'Connexion':'Rp 1/2"'}});
V('Belimo','R220-N DN20',{m:'R2020-4-S2 DN20',kvs:4,kvsTxt:'4.0/6.3/8.6 m³/h',det:{'Connexion':'Rp 3/4"'}});
V('Belimo','R225-N DN25',{m:'R2025-6P3-S2 DN25',kvs:6.3,kvsTxt:'6.3/10/16 m³/h',det:{'Connexion':'Rp 1"'}});
V('Belimo','R232-N DN32',{m:'R2032-16-S3 DN32',kvs:16,kvsTxt:'16 m³/h',det:{'Connexion':'Rp 1 1/4"'}});
V('Belimo','R240-N DN40',{m:'R2040-16-S3 DN40',kvs:16,kvsTxt:'16/25 m³/h',det:{'Connexion':'Rp 1 1/2"'}});
V('Belimo','R250-N DN50',{m:'R2050-25-S4 DN50',kvs:25,kvsTxt:'25/40 m³/h',det:{'Connexion':'Rp 2"'}});

/* --- Belimo PIQCV DN15 : debits nominaux 0,9 / 2,0 / 4,3 GPM = 0,20 / 0,45 / 0,98 m3/h (brochure Belimo) --- */
V('Belimo','PIQCV DN15',{kvs:'n/a (Qnom 0.20/0.45/0.98 m³/h)',det:{'Gamme':'PIQCV','Kvs max':null,'Plage':'0.20–0.98 m³/h','T° max':null}});

/* --- Honeywell V5013N : DN15 Kvs 2,5 / 4,0 ; DN20 Kvs 6,3 ; raccords NPT femelles --- */
V('Honeywell','V5013N DN15',{kvs:2.5,kvsTxt:'2.5 / 4.0 m³/h',det:{'Connexion':'NPT 1/2"'}});
V('Honeywell','V5013N DN20',{kvs:6.3,kvsTxt:'6.3 m³/h',det:{'Connexion':'NPT 3/4"'}});

/* --- Honeywell VBN2 : vannes a bille NPT, Cv (references VBN2ABLSxx inexistantes) --- */
V('Honeywell','VBN2ABLS06 DN15',{m:'VBN2 1/2" DN15',kvs:'n/a (Cv 0.38–11.7)',pn:25,tmax:121,dnpn:'DN15/PN25',det:{'Gamme':'VBN2','Kvs':'Cv 0.38–11.7','Corps':null,'Siège':null,'T° max':'121°C','Connexion':'NPT 1/2"','Stroke':null,'Actionneurs':null,'PDiff max':null,'Poids':null,'Certif.':null}});
V('Honeywell','VBN2ABLS10 DN20',{m:'VBN2 3/4" DN20',kvs:'n/a (Cv 0.31–29)',pn:25,tmax:121,dnpn:'DN20/PN25',det:{'Kvs':'Cv 0.31–29','T° max':'121°C','Connexion':'NPT 3/4"'}});
V('Honeywell','VBN2ABLS16 DN25',{m:'VBN2 1" DN25',kvs:'n/a (Cv 4.4–54)',pn:25,tmax:121,dnpn:'DN25/PN25',det:{'Kvs':'Cv 4.4–54','Connexion':'NPT 1"'}});

/* --- IMI TA-COMPACT-P (PICV) : Qmax DN15 88-470 l/h, DN20 210-1150 l/h, PN16, 90 C --- */
V('IMI Hydronic','PICV DN15',{m:'TA-COMPACT-P DN15',kvs:'n/a (Qmax 88–470 l/h)',pn:16,tmax:90,det:{'Gamme':'TA-COMPACT-P (PICV)','Plage débit':'0.09–0.47 m³/h','T° max':'90°C'}});
V('IMI Hydronic','PICV DN20',{m:'TA-COMPACT-P DN20',kvs:'n/a (Qmax 210–1150 l/h)',pn:16,tmax:90,det:{'Plage':'0.21–1.15 m³/h'}});

/* ---------------- fiches du catalogue (PRODS) ---------------- */
P('im01',function(p){
 p.spec['Kvs max']='8.59 m³/h';p.spec['Corps']='AMETAL';
 p.feat=['IMI STAD DN25 équilibrage manuel','Corps AMETAL PN25','Double port mesure intégré','Kvs max 8.59 m³/h','T° max 120°C','Mémorisation réglage Set&Lock','Logiciel TA Select en ligne','Certifié EN 12828'];
 p.feat_en=['IMI STAD DN25 manual balancing','PN25 AMETAL body','Integrated double measurement port','Max Kvs 8.59 m³/h','Max temp 120°C','Set&Lock setting memorization','TA Select online software','EN 12828 certified'];
 p.detail['Kvs max']='8.59 m³/h';p.detail['Corps']='AMETAL';
 p.detail_en['Max Kvs']='8.59 m³/h';p.detail_en['Body']='AMETAL';
 if(p.tags)p.tags=p.tags.map(function(t){return t;});});

P('im02',function(p){
 p.n='PICV DN20 TA-COMPACT-P 0.21–1.15 m³/h';p.m='TA-COMPACT-P DN20';p.ser='TA-COMPACT-P PICV';
 p.spec['Corps']='AMETAL';
 p.feat=['IMI TA-COMPACT-P DN20 — pression indépendante','Auto-équilibrage + régulation combinés','Plage débit 0.21-1.15 m³/h','Autorité hydraulique 100%','T° max 90°C','Actionneur 24V 0-10V compatible','Élimine vanne équilibrage séparée'];
 p.feat_en=['IMI TA-COMPACT-P DN20 — pressure independent','Combined auto-balancing + regulation','Flow range 0.21-1.15 m³/h','100% hydraulic authority','Max temp 90°C','24V 0-10V actuator compatible','Eliminates separate balancing valve'];
 p.detail['Plage débit']='0.21–1.15 m³/h';p.detail['T° max']='90°C';p.detail['ΔP indépendant']='15–400 kPa';p.detail['Corps']='AMETAL';delete p.detail['Certif.'];
 p.detail_en['Flow range']='0.21–1.15 m³/h';p.detail_en['Max temp']='90°C';p.detail_en['Independent ΔP']='15–400 kPa';p.detail_en['Body']='AMETAL';delete p.detail_en['Certif.'];});

P('si02',function(p){
 p.n='Vanne 3V VXF32 DN25 6.3Kvs';p.m='VXF32.25-6.3';p.ser='Acvatix VXF';
 p.spec={'Diamètre':'DN 25','Kvs':'6.3 m³/h','Corps':'Fonte EN-GJL-250','PN':'PN10','T° max fluide':'150°C','Fluide':'EGF, vapeur BP, solutions glycolées','Connexion':'Brides PN10'};
 p.feat=['Siemens VXF32 vanne 3V DN25','Corps fonte PN10','Kvs 6.3 m³/h','T° max 150°C eau','Compatible actionneurs SAX / SAV'];
 p.feat_en=['Siemens VXF32 3-way valve DN25','PN10 cast iron body','Kvs 6.3 m³/h','Max water temp 150°C','SAX / SAV actuator compatible'];
 p.detail={'DN':'DN25','PN':'PN10','Kvs':'6.3 m³/h','Type':'3 voies mélangeur/distributeur','Corps':'Fonte EN-GJL-250','T° max':'150°C','Actionneurs compatibles':'SAX, SAV','Connexion':'Brides PN10'};
 p.detail_en={'DN':'DN25','PN':'PN10','Kvs':'6.3 m³/h','Type':'3-way mixing/diverting','Body':'EN-GJL-250 cast iron','Max temp':'150°C','Compatible actuators':'SAX, SAV','Connection':'Flanged PN10'};
 p.tags=['Vanne','3 voies','DN25','PN10','Fonte'];});

P('ho02',function(p){
 p.n='Vanne 2V VBN2 DN15 (1/2" NPT) Cv 0.38–11.7';p.m='VBN2 1/2"';p.sub='Vanne à bille 2 voies VBN2 DN15 laiton';
 p.spec={'Diamètre':'DN 15','Kvs':'Cv 0.38–11.7','Corps':'Laiton forgé','PN':'PN25','T° max fluide':'121°C','Connexion':'NPT 1/2"'};
 p.feat=['Honeywell VBN2 vanne à bille 2V DN15 (1/2" NPT)','Corps laiton forgé','Cv 0.38–11.7','T° max 121°C','Eau chaude/glacée + glycol jusqu\\'à 50%'];
 p.feat_en=['Honeywell VBN2 2-way ball valve DN15 (1/2" NPT)','Forged brass body','Cv 0.38–11.7','Max temp 121°C','Hot/chilled water + glycol up to 50%'];
 p.detail={'DN':'DN15','Cv':'0.38–11.7','Type':'2 voies modulante','Corps':'Laiton forgé','T° max':'121°C','Connexion':'NPT 1/2"'};
 p.detail_en={'DN':'DN15','Cv':'0.38–11.7','Type':'2-way modulating','Body':'Forged brass','Max temp':'121°C','Connection':'NPT 1/2"'};
 p.tags=['Vanne','2 voies','DN15','PN25','Laiton'];});
};`;

/* ------------------------------------------------------------------ */
/* Traductions espagnoles des textes nouveaux                           */
/* ------------------------------------------------------------------ */
const ES = {
  'PN25 AMETAL body': 'Cuerpo de AMETAL PN25',
  'Max Kvs 8.59 m³/h': 'Kvs máx. 8,59 m³/h',
  '8.59 m³/h': '8,59 m³/h',
  'IMI TA-COMPACT-P DN20 — pressure independent': 'IMI TA-COMPACT-P DN20 — independiente de la presión',
  'Flow range 0.21-1.15 m³/h': 'Rango de caudal 0,21-1,15 m³/h',
  'Max temp 90°C': 'Temp. máx. 90 °C',
  'Siemens VXF32 3-way valve DN25': 'Válvula de 3 vías Siemens VXF32 DN25',
  'PN10 cast iron body': 'Cuerpo de fundición PN10',
  'Max water temp 150°C': 'Temp. máx. del agua 150 °C',
  'SAX / SAV actuator compatible': 'Compatible con actuadores SAX / SAV',
  'Flanged PN10': 'Bridas PN10',
  'Brides PN10': 'Bridas PN10',
  'Brides PN25': 'Bridas PN25',
  'Honeywell VBN2 2-way ball valve DN15 (1/2" NPT)': 'Válvula de bola de 2 vías Honeywell VBN2 DN15 (1/2" NPT)',
  'Forged brass body': 'Cuerpo de latón forjado',
  'Forged brass': 'Latón forjado',
  'Laiton forgé': 'Latón forjado',
  'Hot/chilled water + glycol up to 50%': 'Agua caliente/fría + glicol hasta el 50 %',
  'Max temp 121°C': 'Temp. máx. 121 °C',
  '2-way modulating': '2 vías modulante',
  '3-way mixing/diverting': '3 vías mezcladora/distribuidora',
  'Compatible actuators': 'Actuadores compatibles',
  'Vanne à bille 2 voies VBN2 DN15 laiton': 'Válvula de bola de 2 vías VBN2 DN15 de latón',
  'Laiton': 'Latón'
};
const esBlock = '<script id="lang-es-data-35">(function(){var D=' + JSON.stringify(ES) +
  ';var w=window.I18N3=window.I18N3||{};var t=w.dict=w.dict||{};t=t.es=t.es||{};Object.keys(D).forEach(function(k){if(!(k in t))t[k]=D[k];});})();</script>';

/* ------------------------------------------------------------------ */
/* Application                                                          */
/* ------------------------------------------------------------------ */
const before = s.length;

// 1) appel au demarrage (dans l'expression BRANDS deja corrigee)
s = s.replace(IIFE_OLD, function () { return IIFE_NEW; });

// 2) definition de la fonction de correction, avant le script qui contient les donnees
const at = s.indexOf(IIFE_NEW);
const start = s.lastIndexOf('<script', at);
if (start < 0) { console.log('ARRET : balise script introuvable'); process.exit(1); }
s = s.slice(0, start) + '<script id="catalog-fix">' + FIX + '</script>\n' + s.slice(start);

// 3) dictionnaire espagnol
const a = s.indexOf('<script id="lang-es-data-34">');
if (a < 0) { console.log('ARRET : script lang-es-data-34 introuvable'); process.exit(1); }
const e = s.indexOf('</script>', a) + '</script>'.length;
s = s.slice(0, e) + '\n' + esBlock + s.slice(e);

// 4) copie de la liste d'orientation (reco) : IMI PICV
const L_OLD = '"n":"PICV DN20 Auto-équil. 0.02-0.25 m³/h","m":"PICV 20"';
const L_NEW = '"n":"PICV DN20 TA-COMPACT-P 0.21–1.15 m³/h","m":"TA-COMPACT-P DN20"';
const nl = s.split(L_OLD).length - 1;
if (nl === 1) s = s.replace(L_OLD, function () { return L_NEW; });
console.log('Corrections du catalogue installees (vannes + 4 fiches) : OK');
console.log('Liste d\'orientation IMI PICV : ' + (nl === 1 ? 'OK' : 'non trouvee (' + nl + ')'));
fs.writeFileSync(f, s, 'utf8');
console.log('Taille : ' + before + ' -> ' + s.length + ' octets (+' + (s.length - before) + ')');

let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (er) { bad++; console.log('ATTENTION script ' + i + ' : ' + er.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
