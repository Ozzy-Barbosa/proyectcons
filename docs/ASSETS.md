# Fotografías y optimización

## Fuentes

- `assets/images/residencial-*.jpeg`, `industrial-*.jpeg` y `social-*.jpeg`: material proporcionado para el sitio. Conservar los originales. La asignación de fotografías a una obra concreta debe confirmarse con el cliente.
- `assets/images/ref-*.jpg`: 22 imágenes temporales de terceros. Autores, URLs originales, fecha de consulta y licencia están registrados en `content/visual-references.json`. No representan obras de PROYECTCONS ni desarrollos INFONAVIT; mantener el aviso de imagen ilustrativa y los créditos.
- `assets/images/logo-proyectcons.png`: logotipo oficial. No se redibuja ni se altera su identidad.

## Derivados para el sitio

Ejecutar desde la raíz:

```sh
node scripts/optimize-images.cjs
```

El script busca `sharp` en las dependencias del proyecto, en `SHARP_MODULE_PATH` o en el runtime de Codex instalado en Windows. No descarga paquetes. En otro equipo, instalar Sharp o indicar la ruta del módulo mediante `SHARP_MODULE_PATH`.

Genera dos variantes WebP por imagen en `assets/images/optimized/`: `<nombre>-640.webp` y `<nombre>-1440.webp`. Conserva proporciones y no amplía originales pequeños. Las fotografías usan calidad 80; el PNG del logo usa WebP sin pérdida y conserva el canal alfa. Cuando existen PNG y JPG del mismo nombre, se utiliza el PNG para evitar sobrescribir su versión transparente.

`manifest.json` registra cada archivo original como clave y sus dimensiones, peso y variantes:

```json
{
  "residencial-04.jpeg": {
    "width": 1280,
    "height": 960,
    "bytes": 119666,
    "variants": [
      { "file": "residencial-04-640.webp", "width": 640, "height": 480, "bytes": 0 },
      { "file": "residencial-04-1440.webp", "width": 1280, "height": 960, "bytes": 0 }
    ]
  }
}
```

Los pesos del ejemplo son ilustrativos; consultar el manifiesto generado. Importante: el sufijo `1440` expresa el máximo solicitado. Usar el ancho real `variant.width` como descriptor `srcset` (1280w en este ejemplo), y declarar `width`/`height` para reservar el espacio y evitar saltos visuales. El generador no elimina archivos antiguos; retirar derivados obsoletos solo después de comprobar que ya no existen referencias.

## Revisión visual

- `residencial-04.jpeg`: terraza curva, sombras arquitectónicas y entorno de Baja California; candidata principal a imagen de presentación editorial.
- `residencial-01.jpeg`: fachada residencial real con lectura amplia del volumen y contexto local; buena portada de proyecto.
- `industrial-03.jpeg`: interior de nave con estructura completa y encuadre equilibrado; mejor portada que `industrial-02.jpeg`, cuya reja domina parte del encuadre.
- `ref-residencial-5.jpg`: referencia de casa contemporánea en entorno árido; útil como ejemplo, siempre identificada como imagen ilustrativa.

Se revisaron visualmente los derivados grandes de la terraza y de la nave para comprobar detalle y proporciones. En la generación inicial de septiembre de 2026, las 34 fotografías suman 8.81 MiB originales y 5.96 MiB en la variante WebP grande (32% menos). Los originales permanecen intactos. El peso real descargado por cada pantalla depende de `srcset`, `sizes` y carga diferida.
