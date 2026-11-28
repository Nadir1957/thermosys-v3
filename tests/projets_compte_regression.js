/* Test : ACCUEIL, section "Mes projets (compte)" : liste, ouverture, suppression en 2 clics, export JSON, textes FR/EN/ES, noms echappes, filtre user_id sur chaque requete. Usage (depuis files) : node tests/projets_compte_regression.js */
'use strict';
const fs=require('fs');
let ok=0,ko=0;const t=(n,c)=>{if(c){ok++;}else{ko++;console.log('ECHEC : '+n);}};
const F=['dist/index.html','index.html'].filter(p=>fs.existsSync(p));
t('au moins un index.html',F.length>=1);
const tick=async()=>{for(let i=0;i<12;i++)await new Promise(r=>setImmediate(r));};
(async()=>{
for(const f of F){const s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');const n=f;
 t(n+' : un seul panneau et un seul module',s.split('id="home-projets-panel"').length===2&&s.split('<script id="projets-compte-module">').length===2&&s.split('<script id="lang-es-projets-compte">').length===2);
 const a=s.indexOf('<script id="projets-compte-module">')+'<script id="projets-compte-module">'.length,b=s.indexOf('</script>',a);const code=s.slice(a,b);
 try{new Function(code);t(n+' : syntaxe du module',true);}catch(e){t(n+' : syntaxe du module : '+e.message,false);continue;}
 const ea=s.indexOf('<script id="lang-es-projets-compte">')+'<script id="lang-es-projets-compte">'.length,eb=s.indexOf('</script>',ea);
 const W0={I18N3:{dict:{}}};new Function('window',s.slice(ea,eb))(W0);const E=W0.I18N3.dict.es;
 t(n+' : dictionnaire ES (21 entrees)',Object.keys(E).length===21&&E['MY PROJECTS (ACCOUNT)']==='MIS PROYECTOS (CUENTA)'&&E['Open']==='Abrir'&&E['Confirm?']==='¿Confirmar?');
 function env(opts){
  const calls=[],toasts=[],els={},timers=[];let rows=opts.rows||[];
  const panel={_h:'',firstChild:null,get innerHTML(){return this._h;},set innerHTML(v){this._h=v;this.firstChild=v?{}:null;}};els['home-projets-panel']=panel;
  els.dvCloudList={innerHTML:'',value:''};els.rsCloudList={innerHTML:'',value:''};
  const W={lang:opts.lang||'fr'};const log=[];
  function q(){const st={f:{}};const o={
   select(c){st.sel=c;return o;},in(k,v){st.in=v;return o;},eq(k,v){st.f[k]=v;return o;},order(){return o;},
   maybeSingle(){calls.push(Object.assign({kind:'fav'},st));return Promise.resolve({data:{data:{items:opts.fav||[]}}});},
   delete(){st.del=true;return o;},
   then(res,rej){calls.push(Object.assign({},st));let r;
     if(opts.error)r={error:{message:'x'}};
     else if(st.del){rows=rows.filter(x=>x.id!==st.f.id);r={};}
     else r={data:rows.map(x=>Object.assign({},x))};
     return Promise.resolve(r).then(res,rej);}};return o;}
  const sbo=opts.guest?{auth:{getSession:()=>Promise.resolve({data:{session:null}})},from:q}:{auth:{getSession:()=>Promise.resolve({data:{session:{user:{id:'user-aaaa-1111'}}}})},from:q};
  const tabs=[];for(let i=0;i<13;i++)tabs.push({id:'tab'+i});
  const doc={readyState:'complete',getElementById:id=>els[id]||null,addEventListener(){},querySelectorAll:()=>tabs,
   createElement:()=>{const a={click(){log.push('click:'+a.download);}};return a;},body:{appendChild(){},removeChild(){}}};
  const fn=new Function('window','document','setInterval','setTimeout','clearTimeout','_sb','showToast','goPage','showTab','loadDevisFromCloud','loadReseauFromCloud','Blob','URL',code);
  const blobs=[];
  fn(W,doc,()=>0,(f)=>{timers.push(f);return timers.length;},()=>{},sbo,(m,k)=>toasts.push(m+'|'+k),(p)=>log.push('goPage:'+p),(a,i,b)=>log.push('showTab:'+a+':'+i+':'+(b&&b.id)),()=>{log.push('loadDevis:'+els.dvCloudList.value);return Promise.resolve();},()=>{log.push('loadReseau:'+els.rsCloudList.value);return Promise.resolve();},function(parts){blobs.push(parts.join(''));},{createObjectURL:()=>'blob:x',revokeObjectURL(){}});
  return {W,panel,calls,toasts,log,els,timers,blobs,rows:()=>rows};
 }
 const ID1='11111111-aaaa-bbbb-cccc-000000000001',ID2='11111111-aaaa-bbbb-cccc-000000000002';
 const R=[{id:ID1,module:'devis',name:'Devis <b>Client</b> "A"',created_at:'2026-11-20T10:00:00Z'},{id:ID2,module:'reseau_hyd',name:'Réseau 1',created_at:'2026-11-21T10:00:00Z'}];
 let e=env({guest:true,rows:R});await tick();
 t(n+' : non connecte : message de connexion, aucune requete',e.panel.innerHTML.indexOf('Connectez-vous pour voir vos projets.')>0&&e.calls.length===0);
 e=env({rows:R,fav:[1,2,3]});await tick();let h=e.panel.innerHTML;
 t(n+' : titre et sections FR',h.indexOf('MES PROJETS (COMPTE)')>0&&h.indexOf('>Devis<')>0&&h.indexOf('>Réseaux<')>0&&h.indexOf('Favoris du catalogue')>0);
 t(n+' : nom du projet echappe (aucun HTML injecte)',h.indexOf('<b>Client</b>')<0&&h.indexOf('&lt;b&gt;Client&lt;/b&gt;')>0&&h.indexOf('&quot;A&quot;')>0);
 t(n+' : compteurs (1 devis, 1 reseau, 3 favoris)',/Devis<\/span> <span class="mp-n">\(1\)/.test(h)&&/Réseaux<\/span> <span class="mp-n">\(1\)/.test(h)&&/Favoris du catalogue<\/span> <span class="mp-n">\(3\)/.test(h));
 t(n+' : boutons Ouvrir/Supprimer/Actualiser/Exporter',h.split('>Ouvrir<').length===3&&h.split('>Supprimer<').length===3&&h.indexOf('>Actualiser<')>0&&h.indexOf('>Exporter tout (JSON)<')>0);
 t(n+' : toutes les requetes filtrees sur user_id',e.calls.length>=2&&e.calls.every(c=>c.f.user_id==='user-aaaa-1111'));
 t(n+' : seuls les modules devis, reseaux, favoris lus',JSON.stringify(e.calls[0].in)==='["devis","reseau_hyd"]'&&e.calls[1].f.module==='dv_favoris');
 e.log.length=0;await e.W.mpAct('open',ID1,'devis');
 t(n+' : ouvrir un devis : page DEVIS + chargement',e.log[0]==='goPage:devis'&&e.log.indexOf('loadDevis:'+ID1)>0&&e.els.dvCloudList.value===ID1);
 e.log.length=0;await e.W.mpAct('open',ID2,'reseau_hyd');
 t(n+' : ouvrir un reseau : page RESEAUX HVAC, onglet Calcul reseau (10) + chargement',e.log[0]==='goPage:hydraulique'&&e.log[1]==='showTab:hyd:10:tab10'&&e.log.indexOf('loadReseau:'+ID2)>0);
 e.log.length=0;await e.W.mpAct('open','x"); alert(1);//','devis');
 t(n+' : identifiant invalide ignore',e.log.length===0);
 const before=e.calls.length;await e.W.mpAct('del',ID1,'devis');
 t(n+' : 1er clic : demande de confirmation, rien supprime',e.panel.innerHTML.indexOf('>Confirmer ?<')>0&&e.calls.length===before&&e.rows().length===2);
 {const tm=e.timers[e.timers.length-1];if(typeof tm==='function')tm();}
 t(n+' : sans 2e clic la confirmation expire',e.panel.innerHTML.indexOf('>Confirmer ?<')<0);
 await e.W.mpAct('del',ID1,'devis');await e.W.mpAct('del',ID1,'devis');await tick();
 const dc=e.calls.filter(c=>c.del);
 t(n+' : 2e clic : suppression ciblee (id et user_id), liste rechargee',dc.length===1&&dc[0].f.id===ID1&&dc[0].f.user_id==='user-aaaa-1111'&&e.rows().length===1&&e.panel.innerHTML.indexOf('Client')<0&&e.toasts.some(x=>x.indexOf('Projet supprimé')===0));
 e=env({rows:R,fav:[1]});await tick();await e.W.mpAct('export','x','x');
 let J=null;try{J=JSON.parse(e.blobs[0]);}catch(x){}
 t(n+' : export JSON valide (application, date, projets)',!!J&&J.application==='Thermosys v3'&&J.count===2&&J.projects.length===2&&typeof J.exported_at==='string');
 t(n+' : export : fichier nomme thermosys_mes_projets_AAAA-MM-JJ.json',e.log.some(x=>/^click:thermosys_mes_projets_\d{4}-\d{2}-\d{2}\.json$/.test(x)));
 t(n+' : export filtre sur user_id',e.calls[e.calls.length-1].f.user_id==='user-aaaa-1111');
 e=env({rows:[]});await tick();await e.W.mpAct('export','x','x');
 t(n+' : export vide : message, aucun fichier',e.blobs.length===0&&e.toasts.some(x=>x.indexOf('Rien à exporter')===0));
 e=env({error:true,rows:R});await tick();
 t(n+' : erreur de lecture : message, pas de plantage',e.panel.innerHTML.indexOf('Erreur de chargement.')>0);
 e=env({rows:[]});await tick();h=e.panel.innerHTML;
 t(n+' : listes vides : messages',h.indexOf('Aucun devis enregistré.')>0&&h.indexOf('Aucun réseau enregistré.')>0&&h.indexOf('Aucun favori enregistré.')>0);
 e=env({rows:R,lang:'en'});await tick();h=e.panel.innerHTML;
 t(n+' : version anglaise',h.indexOf('MY PROJECTS (ACCOUNT)')>0&&h.indexOf('>Quotes<')>0&&h.indexOf('>Networks<')>0&&h.indexOf('>Open<')>0&&h.indexOf('>Delete<')>0);
 const m=/var EN=\{([\s\S]*?)\};\nvar S=/.exec(code);const EN=new Function('return {'+m[1]+'}')();
 const miss=Object.keys(EN).filter(k=>!(EN[k] in E));
 t(n+' : chaque texte EN du module a sa traduction ES ('+miss.join(',')+')',miss.length===0);
}
console.log('projets_compte : '+ok+' OK, '+ko+' echec(s)');process.exit(ko?1:0);
})();
