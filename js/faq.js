(() => {
  'use strict';

  // Native details remain usable without JavaScript, including keyboard control.
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-faq]').forEach(group => {
    if (group.dataset.faqEnhanced === 'true') return;
    const states = [...group.querySelectorAll('[data-faq-item]')].map(item => ({
      item,
      summary: item.querySelector('summary'),
      answer: item.querySelector('.faq-answer'),
      desired: item.open,
      animations: [],
      version: 0,
      answerHeight: 0,
      overflow: item.style.overflow
    })).filter(state => state.summary && state.answer);
    if (!states.length) return;
    group.dataset.faqEnhanced = 'true';

    const stop = state => {
      state.version += 1;
      state.animations.forEach(animation => {
        animation.onfinish = null;
        animation.cancel();
      });
      state.animations = [];
      state.item.style.overflow = state.overflow;
    };

    const settle = (state, open) => {
      stop(state);
      state.desired = open;
      state.item.open = open;
      state.item.dataset.faqState = open ? 'open' : 'closed';
    };

    const change = (state, open, immediateClose = false) => {
      const startHeight = state.item.getBoundingClientRect().height;
      stop(state);
      state.desired = open;

      if (open) {
        // Close the previous disclosure BEFORE opening this one. Never expose
        // two answers to assistive technology, even during a rapid transition.
        states.forEach(other => {
          if (other !== state && (other.item.open || other.desired)) change(other, false, true);
        });
      }

      if (motion?.matches || typeof state.item.animate !== 'function' || typeof state.answer.animate !== 'function') {
        settle(state, open);
        return;
      }

      // Measure natural dimensions without hard-coded answer or summary sizes.
      // On a close, measure the collapsed native disclosure, then temporarily
      // retain its answer only when no other disclosure is about to open.
      state.item.open = open;
      const endHeight = state.item.getBoundingClientRect().height;
      if (!open && !immediateClose) state.item.open = true;
      state.answerHeight = state.answer.getBoundingClientRect().height;
      state.item.dataset.faqState = open ? 'opening' : 'closing';
      state.item.style.overflow = 'hidden';
      const version = state.version;

      try {
        const box = state.item.animate([
          {height: `${startHeight}px`},
          {height: `${endHeight}px`}
        ], {duration: open ? 380 : 280, easing: 'cubic-bezier(.22, 1, .36, 1)'});
        state.animations.push(box);
        if (open || !immediateClose) {
          const frames = open
            ? [{opacity: 0, transform: 'translateY(-8px)'}, {opacity: 1, transform: 'translateY(0)'}]
            : [{opacity: 1, transform: 'translateY(0)'}, {opacity: 0, transform: 'translateY(-4px)'}];
          state.animations.push(state.answer.animate(frames, {
            duration: open ? 300 : 180,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
            fill: 'both'
          }));
        }
        box.onfinish = () => {
          if (state.version === version) settle(state, open);
        };
      } catch {
        // Older/limited browsers still get a fully functional exclusive FAQ.
        settle(state, open);
      }
    };

    let initialOpen = false;
    states.forEach(state => {
      if (state.item.open && initialOpen) settle(state, false);
      else {
        initialOpen ||= state.item.open;
        settle(state, state.item.open);
      }

      // Enter and Space activate the native summary click; no duplicate key
      // handler and no redundant ARIA role/state overrides are required.
      state.summary.addEventListener('click', event => {
        event.preventDefault();
        change(state, !state.desired);
      });

      state.item.addEventListener('toggle', () => {
        // Respect native/programmatic changes, including the shared name group.
        // An open element may deliberately remain visible while closing.
        if (state.animations.length && !state.desired && state.item.open) return;
        if (state.item.open === state.desired) return;
        const open = state.item.open;
        if (open) states.forEach(other => { if (other !== state) settle(other, false); });
        settle(state, open);
      });
    });

    const finishTransitions = () => {
      states.forEach(state => { if (state.animations.length) settle(state, state.desired); });
    };
    motion?.addEventListener?.('change', event => { if (event.matches) finishTransitions(); });
    window.addEventListener('resize', finishTransitions, {passive: true});

    if (typeof window.ResizeObserver === 'function') {
      const observer = new window.ResizeObserver(entries => {
        entries.forEach(entry => {
          const state = states.find(candidate => candidate.answer === entry.target);
          if (!state?.animations.length) return;
          if (Math.abs(state.answer.getBoundingClientRect().height - state.answerHeight) > 1) {
            settle(state, state.desired);
          }
        });
      });
      states.forEach(state => observer.observe(state.answer));
    }
  });
})();
