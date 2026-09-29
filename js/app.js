(() => {
  'use strict';
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const t = (es, en) => english ? en : es;
  const config = window.PROJECTCONS_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  const header = document.querySelector('.site-header');

  const setMenu = open => {
    if (!menu || !nav) return;
    nav.classList.toggle('is-open', open);
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? t('Cerrar menú', 'Close menu') : t('Abrir menú', 'Open menu'));
    document.body.classList.toggle('menu-open', open);
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 1001px)');
  desktop.addEventListener('change', event => { if (event.matches) setMenu(false); });
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  window.addEventListener('scroll', updateHeader, {passive: true});
  updateHeader();

  // Both language editions are static pages. Preserve the visitor's project context.
  document.querySelectorAll('[data-language-link]').forEach(link => {
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    destination.search = window.location.search;
    if (window.location.hash) destination.hash = window.location.hash;
    link.href = destination.href;
  });
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -24px 0px'});
    revealItems.forEach(item => {
      item.classList.add('reveal-ready');
      revealObserver.observe(item);
    });
    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      revealObserver.disconnect();
      revealItems.forEach(item => item.classList.add('is-visible'));
    });
  }

  // Never route a real enquiry to a sample phone number.
  const whatsapp = String(config.whatsapp || '').replace(/[\s()+.-]/g, '');
  const contactReady = /^\d{10,15}$/.test(whatsapp)
    && whatsapp !== '526240000000' && !/^(\d)\1+$/.test(whatsapp) && !/0{7,}$/.test(whatsapp);
  const welcome = t('Hola, me gustaría conversar sobre un proyecto en La Paz, B.C.S.', 'Hello, I would like to discuss a building project in La Paz, Baja California Sur.');
  document.querySelectorAll('[data-whatsapp-link]').forEach(link => {
    if (contactReady) {
      link.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(welcome)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.removeAttribute('target');
      if (/wa\.me|api\.whatsapp/i.test(link.href)) link.href = '#contacto';
    }
  });
  document.querySelectorAll('[data-contact-ready]').forEach(element => { element.hidden = !contactReady; });
  document.querySelectorAll('[data-contact-note]').forEach(element => { element.hidden = contactReady; });
  document.querySelectorAll('[data-phone-display]').forEach(element => {
    if (contactReady && config.phoneDisplay) element.textContent = config.phoneDisplay;
  });
  document.querySelectorAll('[data-phone-link]').forEach(link => {
    link.hidden = !contactReady;
    if (contactReady) link.href = `tel:+${whatsapp}`;
  });

  const form = document.getElementById('quote-form');
  if (!form) return;
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const steps = [...form.querySelectorAll('[data-form-step]')];
  const next = form.querySelector('[data-step-next]');
  const back = form.querySelector('[data-step-back]');
  const submit = form.querySelector('[type="submit"]');
  const progress = document.querySelector('[data-form-progress]');
  const status = document.getElementById('form-status');
  const result = document.getElementById('quote-result');
  const summary = document.getElementById('quote-summary');
  const send = document.getElementById('whatsapp-send');
  const copy = document.getElementById('copy-summary');
  let step = 0;
  let leadId = '';
  form.noValidate = true;
  form.classList.add('form-enhanced');
  [next, back, copy].forEach(button => { if (button) button.type = 'button'; });
  if (status) { status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); }
  const setStatus = message => { if (status) status.textContent = message; };
  const phone = form.elements.namedItem('phone');
  const validatePhone = () => {
    if (!phone) return;
    const value = phone.value.trim();
    const digits = value.replace(/\D/g, '');
    const valid = !value || (/^[+\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15);
    phone.setCustomValidity(valid ? '' : t('Escribe un teléfono válido, con código de país si estás fuera de México.', 'Enter a valid phone number, including your country code if you are outside Mexico.'));
  };
  const showStep = (index, focus = false) => {
    if (!steps.length) return;
    step = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((item, i) => { item.hidden = i !== step; });
    if (next) next.hidden = step === steps.length - 1;
    if (back) back.hidden = step === 0;
    if (submit) submit.hidden = step !== steps.length - 1;
    if (progress) {
      progress.textContent = t(`Paso ${step + 1} de ${steps.length}`, `Step ${step + 1} of ${steps.length}`);
      progress.setAttribute('aria-live', 'polite');
    }
    form.dataset.currentStep = String(step + 1);
    if (focus) steps[step].querySelector('input, select, textarea')?.focus({preventScroll: true});
  };
  const validate = scope => {
    validatePhone();
    const controls = [...scope.querySelectorAll('input, select, textarea')].filter(field => field.willValidate);
    controls.filter(field => ['name', 'location'].includes(field.name)).forEach(field => {
      field.setCustomValidity(field.value.trim() ? '' : t('Completa este campo.', 'Please complete this field.'));
    });
    controls.forEach(field => field.setAttribute('aria-invalid', String(!field.checkValidity())));
    const invalid = controls.find(field => !field.checkValidity());
    if (!invalid) { setStatus(''); return true; }
    const invalidStep = steps.findIndex(item => item.contains(invalid));
    if (invalidStep >= 0) showStep(invalidStep);
    setStatus(t('Revisa los campos indicados antes de continuar.', 'Please check the highlighted fields before continuing.'));
    invalid.focus();
    invalid.reportValidity();
    return false;
  };
  next?.addEventListener('click', () => { if (validate(steps[step] || form)) showStep(step + 1, true); });
  back?.addEventListener('click', () => { setStatus(''); showStep(step - 1, true); });
  fields.forEach(field => {
    const changed = () => {
      if (field === phone) validatePhone();
      if (['name', 'location'].includes(field.name)) field.setCustomValidity('');
      if (field.checkValidity()) field.removeAttribute('aria-invalid');
      // A prepared enquiry becomes stale as soon as its fields change.
      if (result) result.hidden = true;
      if (send) { send.hidden = true; send.removeAttribute('href'); }
      setStatus('');
    };
    field.addEventListener('input', changed);
    field.addEventListener('change', changed);
  });
  showStep(0);

  const params = new URLSearchParams(window.location.search);
  const category = form.elements.namedItem('category');
  const categoryValue = params.get('categoria');
  if (category && categoryValue) {
    const option = [...category.options].find(item => item.value === categoryValue || item.textContent.trim() === categoryValue);
    if (option) category.value = option.value;
  }
  const reference = (params.get('referencia') || '').replace(/\s+/g, ' ').trim().slice(0, 180);
  document.querySelectorAll('[data-project-context]').forEach(element => {
    element.hidden = !reference;
    if (reference) element.textContent = t('Tu referencia: ', 'Your reference: ') + reference;
  });
  const valueOf = name => String(form.elements.namedItem(name)?.value || '').trim();
  const labelOf = name => {
    const field = form.elements.namedItem(name);
    return field?.value ? (field.selectedOptions?.[0]?.textContent.trim() || valueOf(name)) : t('Por definir', 'To be discussed');
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (steps.length && step < steps.length - 1) {
      if (validate(steps[step])) showStep(step + 1, true);
      return;
    }
    if (!validate(form)) return;
    if (!summary || !result) {
      setStatus(t('No pudimos preparar el resumen. Puedes contactarnos desde el enlace de WhatsApp.', 'The summary could not be prepared. Please use the WhatsApp contact link.'));
      return;
    }
    if (!leadId) {
      const random = new Uint32Array(1);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
      else random[0] = Math.floor(Math.random() * 0xffffffff);
      leadId = `PC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${random[0].toString(36).slice(-5).toUpperCase().padStart(5, '0')}`;
    }
    const lines = [
      t('Hola PROJECTCONS, me gustaría conversar sobre mi proyecto.', 'Hello PROJECTCONS, I would like to discuss my project.'),
      '', `${t('Folio', 'Reference')}: ${leadId}`,
      `${t('Nombre', 'Name')}: ${valueOf('name')}`,
      `${t('Teléfono', 'Phone')}: ${valueOf('phone')}`,
      `${t('Tipo de proyecto', 'Project type')}: ${labelOf('category')}`,
      `${t('Ubicación', 'Location')}: ${valueOf('location')}`,
      `${t('Etapa actual', 'Current stage')}: ${labelOf('stage')}`,
      `${t('Inversión estimada', 'Estimated budget')}: ${labelOf('budget')}`,
      `${t('Inicio estimado', 'Estimated start')}: ${labelOf('timing')}`
    ];
    if (reference) lines.push(`${t('Proyecto de referencia', 'Project of interest')}: ${reference}`);
    if (valueOf('message')) lines.push('', `${t('Sobre mi proyecto', 'About my project')}:`, valueOf('message'));
    lines.push('', t('Preparado en el sitio web de PROJECTCONS · Español', 'Prepared on the PROJECTCONS website · English'));
    summary.value = lines.join('\n');
    result.hidden = false;
    if (send) {
      send.hidden = !contactReady;
      if (contactReady) {
        send.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(summary.value)}`;
        send.target = '_blank';
        send.rel = 'noopener noreferrer';
      } else send.removeAttribute('href');
    }
    setStatus(contactReady
      ? t('Tu resumen está listo. Revísalo y abre WhatsApp cuando quieras. Aún no se ha enviado nada.', 'Your summary is ready. Review it and open WhatsApp when you are ready. Nothing has been sent yet.')
      : t('Resumen de demostración listo. El contacto está pendiente de confirmación; puedes copiarlo, pero no se ha enviado nada.', 'Demo summary ready. Contact details are awaiting confirmation; you can copy it, but nothing has been sent.'));
    result.setAttribute('tabindex', '-1');
    result.focus({preventScroll: true});
    result.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest'});
  });
  copy?.addEventListener('click', async () => {
    if (!summary?.value) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(summary.value);
      setStatus(t('Resumen copiado. No se ha enviado ningún mensaje.', 'Summary copied. No message has been sent.'));
    } catch (_) {
      summary.focus();
      summary.select();
      setStatus(t('Seleccionamos tu resumen. Usa la opción Copiar de tu dispositivo o Ctrl/Cmd + C.', 'Your summary is selected. Use your device’s Copy option or Ctrl/Cmd + C.'));
    }
  });
  // Enable only after every handler is bound. Failed or disabled JS cannot leak a GET enquiry.
  steps.forEach(fieldset => { fieldset.disabled = false; });
})();
