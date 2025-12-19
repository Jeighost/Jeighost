// =================================
// INICIALIZACIÓN
// =================================
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initNavigation();
    init3DTilt();
    initMusicPlayer();
    initLazyLoading();
    initScrollAnimations();
    initResetButton();
});

// =================================
// BOTÓN RESET AL TRACK DESTACADO
// =================================
function initResetButton() {
    const resetBtn = document.getElementById('reset-featured');
    const audioPlayer = document.getElementById('audio-player');
    
    if (resetBtn && audioPlayer) {
        resetBtn.addEventListener('click', () => {
            const originalSrc = audioPlayer.getAttribute('data-original-src');
            const originalTitle = audioPlayer.getAttribute('data-original-title');
            const originalArtist = audioPlayer.getAttribute('data-original-artist');
            const originalImage = audioPlayer.getAttribute('data-original-image');
            
            loadTrack(originalSrc, originalTitle, originalArtist, originalImage);
            
            // Scroll suave hacia el reproductor
            const player = document.querySelector('.music-player');
            if (player && window.innerWidth < 768) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

// =================================
// SISTEMA DE PARTÍCULAS ANIMADAS
// =================================
function initParticles() {
    const particlesContainer = document.getElementById('particles-bg');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth > 768 ? 100 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const colors = ['#ffd700', '#ff0000', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.position = 'absolute';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = color;
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = Math.random() * 0.5 + 0.2;
    particle.style.animation = `float ${Math.random() * 10 + 5}s linear infinite`;
    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    
    container.appendChild(particle);
}

// Agregar keyframes de animación float dinámicamente
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes float {
        0% {
            transform: translateY(0) translateX(0);
        }
        25% {
            transform: translateY(-20px) translateX(10px);
        }
        50% {
            transform: translateY(-40px) translateX(-10px);
        }
        75% {
            transform: translateY(-20px) translateX(5px);
        }
        100% {
            transform: translateY(0) translateX(0);
        }
    }
`;
document.head.appendChild(styleSheet);

// =================================
// NAVEGACIÓN
// =================================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menú móvil
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Efecto scroll en navbar
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.2)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// =================================
// EFECTO 3D TILT EN CARDS
// =================================
function init3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', handleTilt);
        element.addEventListener('mouseleave', resetTilt);
    });
}

function handleTilt(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    this.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-10px)
        scale3d(1.02, 1.02, 1.02)
    `;
}

function resetTilt() {
    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale3d(1, 1, 1)';
}

// =================================
// REPRODUCTOR DE MÚSICA
// =================================
function initMusicPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    if (!audioPlayer) return;

    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    const volumeSlider = document.getElementById('volume-slider');
    const musicPlayer = document.querySelector('.music-player');

    window.isPlaying = false;

    // Play/Pause
    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }

    function togglePlay() {
        if (window.isPlaying) {
            audioPlayer.pause();
            playBtn.textContent = '▶';
            musicPlayer.classList.remove('playing');
        } else {
            audioPlayer.play();
            playBtn.textContent = '⏸';
            musicPlayer.classList.add('playing');
        }
        window.isPlaying = !window.isPlaying;
    }

    // Actualizar tiempo
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });

    function updateProgress() {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }

    // Click en barra de progreso
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
        });
    }

    // Control de volumen
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value / 100;
        });
        // Set initial volume
        audioPlayer.volume = 0.7;
    }

    // Formatear tiempo
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Controles prev/next
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            audioPlayer.currentTime = 0;
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Obtener el siguiente track
            const allTracks = document.querySelectorAll('.track-card[data-audio]');
            const currentSrc = audioPlayer.src.split('/').pop();
            
            let currentIndex = -1;
            allTracks.forEach((track, index) => {
                const trackSrc = track.getAttribute('data-audio').split('/').pop();
                if (trackSrc === currentSrc) {
                    currentIndex = index;
                }
            });
            
            const nextIndex = (currentIndex + 1) % allTracks.length;
            const nextTrack = allTracks[nextIndex];
            
            if (nextTrack) {
                const audioSrc = nextTrack.getAttribute('data-audio');
                const trackTitle = nextTrack.getAttribute('data-title');
                const trackArtist = nextTrack.getAttribute('data-artist');
                const trackImage = nextTrack.getAttribute('data-image');
                loadTrack(audioSrc, trackTitle, trackArtist, trackImage);
            }
        });
    }

    // Finalización de audio - auto-next
    audioPlayer.addEventListener('ended', () => {
        // Auto play next track
        if (nextBtn) {
            nextBtn.click();
        } else {
            window.isPlaying = false;
            playBtn.textContent = '▶';
            musicPlayer.classList.remove('playing');
            progressFill.style.width = '0%';
            audioPlayer.currentTime = 0;
        }
    });
}

// =================================
// LAZY LOADING DE IMÁGENES
// =================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Si la imagen no tiene src, crear un placeholder
                    if (!img.src || img.src.includes('placeholder')) {
                        img.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 0, 0, 0.1))';
                    }
                    
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// =================================
// ANIMACIONES AL SCROLL
// =================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.project-card, .video-card, .track-card, .access-card');
    
    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => scrollObserver.observe(el));
    }
}

