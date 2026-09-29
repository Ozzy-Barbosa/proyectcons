# Registro de verificación · 29 de septiembre de 2026

## Migración a Astro + TypeScript: comprobaciones locales

Este bloque corresponde a la nueva entrega de 64 páginas. La publicación histórica de 62 páginas se conserva más abajo y no prueba el despliegue de esta migración.

- `npm run check`: aprobado; 17 archivos revisados, 0 errores, 0 advertencias y 0 indicaciones.
- Compilación de Astro disponible en `dist/`: 64 HTML, 30 páginas de contenido + privacidad + 404 por idioma. Nosotros tiene sus propias rutas `nosotros.html` y `en/nosotros.html`.
- `node scripts/check-site.cjs`: aprobado sobre `dist/`, no sobre HTML antiguo de la raíz. Conserva 42 galerías y 210 referencias a fotografías de diapositivas; cinco archivos distintos por galería. Las colecciones de ejemplo se reutilizan entre fichas.
- Se comprobaron enlaces, anclas, recursos, `srcset`, dimensiones, IDs, títulos, JSON-LD, metadatos, canonical, pares `hreflang`, idioma heurístico, formulario, contacto confirmado y `noindex` de la vista previa.
- Nueva portada: una única imagen prioritaria, fotografía propia `residencial-01.jpeg`. Navegación Nosotros localizada, independiente del inicio e identificada como página actual. Cinco preguntas con grupo exclusivo y controles nativos `details/summary`.
- `node scripts/check-interactions.cjs`: aprobado de nuevo para formulario, consentimiento, resumen, copia, idiomas/contexto, galería y menú. No se envió ningún mensaje.
- `node scripts/check-faq.cjs`: aprobado. Apertura exclusiva, cierre, transiciones interrumpidas, movimiento reducido, alternativa sin animación, cambios de tamaño y cambios nativos.
- Sin enlaces de instalación PWA ni service worker en la entrega. Se trata de una aplicación web multipágina, no de una aplicación instalable ni de un panel administrativo.
- `git diff --check`: sin errores de espacios en la comprobación realizada.

Las pruebas de interacción anteriores usan un DOM simulado. El servidor local y ambos verificadores inspeccionan `dist/` por defecto; si falta la compilación, fallan en lugar de validar archivos antiguos. `check-live.cjs` compara también el contenido publicado de CSS y JavaScript, y comprueba variantes de imagen `srcset`.

### Navegador real: nueva entrega Astro

- Inicio: inspección visual a 1440 × 960, 768 × 1024, 390 × 844 y 320 × 740, con fotografías cargadas y sin desbordamiento horizontal. Se revisaron ambas ediciones en móvil.
- Nosotros: navegación real desde el encabezado; página independiente, estado activo y cambio a su equivalente en inglés. Vista de escritorio y móvil revisadas.
- Menú móvil en inglés: abre mediante teclado y permite volver a Home.
- FAQ: apertura con Enter y Espacio; al seleccionar otra pregunta queda exactamente un `details[open]`. Se comprobó la respuesta asentada y la ausencia de rotación en el texto. Prueba en español e inglés.
- Formulario inglés: avance entre pasos, datos ficticios, consentimiento y preparación del resumen. Destino correcto `https://wa.me/526121363583`. No se abrió WhatsApp ni se envió el mensaje.
- Galería residencial: siguiente y quinta miniatura activan una sola fotografía. Su CTA preserva categoría y referencia al volver al formulario; el selector de idioma conserva ese contexto.
- Se retiró la transición nativa entre documentos después de observar `InvalidStateError` en el navegador integrado. Se repitieron navegación, galería y retorno al formulario tras reconstruir: sin nuevos errores de consola. Se conservan las animaciones de entrada y del acordeón.
- Se ocultó el botón flotante redundante en Inicio para que no cubra fotografía, texto ni controles en pantallas pequeñas. Los contactos principales y el formulario siguen disponibles.
- Nombre visible y metadatos unificados a **PROYECTCONS**, como el logotipo original; identificadores internos existentes se conservan por compatibilidad.

