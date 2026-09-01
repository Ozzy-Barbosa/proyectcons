# PROJECTCONS — Sitio web estático

## Abrir con Live Server
1. Abre esta carpeta completa en VS Code.
2. Abre `index.html`.
3. Clic derecho → **Open with Live Server**.

No hay frameworks ni compilación. El proyecto funciona con HTML + CSS + JavaScript y las fotografías están guardadas localmente en `assets/images/`.

## Estructura
- `index.html` — página principal.
- `css/styles.css` — estilos responsive.
- `js/data.js` — categorías y proyectos.
- `js/config.js` — teléfono, WhatsApp, correo y dominio centralizados.
- `js/app.js` — menú, navegación vertical, scroll activo y formulario WhatsApp.
- `assets/images/` — fotografías y logotipo.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `404.html` — archivos auxiliares.

## Antes de publicar
- Confirmar los datos de `js/config.js` y reemplazar el dominio de ejemplo en `index.html`, `robots.txt` y `sitemap.xml`.
- Confirmar también el teléfono visible y correo en `index.html` (contenido indexable por buscadores).
- Sustituir las fotografías de referencia por las fotografías finales del cliente si corresponde.
- Revisar títulos, descripciones, nombres de proyectos y datos de contacto.

## Seguimiento de prospectos
El formulario genera un folio, captura tipo, ubicación, etapa, inversión y plazo, y prepara un mensaje estructurado en WhatsApp. Conserva parámetros UTM para identificar el origen de campañas. WhatsApp no garantiza por sí solo un CRM: para historial, responsables, estados y recordatorios se recomienda integrar posteriormente un CRM o una hoja conectada mediante un backend, siempre con aviso de privacidad.

## SEO local antes del lanzamiento
- Sustituir el dominio de ejemplo y dar de alta el sitemap en Google Search Console.
- Crear o completar el Perfil de Empresa en Google con el mismo nombre, teléfono y zona de servicio.
- Conseguir reseñas reales y publicar fotografías propias con contexto del proyecto.
- Añadir domicilio solo si es una ubicación comercial real y pública.


### Corrección de imágenes y logo
- El logo ahora usa `assets/images/logo-proyectcons.png`, con fondo blanco eliminado y transparencia real.
- Todas las rutas de imágenes usadas por `data.js` apuntan a archivos que existen dentro de `assets/images/`.
- Las fotografías incluidas son archivos locales, por lo que funcionan con Live Server sin depender de URLs externas.
- Cuando se entregue material fotográfico comercial específico del cliente, puede sustituirse directamente en `js/data.js` conservando las rutas.
