// «Qué florece hoy»: región y fecha → las plantas en flor y las que están a punto.
import { MESES, queFlorece, rangoMeses, regionPorCoordenadas } from './floracion.js';

const CLAVE = 'herbario.region';
const leer = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
const guardar = v => { try { localStorage.setItem(CLAVE, v); } catch { /* sin almacenamiento */ } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const EN = { atlantica: 'en el norte atlántico', montana: 'en la montaña', interior: 'en el interior',
    mediterranea: 'en el litoral mediterráneo', sur: 'en el sur' };

function hoyISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tarjeta(p, region, herbario) {
    const guardada = herbario.tiene(p.id);
    return `<li>
  <div class="tarjeta__imagen"><img src="media/${p.id}/planta-700.webp" alt="${esc(p.nombre)}" width="${p.planta.px[0]}" height="${p.planta.px[1]}" loading="lazy" decoding="async"></div>
  <div class="tarjeta__tira">
    <p class="tarjeta__fila"><b>${esc(p.nombre)}</b> <span>${rangoMeses(p.floracion[region])}</span></p>
    <p><i translate="no">${esc(p.latin)}</i></p>
    <button type="button" data-guardar="${p.id}" aria-pressed="${guardada}">${guardada ? 'Guardada en tu herbario' : 'Guardar en mi herbario'}</button>
  </div>
</li>`;
}

export function montarHoy(raiz, datos, herbario) {
    const form = raiz.querySelector('[data-hoy-form]');
    const fecha = raiz.querySelector('[data-fecha]');
    const salida = raiz.querySelector('[data-hoy-resultado]');
    const boton = raiz.querySelector('[data-ubicacion]');
    const aviso = raiz.querySelector('[data-ubicacion-aviso]');
    const portada = document.querySelector('[data-hoy]');

    const previa = leer();
    if (previa && form.querySelector(`input[value="${previa}"]`)) form.region.value = previa;
    fecha.value = hoyISO();

    function pintar() {
        const region = form.region.value;
        const [anio, mes, dia] = (fecha.value || hoyISO()).split('-').map(Number);
        const { enFlor, aPunto } = queFlorece(datos.plantas, region, mes);
        const cuando = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(Date.UTC(anio, mes - 1, dia));
        const siguiente = MESES[mes % 12];
        salida.innerHTML =
            `<section class="hoy__grupo" aria-labelledby="h-flor"><h3 id="h-flor">En flor</h3>` +
            `<p>${enFlor.length ? `El ${cuando}, ${EN[region]}, ${enFlor.length === 1 ? 'florece una de las 36 plantas' : `florecen ${enFlor.length} de las 36 plantas`}.` : `El ${cuando}, ${EN[region]}, no florece ninguna de las 36 plantas de este herbario.`}</p>` +
            (enFlor.length ? `<ul class="tarjetas">${enFlor.map(p => tarjeta(p, region, herbario)).join('')}</ul>` : '') +
            `</section>` +
            (aPunto.length ? `<section class="hoy__grupo" aria-labelledby="h-punto"><h3 id="h-punto">A punto</h3><p>Empiezan a florecer en ${siguiente}.</p>` +
                `<ul class="tarjetas">${aPunto.map(p => tarjeta(p, region, herbario)).join('')}</ul></section>` : '');
        if (portada && anio) {
            const hoy = queFlorece(datos.plantas, region, new Date().getMonth() + 1).enFlor;
            const nombres = hoy.slice(0, 3).map(p => p.nombre.toLowerCase());
            if (nombres.length) {
                const lista = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0];
                portada.innerHTML = `Hoy, ${EN[region]}, ${hoy.length > 1 ? 'florecen' : 'florece'} <b>${esc(lista)}</b>${hoy.length > 3 ? ', entre otras' : ''}.`;
                portada.hidden = false;
            }
        }
    }

    form.addEventListener('change', () => { guardar(form.region.value); pintar(); });
    fecha.addEventListener('input', pintar);
    form.addEventListener('submit', e => e.preventDefault());
    document.addEventListener('herbario:cambio', pintar);

    if ('geolocation' in navigator) {
        boton.hidden = false;
        boton.addEventListener('click', () => {
            aviso.textContent = 'Buscando dónde estás…';
            navigator.geolocation.getCurrentPosition(pos => {
                const r = regionPorCoordenadas(pos.coords.latitude, pos.coords.longitude);
                if (!r) { aviso.textContent = 'Estás fuera de la península y Baleares. Elige la región que más se parezca a tu clima.'; return; }
                form.region.value = r; guardar(r); pintar();
                aviso.textContent = `Región: ${EN[r].replace(/^en (el |la )?/, '')}. Si vives en una sierra, elige montaña.`;
            }, () => { aviso.textContent = 'No se ha podido saber dónde estás. Elige la región a mano.'; },
            { maximumAge: 600000, timeout: 10000 });
        });
    }
    pintar();
}