Movimiento reducido y cambios de tamaño durante una animación cuentan con pruebas de lógica; no se verificaron en un teléfono físico. La publicación de esta nueva entrega se registra cuando se confirme el despliegue.

## Historial: comprobaciones locales de la entrega anterior de 62 páginas

- Generación: 62 HTML, español/inglés, 29 páginas de contenido + privacidad + 404 por idioma.
- `node scripts/check-site.cjs`: aprobado. Enlaces, recursos, srcset, proporciones, IDs, títulos, JSON-LD, idioma, pares hreflang, canonical, contacto confirmado y noindex de la vista previa.
- 42 galerías (21 por idioma), cinco archivos distintos por galería. Se reutilizan colecciones de referencia; no son 210 fotografías originales diferentes.
- `node scripts/check-interactions.cjs`: aprobado. Pruebas con DOM simulado para menú, carrusel, teclado/swipe, movimiento reducido, pausa/reproducción, consentimiento, resumen, copia y destinos WhatsApp.
- `git diff --check`: sin errores de espacios.

## Historial: navegador real de la entrega anterior

Se abrió la presentación local bajo `/proyectcons/`, equivalente a la ruta de GitHub Pages.

- Portada revisada visualmente en escritorio 1440 × 1000 y móvil390 ×844.
- Revisión móvil320px: inicio ES/EN, proyectos, servicios, categoría social y ficha inglesa. Se corrigió un pequeño desbordamiento de los indicadores de experiencia en320px; comprobado de nuevo sin desbordamiento.
- Tablet768px: proyectos sin desbordamiento.
- Navegación móvil abre; enlace Servicios navega y cierra menú.
- Selector ES/EN abre la misma página; banners, pies, servicios y contenido traducidos.
- Carrusel: flecha siguiente, quinta miniatura, navegación Inicio por teclado y créditos diferenciados entre portafolio propio/referencia.
- Formulario español: campos obligatorios y consentimiento rechazan consulta incompleta; resumen incluye folio y enlace codificado al526121363583.
- CTA de ficha inglesa: conserva idioma, categoría residencial y referencia Sargento—Residence al llegar al formulario; selector conserva ese contexto.
- Formulario inglés: nombre y teléfono internacional ficticios, consentimiento y resumen completo en inglés; destino526121363583 y referencia conservada. Sin envío.
- Sin errores de consola observados en la revisión y sin imágenes visibles rotas.

No se envió ningún WhatsApp ni se transmitió una solicitud de prueba. Los valores utilizados fueron ficticios. Swipe, movimiento reducido y fullscreen cuentan con pruebas de lógica; no se probaron en un teléfono físico/iPhone.

## Estado del contenido

El sitio es una presentación pública para revisión, no la aprobación comercial definitiva. Mantiene noindex. Pendientes del cliente: catálogo final de servicios, fotografías propias/autorizadas, datos/nombres de fichas, validación del aviso de privacidad, dominio comercial y datos de Perfil de Empresa. El posicionamiento y la indexación de Google no están verificados ni garantizados.

## Historial: publicación comprobada de la entrega anterior

- URL pública: https://ozzy-barbosa.github.io/proyectcons/
- Commit del rediseño: `bdb6452cc8a96d1f1ccc7118f916ad0e5c84f64c`.
- Pages desde `main` y `/`, HTTPS obligatorio. La API confirmó `status: built` el2026-09-29T08:09:25Z, sin error.
- Portada pública abierta e inspeccionada en navegador: diseño, fotografía, selector inglés, noindex y destino WhatsApp correctos; sin errores de consola observados.
- `node scripts/check-live.cjs`:62HTML públicos coinciden byte a byte con las páginas locales normalizando finales de línea;38recursos utilizados devuelven HTTP200. Una URL inexistente profunda devuelve HTTP404 y la página personalizada.
- Primera consulta concurrente tuvo un error transitorio de red; una comprobación individual devolvió200 y la repetición completa pasó. No se desactivó TLS ni se modificaron certificados.
- Este registro documenta publicación y funcionamiento; no confirma indexación ni posición en buscadores.
