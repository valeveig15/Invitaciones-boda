(() => {
  'use strict';

  const invite = document.querySelector('.invite');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const musicFab = document.getElementById('musicFab');
  const audio = document.getElementById('siteAudio');

  let lightboxItems = [];
  let lightboxIndex = 0;

  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];

  qsa('[data-next-section]').forEach(btn => btn.addEventListener('click', () => {
    const section = btn.closest('.section');
    const next = section?.nextElementSibling;
    if(next && invite) invite.scrollTo({top:next.offsetTop, behavior:'smooth'});
  }));

  function countdownData(target){
    const diff = Math.max(0, target - Date.now());
    return [
      ['Días', Math.floor(diff/86400000)],
      ['Horas', Math.floor(diff%86400000/3600000)],
      ['Minutos', Math.floor(diff%3600000/60000)],
      ['Segundos', Math.floor(diff%60000/1000)]
    ];
  }

  function updateCountdowns(){
    if(!invite) return;
    const target = new Date(invite.dataset.date).getTime();
    if(!Number.isFinite(target)) return;
    const values = countdownData(target);
    qsa('[data-countdown="digital"]', invite).forEach(el => {
      el.innerHTML = values.map(([label,value]) => `<div class="unit"><b>${String(value).padStart(2,'0')}</b><span>${label==='Minutos'?'min':label==='Segundos'?'seg':label==='Horas'?'hrs':'días'}</span></div>`).join('');
    });
  }
  updateCountdowns();
  setInterval(updateCountdowns,1000);

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const revealItems = qsa('.reveal-on-scroll, [data-animate-icon]', invite || document);

  qsa('.photo-grid img.reveal-on-scroll', invite || document).forEach(img => {
    const markLoaded = () => requestAnimationFrame(() => img.classList.add('is-loaded'));
    if(img.complete && img.naturalWidth > 0) markLoaded();
    else img.addEventListener('load', markLoaded, {once:true});
  });

  if(reduceMotion || !('IntersectionObserver' in window)){
    revealItems.forEach(el => el.classList.add('is-visible'));
  }else{
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {root:invite || null, threshold:.16, rootMargin:'0px 0px -7% 0px'});
    revealItems.forEach(el => revealObserver.observe(el));
  }

  function openModal(markup){
    if(!modal || !modalBody) return;
    modalBody.innerHTML = markup;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  qsa('[data-close]').forEach(b => b.addEventListener('click',closeModal));

  qsa('[data-rsvp]').forEach(b => b.addEventListener('click', () => {
    openModal(`<h2>Confirmación de asistencia</h2><p>${b.dataset.rsvp || ''}</p><form id="rsvpForm"><input required autocomplete="name" placeholder="Nombre y apellido"><select><option>Confirmo asistencia</option><option>No podré asistir</option></select><textarea placeholder="Mensaje / requerimiento alimentario"></textarea><button class="pill pill-sage" type="submit">ENVIAR</button></form>`);
    qs('#rsvpForm')?.addEventListener('submit', e => {
      e.preventDefault();
      openModal('<h2>¡Gracias!</h2><p>Tu respuesta quedó registrada en esta demostración.</p>');
    });
  }));

  qsa('[data-gift]').forEach(b => b.addEventListener('click', () => {
    openModal('<h2>Datos bancarios</h2><p><strong>Aquí irían tus datos bancarios.</strong><br>Banco, número de cuenta y/o alias se completan al personalizar la invitación.<br><small>Esta es una muestra: no se exhiben datos bancarios reales.</small></p>');
  }));

  qsa('[data-song]').forEach(b => b.addEventListener('click', () => {
    openModal(`<h2>¿Qué canción no puede faltar?</h2><p>Dejanos tu sugerencia para la playlist de la fiesta.</p><form id="songForm"><input autocomplete="name" placeholder="Tu nombre (opcional)"><input required placeholder="Canción"><input placeholder="Artista"><button class="pill pill-beige" type="submit">ENVIAR SUGERENCIA</button></form>`);
    qs('#songForm')?.addEventListener('submit', e => {
      e.preventDefault();
      openModal('<h2>¡Anotada! ♫</h2><p>Gracias por sumar tu canción a la fiesta.</p>');
    });
  }));

  qsa('[data-map]').forEach(b => b.addEventListener('click', () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.dataset.map || '')}`,'_blank','noopener');
  }));

  qsa('[data-info]').forEach(b => b.addEventListener('click', () => {
    openModal(`<h2>${b.dataset.infoTitle || 'Información'}</h2><p>${b.dataset.infoContent || 'Información disponible para los invitados.'}</p>`);
  }));

  lightboxItems = qsa('.photo-strip img,.photo-grid img,.venue-cards img,.single-carousel img,.fd-photo-grid img,img.fd-photo');
  lightboxItems.forEach((img,i) => {
    img.classList.add('zoomable-photo');
    img.tabIndex = 0;
    img.setAttribute('role','button');
    img.setAttribute('aria-label',`Ampliar imagen ${i+1}`);
    img.addEventListener('click', () => openLightbox(i));
    img.addEventListener('keydown', e => {
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openLightbox(i); }
    });
  });

  function openLightbox(i){
    if(!lightbox) return;
    lightboxIndex = i;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  }

  function renderLightbox(){
    const item = lightboxItems[lightboxIndex];
    if(!item || !lightboxImg) return;
    lightboxImg.src = item.currentSrc || item.src;
    if(lightboxCaption) lightboxCaption.textContent = item.alt || '';
  }

  function stepLightbox(delta){
    if(!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + delta + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  }

  function closeLightbox(){
    if(!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg?.removeAttribute('src');
  }

  qsa('[data-lightbox-close]').forEach(el => el.addEventListener('click',closeLightbox));
  qs('#lightboxPrev')?.addEventListener('click',() => stepLightbox(-1));
  qs('#lightboxNext')?.addEventListener('click',() => stepLightbox(1));

  // MUSIC
  // Intentamos comenzar automáticamente. Si el navegador bloquea audio con sonido,
  // se inicia en la primera interacción del visitante sin mostrar ningún cartel.
  function updateMusicButton(){
    if(!musicFab || !audio) return;
    const audible = !audio.paused && !audio.muted;
    musicFab.classList.toggle('is-playing', audible);
    musicFab.classList.toggle('is-muted', audio.muted || audio.paused);
    musicFab.setAttribute('aria-pressed', String(audio.muted));
    musicFab.setAttribute('aria-label', audible ? 'Silenciar música' : 'Activar música');
  }

  async function tryStartAudio(){
    if(!audio || !audio.paused) return true;
    try{
      audio.volume = .45;
      audio.muted = false;
      await audio.play();
      updateMusicButton();
      return true;
    }catch(err){
      updateMusicButton();
      return false;
    }
  }

  // Mejor esfuerzo de autoplay. Algunos navegadores lo permitirán y otros no.
  audio?.load();
  tryStartAudio();

  // Si el autoplay fue bloqueado, el primer toque/clic/tecla inicia la música.
  const unlockAudio = async () => {
    const started = await tryStartAudio();
    if(started){
      document.removeEventListener('pointerdown', unlockAudio, true);
      document.removeEventListener('touchstart', unlockAudio, true);
      document.removeEventListener('keydown', unlockAudio, true);
    }
  };
  document.addEventListener('pointerdown', unlockAudio, true);
  document.addEventListener('touchstart', unlockAudio, true);
  document.addEventListener('keydown', unlockAudio, true);

  // El botón ya no pausa: funciona como mute/unmute.
  musicFab?.addEventListener('click', async (event) => {
    event.stopPropagation();
    if(!audio) return;

    if(audio.paused){
      audio.muted = false;
      await tryStartAudio();
    }else{
      audio.muted = !audio.muted;
    }
    updateMusicButton();
  });

  audio?.addEventListener('play', updateMusicButton);
  audio?.addEventListener('pause', updateMusicButton);
  audio?.addEventListener('volumechange', updateMusicButton);
  audio?.addEventListener('canplay', updateMusicButton);
  updateMusicButton();

  document.addEventListener('keydown', e => {
    if(lightbox?.classList.contains('open')){
      if(e.key==='Escape') closeLightbox();
      if(e.key==='ArrowRight') stepLightbox(1);
      if(e.key==='ArrowLeft') stepLightbox(-1);
      return;
    }
    if(e.key==='Escape') closeModal();
  });
})();
