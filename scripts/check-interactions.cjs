// Isolated interaction checks: simulated DOM, no browser and no outgoing messages.
// Complements (but does not replace) visual, responsive and real-browser checks.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const galleryCode = fs.readFileSync(path.join(__dirname, '../js/gallery.js'), 'utf8');

function element() {
  const classes = new Set();
  return {
    handlers: {}, attrs: {}, dataset: {}, hidden: false, disabled: false,
    value: '', textContent: '',
    style: {setProperty(key, value) { this[key] = value; }},
    classList: {
      add(name) { classes.add(name); }, remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
      toggle(name, enabled) {
        if (enabled === undefined) enabled = !classes.has(name);
        if (enabled) classes.add(name); else classes.delete(name);
        return enabled;
      }
    },
    addEventListener(type, handler) { this.handlers[type] = handler; },
    setAttribute(key, value) { this.attrs[key] = value; },
    getAttribute(key) { return this.attrs[key]; },
    removeAttribute(key) { delete this.attrs[key]; },
    focus() { this.focused = true; }, select() { this.selected = true; },
    scrollIntoView() {}, closest() { return null; }, querySelector() { return null; }
  };
}

function checkGallery(lang) {
  const slides = Array.from({length: 5}, element);
  const thumbs = Array.from({length: 5}, element);
  const gallery = element(), stage = element(), previous = element(), next = element();
  const play = element(), status = element(), progress = element();
  let scheduled, reduced = false;
  const motion = {get matches() { return reduced; }, addEventListener(type, handler) { this[type] = handler; }};
  gallery.querySelectorAll = selector => selector.startsWith('figure') ? slides : thumbs;
  gallery.querySelector = selector => ({
    '[data-gallery-status]': status, '[data-gallery-progress]': progress,
    '[data-gallery-play], [data-play]': play, '[data-gallery-stage], .gallery-stage': stage,
    '[data-gallery-prev], [data-prev]': previous, '[data-gallery-next], [data-next]': next
  })[selector];
  const document = {
    documentElement: {lang}, querySelectorAll: () => [gallery], hidden: false,
    handlers: {}, addEventListener(type, handler) { this.handlers[type] = handler; }
  };
  const window = {
    matchMedia: () => motion,
    clearTimeout() { scheduled = null; },
    setTimeout(callback, interval) { assert.equal(interval, 6500); scheduled = callback; return 1; }
  };
  vm.runInNewContext(galleryCode, {document, window});
  assert.equal(status.textContent, '01 / 05');
  assert.equal(slides.filter(slide => !slide.hidden).length, 1);
  assert.equal(scheduled, null, 'Playback must be opt-in');
  assert.equal(slides[0].attrs['aria-hidden'], 'false');
  previous.handlers.click(); assert.equal(status.textContent, '05 / 05');
  next.handlers.click(); assert.equal(status.textContent, '01 / 05');
  thumbs[2].handlers.click(); assert.equal(status.textContent, '03 / 05');
  assert.equal(thumbs[2].attrs['aria-pressed'], 'true');
  gallery.handlers.keydown({key: 'ArrowRight', target: element(), preventDefault() {}});
  assert.equal(status.textContent, '04 / 05');
  gallery.handlers.keydown({key: 'Home', target: element(), preventDefault() {}});
  assert.equal(status.textContent, '01 / 05');
  gallery.handlers.keydown({key: 'End', target: element(), preventDefault() {}});
  assert.equal(status.textContent, '05 / 05');
  assert.equal(progress.style['--position'], '100%');
  stage.handlers.pointerdown({pointerType: 'touch', isPrimary: true, pointerId: 1, clientX: 200, clientY: 20, target: element()});
  stage.handlers.pointerup({pointerId: 1, clientX: 100, clientY: 24});
  assert.equal(status.textContent, '01 / 05');
  stage.handlers.pointerdown({pointerType: 'touch', isPrimary: true, pointerId: 2, clientX: 200, clientY: 20, target: element()});
  stage.handlers.pointerup({pointerId: 2, clientX: 195, clientY: 140});
  assert.equal(status.textContent, '01 / 05', 'Vertical gestures must not change slides');
  play.handlers.click(); assert.equal(play.attrs['aria-pressed'], 'true');
  assert.equal(typeof scheduled, 'function');
  scheduled(); assert.equal(status.textContent, '02 / 05');
  stage.handlers.pointerenter({pointerType: 'mouse'}); assert.equal(scheduled, null);
  stage.handlers.pointerleave(); assert.equal(typeof scheduled, 'function');
  document.hidden = true; document.handlers.visibilitychange(); assert.equal(scheduled, null);
  document.hidden = false; document.handlers.visibilitychange(); assert.equal(typeof scheduled, 'function');
  gallery.handlers.focusin(); assert.equal(scheduled, null);
  reduced = true; motion.change(); play.handlers.click();
  assert.equal(play.disabled, true); assert.equal(play.attrs['aria-pressed'], 'false');
  assert.equal(scheduled, null);
  assert.equal(play.textContent, lang === 'en' ? '▷ Play' : '▷ Reproducir');
}

