  /* ===== CONFIG ===== */
  const DEST_EMAIL='contact@azurtech-informatique.fr';
  /* EmailJS : renseignez ces 3 clés (compte gratuit emailjs.com) pour l'envoi
     automatique du PDF. Sinon : PDF généré + affiché + envoi manuel pré-rempli. */
  const EMAILJS={publicKey:'REMPLACER_PUBLIC_KEY',serviceId:'REMPLACER_SERVICE_ID',templateId:'REMPLACER_TEMPLATE_ID'};
  const emailjsReady=!EMAILJS.publicKey.startsWith('REMPLACER');

  /* Prestation -> matériel cohérent + distanciel autorisé ? */
  const CFG={
    's1':{remote:true, mats:['PC fixe','PC portable']},
    's2':{remote:true, mats:['PC fixe','PC portable']},
    's3':{remote:false,mats:['PC fixe','PC portable']},
    's4':{remote:true, mats:['HP','Canon','Epson','Brother','Xerox','Lexmark','Samsung','Ricoh','Kyocera','Pantum','OKI','Dell','Sharp','Konica Minolta','Toshiba','Autre marque']},
    's5':{remote:true, mats:['PC fixe','PC portable','Imprimante','Équipement réseau','Autre']},
    's6':{remote:true, mats:['Switch / Routeur','Serveur / Hyper-V','Box / Réseau domestique','Autre équipement']}
  };

  const $=id=>document.getElementById(id);
  const menuBtn=$('menuBtn'),menu=$('menu');
  menuBtn.addEventListener('click',()=>menu.classList.toggle('open'));

  const form=$('devisForm'), materiel=$('materiel'),
        m1=$('m1'), m2=$('m2'), modeNote=$('modeNote'),
        villeField=$('villeField');
  const REF='AZ-'+Math.floor(100000+Math.random()*900000);

  function currentSvc(){const r=form.querySelector('input[name=service]:checked');return r?r.id:'s1';}
  function svcLabel(){const r=form.querySelector('input[name=service]:checked');return r?r.value:'';}

  /* Rebuild materiel options for selected service */
  function fillMats(){
    const svc=currentSvc(), c=CFG[svc], isPrinter=(svc==='s4');
    materiel.innerHTML='';
    const ph=document.createElement('option');
    ph.value='';ph.textContent=isPrinter?'Choisissez la marque…':'Sélectionnez…';ph.disabled=true;ph.selected=true;
    materiel.appendChild(ph);
    c.mats.forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;materiel.appendChild(o);});
    materiel.classList.remove('err');$('materielErr').classList.remove('show');
    // label + champ modèle (imprimante uniquement)
    $('materielLbl').textContent=isPrinter?"Marque de l'imprimante":'Matériel concerné';
    $('materielErr').textContent=isPrinter?"Sélectionnez la marque de l'imprimante.":'Sélectionnez le matériel concerné.';
    const mf=$('modeleField');
    mf.style.display=isPrinter?'block':'none';
    if(!isPrinter){$('modele').value='';$('modele').classList.remove('err');$('modeleErr').classList.remove('show');}
  }

  /* Enable/disable "à distance" for component replacement */
  function applyMode(){
    const c=CFG[currentSvc()];
    if(!c.remote){
      m1.disabled=true; m1.checked=false; m2.checked=true; modeNote.classList.add('show');
    }else{
      m1.disabled=false; modeNote.classList.remove('show');
    }
    syncVille();
  }

  /* Ville visible + obligatoire seulement à domicile */
  function syncVille(){
    const dom=m2.checked;
    villeField.style.display=dom?'block':'none';
    if(!dom){$('ville').value='';$('ville').classList.remove('err');$('villeErr').classList.remove('show');}
  }

  form.querySelectorAll('input[name=service]').forEach(r=>r.addEventListener('change',()=>{fillMats();applyMode();}));
  m1.addEventListener('change',syncVille);
  m2.addEventListener('change',syncVille);
  fillMats(); applyMode();

  /* ===== Validation ===== */
  function setErr(id,errId,cond){const el=$(id),msg=$(errId);if(cond){el.classList.add('err');if(msg)msg.classList.add('show');return false}el.classList.remove('err');if(msg)msg.classList.remove('show');return true}

  /* ===== PDF ===== */
  function buildPDF(d){
    const {jsPDF}=window.jspdf, doc=new jsPDF({unit:'mm',format:'a4'}), W=210, M=18; let y;
    doc.setFillColor(15,38,55);doc.rect(0,0,W,32,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(20);doc.text('AZURTECH',M,18);
    doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(180,205,230);
    doc.text("Technicien informatique · Côte d'Azur",M,25);
    doc.setFontSize(11);doc.setTextColor(120,180,225);doc.text('DEVIS',W-M,14,{align:'right'});
    doc.setFontSize(9);doc.setTextColor(200,218,235);
    doc.text(d.ref,W-M,20,{align:'right'});doc.text(d.date,W-M,25,{align:'right'});
    y=46;doc.setTextColor(15,38,55);doc.setFont('helvetica','bold');doc.setFontSize(13);
    doc.text('Demande de devis — gratuite et sans engagement',M,y);
    y+=4;doc.setDrawColor(200,205,205);doc.line(M,y,W-M,y);y+=10;
    const line=(k,v)=>{doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(90,105,120);doc.text(k.toUpperCase(),M,y);
      doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(15,38,55);
      const ls=doc.splitTextToSize(v||'—',W-2*M);doc.text(ls,M,y+6);y+=6+ls.length*5.6+5;};
    line('Prestation',d.svc);
    line('Matériel concerné',d.matFull||d.mat);
    line("Type d'intervention",d.mode);
    if(d.ville)line("Ville d'intervention",d.ville);
    line("Niveau d'urgence",d.urg);
    line('Description du besoin',d.desc);
    y+=1;doc.setDrawColor(200,205,205);doc.line(M,y,W-M,y);y+=9;
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(90,105,120);doc.text('CLIENT',M,y);y+=6;
    doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(15,38,55);
    doc.text(`${d.nom}   ·   ${d.tel}   ·   ${d.email}`,M,y);y+=14;
    doc.setFillColor(230,244,236);doc.setDrawColor(45,160,110);doc.roundedRect(M,y,W-2*M,20,3,3,'FD');
    doc.setTextColor(20,110,72);doc.setFont('helvetica','bold');doc.setFontSize(11);
    doc.text('Ce devis est 100 % gratuit et sans engagement.',M+6,y+8);
    doc.setFont('helvetica','normal');doc.setFontSize(9);
    doc.text("Aucune obligation d'achat. Estimation communiquée après étude de la demande.",M+6,y+15);
    doc.setDrawColor(200,205,205);doc.line(M,285,W-M,285);
    doc.setFontSize(8.5);doc.setTextColor(120,132,145);
    doc.text('AZURTECH  ·  07 68 69 55 40  ·  contact@azurtech-informatique.fr',M,290);
    doc.text('Interventions à distance (LogMeIn) & à domicile autour de Nice.',M,294);
    return doc;
  }

  function mailtoFallback(d,fname,prefix){
    const s=encodeURIComponent(`Demande de devis ${d.ref} — ${d.svc}`);
    const b=encodeURIComponent(`Référence : ${d.ref}\nDate : ${d.date}\n\nPrestation : ${d.svc}\nMatériel : ${d.matFull||d.mat}\nIntervention : ${d.mode}${d.ville?'\nVille : '+d.ville:''}\nUrgence : ${d.urg}\n\nProblème :\n${d.desc}\n\nClient : ${d.nom}\nTéléphone : ${d.tel}\nE-mail : ${d.email}\n\n(Pensez à joindre le PDF « ${fname} ».)`);
    return `${prefix} Téléchargez le devis ci-dessous, puis <a href="mailto:${DEST_EMAIL}?subject=${s}&body=${b}"><b>envoyez-le en un clic</b></a>.`;
  }

  /* ===== Submit ===== */
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    // anti-bot honeypot : si rempli, on stoppe silencieusement
    const hp=$('hp');if(hp&&hp.value.trim()!==''){return;}
    let ok=true;
    // materiel
    ok=setErr('materiel','materielErr',materiel.value==='')&&ok;
    // modèle imprimante si prestation Imprimante
    if(currentSvc()==='s4'){ok=setErr('modele','modeleErr',$('modele').value.trim()==='')&&ok;}
    // desc / coordonnées
    ok=setErr('desc','descErr',$('desc').value.trim().length<10)&&ok;
    ok=setErr('nom','nomErr',$('nom').value.trim()==='')&&ok;
    ok=setErr('tel','telErr',$('tel').value.replace(/[^\d+]/g,'').length<10)&&ok;
    const em=$('email').value.trim();
    ok=setErr('email','emailErr',!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))&&ok;
    // ville si domicile
    if(m2.checked){ok=setErr('ville','villeErr',$('ville').value.trim()==='')&&ok;}
    // rgpd
    const rgpd=$('rgpd');
    if(!rgpd.checked){$('rgpdErr').classList.add('show');ok=false;}else{$('rgpdErr').classList.remove('show');}
    if(!ok){const f=form.querySelector('.err,.errmsg.show');if(f)f.scrollIntoView({behavior:'smooth',block:'center'});return;}

    const btn=$('submitBtn');btn.style.pointerEvents='none';btn.style.opacity='.65';

    // assainissement : retire < > (anti-injection HTML dans l'email), coupe la longueur
    const clean=(s,max=500)=>String(s).replace(/[<>]/g,'').trim().slice(0,max);
    const d={ref:REF,date:new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'}),
      svc:svcLabel(),mat:clean(materiel.value,120),mode:m2.checked?'À domicile':'À distance',
      ville:m2.checked?clean($('ville').value,120):'',urg:clean($('urgence').value,60),
      desc:clean($('desc').value,2000),nom:clean($('nom').value,120),tel:clean($('tel').value,30),email:clean(em,150)};
    d.modele=(currentSvc()==='s4')?clean($('modele').value,120):'';
    d.matFull=d.modele?`${d.mat} — ${d.modele}`:d.mat;

    // 1) PDF + affichage
    const doc=buildPDF(d),blob=doc.output('blob'),url=URL.createObjectURL(blob),fname=`Devis_AZURTECH_${d.ref}.pdf`;
    $('pdfFrame').src=url;$('btnOpen').href=url;$('btnDl').href=url;$('btnDl').setAttribute('download',fname);
    $('refNo').textContent='Réf. '+d.ref;$('doneRef').textContent=d.ref;
    form.style.display='none';const s=$('success');s.classList.add('show');s.scrollIntoView({behavior:'smooth',block:'start'});

    // 2) e-mail
    const st=$('mailStatus');
    if(emailjsReady){
      try{
        emailjs.init({publicKey:EMAILJS.publicKey});
        const b64=doc.output('datauristring').split(',')[1];
        await emailjs.send(EMAILJS.serviceId,EMAILJS.templateId,{to_email:DEST_EMAIL,reference:d.ref,date:d.date,
          prestation:d.svc,materiel:d.matFull||d.mat,intervention:d.mode,ville:d.ville||'—',urgence:d.urg,description:d.desc,
          client_nom:d.nom,client_tel:d.tel,client_email:d.email,content:b64,filename:fname});
        st.className='mail-status ok';st.innerHTML=`Devis envoyé automatiquement à <b>${DEST_EMAIL}</b>.`;
      }catch(err){st.className='mail-status warn';st.innerHTML=mailtoFallback(d,fname,"L'envoi automatique a échoué.");}
    }else{
      st.className='mail-status warn';st.innerHTML=mailtoFallback(d,fname,'Envoi automatique non configuré.');
    }
  });
