// Las doce escenas del año, ligadas al scroll.
//
// Es el motor de scroll de scroll-world (references/scrub-engine.js) adaptado a capas recortadas en
// lugar de vídeo: se conservan su cadena de tramos (un tramo por mes, con su peso en alturas de
// pantalla), el fundido en las juntas, la pausa a mitad de escena (linger, aquí centrada en la fase
// que toca: la flor o el fruto), el suavizado hacia el objetivo, la carga de lo que está cerca y el
// trato del móvil (no recalcular cuando sólo cambia la barra del navegador). Se quitan las partículas y
// el aviso animado, porque se moverían solos: aquí todo depende de la posición del scroll.
//
// Sin JavaScript los meses se leen uno tras otro; con prefers-reduced-motion las láminas aparecen
// completas y sólo se funden de un mes al siguiente.

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const suave = x => { x = clamp(x); return x * x * (3 - 2 * x); };

// Pausa a mitad de escena con el centro donde se quiera: f(0)=0, f(1)=1, pendiente 1-L en el centro
function pausa(x, L, c) {
    if (!L) return x;
    const u = x < c ? (x - c) / c : (x - c) / (1 - c);
    const v = (1 - L) * u + L * u * u * u;
    return c + v * (x < c ? c : 1 - c);
}

// Fases de cada escena, en fracción del tramo
const BROTA = [0, 0.28], FLORECE = [0.22, 0.5], FRUTO = [0.45, 0.7], SECA = [0.74, 0.98];
const tramo = (t, [a, b]) => suave((t - a) / (b - a));
const rgb = hex => [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16));
const mezcla = (a, b, t) => `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(' ')})`;

