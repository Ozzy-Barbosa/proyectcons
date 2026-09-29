# Registro de verificación · 29 de septiembre de 2026

## Comprobaciones locales

- Generación: 62 HTML, español/inglés, 29 páginas de contenido + privacidad + 404 por idioma.
- `node scripts/check-site.cjs`: aprobado. Enlaces, recursos, srcset, proporciones, IDs, títulos, JSON-LD, idioma, pares hreflang, canonical, contacto confirmado y noindex de la vista previa.
- 42 galerías (21 por idioma), cinco archivos distintos por galería. Se reutilizan colecciones de referencia; no son 210 fotografías originales diferentes.
- `node scripts/check-interactions.cjs`: aprobado. Pruebas con DOM simulado para menú, carrusel, teclado/swipe, movimiento reducido, pausa/reproducción, consentimiento, resumen, copia y destinos WhatsApp.
- `git diff --check`: sin errores de espacios.

## Navegador real

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

## Publicación comprobada

- URL pública: https://ozzy-barbosa.github.io/proyectcons/
- Commit del rediseño: `bdb6452cc8a96d1f1ccc7118f916ad0e5c84f64c`.
- Pages desde `main` y `/`, HTTPS obligatorio. La API confirmó `status: built` el2026-09-29T08:09:25Z, sin error.
- Portada pública abierta e inspeccionada en navegador: diseño, fotografía, selector inglés, noindex y destino WhatsApp correctos; sin errores de consola observados.
- `node scripts/check-live.cjs`:62HTML públicos coinciden byte a byte con las páginas locales normalizando finales de línea;38recursos utilizados devuelven HTTP200. Una URL inexistente profunda devuelve HTTP404 y la página personalizada.
- Primera consulta concurrente tuvo un error transitorio de red; una comprobación individual devolvió200 y la repetición completa pasó. No se desactivó TLS ni se modificaron certificados.
- Este registro documenta publicación y funcionamiento; no confirma indexación ni posición en buscadores.