async function checkForm(lang, number, clipboardAvailable = true) {
  const menu = element(), nav = element(), body = element(), header = element(), form = element();
  const stepOne = element(), stepTwo = element(), next = element(), back = element(), submit = element();
  const progress = element(), status = element(), result = element(), summary = element(), send = element();
  const copy = element(), context = element();
  stepOne.disabled = true; stepTwo.disabled = true; result.hidden = true; submit.hidden = true;
  const fields = {};
  for (const name of ['name', 'phone', 'category', 'location', 'stage', 'budget', 'timing', 'message', 'consent']) {
    const field = element();
    field.name = name; field.willValidate = true; field.customError = '';
    field.required = ['name', 'phone', 'category', 'location', 'consent'].includes(name);
    field.checkValidity = () => !field.customError && (!field.required || (name === 'consent' ? field.checked : field.value.length > 0));
    field.setCustomValidity = message => { field.customError = message; };
    field.reportValidity = () => field.checkValidity();
    field.selectedOptions = [{textContent: `Selected ${name}`}];
    fields[name] = field;
  }
  fields.category.options = [{value: 'bodegas', textContent: lang === 'en' ? 'Warehouses' : 'Bodegas'}];
  const controls = Object.values(fields);
  const firstFields = ['name', 'phone', 'category', 'location'].map(name => fields[name]);
  const secondFields = controls.filter(field => !firstFields.includes(field));
  stepOne.querySelectorAll = () => firstFields; stepTwo.querySelectorAll = () => secondFields;
  stepOne.contains = field => firstFields.includes(field); stepTwo.contains = field => secondFields.includes(field);
  stepOne.querySelector = () => firstFields[0]; stepTwo.querySelector = () => secondFields[0];
  form.elements = {namedItem: name => fields[name]};
  form.querySelectorAll = selector => selector === '[data-form-step]' ? [stepOne, stepTwo] : controls;
  form.querySelector = selector => ({'[data-step-next]': next, '[data-step-back]': back, '[type="submit"]': submit})[selector];
  nav.querySelectorAll = () => [];
  const languageLink = element(), contactLink = element();
  languageLink.href = 'https://example.test/en/index.html';
  contactLink.href = 'https://wa.me/526240000000';
  const document = {
    documentElement: {lang}, body, handlers: {},
    addEventListener(type, handler) { this.handlers[type] = handler; },
    querySelector: selector => selector === '.site-header' ? header : selector === '[data-form-progress]' ? progress : null,
    getElementById: id => ({
      'nav-toggle': menu, 'site-nav': nav, 'quote-form': form, 'form-status': status,
      'quote-result': result, 'quote-summary': summary, 'whatsapp-send': send, 'copy-summary': copy
    })[id],
    querySelectorAll: selector => ({
      '[data-language-link]': [languageLink], '[data-whatsapp-link]': [contactLink], '[data-project-context]': [context]
    })[selector] || []
  };
  const mediaListeners = {};
  const window = {
    PROJECTCONS_CONFIG: {whatsapp: number},
    location: {href: 'https://example.test/index.html?categoria=bodegas&referencia=QA#contacto', search: '?categoria=bodegas&referencia=QA', hash: '#contacto', origin: 'https://example.test'},
    matchMedia: query => ({matches: false, addEventListener(type, handler) { mediaListeners[query] = handler; }}),
    addEventListener() {}, scrollY: 0,
    crypto: {getRandomValues(array) { array[0] = 12345; }},
    open() { throw new Error('Submitting the form must never open or send anything automatically'); }
  };
  const navigator = clipboardAvailable ? {clipboard: {async writeText(text) { navigator.copied = text; }}} : {};
  vm.runInNewContext(appCode, {document, window, navigator, URL, URLSearchParams});
  assert.equal(stepOne.disabled, false); assert.equal(stepTwo.disabled, false);
  assert.equal(stepTwo.hidden, true); assert.equal(submit.hidden, true); assert.equal(next.hidden, false);
  assert.equal(form.noValidate, true);
  assert.equal(fields.category.value, 'bodegas');
  assert.ok(context.textContent.endsWith('QA'));
  assert.equal(languageLink.href, 'https://example.test/en/index.html?categoria=bodegas&referencia=QA#contacto');
  menu.handlers.click(); assert.equal(menu.attrs['aria-expanded'], 'true');
  document.handlers.keydown({key: 'Escape'}); assert.equal(menu.attrs['aria-expanded'], 'false'); assert.equal(menu.focused, true);
  menu.handlers.click(); mediaListeners['(min-width: 1001px)']({matches: true}); assert.equal(menu.attrs['aria-expanded'], 'false');
  next.handlers.click(); assert.equal(form.dataset.currentStep, '1'); assert.equal(result.hidden, true);
  fields.name.value = '   '; fields.phone.value = '+1 (555) 010-0101'; fields.location.value = 'La Paz';
  next.handlers.click(); assert.equal(form.dataset.currentStep, '1', 'Spaces are not a valid name');
  fields.name.value = 'Prueba QA'; fields.phone.value = 'bad phone';
  next.handlers.click(); assert.equal(form.dataset.currentStep, '1', 'Invalid phone must stay on step one');
  fields.phone.value = '+1 (555) 010-0101';
  next.handlers.click(); assert.equal(form.dataset.currentStep, '2'); assert.equal(stepTwo.hidden, false); assert.equal(submit.hidden, false);
  back.handlers.click(); assert.equal(form.dataset.currentStep, '1');
  form.handlers.submit({preventDefault() {}}); assert.equal(form.dataset.currentStep, '2', 'Enter at step one moves to step two');
  form.handlers.submit({preventDefault() {}}); assert.equal(result.hidden, true); assert.ok(fields.consent.focused);
  fields.consent.checked = true; fields.consent.handlers.change();
  fields.message.value = 'QA: construcción & diseño #1';
  form.handlers.submit({preventDefault() {}});
  assert.equal(result.hidden, false);
  assert.ok(summary.value.includes('QA: construcción & diseño #1')); assert.ok(summary.value.includes('PC-')); assert.ok(summary.value.includes('QA'));
  assert.ok(summary.value.startsWith(lang === 'en' ? 'Hello PROJECTCONS' : 'Hola PROJECTCONS'));
  if (number === '526121363583') {
    assert.equal(send.hidden, false);
    const url = new URL(send.href);
    assert.equal(url.origin, 'https://wa.me'); assert.equal(url.pathname, '/526121363583');
    assert.equal(url.searchParams.get('text'), summary.value);
    assert.ok(status.textContent.includes(lang === 'en' ? 'Nothing has been sent' : 'no se ha enviado'));
  } else {
    assert.equal(send.hidden, true); assert.equal(send.href, undefined);
    assert.equal(contactLink.href, '#contacto');
  }
  await copy.handlers.click();
  if (clipboardAvailable) assert.equal(navigator.copied, summary.value);
  else assert.equal(summary.selected, true, 'Copy fallback selects the text without claiming success');
  fields.name.handlers.input();
  assert.equal(result.hidden, true); assert.equal(send.hidden, true);
}

(async () => {
  checkGallery('es'); checkGallery('en');
  await checkForm('es', '526121363583');
  await checkForm('en', '526121363583');
  await checkForm('es', '526240000000');
  await checkForm('en', '', false);
  console.log('OK: ES/EN galleries, keyboard/swipe/wrap, opt-in playback and reduced motion; menu; safe progressive form, validation, consent, summary, copy, language/project context and WhatsApp URL. No message sent. Simulated DOM; browser verification is separate.');
})().catch(error => { console.error(error); process.exitCode = 1; });
