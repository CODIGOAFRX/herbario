// Escribe en index.html lo que sale de app/datos/plantas.json: las plantas de la portada, los doce
// meses, la regla del año, las regiones, el calendario y el catálogo. Funciones puras: las usan el
// build y los tests.
import { rangoMeses, mesesDeFlor, MESES } from '../app/floracion.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pct = n => `${(n * 100).toFixed(2)}%`;
const media = id => `media/${id}`;

export function porId(datos) {
    return Object.fromEntries(datos.plantas.map(p => [p.id, p]));
}

function credito(p) {
    const o = p.obra;
    return `${o.autor}, ${o.titulo}${o.lugar ? `, ${o.lugar}` : ''}, ${o.anio}`;
}

// La lámina rehecha con sus recortes: la planta y sus detalles en el sitio que tenían en el papel
function lamina(p, { carga = 'lazy', clase = 'lamina' } = {}) {
    const [w, h] = p.lamina;
    const pl = p.planta;
    const detalles = p.detalles.map((d, i) =>
        `<img class="${clase}__detalle" src="${media(p.id)}/detalle-${i + 1}.webp" alt="" width="${d.px[0]}" height="${d.px[1]}"` +
        ` loading="${carga}" decoding="async" style="left:${pct(d.x)};top:${pct(d.y)};width:${pct(d.w)}" data-i="${i}">`).join('');
    return `<figure class="${clase}" style="aspect-ratio:${w} / ${h}" data-planta="${p.id}">` +
        `<div class="${clase}__sombra" style="left:${pct(pl.x)};top:${pct(pl.y)};width:${pct(pl.w)};height:${pct(pl.h)};--recorte:url(${media(p.id)}/planta-700.webp)" aria-hidden="true"></div>` +
        `<img class="${clase}__planta" src="${media(p.id)}/planta-1400.webp" srcset="${media(p.id)}/planta-700.webp 700w, ${media(p.id)}/planta-1400.webp 1400w"` +
        ` sizes="(max-width: 860px) 80vw, 45vw" width="${pl.px[0]}" height="${pl.px[1]}" loading="${carga}" decoding="async"` +
        ` alt="${esc(p.nombre)} (${esc(p.latinLamina)}), de la lámina de ${esc(p.obra.autor)}"` +
        ` style="left:${pct(pl.x)};top:${pct(pl.y)};width:${pct(pl.w)}">` +
        detalles +
        `<figcaption class="sr-only">${esc(credito(p))}</figcaption></figure>`;
}

function floracionLista(p, regiones) {
    return Object.entries(p.floracion)
        .map(([r, m]) => `<li><span>${esc(regiones[r])}</span> <span>${rangoMeses(m)}</span></li>`).join('');
}

const FASES = ['Brota', 'Florece', 'Da fruto', 'Se seca'];

// El papel cambia con la estación: frío en invierno, verde tierno en primavera, cálido en verano,
// ocre en otoño. Sin JavaScript, cada mes tiene el suyo; con las escenas, se funden con el scroll.
export const PAPELES = ['#e9ebe7', '#e9ece5', '#e7ece0', '#e8eddd', '#ebeedb', '#eeedd8',
    '#f0ead2', '#efe6cc', '#ede2c9', '#eadcc2', '#e6ddcb', '#e7e6e1'];

export function escenas(datos) {
    const id = porId(datos);
    return datos.meses.map((m, i) => {
        const [prota, ...otras] = m.plantas.map(x => id[x]);
        const estado = prota.estado === 'fruto'
            ? `En ${m.id} no florece: da fruto.`
            : `En ${m.id} está en flor.`;
        return `<article class="mes" id="${m.id}" data-estado="${prota.estado}" style="--letras:${m.nombre.length};--papel-mes:${PAPELES[i]}" aria-labelledby="t-${m.id}">
  <div class="mes__escena">
    <div class="mes__cabeza">
      <h2 class="mes__nombre" id="t-${m.id}">${m.nombre}</h2>
      <p class="mes__luz">${m.estacion} · ${m.luz} de luz el día 15 en Madrid</p>
    </div>
    ${lamina(prota, { carga: i === 0 ? 'eager' : 'lazy' })}
    <div class="etiqueta">
      <ol class="fases" aria-label="Fases de la lámina">${FASES.map((f, k) => `<li data-fase="${k}">${f}</li>`).join('')}</ol>
      <p class="etiqueta__latin"><i translate="no">${esc(prota.latin)}</i></p>
      <h3 class="etiqueta__nombre">${esc(prota.nombre)}</h3>
      <p class="etiqueta__estado">${esc(estado)} ${esc(prota.familia)}.</p>
      <p class="etiqueta__texto">${esc(prota.texto)}</p>
      <ul class="etiqueta__flor" aria-label="Floración por región">${floracionLista(prota, datos.regiones)}</ul>
      <p class="etiqueta__fuente"><span>Lámina</span> ${esc(prota.obra.autor)}, <i>${esc(prota.obra.titulo)}</i>, ${esc(prota.obra.anio)}</p>
      <button class="boton boton--linea boton-guardar" type="button" data-guardar="${prota.id}" hidden>Guardar en mi herbario</button>
    </div>
    <ul class="mes__tambien" aria-label="También en ${m.id}">${otras.map(p =>
        `<li><img src="${media(p.id)}/planta-700.webp" alt="" width="${p.planta.px[0]}" height="${p.planta.px[1]}" loading="lazy" decoding="async">` +
        `<span><i translate="no">${esc(p.latin)}</i> ${esc(p.nombre)}</span></li>`).join('')}</ul>
  </div>
</article>`;
    }).join('\n');
}

