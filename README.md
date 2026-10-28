# Herbario del año

**Doce meses de flora española en láminas botánicas antiguas que brotan, florecen, dan fruto y se secan con el scroll.**

Cada mes tiene una planta protagonista y dos más que la acompañan: la campanilla de invierno en enero, la amapola en mayo, la hierba de San Juan en junio, el azafrán en octubre, el acebo en diciembre. Las 36 láminas son grabados y litografías de 1750 a 1927, de dominio público, recortados en capas: la planta entera y las figuras de detalle que el grabador dibujaba aparte.

En vivo: **[pedrogomez.dev/proyecto/herbario](https://pedrogomez.dev/proyecto/herbario/)**

## Qué hay dentro

- **El año.** Una escena por mes, fija en pantalla mientras se baja. La planta brota desde la raíz todavía en tinta, florece cuando le llega el color (como lo daban a mano los iluminadores), da fruto cuando entran las figuras de detalle desde los márgenes, cada una a su profundidad, y se seca: amarillea y queda prensada. En los meses de fruto (agosto, noviembre, diciembre) la escena se detiene en el fruto y no en la flor. Todo avanza y retrocede con el scroll; nada se reproduce solo.
- **Qué florece hoy.** Eliges región (norte atlántico, montaña, interior, litoral mediterráneo o sur) y fecha, y salen las plantas en flor y las que empiezan el mes siguiente. «Usar mi ubicación» calcula la región en el propio navegador, sin enviar las coordenadas a ningún sitio.
- **Tu herbario.** Guardas plantas, las montas en un pliego con su etiqueta (quién las recogió y dónde) y lo descargas en PNG, a color o como cianotipia: las siluetas en blanco sobre azul de Prusia, como las algas de Anna Atkins (1843). Se guarda en `localStorage`.
- **Calendario de floración** y **catálogo** de las 36 láminas con su crédito y el enlace al original.

Sin JavaScript se leen los doce meses uno tras otro, con cada lámina rehecha con sus recortes, y el calendario. Con `prefers-reduced-motion` las láminas aparecen completas y los meses sólo se funden.

## Cómo se prepararon las láminas

Las láminas vienen de la [Biodiversity Heritage Library](https://www.biodiversitylibrary.org/) y de su cuenta de [Flickr](https://www.flickr.com/photos/biodivlibrary/). La mayoría son de la *Deutschlands Flora* de Jacob Sturm (1798-1862); las mediterráneas, de *Flore médicale* (1828-1835), *Köhler's Medizinal-Pflanzen* (1883-1914), el *Herbarium Blackwellianum* (1750-1773) y otras. [CREDITOS.md](CREDITOS.md) tiene la fuente de cada una.

Los scripts de Python están en [`pipeline/`](pipeline/):

1. `seleccion.py`: las 36 plantas, mes a mes, y el orden de preferencia de las obras.
2. `descargar.py`: busca cada planta en el canal público de la BHL en Flickr por su etiqueta `taxonomy:binomial` y descarga la página a resolución completa desde biodiversitylibrary.org.
3. `recortar.py`: estima el color del papel sólo desde lo que parece papel (así un pétalo grande no se confunde con el fondo), saca la tinta, quita marcos, lomos, pies de texto y números de lámina, rellena los pétalos blancos (en el grabado son sólo un contorno) y separa la planta (lo alto) de los detalles, cada uno con su letra.
4. `contenido.py` + `datos.py`: fichas, floración por región (según Flora iberica) y créditos; escribe `app/datos/plantas.json` y `CREDITOS.md`.

```bash
python -m venv .venv && .venv/Scripts/pip install numpy pillow scipy
python pipeline/descargar.py <trabajo>          # necesita <trabajo>/feed.json (búsqueda en Flickr)
python pipeline/recortar.py <trabajo> app/media
python pipeline/datos.py <trabajo>
```

## Desarrollo

```bash
npm test         # datos, archivos de cada lámina, floración y HTML generado
npm run build    # genera dist/proyecto/herbario
npm run dev      # http://127.0.0.1:8050/proyecto/herbario/
```

En Windows `node --test` se queda colgado: `node test/herbario.test.mjs`.

| Pieza | Dónde |
| --- | --- |
| Motor de escenas (de scroll-world, con capas en lugar de vídeo) | `app/escenas.js` |
| Qué florece hoy | `app/hoy.js`, `app/floracion.js` |
| Tu herbario y la cianotipia | `app/pliego.js` |
| HTML de los meses, el calendario y el catálogo | `scripts/render.mjs` |

Sin dependencias ni frameworks. CSP estricta en `app/_headers`.

## Despliegue

Worker de Cloudflare con archivos estáticos (`wrangler.jsonc`), enganchado a `pedrogomez.dev/proyecto/herbario`: `npm run deploy`. GitHub Actions (`.github/workflows/ci.yml`) comprueba y construye en cada push y pull request.
