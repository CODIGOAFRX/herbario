---
name: Herbario del año
description: Doce meses de láminas botánicas antiguas que brotan, florecen, dan fruto y se secan con el scroll.
colors:
  papel-enero: "#e9ebe7"
  papel-mayo: "#ebeedb"
  papel-julio: "#f0ead2"
  papel-octubre: "#eadcc2"
  papel-claro: "#f4f3ee"
  tinta: "#1f241d"
  tinta-2: "#4d5247"
  savia: "#3b6231"
  cianotipia: "#24559f"
typography:
  display:
    fontFamily: "'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(3.6rem, 9vw, 9.5rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  head:
    fontFamily: "'Bodoni Moda', Didot, Georgia, serif"
    fontSize: "clamp(2.4rem, 4.6vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1.02
  sub:
    fontFamily: "'Bodoni Moda', Didot, Georgia, serif"
    fontSize: "clamp(2rem, 3vw, 2.9rem)"
    fontWeight: 400
    lineHeight: 1.02
  body:
    fontFamily: "Spectral, 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.05rem, .35vw + .98rem, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  none: "0"
spacing:
  margen: "clamp(16px, 5vw, 72px)"
  seccion: "clamp(100px, 12vw, 180px)"
components:
  button-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel-claro}"
    rounded: "{rounded.none}"
    padding: "0.7rem 1.4rem"
    height: "48px"
  button-tinta-hover:
    backgroundColor: "{colors.savia}"
  button-linea:
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "0.7rem 1.4rem"
    height: "48px"
  region-elegida:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel-claro}"
    height: "44px"
---

# Design System: Herbario del año

## Overview

Un libro de botánica abierto. Las láminas, recortadas de su papel, flotan sobre una página que cambia de tono con la estación según se baja: fría en invierno, verde tierno en primavera, cálida en verano, ocre en otoño. Comparte el lenguaje de Catábasis (papel, mucho aire, serif de libro, nombres latinos en cursiva de color, créditos en versalitas, cabecera mínima), pero no su idea: allí se baja al abismo y el papel se oscurece; aquí el tiempo es un ciclo y diciembre vuelve a enero.

El momento fuerte son las doce escenas del año, fijas mientras se baja: la planta brota en tinta, le llega el color, entran las figuras de detalle y se seca. Todo depende de la posición del scroll.

## Colors

### Primary
- **Savia** `#3b6231`: la rúbrica. Nombres latinos, la fase actual de la lámina, el mes activo de la regla, los subrayados al pasar el ratón. Como el rojo de Catábasis, pero de hoja.

### Neutral
- **Papel**: doce tonos, uno por mes (`scripts/render.mjs`, `PAPELES`), de `#e9ebe7` en enero a `#eadcc2` en octubre. Con las escenas, `escenas.js` funde la página entera de uno a otro; sin JavaScript cada mes lleva el suyo.
- **Papel claro** `#f4f3ee`: el pliego del herbario y los campos.
- **Tinta** `#1f241d` para el texto; **tinta 2** `#4d5247` para entradillas, créditos y notas.

### Tertiary
- **Cianotipia** `#24559f`: sólo el herbario en azul (pantalla y PNG).

### Named Rules
- **El color lo ponen las láminas.** La interfaz es papel y tinta; la savia marca lo que hay que leer como botánica.

## Typography

**Bodoni Moda** (títulos, meses, nombres de planta, cursivas de las fases), la letra de la época de Sturm y de los libros de Redouté y de *Flore médicale*. **Spectral** para el texto. Alojadas en `app/fonts/`.

### Hierarchy
- **Display**: el título y el nombre del mes, 4–9,5rem, con la segunda línea del título en cursiva y sangrada.
- **Head**: títulos de sección, con la última palabra en cursiva de savia («Qué florece *hoy*»).
- **Sub**: el nombre de la planta. **Body**: texto corrido. **Small**: créditos.
- Versalitas (`font-variant-caps: all-small-caps`) para etiquetas de dato: estación y luz, regiones, «Lámina», campos de formulario.

## Layout

Márgenes de `clamp(16px, 5vw, 72px)` y secciones separadas por `clamp(100px, 12vw, 180px)`. Cada escena: el mes y la etiqueta a la izquierda, la lámina al centro, las dos plantas acompañantes a la derecha y la regla del año pegada al borde derecho, como la sonda de Catábasis. En el móvil se apilan y la regla pasa abajo, con las iniciales.

## Elevation & Depth

Sin sombras de interfaz. La profundidad es de las capas de cada lámina: una silueta muy tenue de la planta detrás, la planta y, delante, las figuras de detalle, cada una a su velocidad.

## Shapes

Esquinas rectas. Filetes de 1px sólo en botones, regiones y campos (como en Catábasis).

## Components

### Buttons
Esquina recta, 48px, filete de tinta. El de tinta se rellena y pasa a savia al pasar; el de línea sólo cambia el color del texto.

### La etiqueta (signature component)
Sin caja, directamente sobre el papel: las cuatro fases en cursiva (la actual en savia y subrayada), el nombre latino en savia, el nombre en Bodoni, el estado del mes en cursiva, el texto, la floración por región en versalitas y el crédito de la lámina.

### Fichas y tarjetas
La planta o la lámina sin marco, sobre el papel (las láminas enteras con `mix-blend-mode: multiply`), y debajo latín en savia, nombre en Bodoni y crédito.

## Do's and Don'ts

### Do:
- Sólo láminas reales recortadas, con su crédito.
- Todo movimiento ligado al scroll; con `prefers-reduced-motion`, los meses uno tras otro.
- La página entera legible sin JavaScript.

### Don't:
- Mayúsculas de cartel, letras de palo seco o slab, tarjetas grises, fondos oscuros a pantalla completa.
- Degradados, sombras, animaciones que se reproduzcan solas.
- Imágenes generadas o redibujadas.
