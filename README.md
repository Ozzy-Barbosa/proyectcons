# PROYECTCONS · Arquitectura y construcción

Aplicación web multipágina con **Astro y TypeScript**, publicada como HTML estático en GitHub Pages. Componentes reutilizables, dos idiomas y JavaScript solo para las interacciones. No es una PWA, no requiere instalación y no tiene panel administrativo.

## Desarrollo y comprobación

```sh
npm ci
npm run dev
# Para verificar la versión que se publica:
npm run verify
node scripts/check-faq.cjs
node scripts/serve.cjs
```

Desarrollo: http://127.0.0.1:4321/proyectcons/. Vista de la compilación: http://127.0.0.1:4173/proyectcons/. `serve.cjs` sirve únicamente `dist/`; no utilizar Live Server sobre los archivos de origen.

Después de desplegar: `node scripts/check-live.cjs` compara por HTTP las páginas, CSS y JavaScript publicados con `dist/`, y comprueba imágenes y 404. Evidencia en `docs/VERIFICACION.md`.

Las páginas de `dist/` son resultados generados: **no editarlas directamente**. Astro conserva las URLs `.html` existentes bajo `/proyectcons/` y genera ambas ediciones. `scripts/build-pages.cjs` es el adaptador de contenido heredado: exporta las plantillas y los metadatos al proceso de Astro, ya no escribe HTML en la raíz.

## Dónde editar

- `src/components/Home.astro`: nueva portada y recorrido del inicio.
- `src/components/About.astro`: página independiente de Nosotros.
- `src/components/Faq.astro`: preguntas y respuestas en ambos idiomas.
- `src/components/ProjectImage.astro`: fotografías propias con tamaños optimizados.
- `src/layouts/`: estructura global del documento.
- `src/pages/`: rutas estáticas de Astro; `src/lib/`: datos y adaptación de plantillas existentes para conservar portafolio, servicios, navegación, formulario y SEO.
- `css/redesign.css`: composición de Inicio, Nosotros y preguntas animadas.
- `css/styles.css`: sistema visual editorial, responsive, animaciones y movimiento reducido.
- `js/config.js`: contacto confirmado, URL pública y `preview`.
- `content/catalog.json`: cinco categorías y 21 fichas. El orden define `proyecto-01.html`, etc.; no reordenar URLs publicadas sin redirecciones.
- `content/visual-references.json`: fotos de referencia, autores, fuentes y colecciones por categoría.
- `js/app.js`: menú, idioma, apariciones progresivas y formulario.
- `js/gallery.js`: carrusel, miniaturas, swipe, teclado, fullscreen y reproducción opcional.
- `js/faq.js`: acordeón exclusivo, animación de caída y movimiento reducido.
- `scripts/check-site.cjs`: páginas, metadatos, rutas, imágenes, idiomas y protecciones del contenido provisional.
- `scripts/check-interactions.cjs`: pruebas de interacciones con DOM simulado; no sustituye la revisión en navegador.
- `scripts/check-faq.cjs`: apertura exclusiva, cierre, clics rápidos, cambios de tamaño y alternativas sin animación.
- `docs/ASSETS.md`: imágenes y regeneración WebP.
- `docs/SEO-Y-PUBLICACION.md`: investigación SEO local y checklist de lanzamiento.
- `docs/PROMPT-DISENO.md`: prompt reutilizable para la siguiente revisión visual.

## Ediciones y páginas

Hay 30 páginas de contenido por idioma: inicio, nosotros, proyectos, servicios, cinco categorías y 21 fichas. Cada edición tiene además privacidad y 404: **64 HTML** en total. La edición inglesa está en `en/`, y el selector enlaza a la misma página del otro idioma. Navegación, formularios, errores, pies, galería y metadatos están traducidos. Esto no constituye una promesa de atención humana en inglés.

## Fotografías y contenido provisional

Los originales se conservan. Se sirven derivados WebP con tamaños reales y `srcset`; generarlos de nuevo con `node scripts/optimize-images.cjs` (requiere Sharp; puede usar el runtime de Codex o una instalación local).

Cada ficha contiene cinco archivos distintos. Las 22 referencias de terceros se reutilizan entre fichas de la misma categoría: **no representan 21 obras fotografiadas ni 105 fotos únicas**. Sargento y CEDIS COMEX conservan su material y completan sus galerías con referencias identificadas. Confirmar nombres y asociaciones con el cliente. Las fotos de vivienda no son desarrollos avalados por INFONAVIT.

Los servicios se muestran como propuesta pendiente de confirmación. No se inventan domicilios, horarios, certificaciones, precios, reseñas ni financiamientos.

Para completar una ficha, editar `name`, `description`, `images` y `ready` en el catálogo. Usar 5–10 fotos propias autorizadas. La marca `ready` no debe activarse con referencias. Acompañar cambios editoriales con traducción ES/EN en la plantilla; actualmente las descripciones de presentación provisionales son comunes.

## Contacto y privacidad

WhatsApp confirmado: **+52 612 136 3583**. El formulario pide información en dos pasos, genera un folio y presenta un resumen. El visitante decide abrir WhatsApp y enviar el mensaje; no se simula recepción. Se puede copiar el resumen. No hay base de datos, cookies de seguimiento, analítica ni almacenamiento local de datos personales. No se envían mensajes al probar.

No hay automatización CRM: el folio organiza la consulta, pero no crea recordatorios, estados ni historial fuera de WhatsApp. Esa integración requiere un alcance adicional. El aviso de privacidad es de revisión y debe validarse/completarse por el negocio antes del lanzamiento comercial.

## Publicación de avance y SEO

URL configurada: https://ozzy-barbosa.github.io/proyectcons/. GitHub Actions compila y publica **solo `dist/`**, no la raíz del repositorio. La configuración de Pages debe utilizar GitHub Actions. Publicar implica comprobar, hacer commit/push, esperar el despliegue y verificar la URL pública. Las dependencias se fijan en `package-lock.json`.

`preview: true` mantiene **todas las páginas con noindex**, permite rastrearlas y deja el sitemap vacío. La presentación es pública, no privada. El cliente puede abrirla con el enlace; esta versión de ejemplos no se solicita a Google como portafolio definitivo.

Para producción: confirmar contenidos y dominio comercial, completar fotos/fichas/servicios/privacidad, cambiar `preview` a `false`, regenerar, verificar el sitemap y registrar Search Console/Perfil de Empresa. Las fichas `ready: false`, privacidad y servicios aún no aprobados permanecen fuera del índice. No se garantiza una posición en Google.

## Interacción accesible

Controles de teclado, foco visible, etiquetas, textos alternativos, consentimiento, navegación táctil y preferencia `prefers-reduced-motion`. Carrusel opt-in cada 6.5 segundos; se pausa al navegar manualmente, enfocar controles, ocultar pestaña o salir de la vista. Sin JavaScript se muestran todas las fotografías; el formulario queda inhabilitado con alternativa directa a WhatsApp.

Las preguntas usan `details/summary` nativos y un grupo exclusivo. JavaScript añade transición de altura y caída suave; en movimiento reducido se abren y cierran sin animación. Se mantiene navegación multipágina normal, sin interceptar enlaces ni añadir un enrutador de cliente.