export function montarAno(seccion, { porMes = 1.5, fundido = 0.12, demora = 0.5 } = {}) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
    const escenario = seccion.querySelector('.ano__escenario');
    const ruta = seccion.querySelector('.ruta');
    const enlaces = [...ruta.querySelectorAll('a')];
    const articulos = [...escenario.querySelectorAll('.mes')];
    const N = articulos.length;
    if (!N) return null;

    seccion.classList.add('con-escenas');
    ruta.hidden = false;

    const SEGMENTOS = articulos.map((el, i) => preparar(el, i));
    // El papel de cada mes (lo pone render.mjs); la página entera pasa de uno a otro con el scroll
    const PAPELES = articulos.map(a => rgb(a.style.getPropertyValue('--papel-mes').trim() || '#e9ebe7'));
    const raiz = document.documentElement;
    let vh = escenario.clientHeight, vw = innerWidth, arriba = 0, total = 0, activo = -1;
    let anchoMaquetado = innerWidth, leyendo = false, moviendo = false;

    function preparar(el, i) {
        const fig = el.querySelector('.lamina');
        const img = fig.querySelector('.lamina__planta');
        const s = {
            el, i, w: porMes,
            centro: el.dataset.estado === 'fruto' ? 0.66 : 0.52,
            nombre: el.querySelector('.mes__nombre'),
            textos: [...el.querySelectorAll('.mes__cabeza, .etiqueta, .mes__tambien')],
            fases: [...el.querySelectorAll('.fases li')],
            sombra: fig.querySelector('.lamina__sombra'),
            imgs: [], cur: 0, target: 0, visible: false, cargada: i < 2, fase: -1,
        };
        // La planta va en un cuerpo con tres copias: en tinta, en color y seca
        const cuerpo = document.createElement('div');
        cuerpo.className = 'lamina__cuerpo';
        cuerpo.style.cssText = img.style.cssText + `;aspect-ratio:${img.width} / ${img.height};transform-origin:50% 100%`;
        img.removeAttribute('style');
        img.replaceWith(cuerpo);
        const linea = img.cloneNode();
        const seca = img.cloneNode();
        linea.classList.add('lamina__planta--linea');
        seca.classList.add('lamina__planta--seca');
        linea.alt = seca.alt = '';
        cuerpo.append(linea, img, seca);
        s.cuerpo = cuerpo; s.color = img; s.seca = seca;
        s.detalles = [...fig.querySelectorAll('.lamina__detalle')].map((d, k) => {
            const x = parseFloat(d.style.left) / 100 + parseFloat(d.style.width) / 200;
            const y = parseFloat(d.style.top) / 100 + 0.05;
            return { el: d, dx: x - 0.5, dy: y - 0.5, prof: 0.7 + ((k * 37 + i * 11) % 9) / 10 };
        });
        // Lo lejano no se descarga hasta que se acerca (como los clips del motor original)
        s.imgs = [...el.querySelectorAll('img')];
        if (!s.cargada) for (const im of s.imgs) {
            if (im.srcset) { im.dataset.srcset = im.srcset; im.removeAttribute('srcset'); }
            im.dataset.src = im.src; im.removeAttribute('src');
        }
        if (s.sombra && !s.cargada) { s.sombra.dataset.recorte = s.sombra.style.getPropertyValue('--recorte'); s.sombra.style.removeProperty('--recorte'); }
        if (reduce) aplicar(s, 1, true);
        return s;
    }

    function cargar(s) {
        if (s.cargada) return;
        s.cargada = true;
        for (const im of s.imgs) {
            if (im.dataset.srcset) im.srcset = im.dataset.srcset;
            if (im.dataset.src) im.src = im.dataset.src;
        }
        if (s.sombra && s.sombra.dataset.recorte) s.sombra.style.setProperty('--recorte', s.sombra.dataset.recorte);
    }

    // Pinta una escena en el punto t (0..1) de su tramo
    function aplicar(s, t, quieto = reduce) {
        if (quieto) {
            s.cuerpo.style.clipPath = 'none';
            s.color.style.opacity = 1;
            s.seca.style.opacity = 0;
            for (const d of s.detalles) { d.el.style.opacity = 1; d.el.style.transform = 'none'; }
            marcarFase(s, -1);
            return;
        }
        const k1 = tramo(t, BROTA), k2 = tramo(t, FLORECE), k3 = tramo(t, FRUTO), k4 = tramo(t, SECA);
        s.cuerpo.style.clipPath = k1 >= 1 ? 'none' : `inset(${((1 - k1) * 100).toFixed(2)}% -10% 0 -10%)`;
        s.cuerpo.style.transform = `translateY(${((1 - k1) * 4).toFixed(2)}%) rotate(${(-2.5 * k4).toFixed(2)}deg) scale(${(1 - 0.04 * k4).toFixed(4)})`;
        s.color.style.opacity = k2.toFixed(3);
        s.seca.style.opacity = k4.toFixed(3);
        const deriva = (0.5 - t) * 0.1 * vh;
        for (const d of s.detalles) {
            const lejos = 1 - k3;
            // Suben desde abajo, cada una a su profundidad, sin cruzar la columna del nombre
            // En el móvil apenas viajan: debajo está la etiqueta
            const viaje = vw > 860 ? 1 : 0.6;
            const x = lejos * d.dx * 0.08 * vw * d.prof * viaje;
            const y = (lejos * (0.25 + d.dy * 0.3) * vh + deriva + k4 * 0.05 * vh) * d.prof * viaje;
            d.el.style.opacity = (k3 * (1 - 0.55 * k4)).toFixed(3);
            d.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        }
        if (s.sombra) {
            s.sombra.style.opacity = (k1 * (1 - 0.6 * k4)).toFixed(3);
            s.sombra.style.transform = `translate(2.5%, ${(1.5 + (t - 0.5) * 8).toFixed(2)}%) scale(${(1.14 + 0.08 * t).toFixed(3)})`;
        }
        s.nombre.style.transform = vw > 860 ? `translate3d(0, ${((0.5 - t) * 0.08 * vh).toFixed(1)}px, 0)` : '';
        marcarFase(s, t < BROTA[1] - 0.02 ? 0 : t < FRUTO[0] + 0.02 ? 1 : t < SECA[0] ? 2 : 3);
    }

    function marcarFase(s, f) {
        if (f === s.fase) return;
        s.fase = f;
        s.fases.forEach((li, k) => k === f ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current'));
    }

    function maquetar() {
        vh = escenario.clientHeight || innerHeight;
        vw = innerWidth;
        anchoMaquetado = innerWidth;
        let off = 0;
        SEGMENTOS.forEach(s => { s.start = off * vh; off += s.w; s.end = off * vh; });
        total = off;
        seccion.style.height = `${total * vh + vh}px`;
        arriba = seccion.getBoundingClientRect().top + scrollY;
        leer();
    }

    function leer() {
        const y = scrollY - arriba;
        const fade = fundido * vh;
        let ci = 0;
        for (let i = 0; i < N; i++) if (y >= SEGMENTOS[i].start) ci = i;
        for (let i = 0; i < N; i++) {
            const s = SEGMENTOS[i];
            if (y > s.start - 1.6 * vh && y < s.end + 1.6 * vh) cargar(s);
            const local = clamp((y - s.start) / (s.end - s.start));
            s.target = pausa(local, demora, s.centro);
            // Fundido centrado en cada junta: en la junta, los dos meses están a la mitad
            let op = Math.min(suave((y - (s.start - fade / 2)) / fade), suave((s.end + fade / 2 - y) / fade));
            if ((i === 0 && y < s.start) || (i === N - 1 && y > s.end)) op = 1;   // llega y se va con la sección
            s.el.style.opacity = op;
            // El texto cambia antes que la lámina: en la junta nunca se leen dos meses a la vez
            const opTexto = clamp((op - 0.5) * 2).toFixed(3);
            for (const t of s.textos) t.style.opacity = opTexto;
            // Sin visibility: hidden, para que los lectores de pantalla lean todos los meses
            s.el.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
            s.el.style.zIndex = i === ci ? 2 : 1;
            s.visible = op > 0.001;
            if (reduce) s.cur = s.target;
        }
        if (ci !== activo) {
            activo = ci;
            enlaces.forEach((a, k) => k === ci ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
        }
        ruta.classList.toggle('es-visible', y > -0.4 * vh && y < total * vh - 0.6 * vh);
        const pos = clamp(y / vh / porMes - 0.5, 0, N - 1);
        const i0 = Math.floor(pos), i1 = Math.min(N - 1, i0 + 1);
        raiz.style.setProperty('--papel', mezcla(PAPELES[i0], PAPELES[i1], suave(pos - i0)));
        leyendo = false;
        if (!reduce && !moviendo) { moviendo = true; requestAnimationFrame(paso); }
    }

    // Suaviza hacia el objetivo y se detiene en cuanto llega: sin scroll, nada se mueve
    function paso() {
        let falta = false;
        for (const s of SEGMENTOS) {
            if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
            s.cur += (s.target - s.cur) * 0.18;
            if (Math.abs(s.target - s.cur) < 0.0008) s.cur = s.target; else falta = true;
            if (s.visible) aplicar(s, s.cur);
        }
        if (falta) requestAnimationFrame(paso); else moviendo = false;
    }

    function irA(i, comportamiento) {
        const s = SEGMENTOS[i];
        const destino = arriba + s.start + (s.end - s.start) * s.centro;
        scrollTo({ top: destino, behavior: comportamiento || (reduce ? 'auto' : 'smooth') });
    }

    enlaces.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); irA(i); history.replaceState(null, '', `#${articulos[i].id}`); }));
    // Enlaces a un mes desde otras partes de la página
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || ruta.contains(a)) return;
        const i = articulos.findIndex(m => `#${m.id}` === a.getAttribute('href'));
        if (i < 0) return;
        e.preventDefault(); irA(i); history.replaceState(null, '', `#${articulos[i].id}`);
    });
    // Con el teclado: al entrar el foco en un mes, se va a ese mes
    escenario.addEventListener('focusin', e => {
        const i = articulos.findIndex(m => m.contains(e.target));
        if (i >= 0 && i !== activo) irA(i, 'auto');
    });

    addEventListener('scroll', () => { if (!leyendo) { leyendo = true; requestAnimationFrame(leer); } }, { passive: true });
    // En el móvil, la barra del navegador cambia el alto al hacer scroll: sólo se recalcula si cambia el ancho
    addEventListener('resize', () => { if (coarse && innerWidth === anchoMaquetado) return; maquetar(); });
    addEventListener('orientationchange', maquetar);
    addEventListener('load', maquetar);
    maquetar();

    const inicial = articulos.findIndex(m => `#${m.id}` === location.hash);
    if (inicial >= 0) irA(inicial, 'auto');

    return { irA, mesActivo: () => activo };
}