// Regla del año: un enlace por mes (la navegación del motor de escenas)
export function ruta(datos) {
    return datos.meses.map(m => `<li><a href="#${m.id}" data-mes="${m.numero}"><span class="ruta__mes">${m.nombre}</span><span class="ruta__inicial" aria-hidden="true">${m.nombre[0]}</span></a></li>`).join('');
}

// Portada: cuatro plantas recortadas, sueltas sobre el papel
const PORTADA = ['papaver-rhoeas', 'citrus-aurantium', 'galanthus-nivalis', 'viola-odorata'];
export function portada(datos) {
    const id = porId(datos);
    return PORTADA.map((pid, k) => {
        const p = id[pid];
        return `<figure class="portada__planta portada__planta--${k + 1}"><img src="${media(p.id)}/planta-${k === 0 ? 1400 : 700}.webp" alt="" width="${p.planta.px[0]}" height="${p.planta.px[1]}"${k === 0 ? ' fetchpriority="high"' : ''} decoding="async">` +
            `<figcaption><i translate="no">${esc(p.latin)}</i> ${esc(p.obra.autor.split(' ').at(-1))}, ${esc(p.obra.anio.slice(0, 4))}</figcaption></figure>`;
    }).join('');
}

export function opciones(datos) {
    return Object.entries(datos.regiones).map(([k, v], i) =>
        `<label class="region"><input type="radio" name="region" value="${k}"${i === 2 ? ' checked' : ''}> <span>${esc(v)}</span></label>`).join('');
}

// Calendario impreso: por estaciones, cada planta con sus meses de flor
export function calendario(datos) {
    const grupos = [['Invierno', [12, 1, 2]], ['Primavera', [3, 4, 5]], ['Verano', [6, 7, 8]], ['Otoño', [9, 10, 11]]];
    const usadas = new Set();
    return grupos.map(([nombre, meses]) => {
        const plantas = datos.plantas.filter(p => {
            if (usadas.has(p.id)) return false;
            const primero = mesesDeFlor(p);
            // Cada planta va a la estación en la que empieza a florecer
            const tr = primero.length === 12 ? 1 : (primero.find(m => !primero.includes(m === 1 ? 12 : m - 1)) ?? primero[0]);
            if (!meses.includes(tr)) return false;
            usadas.add(p.id);
            return true;
        });
        return `<section class="carta__grupo" aria-labelledby="c-${nombre}">
  <h3 id="c-${nombre}">${nombre}</h3>
  <ul>${plantas.map(p => `<li><span class="carta__planta">${esc(p.nombre)} <i translate="no">${esc(p.latin)}</i></span><span class="carta__meses">${rangoMeses(mesesDeFlor(p))}</span>` +
        `<span class="carta__donde">${Object.entries(p.floracion).map(([r, m]) => `${esc(datos.regiones[r])}, ${rangoMeses(m)}`).join(' · ')}</span></li>`).join('')}</ul>
</section>`;
    }).join('\n');
}

// Catálogo: cada lámina entera con su etiqueta
export function catalogo(datos) {
    return datos.plantas.map(p => `<li class="ficha">
  <a href="${esc(p.bhl)}" class="ficha__imagen"><img src="${media(p.id)}/lamina-900.webp" alt="Lámina de ${esc(p.nombre.toLowerCase())}, ${esc(p.obra.titulo)}" width="${Math.round(900 * p.lamina[0] / p.lamina[1])}" height="900" loading="lazy" decoding="async"></a>
  <p class="ficha__latin"><i translate="no">${esc(p.latinLamina)}</i></p>
  <p class="ficha__nombre">${esc(p.nombre)}</p>
  <p class="ficha__fuente">${esc(MESES[datos.meses.findIndex(m => m.plantas.includes(p.id))])} · ${esc(p.obra.autor)},&nbsp;${esc(p.obra.anio)}</p>
</li>`).join('\n');
}

export function rellenar(html, datos) {
    return html
        .replace('{{PORTADA}}', portada(datos))
        .replace('{{MESES}}', escenas(datos))
        .replace('{{RUTA}}', ruta(datos))
        .replace('{{REGIONES}}', opciones(datos))
        .replace('{{CALENDARIO}}', calendario(datos))
        .replace('{{LAMINAS}}', catalogo(datos));
}
