const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const visuals = JSON.parse(fs.readFileSync(path.join(root, 'content/visual-references.json'), 'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function photo(file, prefix = '', eager = false) {
  const entry = visuals.photos[file];
  if (!entry || !/^[a-z0-9.-]+$/.test(file) || !fs.existsSync(path.join(root,'assets/images',file))) throw new Error('Referencia no disponible: '+file);
  return `<img src="${prefix}assets/images/${file}" alt="${esc(entry.alt)} — imagen ilustrativa" width="1600" height="1067" loading="${eager?'eager':'lazy'}"${eager?' fetchpriority="high"':''}>`;
}
function credit(file) {
  const entry = visuals.photos[file];
  return entry ? `Referencia visual · <a href="${esc(entry.source)}" target="_blank" rel="noopener noreferrer">${esc(entry.author)} / Pexels</a>` : '';
}
function banner(file, prefix='') {
  return `<div class="banner-photo">${photo(file,prefix,true)}</div>`;
}
function referenceProjects(category, index, project) {
  // Preserve customer photographs; complete drafts with explicitly credited references.
  if (project.images.length >= 5) return project;
  const pool = visuals.categories[category.id] || [];
  if (!pool.length) return project;
  if (project.ready) throw new Error('Una ficha publicada no puede utilizar una galería de ejemplo.');
  const images = [...new Set([...project.images, ...pool.map((_,i)=>pool[(i+index)%pool.length])])].slice(0,5);
  if (images.length < 5) throw new Error('La categoría requiere cinco imágenes distintas: '+category.id);
  return {...project, reference:true, images, description:project.images.length ? project.description : 'Selección de imágenes ilustrativas para visualizar esta categoría. No corresponde a una obra realizada por PROYECTCONS.'};
}
function servicesPreview(html) {
  let index=0;
  return html.replace('class="services"','class="services photo-services"')
    .replace('<div class="container">','<div class="container"><p class="pending-note"><strong>Vista previa de servicios.</strong> Los servicios, alcances y fotografías definitivos están pendientes de confirmación. Las imágenes son ilustrativas.</p>')
    .replace(/<article class="service-card">/g, () => {
      const file=visuals.services[index++];
      return `<article class="service-card"><figure class="service-photo">${photo(file)}<figcaption>${credit(file)}</figcaption></figure>`;
    });
}
module.exports={visuals,photo,credit,banner,referenceProjects,servicesPreview};
