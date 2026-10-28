# Herbario del año (pedrogomez.dev/proyecto/herbario)

Web estática (HTML, CSS y JavaScript sin frameworks) servida por un Worker de Cloudflare. Todo el texto de
la web y de los comentarios va en español de España.

- Contexto de producto: [PRODUCT.md](PRODUCT.md). Sistema visual: [DESIGN.md](DESIGN.md). Créditos: [CREDITOS.md](CREDITOS.md).
- `app/datos/plantas.json` es la única fuente de datos; se genera con `pipeline/datos.py` y el HTML de los
  meses, el calendario y el catálogo se escribe en el build (`scripts/render.mjs`).
- Vista local: `npm run dev` (http://127.0.0.1:8050/proyecto/herbario/).
- Tests: en Windows `node --test` se queda colgado; ejecuta `node test/herbario.test.mjs`.

Reglas: las escenas avanzan y retroceden con el scroll (nada se reproduce solo), la página se lee sin
JavaScript y con `prefers-reduced-motion` los meses se leen uno tras otro. Sólo láminas reales con su
crédito: nada generado ni redibujado. Sin analítica ni cookies.
