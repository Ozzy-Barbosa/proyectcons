# SEO local y preparación de publicación

Auditoría inicial de solo lectura y actualización del rediseño: 29 de septiembre de 2026. El estado de GitHub descrito abajo se comprobó antes de publicar; no constituye una confirmación de despliegue. El verificador estático se actualizó para las 62 páginas ES/EN.

## Estado de GitHub comprobado

- Repositorio: `https://github.com/Ozzy-Barbosa/proyectcons`.
- Público, rama predeterminada `main`; la cuenta conectada `Ozzy-Barbosa` tiene permiso `ADMIN`.
- GitHub CLI está autenticado. La lectura necesitó salir del aislamiento local para acceder a su configuración; no fue necesaria una nueva sesión.
- `has_pages: false`; consultar el sitio de Pages devuelve HTTP 404. No hay workflows remotos configurados.
- URL prevista al activar Pages: `https://ozzy-barbosa.github.io/proyectcons/`. Todavía no estaba activa durante esta auditoría.
- No se hicieron commits, push, cambios de configuración ni publicación durante esta subtarea.

### Ruta de publicación para el responsable del despliegue

El sitio es estático. Puede publicarse el contenido ya generado desde `main` y la raíz `/`, con `.nojekyll`, o mediante un workflow que compile y empaquete solamente archivos públicos. La ruta de proyecto `/proyectcons/` debe conservarse en enlaces, recursos, canonicals y variantes de idioma.

