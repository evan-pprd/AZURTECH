  const btn=document.getElementById('menuBtn'),menu=document.getElementById('menu');
  btn.addEventListener('click',()=>menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));

  // ===== Avis clients =====
  const STAR_PATH="M11.48 3.5a.56.56 0 0 1 1.04 0l2.12 5.11a.56.56 0 0 0 .48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 0 0-.19.56l1.29 5.38a.56.56 0 0 1-.84.61l-4.73-2.88a.56.56 0 0 0-.58 0l-4.73 2.88a.56.56 0 0 1-.84-.61l1.29-5.38a.56.56 0 0 0-.19-.56l-4.2-3.6a.56.56 0 0 1 .32-.99l5.52-.44a.56.56 0 0 0 .48-.35Z";
  const SAMPLE_REVIEWS=[
    {name:'Marie L.',city:'Nice',rating:5,text:"Très patient, il a configuré mon nouvel ordinateur et m'a tout expliqué simplement. Je recommande vivement.",verified:true},
    {name:'Jean-Pierre R.',city:'Antibes',rating:5,text:"Intervention rapide à domicile pour remplacer mon disque. Prix annoncé à l'avance, aucune surprise.",verified:true},
    {name:'Sophie M.',city:"Cap-d'Ail",rating:5,text:"Dépannage à distance en soirée, très pratique. Efficace, à l'écoute et de bon conseil.",verified:true},
    {name:'Nadia B.',city:'Beausoleil',rating:5,text:"Mon PC était très lent : nettoyé et réinitialisé, il est comme neuf. Un grand merci !",verified:true},
    {name:'Alain T.',city:'Cagnes-sur-Mer',rating:5,text:"Passage à Windows 11 sans perdre mes photos. Travail soigné et rassurant.",verified:true},
    {name:'Christiane P.',city:'Le Cannet',rating:5,text:"Installation de mon imprimante et de la box. Aimable et compétent, je le rappellerai.",verified:true},
    {name:'Robert D.',city:'Cannes',rating:4,text:"Bon travail sur mon imprimante qui ne fonctionnait plus. Ponctuel et professionnel.",verified:true},
    {name:'Michel V.',city:'Villeneuve-Loubet',rating:4,text:"Diagnostic clair sur mon ordinateur portable. Bon rapport qualité-prix.",verified:true}
  ];
  let reviews=SAMPLE_REVIEWS.slice();
  let expanded=false;
  const SHOWN_LIMIT=4;
  const AV_COLORS=['#0B6FB8','#0FA69C','#FF6B4A','#F7A81B','#08517F','#0B857D'];
  function starSVG(f){return f
    ?'<svg class="star-full" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width=".5"><path d="'+STAR_PATH+'"/></svg>'
    :'<svg class="star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="'+STAR_PATH+'"/></svg>';}
  function starsRow(n){let s='';for(let i=1;i<=5;i++)s+=starSVG(i<=n);return s;}
  function initials(name){const p=name.trim().split(/\s+/);return ((p[0]&&p[0][0]||'')+(p[1]&&p[1][0]||'')).toUpperCase()||'?';}
  function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
  function renderReviews(){
    const grid=document.getElementById('reviewGrid');
    const sorted=reviews.slice().sort((a,b)=>b.rating-a.rating);
    const shown=expanded?sorted:sorted.slice(0,SHOWN_LIMIT);
    grid.innerHTML=shown.map((r,i)=>{
      const col=AV_COLORS[i%AV_COLORS.length];
      return '<div class="review-card">'+
        '<div class="rc-top">'+
          '<span class="rc-avatar" style="background:'+col+'">'+esc(initials(r.name))+'</span>'+
          '<span class="rc-id"><span class="nm">'+esc(r.name)+'</span><span class="mt">'+(r.city?esc(r.city)+' · ':'')+(r.verified?'Client vérifié':'Nouvel avis')+'</span></span>'+
        '</div>'+
        '<div class="rc-stars stars">'+starsRow(r.rating)+'</div>'+
        '<p>'+esc(r.text)+'</p>'+
        (r.verified?'<span class="rc-badge">✓ Intervention réalisée</span>':'')+
      '</div>';
    }).join('');
    const avg=reviews.reduce((a,r)=>a+r.rating,0)/reviews.length;
    document.getElementById('avgScore').textContent=avg.toFixed(1).replace('.',',');
    document.getElementById('avgStars').innerHTML=starsRow(Math.round(avg));
    document.getElementById('rsCount').textContent='sur '+reviews.length+' avis';
    const moreBtn=document.getElementById('moreBtn');
    const chev=' <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    if(reviews.length<=SHOWN_LIMIT){moreBtn.classList.add('hide')}
    else{
      moreBtn.classList.remove('hide');
      moreBtn.classList.toggle('open',expanded);
      moreBtn.innerHTML=(expanded?'Voir moins':"Voir plus d'avis ("+(reviews.length-SHOWN_LIMIT)+')')+chev;
    }
  }
  let currentRating=0;
  const starInput=document.getElementById('starInput');
  function paintStars(n){[].forEach.call(starInput.children,(b,idx)=>b.classList.toggle('on',idx<n));}
  for(let i=1;i<=5;i++){
    const b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-label',i+(i>1?' étoiles':' étoile'));
    b.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="'+STAR_PATH+'"/></svg>';
    b.addEventListener('click',()=>{currentRating=i;paintStars(i)});
    b.addEventListener('mouseenter',()=>paintStars(i));
    starInput.appendChild(b);
  }
  starInput.addEventListener('mouseleave',()=>paintStars(currentRating));
  document.getElementById('rvSubmit').addEventListener('click',()=>{
    const name=document.getElementById('rvName').value.trim();
    const city=document.getElementById('rvCity').value.trim();
    const text=document.getElementById('rvText').value.trim();
    const err=document.getElementById('rvErr');
    if(!currentRating||name===''||text.length<4){err.classList.add('show');return}
    err.classList.remove('show');
    reviews.unshift({name:name,city:city,rating:currentRating,text:text,verified:false});
    expanded=true;
    renderReviews();
    document.getElementById('rfForm').style.display='none';
    const s=document.getElementById('rfSuccess');s.classList.add('show');
    setTimeout(()=>{
      s.classList.remove('show');document.getElementById('rfForm').style.display='';
      document.getElementById('rvName').value='';document.getElementById('rvCity').value='';document.getElementById('rvText').value='';
      currentRating=0;paintStars(0);
    },3500);
  });
  document.getElementById('moreBtn').addEventListener('click',()=>{expanded=!expanded;renderReviews();if(!expanded)document.getElementById('avis').scrollIntoView({behavior:'smooth',block:'start'})});
  renderReviews();

  // scroll reveal
  const rv=document.querySelectorAll('.reveal');
  if('IntersectionObserver'in window){
    const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    rv.forEach(el=>io.observe(el));
  }else{rv.forEach(el=>el.classList.add('in'))}
