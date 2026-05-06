/* ═══════════════════════════════════════════════════════════
   JEIGHOST — MAIN.JS v2.0
   Clean, performant, no bloat
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initMusicPlayer();
  initImageFallback();
  initActiveNavLinks();
});

/* ══════════════════════════════
   NAVIGATION
══════════════════════════════ */
function initNav() {
  const nav        = document.getElementById('main-nav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');

  if (!nav) return;

  // Scroll state
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ══════════════════════════════
   SCROLL REVEAL
══════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  els.forEach(el => observer.observe(el));
}

/* ══════════════════════════════
   ACTIVE NAV LINK ON SCROLL
══════════════════════════════ */
function initActiveNavLinks() {
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navAnchors.length) return;

  const ids = Array.from(navAnchors)
    .map(a => a.getAttribute('href').slice(1))
    .filter(Boolean);

  const sections = ids
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const match = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
}

/* ══════════════════════════════
   MUSIC PLAYER
══════════════════════════════ */
function initMusicPlayer() {
  const audio     = document.getElementById('audio-player');
  const playerCard = document.getElementById('player-card');
  if (!audio || !playerCard) return;

  const playBtn    = document.getElementById('play-btn');
  const prevBtn    = document.getElementById('prev-btn');
  const nextBtn    = document.getElementById('next-btn');
  const progBar    = document.getElementById('player-progress');
  const progFill   = document.getElementById('player-progress-fill');
  const curTimeEl  = document.getElementById('player-current-time');
  const durEl      = document.getElementById('player-duration');
  const volSlider  = document.getElementById('player-volume');
  const artwork    = document.getElementById('player-artwork');
  const titleEl    = document.getElementById('player-title');
  const artistEl   = document.getElementById('player-artist');
  const trackItems = document.querySelectorAll('.track-item');

  let isPlaying  = false;
  let currentIdx = 0;
  const tracks   = Array.from(trackItems);

  // Set initial volume
  audio.volume = 0.8;

  /* ── Helpers ── */
  function fmt(s) {
    if (isNaN(s)) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function setPlaying(state) {
    isPlaying = state;
    playerCard.classList.toggle('playing', state);

    const playIcon  = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (playIcon)  playIcon.style.display  = state ? 'none'  : 'block';
    if (pauseIcon) pauseIcon.style.display = state ? 'block' : 'none';
  }

  function loadTrack(idx, autoplay = false) {
    const t = tracks[idx];
    if (!t) return;

    // Update active state in list
    tracks.forEach(x => x.classList.remove('active'));
    t.classList.add('active');

    const src    = t.dataset.src    || '';
    const title  = t.dataset.title  || 'Track';
    const artist = t.dataset.artist || 'Jeighost';
    const art    = t.dataset.art    || '';

    // Update audio source
    if (audio.src !== new URL(src, location.href).href) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = src;
      audio.load();
    }

    // Update UI
    if (titleEl)  titleEl.textContent  = title;
    if (artistEl) artistEl.textContent = artist;

    if (artwork && art) {
      artwork.style.opacity = '0';
      artwork.src = art;
      artwork.onload = () => {
        artwork.style.transition = 'opacity 0.45s ease';
        artwork.style.opacity    = '1';
      };
    }

    currentIdx = idx;

    if (autoplay) {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {}); // Autoplay blocked
    }
  }

  /* ── Play / Pause ── */
  function togglePlay() {
    if (!audio.src || audio.src === window.location.href) {
      loadTrack(0, true);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);

  /* ── Prev / Next ── */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      // If more than 3s played, restart current track
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
      } else {
        const prev = (currentIdx - 1 + tracks.length) % tracks.length;
        loadTrack(prev, isPlaying);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const next = (currentIdx + 1) % tracks.length;
      loadTrack(next, isPlaying);
    });
  }

  /* ── Track list clicks ── */
  tracks.forEach((t, i) => {
    t.addEventListener('click', () => {
      if (i === currentIdx) {
        togglePlay();
      } else {
        loadTrack(i, true);
      }
    });
  });

  /* ── Progress update ── */
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progFill)  progFill.style.width = pct + '%';
    if (curTimeEl) curTimeEl.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (durEl) durEl.textContent = fmt(audio.duration);
  });

  audio.addEventListener('ended', () => {
    const next = (currentIdx + 1) % tracks.length;
    loadTrack(next, true);
  });

  /* ── Progress bar click / drag ── */
  let dragging = false;

  function seekTo(e) {
    if (!audio.duration) return;
    const rect = progBar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  }

  if (progBar) {
    progBar.addEventListener('mousedown', (e) => { dragging = true; seekTo(e); });
    document.addEventListener('mousemove', (e) => { if (dragging) seekTo(e); });
    document.addEventListener('mouseup',  () => { dragging = false; });
    // Touch support
    progBar.addEventListener('touchstart', (e) => seekTo(e.touches[0]), { passive: true });
    progBar.addEventListener('touchmove',  (e) => seekTo(e.touches[0]), { passive: true });
  }

  /* ── Volume ── */
  if (volSlider) {
    volSlider.addEventListener('input', () => {
      audio.volume = volSlider.value / 100;
    });
  }
}

/* ══════════════════════════════
   IMAGE FALLBACK
══════════════════════════════ */
function initImageFallback() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      this.style.cssText = `
        background: linear-gradient(135deg, rgba(200,168,75,0.07), rgba(155,28,28,0.07));
        min-height: 80px;
      `;
      this.removeAttribute('src');
    });
  });
}

/* ══════════════════════════════
   SMOOTH SCROLL ANCHORS
══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ══════════════════════════════
   PERFORMANCE: PASSIVE LISTENERS
   (scroll handled above with passive: true)
══════════════════════════════ */

/* ══════════════════════════════
   DEV CONSOLE SIGNATURE
══════════════════════════════ */
console.log(
  '%c JEIGHOST ',
  'font-size:22px;font-weight:bold;background:#c8a84b;color:#080808;padding:4px 12px;border-radius:4px;'
);
console.log('%c Portfolio v2.0 — 2024', 'color:#5a5a5a;font-size:12px;');
