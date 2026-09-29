(() => {
  'use strict';
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const t = (es, en) => english ? en : es;
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const slides = [...gallery.querySelectorAll('figure[data-slide], .gallery-slide')];
    const thumbs = [...gallery.querySelectorAll('[data-thumb], button[data-slide]')];
    if (!slides.length) return;
    const status = gallery.querySelector('[data-gallery-status]');
    const progress = gallery.querySelector('[data-gallery-progress]');
    const play = gallery.querySelector('[data-gallery-play], [data-play]');
    const expand = gallery.querySelector('[data-gallery-expand], [data-expand]');
    const stage = gallery.querySelector('[data-gallery-stage], .gallery-stage');
    const strip = gallery.querySelector('[data-gallery-strip], .gallery-thumbs');
    const previous = gallery.querySelector('[data-gallery-prev], [data-prev]');
    const next = gallery.querySelector('[data-gallery-next], [data-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let timer;
    let playing = false;
    let hovered = false;
    let visible = true;
    let startPoint;
    let fullscreenWasActive = false;
    const stopTimer = () => {
      window.clearTimeout(timer);
      gallery.classList.remove('is-playing');
    };
    const schedule = () => {
      stopTimer();
      if (!playing || hovered || !visible || document.hidden || reducedMotion.matches || slides.length < 2) return;
      gallery.classList.add('is-playing');
      timer = window.setTimeout(() => show(current + 1), 6500);
    };
    const setPlaying = value => {
      playing = Boolean(value && !reducedMotion.matches && slides.length > 1);
      play?.setAttribute('aria-pressed', String(playing));
      if (play) {
        play.textContent = playing ? t('Ⅱ Pausar', 'Ⅱ Pause') : t('▷ Reproducir', '▷ Play');
        play.setAttribute('aria-label', playing ? t('Pausar presentación', 'Pause slideshow') : t('Reproducir presentación', 'Play slideshow'));
      }
      status?.setAttribute('aria-live', playing ? 'off' : 'polite');
      schedule();
    };
    const show = (index, manual = false) => {
      const previousIndex = current;
      current = (index + slides.length) % slides.length;
      gallery.dataset.direction = current >= previousIndex ? 'next' : 'previous';
      slides.forEach((slide, i) => {
        slide.hidden = i !== current;
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
        if (i === current) {
          const picture = slide.querySelector('img');
          if (picture) picture.loading = 'eager';
        }
      });
      thumbs.forEach((button, i) => {
        button.setAttribute('aria-pressed', String(i === current));
        button.classList.toggle('is-active', i === current);
      });
      if (status) status.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      progress?.style.setProperty('--position', `${(current + 1) / slides.length * 100}%`);
      const selected = thumbs[current];
      if (strip?.scrollTo && selected) {
        const stripBox = strip.getBoundingClientRect();
        const thumbBox = selected.getBoundingClientRect();
        // Scroll only the thumbnail rail, never the whole page.
        strip.scrollTo({left: strip.scrollLeft + thumbBox.left - stripBox.left - strip.clientWidth / 2 + selected.clientWidth / 2, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
      }
      if (manual) setPlaying(false); else schedule();
    };
    gallery.classList.add('gallery-enhanced');
    gallery.setAttribute('aria-roledescription', t('carrusel', 'carousel'));
    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', t('diapositiva', 'slide'));
      slide.setAttribute('aria-label', t(`${i + 1} de ${slides.length}`, `${i + 1} of ${slides.length}`));
    });
    [previous, next, play].forEach(control => { if (control) control.hidden = slides.length < 2; });
    previous?.addEventListener('click', () => show(current - 1, true));
    next?.addEventListener('click', () => show(current + 1, true));
    thumbs.forEach((button, i) => button.addEventListener('click', () => show(i, true)));
    play?.addEventListener('click', () => setPlaying(!playing));
    gallery.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
      show(target, true);
      if (event.target.closest('[data-thumb], button[data-slide]')) thumbs[current]?.focus({preventScroll: true});
    });
    // Horizontal navigation leaves vertical scrolling and pinch-to-zoom available.
    if (stage) stage.style.touchAction = 'pan-y pinch-zoom';
    stage?.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' || !event.isPrimary || event.target.closest('button,a')) return;
      startPoint = {x: event.clientX, y: event.clientY, id: event.pointerId};
    });
    stage?.addEventListener('pointerup', event => {
      if (!startPoint || event.pointerId !== startPoint.id) return;
      const dx = event.clientX - startPoint.x;
      const dy = event.clientY - startPoint.y;
      startPoint = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1), true);
    });
    stage?.addEventListener('pointercancel', () => { startPoint = null; });
    stage?.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') { hovered = true; stopTimer(); }
    });
    stage?.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    gallery.addEventListener('focusin', () => setPlaying(false));
    document.addEventListener('visibilitychange', schedule);
    const motionPreference = () => {
      if (play) {
        play.disabled = reducedMotion.matches;
        play.title = reducedMotion.matches ? t('Respeta tu preferencia de movimiento reducido', 'Your reduced-motion preference is enabled') : '';
      }
      setPlaying(false);
    };
    reducedMotion.addEventListener('change', motionPreference);
    if (expand) {
      expand.hidden = typeof gallery.requestFullscreen !== 'function';
      expand.addEventListener('click', async () => {
        setPlaying(false);
        try {
          if (document.fullscreenElement === gallery) await document.exitFullscreen();
          else await gallery.requestFullscreen();
        } catch (_) {
          if (status) status.textContent = t('Pantalla completa no disponible en este navegador.', 'Fullscreen is unavailable in this browser.');
        }
      });
      document.addEventListener('fullscreenchange', () => {
        const full = document.fullscreenElement === gallery;
        expand.textContent = full ? t('↙ Reducir', '↙ Exit fullscreen') : t('⛶ Ampliar', '⛶ Expand');
        expand.setAttribute('aria-pressed', String(full));
        if (!full && fullscreenWasActive) expand.focus({preventScroll: true});
        fullscreenWasActive = full;
      });
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        schedule();
      }, {threshold: 0.2});
      observer.observe(gallery);
    }
    motionPreference();
    show(0);
  });
})();
