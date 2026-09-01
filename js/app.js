(() => {
  'use strict';
  const data = window.PROJECTCONS_DATA;
  const config = window.PROJECTCONS_CONFIG || {};
  const nav = document.getElementById('category-nav');
  const content = document.getElementById('category-content');
  const menu = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (!data || !nav || !content) return;

  const icons = ['⌂','▤','▥','◇','✓','★'];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  data.categories.forEach((cat, index) => {
    const button = document.createElement('button');
    button.className = 'category-link' + (index === 0 ? ' active' : '');
    button.type = 'button';
    button.dataset.target = cat.id;
    button.innerHTML = `<span class="cat-icon">${icons[index] || '◇'}</span><span>${escapeHTML(cat.title)}</span>`;
    button.addEventListener('click', () => {
      document.getElementById(`cat-${cat.id}`)?.scrollIntoView({behavior:'smooth', block:'start'});
      document.querySelectorAll('.category-link').forEach(x => x.classList.remove('active'));
      button.classList.add('active');
    });
    nav.appendChild(button);

    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = `cat-${cat.id}`;
    section.dataset.category = cat.id;
    section.innerHTML = `
      <div class="category-heading">
        <div><span class="category-kicker">CATEGORÍA DE PROYECTOS</span><h3>${escapeHTML(cat.title)}</h3><p>${escapeHTML(cat.subtitle)}</p></div>
        <span class="project-count">${cat.projects.length} proyectos mostrados</span>
      </div>
      <div class="project-list">
        ${cat.projects.map((project, i) => `
          <article class="project-card">
            <div class="project-image"><img src="${project.image}" alt="${escapeHTML(project.name)} — ${escapeHTML(cat.title)}" loading="${index === 0 && i === 0 ? 'eager':'lazy'}" onerror="this.onerror=null;this.classList.add('image-missing');this.alt='Imagen no disponible';this.removeAttribute('src');"></div>
            <div class="project-info">
              <span class="project-number">PROYECTO ${String(i+1).padStart(2,'0')}</span>
              <h4>${escapeHTML(project.name)}</h4>
              <p>${escapeHTML(project.description)}</p>
              <div class="project-specs">${project.specs.map(s => `<span>${escapeHTML(s)}</span>`).join('')}</div>
            </div>
          </article>`).join('')}
      </div>`;
    content.appendChild(section);
  });

  menu?.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
  });
  document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('menu-open');
  }));

  const sections = [...document.querySelectorAll('.category-section')];
  const links = [...document.querySelectorAll('.category-link')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) links.forEach(link => link.classList.toggle('active', link.dataset.target === entry.target.dataset.category));
    }), {rootMargin:'-25% 0px -60% 0px', threshold:0});
    sections.forEach(section => observer.observe(section));

    const anchors = [...document.querySelectorAll('.main-nav a')];
    const observed = [...document.querySelectorAll('main section[id]')];
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) anchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }), {rootMargin:'-45% 0px -45% 0px'});
    observed.forEach(s => navObserver.observe(s));
  }

  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const error = document.getElementById('formError');
    const fields = [...form.querySelectorAll('[required]')];
    fields.forEach(field => field.setAttribute('aria-invalid', String(!field.checkValidity())));
    if (!form.checkValidity()) {
      if (error) error.textContent = 'Revisa los campos obligatorios antes de continuar.';
      form.querySelector(':invalid')?.focus();
      return;
    }
    if (error) error.textContent = '';
    const fd = new FormData(form);
    const phone = config.whatsapp || '526240000000';
    const leadId = `PC-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const params = new URLSearchParams(location.search);
    const source = params.get('utm_source') || document.referrer || 'Sitio web directo';
    const text = [
      'Hola, quiero solicitar una evaluación inicial de mi proyecto.',
      '', `Folio: ${leadId}`, `Nombre: ${fd.get('nombre')}`, `Teléfono: ${fd.get('telefono')}`,
      `Tipo de proyecto: ${fd.get('proyecto')}`, `Ubicación: ${fd.get('ubicacion')}`,
      `Etapa actual: ${fd.get('etapa')}`, `Rango de inversión: ${fd.get('presupuesto')}`,
      `Inicio estimado: ${fd.get('inicio')}`, '', 'Descripción:', fd.get('mensaje'), '', `Origen: ${source}`
    ].join('\n');
    try { sessionStorage.setItem('projectcons_lead', JSON.stringify({leadId, createdAt: new Date().toISOString()})); } catch (_) {}
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });

  form?.querySelectorAll('[required]').forEach(field => field.addEventListener('input', () => {
    if (field.checkValidity()) field.removeAttribute('aria-invalid');
  }));

  document.querySelectorAll('[data-whatsapp-link]').forEach(link => {
    const welcome = 'Hola, me interesa cotizar un proyecto en La Paz.';
    link.href = `https://wa.me/${config.whatsapp || '526240000000'}?text=${encodeURIComponent(welcome)}`;
  });
})();
