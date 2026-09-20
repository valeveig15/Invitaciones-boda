(() => {
  'use strict';
  const invite = document.querySelector('.invite');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const musicFab = document.getElementById('musicFab');
  const audio = document.querySelector('audio[data-invite-track]');
  const welcomeMusic = document.getElementById('welcomeMusic');
  const enterWithMusic = document.getElementById('enterWithMusic');
  let lightboxItems = [], lightboxIndex = 0, musicOn = false;

  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];

  qsa('[data-next-section]').forEach(btn => btn.addEventListener('click', () => {
    const section = btn.closest('.section');
    const next = section?.nextElementSibling;
    if (next && invite) invite.scrollTo({top: next.offsetTop, behavior: 'smooth'});
  }));

  function countdownData(target){
    const diff = Math.max(0, target - Date.now());
    return [['Días',Math.floor(diff/86400000)],['Horas',Math.floor(diff%86400000/3600000)],['Minutos',Math.floor(diff%3600000/60000)],['Segundos',Math.floor(diff%60000/1000)]];
  }
  function updateCountdowns(){
    if(!invite) return;
    const target = new Date(invite.dataset.date).getTime();
    if(!Number.isFinite(target)) return;
    const values = countdownData(target);
    qsa('[data-countdown="digital"]', invite).forEach(el => el.innerHTML = values.map(([l,v]) => `<div class="unit"><b>${String(v).padStart(2,'0')}</b><span>${l==='Minutos'?'min':l==='Segundos'?'seg':l==='Horas'?'hrs':'días'}</span></div>`).join(''));
    qsa('[data-countdown="rings"]', invite).forEach(el => el.innerHTML = values.map(([l,v]) => `<div class="ring"><b>${v}</b><span>${l}</span></div>`).join(''));
  }
  updateCountdowns(); setInterval(updateCountdowns,1000);

  // Revelado progresivo al recorrer la invitación. La raíz es el propio
  // contenedor desplazable para que la animación ocurra exactamente al llegar
  // a cada bloque, y no antes.
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const revealItems = qsa('.reveal-on-scroll, [data-animate-icon]', invite || document);
  // Las fotos no se revelan hasta que el archivo terminó de cargar. Esto evita
  // que una imagen aparezca de golpe si su descarga finaliza después de que el
  // observador de scroll ya la había marcado como visible.
  qsa('.photo-grid img.reveal-on-scroll', invite || document).forEach(img => {
    const markLoaded = () => requestAnimationFrame(() => img.classList.add('is-loaded'));
    if (img.complete && img.naturalWidth > 0) markLoaded();
    else img.addEventListener('load', markLoaded, {once:true});
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      root: invite || null,
      threshold: .16,
      rootMargin: '0px 0px -7% 0px'
    });
    revealItems.forEach(el => revealObserver.observe(el));
  }

  function openModal(markup){ if(!modal || !modalBody) return; modalBody.innerHTML=markup; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
  function closeModal(){ if(!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  qsa('[data-close]').forEach(b=>b.addEventListener('click',closeModal));

  qsa('[data-rsvp]').forEach(b=>b.addEventListener('click',()=>{
    openModal(`<h2>Confirmación de asistencia</h2><p>${b.dataset.rsvp || ''}</p><form id="rsvpForm"><input required autocomplete="name" placeholder="Nombre y apellido"><select><option>Confirmo asistencia</option><option>No podré asistir</option></select><textarea placeholder="Mensaje / requerimiento alimentario"></textarea><button class="pill pill-sage" type="submit">ENVIAR</button></form>`);
    qs('#rsvpForm')?.addEventListener('submit',e=>{e.preventDefault();openModal('<h2>¡Gracias!</h2><p>Tu respuesta quedó registrada en esta demostración. Para producción, conectá este formulario con tu backend o servicio de formularios.</p>')});
  }));
  qsa('[data-gift]').forEach(b=>b.addEventListener('click',()=>openModal('<h2>Datos bancarios</h2><p><strong>Aquí irían tus datos bancarios.</strong><br>Banco, número de cuenta y/o alias se completan al personalizar la invitación.<br><small>Esta es una muestra: no se exhiben datos bancarios reales.</small></p>')));
  qsa('[data-song]').forEach(b=>b.addEventListener('click',()=>{
    openModal(`<h2>¿Qué canción no puede faltar?</h2>
      <p>Dejanos tu sugerencia para la playlist de la fiesta.</p>
      <form id="songForm">
        <input autocomplete="name" placeholder="Tu nombre (opcional)">
        <input required placeholder="Canción">
        <input placeholder="Artista">
        <button class="pill pill-beige" type="submit">ENVIAR SUGERENCIA</button>
      </form>`);
    qs('#songForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      openModal('<h2>¡Anotada! ♫</h2><p>Gracias por sumar tu canción a la fiesta.</p>');
    });
  }));
  qsa('[data-map]').forEach(b=>b.addEventListener('click',()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.dataset.map || '')}`,'_blank','noopener')));
  qsa('[data-info]').forEach(b=>b.addEventListener('click',()=>openModal(`<h2>${b.dataset.infoTitle || 'Información'}</h2><p>${b.dataset.infoContent || 'Información disponible para los invitados.'}</p>`)));
  qsa('[data-album]').forEach(b=>b.addEventListener('click',()=>openModal('<h2>Álbum compartido</h2><p>Conectá este botón con el álbum colaborativo real de la pareja.</p>')));

  function eventRange(){ const start=new Date(invite?.dataset.date); const hours=Number(invite?.dataset.duration || 6); return {start,end:new Date(start.getTime()+hours*3600000)}; }
  function compactUTC(d){ return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'); }
  function escapeICS(v=''){ return String(v).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
  function downloadICS(){
    const {start,end}=eventRange(); if(!Number.isFinite(start.getTime())) return;
    const couple=invite?.dataset.couple || 'Boda'; const location=invite?.dataset.location || qs('[data-map]',invite)?.dataset.map || '';
    const uid=`${start.getTime()}-${couple.replace(/\W+/g,'').toLowerCase()}@invitacion.local`;
    const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Invitacion Digital//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${compactUTC(new Date())}`,`DTSTART:${compactUTC(start)}`,`DTEND:${compactUTC(end)}`,`SUMMARY:${escapeICS('Boda '+couple)}`,`DESCRIPTION:${escapeICS('Celebración de '+couple)}`,`LOCATION:${escapeICS(location)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob=new Blob([body],{type:'text/calendar;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`boda-${couple.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.ics`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function googleCalendarUrl(){
    const {start,end}=eventRange(); const couple=invite?.dataset.couple || 'Boda'; const location=invite?.dataset.location || qs('[data-map]',invite)?.dataset.map || '';
    const p=new URLSearchParams({action:'TEMPLATE',text:`Boda ${couple}`,dates:`${compactUTC(start)}/${compactUTC(end)}`,details:`Celebración de ${couple}`,location}); return `https://calendar.google.com/calendar/render?${p.toString()}`;
  }
  qsa('[data-calendar]').forEach(b=>b.addEventListener('click',()=>{
    openModal(`<h2>Agendar evento</h2><p>Elegí cómo querés guardar la fecha.</p><div class="calendar-actions"><a class="pill pill-beige calendar-link" target="_blank" rel="noopener" href="${googleCalendarUrl()}">GOOGLE CALENDAR</a><button class="pill pill-gray" id="downloadIcs" type="button">DESCARGAR .ICS</button></div>`);
    qs('#downloadIcs')?.addEventListener('click',downloadICS);
  }));

  lightboxItems=qsa('.photo-strip img,.photo-grid img,.venue-cards img,.single-carousel img,.fd-photo-grid img,img.fd-photo');
  lightboxItems.forEach((img,i)=>{ img.classList.add('zoomable-photo'); img.tabIndex=0; img.setAttribute('role','button'); img.setAttribute('aria-label',`Ampliar imagen ${i+1}`); img.addEventListener('click',()=>openLightbox(i)); img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(i)}}); });
  function openLightbox(i){ if(!lightbox) return; lightboxIndex=i; renderLightbox(); lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); }
  function renderLightbox(){ const item=lightboxItems[lightboxIndex]; if(!item||!lightboxImg)return; lightboxImg.src=item.currentSrc||item.src; if(lightboxCaption)lightboxCaption.textContent=item.alt||''; }
  function stepLightbox(d){ if(!lightboxItems.length)return; lightboxIndex=(lightboxIndex+d+lightboxItems.length)%lightboxItems.length; renderLightbox(); }
  function closeLightbox(){ if(!lightbox)return; lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); lightboxImg?.removeAttribute('src'); }
  qsa('[data-lightbox-close]').forEach(el=>el.addEventListener('click',closeLightbox));
  qs('#lightboxPrev')?.addEventListener('click',()=>stepLightbox(-1)); qs('#lightboxNext')?.addEventListener('click',()=>stepLightbox(1));

  const s5Imgs=['https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=1200&q=90','https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=90','https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=90'];
  let s5Index=0; const s5Slide=qs('#s5Slide');
  qs('.single-carousel .next')?.addEventListener('click',()=>{s5Index=(s5Index+1)%s5Imgs.length;if(s5Slide)s5Slide.src=s5Imgs[s5Index]});
  qs('.single-carousel .prev')?.addEventListener('click',()=>{s5Index=(s5Index+s5Imgs.length-1)%s5Imgs.length;if(s5Slide)s5Slide.src=s5Imgs[s5Index]});

  function updateMusicButton(){
    if(!musicFab) return;
    const playing = Boolean(audio && !audio.paused && !audio.ended);
    musicOn = playing;
    musicFab.classList.toggle('is-playing', playing);
    musicFab.classList.toggle('has-error', false);
    musicFab.setAttribute('aria-pressed', String(playing));
    const state = musicFab.querySelector('.music-control-state');
    if(state) state.textContent = playing ? 'ON' : 'OFF';
    musicFab.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  }

  async function playSiteMusic(){
    if(!audio) return false;
    try{
      audio.volume = .42;
      if(audio.readyState === 0) audio.load();
      await audio.play();
      updateMusicButton();
      return true;
    }catch(err){
      console.error('No se pudo iniciar el audio:', err);
      musicFab?.classList.add('has-error');
      const state = musicFab?.querySelector('.music-control-state');
      if(state) state.textContent = 'REINTENTAR';
      return false;
    }
  }

  async function enterInvitation(){
    await playSiteMusic();
    if(welcomeMusic){
      welcomeMusic.classList.add('is-hidden');
      welcomeMusic.setAttribute('aria-hidden','true');
      setTimeout(()=>welcomeMusic.remove(), 650);
    }
  }

  enterWithMusic?.addEventListener('click', enterInvitation);

  musicFab?.addEventListener('click', async ()=>{
    if(!audio) return;
    if(audio.paused) await playSiteMusic();
    else{
      audio.pause();
      updateMusicButton();
    }
  });

  audio?.addEventListener('play', updateMusicButton);
  audio?.addEventListener('pause', updateMusicButton);
  audio?.addEventListener('ended', updateMusicButton);
  audio?.addEventListener('canplay', ()=>musicFab?.classList.remove('has-error'));
  audio?.addEventListener('error', ()=>{
    musicFab?.classList.add('has-error');
    const state = musicFab?.querySelector('.music-control-state');
    if(state) state.textContent = 'ERROR';
  });
  if(audio) audio.load();
  updateMusicButton();

  document.addEventListener('keydown', startMusicOnFirstInteraction, {once:true, capture:true});

  audio?.addEventListener('play', updateMusicButton);
  audio?.addEventListener('pause', updateMusicButton);
  audio?.addEventListener('ended', updateMusicButton);
  audio?.addEventListener('canplay', ()=>musicFab?.classList.remove('has-error'));
  audio?.addEventListener('error', ()=>{
    musicFab?.classList.remove('is-playing');
    musicFab?.classList.add('has-error');
    musicFab?.setAttribute('aria-label','Error al cargar la música');
  });
  if(audio) audio.load();
  updateMusicButton();

  document.addEventListener('keydown',e=>{ if(lightbox?.classList.contains('open')){ if(e.key==='Escape')closeLightbox(); if(e.key==='ArrowRight')stepLightbox(1); if(e.key==='ArrowLeft')stepLightbox(-1); return; } if(e.key==='Escape')closeModal(); });
})();
