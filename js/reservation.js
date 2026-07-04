  const btn=document.getElementById('menuBtn'),menu=document.getElementById('menu');
  btn.addEventListener('click',()=>menu.classList.toggle('open'));

  const $=id=>document.getElementById(id);
  const DOW=['dim','lun','mar','mer','jeu','ven','sam'];
  const MON=['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];

  /* ===== STOCKAGE DES RENDEZ-VOUS =====
     ⚠ localStorage = propre à CE navigateur, non partagé entre clients.
     Pour un vrai partage entre visiteurs, remplacez loadStore()/saveStore()
     par des appels à un backend (Firebase, Google Apps Script, API .fr, etc.).
     Format : { "2026-07-05": ["18:00","19:30"], ... }  */
  const STORE_KEY='azurtech_rdv';
  let mem={};
  function loadStore(){try{const s=localStorage.getItem(STORE_KEY);return s?JSON.parse(s):{}}catch(e){return mem}}
  function saveStore(o){mem=o;try{localStorage.setItem(STORE_KEY,JSON.stringify(o))}catch(e){}}
  let store=loadStore();
  const iso=dt=>`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  const toMin=v=>{const[a,b]=v.split(':').map(Number);return a*60+b};
  const bookedFor=k=>store[k]||[];

  /* Plage d'ouverture selon le jour (min/max) */
  function hoursForDay(dow){
    if(dow>=1&&dow<=3) return {min:'18:00',max:'20:30',txt:'18h00 – 20h30'};   // Lun-Mer
    if(dow===4||dow===5) return {min:'17:30',max:'20:30',txt:'17h30 – 20h30'}; // Jeu-Ven
    return {min:'08:00',max:'20:00',txt:'08h00 – 20h00'};                       // Sam-Dim
  }
  function dayCapacity(dow){const h=hoursForDay(dow);return Math.floor((toMin(h.max)-toMin(h.min))/60)+1;}
  /* Reste-t-il un créneau libre (règle ±1h) ? */
  function canFit(k,dow){
    const h=hoursForDay(dow),a=toMin(h.min),b=toMin(h.max),bk=bookedFor(k).map(toMin);
    for(let t=a;t<=b;t+=15){if(bk.every(x=>Math.abs(x-t)>=60))return true;}
    return false;
  }
  /* Niveau de disponibilité : green / orange / red */
  function avLevel(k,dow){
    const cnt=bookedFor(k).length;
    if(cnt===0) return 'green';
    if(cnt>=dayCapacity(dow)||!canFit(k,dow)) return 'red';
    return 'orange';
  }
  /* Conflit ±1h avec un RDV existant */
  function timeConflict(k,val){const t=toMin(val);return bookedFor(k).some(x=>Math.abs(toMin(x)-t)<60);}

  const SHORT={
    'Configuration de PC & Migration Windows 11':'Configuration & Windows 11',
    'Réinitialisation & Nettoyage PC':'Réinitialisation PC',
    'Remplacement RAM / Disque dur / Batterie':'RAM / Disque dur / Batterie',
    'Installation & Configuration Imprimante':'Imprimante',
    'Diagnostic Informatique':'Diagnostic',
    'Configuration équipement réseaux':'Équipement réseaux'
  };

  /* Prestation -> matériel cohérent + distanciel autorisé ? */
  const CFG={
    's1':{remote:true, mats:['PC fixe','PC portable']},
    's2':{remote:true, mats:['PC fixe','PC portable']},
    's3':{remote:false,mats:['PC fixe','PC portable']},
    's4':{remote:true, mats:['HP','Canon','Epson','Brother','Xerox','Lexmark','Samsung','Ricoh','Kyocera','Pantum','OKI','Dell','Sharp','Konica Minolta','Toshiba','Autre marque']},
    's5':{remote:true, mats:['PC fixe','PC portable','Imprimante','Équipement réseau','Autre']},
    's6':{remote:true, mats:['Switch / Routeur','Serveur / Hyper-V','Box / Réseau domestique','Autre équipement']}
  };

  const form=$('rdvForm'), materiel=$('materiel'), m1=$('m1'), m2=$('m2'),
        modeNote=$('modeNote'), villeField=$('villeField'), adrField=$('adrField'), heure=$('heure');
  const slotNote=$('slotNote');
  const state={svc:'Configuration de PC & Migration Windows 11',svcShort:'Configuration & Windows 11',mode:'À distance',date:null,time:null,dateLabel:null,curHours:null};

  function currentSvc(){const r=form.querySelector('input[name=svc]:checked');return r?r.id:'s1';}
  function svcValue(){const r=form.querySelector('input[name=svc]:checked');return r?r.value:'';}

  /* Matériel dynamique par prestation */
  function fillMats(){
    const svc=currentSvc(), c=CFG[svc], isPrinter=(svc==='s4');
    materiel.innerHTML='';
    const ph=document.createElement('option');
    ph.value='';ph.textContent=isPrinter?'Choisissez la marque…':'Sélectionnez…';ph.disabled=true;ph.selected=true;
    materiel.appendChild(ph);
    c.mats.forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;materiel.appendChild(o);});
    materiel.classList.remove('err');$('materielErr').classList.remove('show');
    $('materielLbl').textContent=isPrinter?"Marque de l'imprimante":'Matériel concerné';
    $('materielErr').textContent=isPrinter?"Sélectionnez la marque de l'imprimante.":'Sélectionnez le matériel concerné.';
    const mf=$('modeleField');
    mf.style.display=isPrinter?'block':'none';
    if(!isPrinter){$('modele').value='';$('modele').classList.remove('err');$('modeleErr').classList.remove('show');}
  }

  /* Bloque "à distance" pour remplacement composant */
  function applyMode(){
    const c=CFG[currentSvc()];
    if(!c.remote){m1.disabled=true;m1.checked=false;m2.checked=true;modeNote.classList.add('show');}
    else{m1.disabled=false;modeNote.classList.remove('show');}
    state.mode=m2.checked?'À domicile':'À distance';
    syncVille();
  }

  /* Ville + adresse visibles/obligatoires seulement à domicile */
  function syncVille(){
    const dom=m2.checked;
    villeField.style.display=dom?'block':'none';
    adrField.style.display=dom?'block':'none';
    if(!dom){$('ville').value='';$('ville').classList.remove('err');$('villeErr').classList.remove('show');$('adr').value='';}
    state.mode=dom?'À domicile':'À distance';
    sync();
  }

  form.querySelectorAll('input[name=svc]').forEach(r=>r.addEventListener('change',()=>{
    state.svc=svcValue();state.svcShort=SHORT[state.svc]||state.svc;
    fillMats();applyMode();sync();
  }));
  m1.addEventListener('change',syncVille);
  m2.addEventListener('change',syncVille);
  materiel.addEventListener('change',()=>{materiel.classList.remove('err');$('materielErr').classList.remove('show');sync();});

  /* Dates : 10 prochains jours */
  const datesEl=$('dates');
  const pills=[];
  let d=new Date(),added=0;d.setDate(d.getDate()+1);
  while(added<10){
    const cur=new Date(d),dow=cur.getDay(),k=iso(cur);
    const pill=document.createElement('div');
    pill.className='date-pill';pill.tabIndex=0;pill.setAttribute('role','button');
    pill.innerHTML=`<div class="dow">${DOW[dow]}</div><div class="num">${cur.getDate()}</div><div class="mon">${MON[cur.getMonth()]}</div><span class="av-cnt"></span><span class="av-dot"></span>`;
    const label=`${DOW[dow]}. ${cur.getDate()} ${MON[cur.getMonth()]}`;
    const ref={el:pill,dow,k,label};
    pills.push(ref);
    const pick=()=>{
      if(avLevel(k,dow)==='red') return; // jour complet
      pills.forEach(p=>p.el.classList.remove('sel'));pill.classList.add('sel');
      state.date=cur;state.dateLabel=label;state.time=null;state.iso=k;
      const h=hoursForDay(dow);state.curHours=h;
      heure.disabled=false;heure.value='';heure.min=h.min;heure.max=h.max;heure.classList.remove('err');
      $('conflictNote').classList.remove('show');
      const bk=bookedFor(k);
      slotNote.textContent=`Horaires d'ouverture ce jour : ${h.txt}. Indiquez l'heure souhaitée.`
        +(bk.length?` Déjà réservé : ${bk.slice().sort().join(', ')} (±1h bloqué autour).`:'');
      sync();
    };
    pill.addEventListener('click',pick);
    pill.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
    datesEl.appendChild(pill);added++;
    d.setDate(d.getDate()+1);
  }
  /* Applique les couleurs de disponibilité */
  function recolorPills(){
    pills.forEach(p=>{
      p.el.classList.remove('av-green','av-orange','av-red');
      const lv=avLevel(p.k,p.dow);
      p.el.classList.add('av-'+lv);
      const cnt=bookedFor(p.k).length;
      p.el.querySelector('.av-cnt').textContent=lv==='red'?'complet':(cnt?cnt+' pris':'libre');
    });
  }
  recolorPills();

  function withinHours(v){
    if(!state.curHours||!v) return false;
    return v>=state.curHours.min && v<=state.curHours.max;
  }
  heure.addEventListener('change',()=>{
    const cn=$('conflictNote');
    if(!withinHours(heure.value)){state.time=null;if(heure.value)heure.classList.add('err');cn.classList.remove('show');sync();return;}
    if(state.iso&&timeConflict(state.iso,heure.value)){
      state.time=null;heure.classList.add('err');
      cn.textContent='Un rendez-vous est déjà pris sur cet horaire (créneau bloqué 1h avant et 1h après). Choisissez un autre horaire.';
      cn.classList.add('show');sync();return;
    }
    state.time=heure.value;heure.classList.remove('err');cn.classList.remove('show');sync();
  });

  function setV(id,val){const el=$(id);if(val){el.textContent=val;el.classList.remove('empty');}else{el.textContent='À choisir';el.classList.add('empty');}}
  function sync(){
    $('sumSvc').textContent=state.svcShort;
    $('sumMode').textContent=state.mode;
    setV('sumMat',materiel.value);
    setV('sumDate',state.dateLabel);
    setV('sumTime',state.time);
  }

  function setErr(id,errId,cond){const el=$(id),msg=$(errId);if(cond){el.classList.add('err');msg.classList.add('show');return false}el.classList.remove('err');msg.classList.remove('show');return true}
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  form.addEventListener('submit',e=>{
    e.preventDefault();
    // anti-bot honeypot
    const hp=$('hp');if(hp&&hp.value.trim()!==''){return;}
    let ok=true;
    // matériel
    ok=setErr('materiel','materielErr',materiel.value==='')&&ok;
    // modèle imprimante
    if(currentSvc()==='s4') ok=setErr('modele','modeleErr',$('modele').value.trim()==='')&&ok;
    // date + horaire
    if(!state.date){alert('Merci de choisir une date.');$('dates').scrollIntoView({behavior:'smooth',block:'center'});return}
    if(!withinHours(heure.value)){heure.classList.add('err');slotNote.textContent=`Indiquez une heure comprise dans les horaires d'ouverture (${state.curHours?state.curHours.txt:''}).`;heure.scrollIntoView({behavior:'smooth',block:'center'});return}
    // Re-vérifie le conflit ±1h au moment de confirmer (un RDV a pu être pris entre-temps)
    if(state.iso&&timeConflict(state.iso,heure.value)){
      const cn=$('conflictNote');heure.classList.add('err');
      cn.textContent='Un rendez-vous est déjà pris sur cet horaire (créneau bloqué 1h avant et 1h après). Choisissez un autre horaire.';
      cn.classList.add('show');cn.scrollIntoView({behavior:'smooth',block:'center'});return;
    }
    state.time=heure.value;
    // coordonnées
    ok=setErr('nom','nomErr',$('nom').value.trim()==='')&&ok;
    ok=setErr('tel','telErr',$('tel').value.trim().length<8)&&ok;
    const em=$('email').value.trim();
    ok=setErr('email','emailErr',!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))&&ok;
    // ville si domicile
    if(m2.checked) ok=setErr('ville','villeErr',$('ville').value.trim()==='')&&ok;
    if(!ok){const f=form.querySelector('.err');if(f)f.scrollIntoView({behavior:'smooth',block:'center'});return}
    const ref='AZ-'+Math.floor(100000+Math.random()*900000);
    const matFull=currentSvc()==='s4'?`${esc(materiel.value)} — ${esc($('modele').value.trim())}`:esc(materiel.value);
    let rows=
      `<div class="l"><span class="k">Référence</span><span class="v mono">${esc(ref)}</span></div>`+
      `<div class="l"><span class="k">Prestation</span><span class="v">${esc(state.svcShort)}</span></div>`+
      `<div class="l"><span class="k">Matériel</span><span class="v">${matFull}</span></div>`+
      `<div class="l"><span class="k">Mode</span><span class="v">${esc(state.mode)}</span></div>`;
    if(m2.checked) rows+=`<div class="l"><span class="k">Ville</span><span class="v">${esc($('ville').value.trim())}</span></div>`;
    rows+=
      `<div class="l"><span class="k">Date</span><span class="v">${state.dateLabel}</span></div>`+
      `<div class="l"><span class="k">Horaire</span><span class="v">${state.time}</span></div>`;
    $('recap').innerHTML=rows;
    // Enregistre le créneau -> bloque ±1h pour les prochains clients + recolore
    store[state.iso]=bookedFor(state.iso).concat(state.time);
    saveStore(store);recolorPills();
    form.style.display='none';const s=$('success');s.classList.add('show');s.scrollIntoView({behavior:'smooth',block:'center'});
  });

  fillMats();applyMode();sync();