La API oficial permite crear Pages indicando la rama y carpeta de origen; la cuenta actual tiene permiso administrativo y alcance `repo`. Primero deben pasar las pruebas y enviarse los archivos al repositorio. Después de activar Pages hay que comprobar el despliegue y las URLs públicas, no solamente aceptar la respuesta de configuración. [GitHub: API de Pages](https://docs.github.com/en/rest/pages/pages), [fuente de publicación](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Contactos y afirmaciones pendientes

Actualización durante el rediseño: el usuario confirmó el WhatsApp **612 136 3583**. La configuración ya utiliza `526121363583`, muestra `+52 612 136 3583` y tiene como URL de presentación `https://ozzy-barbosa.github.io/proyectcons/`. No se ha confirmado un correo: queda vacío y no debe inventarse ni publicarse como contacto. Los antiguos datos de plantilla se retiran de HTML y recursos de ejecución.

El usuario sí confirmó más de 18 años en el sector, actividad desde 2008 y más de 60 proyectos. El catálogo de servicios, fotografías definitivas, datos de cada proyecto, domicilio, horarios y contactos deben aprobarse con el cliente. No se debe inferir afiliación a INFONAVIT, certificaciones, garantías, plazos, financiamiento ni atención humana en inglés por el hecho de traducir el sitio.

## Verificación estática del rediseño

Ejecutar `node scripts/build-pages.cjs` y después `node scripts/check-site.cjs`. La segunda orden audita 62 páginas (29 principales/de portafolio por idioma, privacidad y 404 en ambos), 42 galerías de detalle con cinco fotografías únicas como mínimo, seis fotos de servicios por idioma y banners. También comprueba archivos y variantes `srcset`, anclas, nombres de página únicos, IDs, JSON-LD, pares de idioma y sus enlaces, contacto confirmado, formularios y exclusión de indexación de la vista previa. La detección de texto español en páginas inglesas es una revisión heurística, no una certificación de traducción. La validación visual, interacción y comprobación del despliegue siguen siendo independientes.

## Política de vista previa y salida a producción

Esta publicación se solicita como avance para revisión del cliente. Mientras tenga fotos de ejemplo y contenido provisional, conviene mantener todas las páginas de la vista previa con `noindex, follow`, y etiquetar el material de referencia. `robots.txt` debe permitir el rastreo: si se bloquea, Google puede no leer `noindex`. Esta configuración no hace el sitio privado; cualquier persona con el enlace puede visitarlo. [Google: controles de indexación](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

Al aprobar la versión comercial:

1. Confirmar dominio, WhatsApp, razón/nombre comercial, ubicación y cobertura real.
2. Sustituir o retirar las fichas de ejemplo; publicar casos reales con fotos autorizadas, alcance y datos aprobados.
3. Quitar `noindex` únicamente de páginas completas, actualizar canonical y sitemap a la URL pública elegida.
4. Verificar Search Console, enviar sitemap y revisar inspección de URL. El envío no asegura indexación ni una posición determinada.
5. Mantener el Perfil de Empresa de Google actualizado y coherente con el sitio; solicitar reseñas reales a clientes sin fabricar testimonios.

## Dos idiomas, no una traducción visual incompleta

Recomendación: páginas HTML separadas en español y `/en/`, enlazadas desde un selector visible que conserve la página equivalente. Traducir navegación, contenido, formulario, errores, pies de foto, avisos, metadatos y textos accesibles; no cambiar de idioma a la fuerza por ubicación.

Cada par debe declarar `hreflang="es-MX"` y `hreflang="en"`, incluirse a sí mismo, apuntar de vuelta a su equivalente y usar URLs absolutas. `x-default` puede apuntar a la versión española elegida como predeterminada. Cada idioma debe tener su propio canonical, no un canonical de inglés hacia español. [Google: sitios multilingües](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [versiones localizadas](https://developers.google.com/search/docs/specialty/international/localized-versions).

## Intenciones de búsqueda para contenido natural

Estas son propuestas editoriales, no datos de volumen ni promesas de posicionamiento. La exploración encontró resultados locales de constructoras, portafolios, solicitud de presupuestos y oferta bilingüe. El término sin estado también devuelve resultados de La Paz, Bolivia: usar de forma clara **La Paz, Baja California Sur, México**.

| Intención | Expresiones de referencia | Respuesta útil y ubicación |
| --- | --- | --- |
| Elegir constructora local | constructora en La Paz BCS; constructoras en La Paz Baja California Sur | Inicio: ubicación real, experiencia confirmada, obras y contacto. |
| Construir vivienda propia | construir mi casa en La Paz; construcción de casas en La Paz | Categoría residencial: tipo de proyecto, información que se necesita para comenzar. |
| Planear una casa a medida | proyecto de casa en La Paz; vivienda a medida en La Paz BCS | Residencial/servicios aprobados: necesidades, terreno y alcance. |
| Solicitar presupuesto | cotizar construcción de casa en La Paz; presupuesto para construir en La Paz | Formulario: ubicación, etapa, superficie opcional, prioridades; sin precios inventados. |
| Ejecutar un proyecto existente | ya tengo planos y quiero construir en La Paz | FAQ y formulario: permitir indicar si se cuenta con terreno o planos. |
| Construir espacio comercial | construcción de locales comerciales en La Paz | Categoría comercial: casos reales y necesidades del negocio, sin servicios no confirmados. |
| Construir almacenamiento | construcción de bodegas en La Paz BCS | Categoría bodegas: registro de obra real y consulta de alcance. |
| Buscar constructor en inglés | home builder in La Paz Mexico; build a house in La Paz BCS; construction company in La Paz | Versión inglesa con equivalentes completos y contacto claro. |

“Vivienda en La Paz” también puede significar compra, renta o programas públicos. No debe presentarse a Proyectcons como inmobiliaria, institución de crédito o proveedor de vivienda disponible sin confirmación. Las categorías INFONAVIT/interés social deben describir solo el alcance validado.

Señales observadas en fuentes de primera mano: [Balandra Arquitectura](https://www.balandraarquitectura.com/) usa construcción residencial/comercial y portafolio local; [MO&CA](https://www.mocathebuilders.com/) presenta construcción de vivienda a medida en inglés; [Baja Custom Homes](https://bchomes.mx/es/) combina proyectos y contenidos bilingües. Se revisaron para identificar lenguaje e intenciones, no para copiar su oferta, fotografías, afirmaciones ni posicionamiento.

## Prioridades SEO de implementación

- Un título específico, descripción y H1 por página; estructura de encabezados lógica, enlaces descriptivos y texto visible útil.
- Contenido local pertinente, sin repetir largas listas de palabras clave ni crear páginas vacías para cada variante.
- Fotos optimizadas, dimensiones declaradas, texto alternativo descriptivo y carga diferida salvo imagen principal. Las fotos de stock no son evidencia de obras propias.
- Datos estructurados limitados a información cierta. `Organization` y `BreadcrumbList` son una base prudente; no inventar dirección, coordenadas, reseñas ni calificaciones para obtener resultados enriquecidos.
- Formulario accesible y comprensible, con resumen antes de abrir WhatsApp. Abrir un mensaje no equivale a enviarlo ni a registrarlo en un CRM.
- Revisar teclado, contraste, móvil, preferencias de movimiento reducido y carga antes de publicar.

Google recomienda contenido pensado primero para personas, experiencia de primera mano y una buena experiencia global. El sitio necesita responder dudas y mostrar trabajo real, no aumentar páginas únicamente por palabras clave. [Google: contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

El posicionamiento local también depende de relevancia, distancia y prominencia, además de información comercial precisa y reseñas reales. No es posible garantizar el primer lugar ni pagar a Google por una mejor posición local. [Google: mejorar el posicionamiento local](https://support.google.com/business/answer/7091?hl=es).

## Verificación posterior requerida

Registrar commit publicado, estado de Pages, URL funcional y comprobaciones de inicio, servicios, proyectos, una categoría, un detalle, ambos idiomas y página 404. Comprobar recursos sin errores, navegación bajo `/proyectcons/`, alternancia de idiomas, galerías, formulario, noindex de la vista previa y ausencia de datos de plantilla. La aprobación visual y de contenido del cliente sigue siendo un paso separado.
