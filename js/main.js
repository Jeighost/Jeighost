/* ═══════════════════════════════════════════════════════════
   JEIGHOST — MAIN.JS v3 (shared by every page)
═══════════════════════════════════════════════════════════ */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav state + scroll progress ── */
  const nav = $('#main-nav'), bar = $('#progress');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  const burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    const setMenu = open => {
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ── Scroll reveal ── */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ── Local clock (Barranquilla) ── */
  const clock = $('#clock');
  if (clock) {
    const f = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota' });
    const tick = () => clock.textContent = f.format(new Date());
    tick(); setInterval(tick, 15000);
  }
  $$('.year').forEach(el => el.textContent = new Date().getFullYear());

  /* ── Hero spotlight ── */
  const hero = $('.hero'), spot = $('#spot');
  if (hero && spot && !reduce && matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      spot.style.left = (e.clientX - r.left) + 'px';
      spot.style.top = (e.clientY - r.top) + 'px';
    });
  }

  /* ── Copy email ── */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copiado ✓'; }
    catch { location.href = 'mailto:' + text; }
    setTimeout(() => btn.textContent = 'Copiar', 2000);
  }));

  /* ── YouTube facade: load the player only on click ── */
  $$('.yt').forEach(b => b.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.id + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'Video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    b.replaceWith(f);
  }));
  const vids = $$('video');
  vids.forEach(v => v.addEventListener('play', () => vids.forEach(o => o !== v && o.pause())));

  /* ── Music player ── */
  const audio = $('#audio');
  if (audio) {
    const player = $('#player'), music = $('#music');
    const tracks = $$('.track'), art = $('#player-art');
    const icPlay = $('#ic-play'), icPause = $('#ic-pause'), playBtn = $('#play');
    const fill = $('#prog-fill'), prog = $('#prog'), tCur = $('#t-cur'), tDur = $('#t-dur');
    let idx = 0, loaded = false;
    const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
    const setUI = on => {
      player.classList.toggle('playing', on);
      music.classList.toggle('is-playing', on);
      icPlay.style.display = on ? 'none' : 'block';
      icPause.style.display = on ? 'block' : 'none';
      playBtn.setAttribute('aria-label', on ? 'Pausar' : 'Reproducir');
    };
    const load = i => {
      idx = (i + tracks.length) % tracks.length;
      const t = tracks[idx];
      tracks.forEach(x => x.classList.toggle('active', x === t));
      audio.src = t.dataset.src; loaded = true;
      $('#player-title').textContent = t.dataset.title;
      $('#player-artist').textContent = t.dataset.artist;
      art.style.opacity = 0;
      art.onload = () => art.style.opacity = 1;
      art.src = t.dataset.art;
      fill.style.width = '0%'; tCur.textContent = '0:00'; tDur.textContent = '0:00';
    };
    const play = () => { if (!loaded) load(idx); audio.play().catch(() => setUI(false)); };

    playBtn.addEventListener('click', () => audio.paused ? play() : audio.pause());
    $('#prev').addEventListener('click', () => { const was = !audio.paused; load(idx - 1); if (was) play(); });
    $('#next').addEventListener('click', () => { const was = !audio.paused; load(idx + 1); if (was) play(); });
    tracks.forEach((t, i) => t.addEventListener('click', () => {
      if (i === idx && loaded) { audio.paused ? play() : audio.pause(); return; }
      load(i); play();
    }));
    audio.addEventListener('play', () => { setUI(true); vids.forEach(v => v.pause()); });
    audio.addEventListener('pause', () => setUI(false));
    audio.addEventListener('ended', () => { load(idx + 1); play(); });
    audio.addEventListener('loadedmetadata', () => tDur.textContent = fmt(audio.duration));
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const p = audio.currentTime / audio.duration * 100;
      fill.style.width = p + '%';
      tCur.textContent = fmt(audio.currentTime);
      prog.setAttribute('aria-valuenow', Math.round(p));
    });
    prog.addEventListener('click', e => {
      if (!audio.duration) return;
      const r = prog.getBoundingClientRect();
      audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
    });
    prog.addEventListener('keydown', e => {
      if (!audio.duration) return;
      if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
    });
    const vol = $('#vol');
    audio.volume = .8;
    vol.addEventListener('input', () => audio.volume = vol.value / 100);
    tracks[0].classList.add('active');
  }

  /* ── Image fallback ── */
  $$('img').forEach(img => img.addEventListener('error', function () {
    this.style.background = 'linear-gradient(135deg, rgba(200,168,75,.08), rgba(155,28,28,.08))';
    this.removeAttribute('src');
  }));
})();
