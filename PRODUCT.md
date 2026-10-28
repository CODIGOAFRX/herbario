# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML, CSS y JavaScript sin frameworks ni dependencias, como Catábasis, Palimpsesto y Ornamentos. El HTML de los meses, el calendario y el catálogo se genera en el build (`scripts/render.mjs`) desde `app/datos/plantas.json`. Se sirve como Worker de Cloudflare con archivos estáticos en `pedrogomez.dev/proyecto/herbario`. Las láminas se preparan una vez con Python (NumPy, Pillow, SciPy) en `pipeline/`.

## Users

Gente curiosa de la flora que vive en España: pasea por el campo, por un parque o por su calle y quiere saber qué está floreciendo ahora donde vive, y disfrutar de las láminas antiguas. La web forma parte del portfolio de Pedro Gómez (pedrogomez.dev), que hace de escaparate, pero la herramienta tiene que servir de verdad a quien no busca un portfolio.

## Product Purpose

Recorrer el año de la flora española en 36 láminas botánicas antiguas, una escena por mes que avanza con el scroll, y responder a una pregunta concreta: qué florece hoy en mi región. Quien quiera puede guardar las plantas en un herbario propio y descargarlo. Funciona si el visitante baja hasta el final por gusto y si vuelve otro mes a mirar qué florece.

## Positioning

Las plantas son láminas reales de floras impresas entre 1750 y 1927 (Sturm, Flore médicale, Köhler, Blackwell…), recortadas en capas sin redibujar nada, y las fechas de floración son de la flora de la península y Baleares por región, no de un calendario genérico. Nada de imágenes generadas.

## Operating Context

- Se lee en el móvil tanto como en el ordenador; la herramienta se usa a menudo fuera de casa.
- Regiones: norte atlántico, montaña, interior, litoral mediterráneo y sur. Canarias queda fuera: tiene otra flora.
- El herbario personal vive en `localStorage` del navegador; se exporta en PNG a color o como cianotipia.
- Proyectos hermanos del mismo autor, cada uno en su repo: Catábasis (descenso al abismo), Palimpsesto (Granada en dos épocas) y Ornamentos (capitulares). Herbario no debe parecerse a ellos.

## Capabilities and Constraints

- Doce escenas ligadas al scroll: todo avanza y retrocede con la posición; nada se reproduce solo.
- La página se lee entera sin JavaScript y tiene alternativa con `prefers-reduced-motion`.
- Qué florece hoy: región y fecha; la ubicación, si se pide, se convierte en región dentro del navegador.
- Las épocas de floración son aproximadas (Flora iberica, Anthos) y se dice en la página.
- Todo el texto en español de España.

## Brand Commitments

- Sin analítica, sin cookies y sin enviar datos del visitante a ningún sitio. CSP estricta en `app/_headers`.
- Firma: Pedro Gómez, pedrogomez.dev. Código público en `CODIGOAFRX/herbario`.

## Evidence on Hand

- 36 láminas de dominio público de la Biodiversity Heritage Library, con su fuente en `CREDITOS.md` y en cada ficha.
- Fichas de las plantas y floración por región en `pipeline/contenido.py`.
- No hay testimonios, cifras de uso ni prensa: no se inventan.

## Product Principles

1. La lámina manda: cada imagen es un original con su crédito, recortado y nunca redibujado.
2. El scroll es el tiempo: el visitante controla el año, adelante y atrás.
3. Útil sin pedir nada: ni cuenta, ni cookies, ni datos fuera del navegador.
4. Fechas honestas: aproximadas, por región, y dicho así.

## Accessibility & Inclusion

Navegable con teclado (al entrar el foco en un mes, la página va a ese mes), lectores de pantalla con el texto completo de cada mes, contraste AA, alternativa con `prefers-reduced-motion` y contenido completo sin JavaScript.