// =================================
// CLICK EN TRACK CARDS - CAMBIAR REPRODUCCIÓN
// =================================
document.addEventListener('click', (e) => {
    const videoCard = e.target.closest('.video-card:not(.featured-video)');
    if (videoCard) {
        const thumbnail = videoCard.querySelector('.video-thumbnail');
        if (thumbnail && thumbnail.contains(e.target)) {
            console.log('Video clicked');
            animateClick(e.target);
        }
    }
    
    // Sistema de cambio de track en el reproductor
    const trackCard = e.target.closest('.track-card');
    if (trackCard) {
        const audioSrc = trackCard.getAttribute('data-audio');
        const trackTitle = trackCard.getAttribute('data-title');
        const trackArtist = trackCard.getAttribute('data-artist');
        const trackImage = trackCard.getAttribute('data-image');
        
        if (audioSrc) {
            loadTrack(audioSrc, trackTitle, trackArtist, trackImage);
            animateClick(trackCard);
            
            // Scroll suave hacia el reproductor
            const player = document.querySelector('.music-player');
            if (player && window.innerWidth < 768) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
});

// Función para cargar un nuevo track
function loadTrack(audioSrc, title, artist, image) {
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const musicPlayer = document.querySelector('.music-player');
    const resetBtn = document.getElementById('reset-featured');
    
    if (!audioPlayer) return;
    
    // Verificar si es el track original
    const originalSrc = audioPlayer.getAttribute('data-original-src');
    const isOriginal = audioSrc === originalSrc;
    
    // Detener audio actual
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    
    // Cambiar source
    audioPlayer.src = audioSrc;
    
    // Actualizar información visual
    const trackTitleEl = document.getElementById('current-track-title');
    const trackArtistEl = document.getElementById('current-track-artist');
    const artworkImg = document.getElementById('player-artwork');
    
    if (trackTitleEl) trackTitleEl.textContent = title || 'Track';
    if (trackArtistEl) trackArtistEl.textContent = artist || 'Jeighost';
    if (artworkImg) {
        artworkImg.src = image || 'assets/images/album-art.jpg';
        // Efecto de fade en la imagen
        artworkImg.style.opacity = '0';
        setTimeout(() => {
            artworkImg.style.transition = 'opacity 0.5s ease';
            artworkImg.style.opacity = '1';
        }, 100);
    }
    
    // Mostrar/ocultar botón de reset
    if (resetBtn) {
        resetBtn.style.display = isOriginal ? 'none' : 'inline-block';
    }
    
    // Reproducir automáticamente
    audioPlayer.load();
    audioPlayer.play().then(() => {
        if (playBtn) playBtn.textContent = '⏸';
        if (musicPlayer) musicPlayer.classList.add('playing');
        window.isPlaying = true;
    }).catch(err => {
        console.log('Autoplay prevented:', err);
    });
}

function animateClick(element) {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = '';
    }, 200);
}

// =================================
// SMOOTH SCROLL PARA ENLACES
// =================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =================================
// GENERADOR DE IMÁGENES PLACEHOLDER
// =================================
window.addEventListener('load', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Si la imagen no carga, mostrar un gradiente
        img.addEventListener('error', function() {
            this.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 0, 0, 0.2))';
            this.style.minHeight = '200px';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.alt = '🎨';
        });
    });
});

// =================================
// OPTIMIZACIÓN DE RENDIMIENTO
// =================================
// Debounce para eventos de resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Reinicializar partículas si es necesario
        if (window.innerWidth > 768) {
            const particlesContainer = document.getElementById('particles-bg');
            if (particlesContainer && particlesContainer.children.length < 100) {
                // Agregar más partículas en pantallas grandes
            }
        }
    }, 250);
});

// Optimización de scroll
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Aquí se pueden agregar efectos adicionales de scroll
            ticking = false;
        });
        ticking = true;
    }
});

// =================================
// DETECCIÓN DE MODO OSCURO/CLARO DEL SISTEMA
// =================================
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Ya estamos en modo oscuro por defecto
    console.log('Dark mode active');
}

// =================================
// PRECARGA DE CONTENIDO CRÍTICO
// =================================
document.addEventListener('DOMContentLoaded', () => {
    // Precargar fuentes críticas
    const fonts = [
        'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
        'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&display=swap'
    ];
    
    fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = font;
        document.head.appendChild(link);
    });
});

// =================================
// EFECTOS ADICIONALES
// =================================

// Cursor personalizado (opcional)
if (window.innerWidth > 1024) {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #ffd700;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
}

// Efecto parallax suave en el hero (solo en desktop)
const heroSection = document.querySelector('.hero-section');
if (heroSection && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;
        
        // Solo aplicar efecto mientras el hero esté visible
        if (scrolled < heroHeight) {
            heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
            // Reducir opacidad solo cuando esté cerca del final
            const fadeStart = heroHeight * 0.7;
            if (scrolled > fadeStart) {
                heroSection.style.opacity = 1 - ((scrolled - fadeStart) / (heroHeight - fadeStart));
            } else {
                heroSection.style.opacity = 1;
            }
        }
    });
}

// =================================
// ANALYTICS Y TRACKING (Preparado para implementación)
// =================================
function trackEvent(category, action, label) {
    // Placeholder para Google Analytics o similar
    console.log('Event tracked:', { category, action, label });
}

// Rastrear clics en enlaces externos
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', () => {
        trackEvent('External Link', 'Click', link.href);
    });
});

// =================================
// CONSOLA DE BIENVENIDA
// =================================
console.log('%cJEIGHOST', 'font-size: 50px; font-weight: bold; color: #ffd700; text-shadow: 0 0 10px #ffd700;');
console.log('%cPortafolio Oficial | 2024', 'font-size: 16px; color: #ff0000;');
console.log('%c🎨 Diseñado con pasión y código', 'font-size: 14px; color: #808080;');
