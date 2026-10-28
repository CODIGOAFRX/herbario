// Entrada: monta las escenas del año, la portada, «Qué florece hoy» y el herbario.
import { montarAno } from './escenas.js';
import { montarHoy } from './hoy.js';
import { montarPliego } from './pliego.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

// Portada: el mes de hoy en color (en el móvil, el estante se desplaza hasta él) y, al bajar,
// el estante sube algo más despacio que la página
function montarPortada() {
    const portada = document.querySelector('.portada');
    const estante = portada.querySelector('.portada__ano');
    const hoy = estante.querySelector(`li[data-mes="${new Date().getMonth() + 1}"]`);
    if (hoy) {
        hoy.classList.add('es-hoy');
        hoy.querySelector('a').setAttribute('aria-current', 'date');
        if (estante.scrollWidth > estante.clientWidth) estante.scrollLeft = hoy.offsetLeft - (estante.clientWidth - hoy.offsetWidth) / 2;
    }
    if (reduce) return;
    const ol = estante.querySelector('ol');
    let pendiente = false;
    const leer = () => {
        pendiente = false;
        const y = Math.min(scrollY, portada.offsetHeight);
        ol.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
    };
    addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(leer); } }, { passive: true });
    leer();
}

// Con movimiento reducido, los meses se leen uno tras otro, como sin JavaScript
if (!reduce) montarAno(document.querySelector('#ano'));
montarPortada();

fetch('datos/plantas.json')
    .then(r => r.json())
    .then(datos => {
        const herbario = montarPliego(document.querySelector('#herbario'), datos);
        montarHoy(document.querySelector('#hoy'), datos, herbario);
    })
    .catch(() => {
        document.querySelector('[data-hoy-resultado]').innerHTML = '<p>No se han podido cargar los datos. El <a href="#calendario">calendario de floración</a> tiene las mismas fechas.</p>';
    });
