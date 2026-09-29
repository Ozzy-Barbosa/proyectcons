/* Static release audit. Run after: node scripts/build-pages.cjs */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const check = (condition, file, message) => { if (!condition) fail(file, message); };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry =>
  entry.name.startsWith('.') || ['node_modules', 'tmp', 'test-results'].includes(entry.name) ? [] :
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const files = walk(root).filter(file => file.endsWith('.html')).map(file => path.relative(root, file).replaceAll('\\', '/'));
const pages = new Map(files.map(file => [file, read(file)]));
const decode = value => String(value).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const attrs = markup => Object.fromEntries([...markup.matchAll(/(?:^|\s)([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)].map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? '')]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]*?)>`, 'gi'))].map(m => attrs(m[1]));
const text = html => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const context = {window:{}};
vm.runInNewContext(read('js/config.js'), context);
const config = context.window.PROJECTCONS_CONFIG;
const base = new URL(config.domain);
const publicURL = file => new URL(file === 'index.html' ? '' : file, base).href;
const catalog = JSON.parse(read('content/catalog.json'));
const expectedCounts = [5, 6, 2, 4, 4];
const expectedKeys = ['index.html', 'proyectos.html', 'servicios.html', 'privacidad.html', '404.html'];
catalog.categories.forEach(cat => {
  expectedKeys.push(`proyectos/${cat.id}/index.html`);
  for (let i = 1; i <= cat.count; i++) expectedKeys.push(`proyectos/${cat.id}/proyecto-${String(i).padStart(2, '0')}.html`);
});
const expectedFiles = new Set(expectedKeys.flatMap(file => [file, `en/${file}`]));
check(files.length === 62, 'sitio', `Se esperaban 62 páginas ES/EN; hay ${files.length}`);
check(JSON.stringify(catalog.categories.map(cat => cat.count)) === JSON.stringify(expectedCounts), 'catálogo', 'Las cinco categorías deben conservar 5, 6, 2, 4 y 4 proyectos');
for (const file of expectedFiles) check(pages.has(file), file, 'Página requerida faltante');
for (const file of files) check(expectedFiles.has(file), file, 'HTML fuera de la estructura aprobada');
check(config.whatsapp === '526121363583', 'config', 'WhatsApp debe coincidir con el contacto confirmado');
check(config.phoneDisplay.replace(/\D/g, '') === config.whatsapp, 'config', 'Teléfono visible y WhatsApp no coinciden');
check(base.protocol === 'https:' && base.hostname === 'ozzy-barbosa.github.io' && base.pathname === '/proyectcons/', 'config', 'La URL de esta vista previa debe incluir /proyectcons/');
check(config.preview === true, 'config', 'La entrega de revisión debe conservar preview: true');

// Resolve both relative resources and same-site absolute URLs, including Pages' subdirectory.
function localTarget(file, value) {
  let parsed;
  try { parsed = new URL(decode(value), publicURL(file)); } catch { fail(file, `URL inválida: ${value}`); return null; }
  if (!['https:', 'http:'].includes(parsed.protocol)) {
    if (!['tel:', 'mailto:', 'data:'].includes(parsed.protocol)) fail(file, `Protocolo no permitido: ${value}`);
    return null;
  }
  if (parsed.origin !== base.origin) return null;
  if (!parsed.pathname.startsWith(base.pathname)) { fail(file, `URL fuera de /proyectcons/: ${value}`); return null; }
  let target;
  try { target = decodeURIComponent(parsed.pathname.slice(base.pathname.length)); } catch { fail(file, `Ruta mal codificada: ${value}`); return null; }
  if (!target || target.endsWith('/')) target += 'index.html';
  return {file:target, hash:parsed.hash.slice(1)};
}
function resource(file, value) {
  const target = localTarget(file, value);
  if (!target) return null;
  const absolute = path.resolve(root, target.file);
  if (!absolute.startsWith(root + path.sep)) { fail(file, `Recurso fuera del proyecto: ${value}`); return target; }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) { fail(file, `Recurso faltante: ${value}`); return target; }
  if (target.hash && target.file.endsWith('.html')) {
    let anchor;
    try { anchor = decodeURIComponent(target.hash); } catch { fail(file, `Ancla mal codificada: ${value}`); return target; }
    const destination = pages.get(target.file) ?? read(target.file);
    const ids = [...destination.matchAll(/(?:\s)id="([^"]+)"/g)].map(m => decode(m[1]));
    check(ids.includes(anchor), file, `Ancla faltante: ${value}`);
  }
  return target;
}
const titles = new Map();
const canonicalURLs = new Set();
const placeholder = /526240000000|\+52\s*624\s*000\s*0000|hola@proyectcons\.com|tudominio\.com|example\.com|lorem\s+ipsum/gi;
const spanishUI = /\b(?:inicio|nosotros|proyectos|servicios|cotizar|cuéntanos|contáctanos|fotografía|fotografías|galería|galerías|anterior|siguiente|reproducir|ampliar|selecciona|presupuesto|teléfono|formulario|preparación|documentación|superficie|construcción|residenciales|comerciales|bodegas|privacidad|obligatorios|asesoría)\b/giu;
let galleryCount = 0;
let galleryImages = 0;
for (const [file, html] of pages) {
  const isEnglish = file.startsWith('en/');
  const lang = isEnglish ? 'en' : 'es-MX';
  const key = file.replace(/^en\//, '');
  const equivalent = isEnglish ? key : `en/${key}`;
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => decode(m[1]));
  check(new Set(ids).size === ids.length, file, 'IDs duplicados');
  check(tags(html, 'h1').length === 1, file, 'Se requiere exactamente un H1');
  check(tags(html, 'html')[0]?.lang === lang, file, `Idioma raíz distinto de ${lang}`);
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  check(!!title && !titles.has(title), file, `Título faltante o duplicado${titles.has(title) ? ` con ${titles.get(title)}` : ''}`);
  titles.set(title, file);
  const metadata = tags(html, 'meta');
  check(metadata.filter(m => m.name === 'description' && m.content?.trim()).length === 1, file, 'Descripción única requerida');
  check(metadata.filter(m => m.name === 'robots' && /\bnoindex\b/i.test(m.content) && /\bfollow\b/i.test(m.content)).length === 1, file, 'Toda vista previa debe tener noindex, follow');
  check(![...html.matchAll(placeholder)].length, file, 'Contacto/dominio de plantilla o lorem ipsum');
  const links = tags(html, 'link');
  const canonicals = links.filter(a => a.rel === 'canonical');
  check(canonicals.length === 1 && canonicals[0].href === publicURL(file), file, 'Canonical propio incorrecto');
  if (canonicals[0]) { check(!canonicalURLs.has(canonicals[0].href), file, 'Canonical duplicado'); canonicalURLs.add(canonicals[0].href); }
  const alternate = links.filter(a => a.rel === 'alternate' && a.hreflang);
  check(alternate.length === 3, file, 'Se requieren variantes es-MX, en y x-default');
  for (const [locale, target] of [['es-MX', key], ['en', `en/${key}`], ['x-default', key]]) {
    const matches = alternate.filter(a => a.hreflang === locale);
    check(matches.length === 1 && matches[0].href === publicURL(target), file, `hreflang ${locale} incorrecto o no recíproco`);
  }
  const languageLinks = tags(html, 'a').filter(a => 'data-language-link' in a);
  check(languageLinks.length === 1, file, 'Debe existir un selector de idioma');
  if (languageLinks[0]) check(localTarget(file, languageLinks[0].href)?.file === equivalent, file, 'Selector de idioma no conserva la página equivalente');
  for (const tag of tags(html, '(?:a|link|script|img|source|iframe|video|audio)')) {
    for (const key of ['href', 'src', 'poster']) if (tag[key]) resource(file, tag[key]);
    if (tag.srcset) {
      const descriptors = [];
      for (const candidate of tag.srcset.split(',')) {
        const parts = candidate.trim().split(/\s+/);
        check(parts.length === 2 && /^\d+(?:\.\d+)?[wx]$/.test(parts[1]), file, `srcset inválido: ${candidate}`);
        descriptors.push(parts[1]);
        resource(file, parts[0]);
      }
      check(new Set(descriptors).size === descriptors.length, file, 'Descriptores srcset duplicados');
    }
    if (tag.href?.startsWith('tel:')) check(tag.href === `tel:+${config.whatsapp}`, file, 'Teléfono no confirmado');
    if (tag.href?.startsWith('https://wa.me/')) check(new URL(tag.href).pathname === `/${config.whatsapp}`, file, 'Destino WhatsApp no confirmado');
  }
  for (const img of tags(html, 'img')) {
    check('alt' in img, file, 'Imagen sin atributo alt');
    check(Number(img.width) > 0 && Number(img.height) > 0, file, 'Imagen sin dimensiones');
    if (img.src?.includes('/optimized/') && !img.class?.includes('brand-logo')) check(!!img.srcset && !!img.sizes, file, 'Foto sin srcset/sizes');
  }
  for (const tag of tags(html, '(?:button|input|a|section|nav|div)')) {
    for (const key of ['aria-controls', 'aria-labelledby', 'aria-describedby']) if (tag[key]) {
      for (const id of tag[key].split(/\s+/)) check(ids.includes(id), file, `Referencia ${key} faltante: ${id}`);
    }
  }
  const structured = [];
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const data = JSON.parse(match[1]); structured.push(...(Array.isArray(data) ? data : [data])); } catch { fail(file, 'JSON-LD inválido'); }
  }
  const webPage = structured.find(item => item['@type'] === 'WebPage');
  check(webPage?.url === publicURL(file) && webPage?.inLanguage === lang, file, 'WebPage JSON-LD no coincide con URL/idioma');
  for (const item of structured) {
    check(item['@context'] === 'https://schema.org', file, 'Contexto JSON-LD inesperado');
    if (item['@type'] === 'BreadcrumbList') item.itemListElement?.forEach((entry, i) => {
      check(entry.position === i + 1 && !!entry.name, file, 'Breadcrumb JSON-LD incompleto');
      resource(file, entry.item);
    });
    if (item['@type'] === 'GeneralContractor') {
      check(item.telephone === `+${config.whatsapp}`, file, 'Contacto JSON-LD incorrecto');
      check(!item.aggregateRating && !item.review, file, 'No añadir reseñas sin confirmar');
    }
  }
  if (isEnglish) {
    // Names, URL slugs and the intentional Spanish-language switch are not untranslated UI.
    const withoutSwitch = html.replace(/<a\b[^>]*data-language-link[^>]*>[\s\S]*?<\/a>/gi, '');
    const visibleText = text(withoutSwitch);
    const accessibleText = tags(withoutSwitch, '(?:img|button|a|nav|section|div|input|textarea|figure)').flatMap(a => [a.alt, a['aria-label'], a.placeholder].filter(Boolean)).join(' ');
    const untranslated = [...(visibleText + ' ' + accessibleText).matchAll(spanishUI)].map(m => m[0]);
    check(untranslated.length === 0, file, `Posible texto español sin traducir: ${[...new Set(untranslated)].join(', ')}`);
  }
  if (/proyecto-\d+\.html$/.test(file)) {
    galleryCount++;
    const slides = [...html.matchAll(/<figure\b([^>]*\bdata-slide\b[^>]*)>([\s\S]*?)<\/figure>/gi)];
    const sources = slides.map(slide => tags(slide[2], 'img')[0]?.src).filter(Boolean);
    galleryImages += sources.length;
    check(sources.length >= 5 && slides.length === sources.length, file, 'Se requieren al menos cinco fotos en la galería');
    check(new Set(sources).size === sources.length, file, 'Fotos repetidas dentro de la misma galería');
    check(tags(html, 'button').filter(a => 'data-thumb' in a).length === slides.length, file, 'Miniaturas y diapositivas no coinciden');
    for (const attr of ['data-gallery', 'data-gallery-play', 'data-gallery-expand', 'data-gallery-prev', 'data-gallery-next', 'data-gallery-status', 'data-gallery-progress']) check(html.includes(attr), file, `Control de galería faltante: ${attr}`);
    for (const slide of slides) if (slide[2].includes('/ref-')) {
      check(slide[2].includes('https://www.pexels.com/photo/'), file, 'Foto de referencia sin crédito a la fuente');
      check(slide[2].includes(isEnglish ? 'REFERENCE IMAGE' : 'IMAGEN DE REFERENCIA'), file, 'Foto de terceros sin identificación visible');
    }
    check(html.includes(isEnglish ? 'Third-party illustrative images.' : 'Imágenes ilustrativas de terceros.'), file, 'Galería sin aviso sobre ejemplos');
  }
  if (key === 'servicios.html') {
    check(tags(html, 'figure').filter(a => a.class?.split(/\s+/).includes('service-photo')).length === 6, file, 'Servicios debe mostrar seis fotografías');
    check(html.includes(isEnglish ? 'Service proposal under review.' : 'Propuesta de servicios en revisión.'), file, 'Falta aviso de servicios por confirmar');
  }
  if (['servicios.html', 'proyectos.html'].includes(key)) check(tags(html, 'section').some(a => a.class?.split(/\s+/).includes('page-banner')), file, 'Falta banner de la página');
  if (key === 'index.html') {
    check(html.includes('+18') && html.includes('+60') && html.includes('2008'), file, 'Faltan cifras confirmadas de trayectoria');
    check(!html.includes('category-content') && !html.includes('js/data.js'), file, 'Catálogo antiguo aún presente en inicio');
    check(ids.includes('quote-form') && ids.includes('quote-summary') && ids.includes('whatsapp-send'), file, 'Formulario/resumen/destino WhatsApp incompletos');
    const requiredFields = tags(html, '(?:input|select)').filter(a => 'required' in a).map(a => a.name);
    for (const name of ['category', 'location', 'name', 'phone', 'consent']) check(requiredFields.includes(name), file, `Campo obligatorio faltante: ${name}`);
    for (const label of tags(html, 'label')) if (label.for) check(ids.includes(label.for), file, `Etiqueta de campo sin destino: ${label.for}`);
    check(/<noscript>[\s\S]*wa\.me\/526121363583[\s\S]*<\/noscript>/.test(html), file, 'Falta alternativa de contacto sin JavaScript');
  }
  if (key === '404.html') {
    // Pages serves the root 404 document without changing the originally requested URL.
    const missingURL = new URL(`${isEnglish ? 'en/' : ''}missing/deep/page/`, base);
    const baseHref = tags(html, 'base')[0]?.href;
    const effectiveBase = baseHref ? new URL(baseHref, missingURL) : missingURL;
    const broken = [];
    for (const tag of tags(html, '(?:a|link|script|img)')) for (const attr of ['href', 'src']) {
      const value = tag[attr];
      if (!value || value.startsWith('#')) continue;
      const intended = new URL(value, publicURL(file));
      if (intended.origin === base.origin && new URL(value, effectiveBase).pathname !== intended.pathname) broken.push(value);
    }
    check(broken.length === 0, file, `La página 404 falla en rutas inexistentes profundas: ${[...new Set(broken)].slice(0, 5).join(', ')}. Usar URLs absolutas o una base explícita`);
  }
}
check(galleryCount === 42, 'galerías', `Deben existir 42 galerías ES/EN; hay ${galleryCount}`);
const sitemap = read('sitemap.xml');
check(/<urlset\b/.test(sitemap) && !/<loc\b/.test(sitemap), 'sitemap.xml', 'La vista previa no debe anunciar páginas indexables');
const robots = read('robots.txt');
check(/Allow:\s*\//i.test(robots) && !/Disallow:\s*\//i.test(robots), 'robots.txt', 'Se debe permitir el rastreo para leer noindex');
for (const file of ['js/config.js', 'js/app.js', 'js/gallery.js', 'robots.txt', 'sitemap.xml']) {
  // A strict rejection guard is not a configured contact or destination; retain its protection.
  const source = read(file).replace(/whatsapp\s*!==\s*(['"])526240000000\1/g, 'whatsapp !== REJECTED_SAMPLE_NUMBER');
  check(![...source.matchAll(placeholder)].length, file, 'Contiene datos de plantilla publicados');
}
for (const css of walk(path.join(root, 'css')).filter(file => file.endsWith('.css'))) {
  const file = path.relative(root, css).replaceAll('\\', '/');
  for (const match of read(file).matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) resource(file, match[1]);
}
const manifest = JSON.parse(read('site.webmanifest'));
for (const icon of manifest.icons || []) resource('site.webmanifest', icon.src);
resource('site.webmanifest', manifest.start_url);
if (errors.length) {
  console.error(`${errors.length} error(es):\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`OK: ${files.length} páginas ES/EN; ${galleryCount} galerías y ${galleryImages} fotos; enlaces/recursos/srcset/anclas, idiomas/hreflang/canonical, títulos/IDs/JSON-LD, formularios, contactos y preview noindex verificados.`);
console.log('Nota: la auditoría lingüística es heurística; no sustituye la revisión editorial ni las pruebas visuales/interactivas en navegador.');
