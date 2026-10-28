// Entrada: monta las escenas del año, la portada, «Qué florece hoy» y el herbario.
import { montarAno } from './escenas.js';
import { montarHoy } from './hoy.js';
import { montarPliego } from './pliego.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Portada: las plantas sueltas suben a velocidades distintas según se baja, como capas de papel
function montarPortada() {
    const portada = document.querySelector('.portada');
    const plantas = [...portada.querySelectorAll('.portada__planta')];
    const velocidad = [0.22, 0.38, 0.12, 0.3];
    if (reduce) return;
    let pendiente = false;
    const leer = () => {
        pendiente = false;
        const y = Math.min(scrollY, portada.offsetHeight);
        plantas.forEach((p, k) => { p.style.transform = `translate3d(0, ${(-y * velocidad[k]).toFixed(1)}px, 0)`; });
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
