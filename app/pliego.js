// Tu herbario: las plantas guardadas, montadas en un pliego con su etiqueta. Se guarda en este
// navegador y se descarga en PNG a color o como cianotipia (las siluetas en blanco sobre azul).

const CLAVE = 'herbario.pliego';
const MAX = 9;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || { plantas: [], recolector: '', lugar: '' }; }
    catch { return { plantas: [], recolector: '', lugar: '' }; }
}
function escribir(estado) { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento */ } }

// Huecos del pliego para n plantas, en fracción del papel (deja libre la esquina de la etiqueta)
function huecos(n) {
    const filas = n <= 2 ? 1 : n <= 6 ? 2 : 3;
    const res = [];
    let k = 0;
    for (let f = 0; f < filas; f++) {
        const quedan = n - k;
        const enFila = Math.ceil(quedan / (filas - f));
        for (let c = 0; c < enFila; c++, k++) {
            const w = 0.88 / enFila;
            res.push({ x: 0.06 + c * w, y: 0.05 + f * (0.78 / filas), w, h: 0.78 / filas - 0.02 });
        }
    }
    return res;
}

export function montarPliego(raiz, datos) {
    const porId = Object.fromEntries(datos.plantas.map(p => [p.id, p]));
    const hoja = raiz.querySelector('[data-pliego]');
    const etiqueta = raiz.querySelector('[data-etiqueta]');
    const acciones = raiz.querySelector('[data-acciones]');
    const ciano = raiz.querySelector('[data-cianotipia]');
    const vacio = hoja.querySelector('.pliego-propio__vacio');
    const aviso = raiz.querySelector('[data-herbario-aviso]');
    let deshacer = null;
    let estado = leer();
    estado.plantas = estado.plantas.filter(id => porId[id]);

    etiqueta.recolector.value = estado.recolector || '';
    etiqueta.lugar.value = estado.lugar || '';

    function anunciar() { document.dispatchEvent(new CustomEvent('herbario:cambio')); }

    // Sin plantas guardadas, el pliego enseña de ejemplo las tres plantas de este mes
    const delMes = datos.meses[new Date().getMonth()];

    function pintar() {
        const ids = estado.plantas;
        const ejemplo = ids.length === 0;
        const muestra = ejemplo ? delMes.plantas : ids;
        hoja.querySelectorAll('.pieza, .pliego-propio__ficha').forEach(n => n.remove());
        hoja.classList.toggle('es-ejemplo', ejemplo);
        vacio.hidden = true;
        acciones.hidden = ejemplo;
        huecos(muestra.length).forEach((h, i) => {
            const p = porId[muestra[i]];
            const fig = document.createElement('figure');
            fig.className = 'pieza';
            fig.style.cssText = `left:${h.x * 100}%;top:${h.y * 100}%;width:${h.w * 100}%;height:${h.h * 100}%;grid-template-rows:minmax(0,1fr) auto`;
            fig.innerHTML = `<span class="pieza__planta"><img src="media/${p.id}/planta-700.webp" alt="${esc(p.nombre)}" width="${p.planta.px[0]}" height="${p.planta.px[1]}" loading="lazy">` +
                `<span class="pieza__cinta" aria-hidden="true"></span></span>` +
                `<figcaption><i translate="no">${esc(p.latin)}</i><br>${esc(p.nombre)}</figcaption>` +
                (ejemplo
                    ? `<button type="button" class="pieza__guardar" data-guardar="${p.id}">Guardar</button>`
                    : `<button type="button" data-quitar="${p.id}" aria-label="Quitar ${esc(p.nombre.toLowerCase())} del herbario">×</button>`);
            hoja.append(fig);
        });
        const ficha = document.createElement('div');
        ficha.className = 'pliego-propio__ficha';
        ficha.innerHTML = ejemplo
            ? `<b>Ejemplo: ${esc(delMes.nombre.toLowerCase())}</b>Todavía no has guardado ninguna planta. Pulsa «Guardar» en estas o en cualquier lámina.`
            : `<b>Herbario${estado.recolector ? ` de ${esc(estado.recolector)}` : ' del año'}</b>` +
              `${estado.lugar ? esc(estado.lugar) + '<br>' : ''}${ids.length} ${ids.length === 1 ? 'planta' : 'plantas'} · ${new Date().getFullYear()}`;
        hoja.append(ficha);
        document.querySelectorAll('[data-guardar]:not(.pieza__guardar)').forEach(b => {
            const si = ids.includes(b.dataset.guardar);
            b.setAttribute('aria-pressed', si);
            b.textContent = si ? 'Guardada en tu herbario' : 'Guardar en mi herbario';
        });
    }

    const api = {
        tiene: id => estado.plantas.includes(id),
        alternar(id) {
            const p = porId[id];
            if (api.tiene(id)) {
                const antes = [...estado.plantas];
                estado.plantas = estado.plantas.filter(x => x !== id);
                avisar(`Has quitado ${p.nombre.toLowerCase()} del pliego.`, () => { estado.plantas = antes; escribir(estado); pintar(); anunciar(); });
            } else if (estado.plantas.length < MAX) {
                estado.plantas.push(id);
                avisar(`${p.nombre} está en tu herbario.`);
            } else { avisar(`En un pliego caben ${MAX} plantas. Quita alguna para guardar ${p.nombre.toLowerCase()}.`); return; }
            escribir(estado); pintar(); anunciar();
        },
    };

    // Aviso en la página (no un alert), con «Deshacer» cuando se quita una planta
    function avisar(texto, alDeshacer) {
        deshacer = alDeshacer || null;
        aviso.innerHTML = '';
        aviso.append(texto);
        if (alDeshacer) {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'enlace'; b.textContent = 'Deshacer';
            b.addEventListener('click', () => { if (deshacer) deshacer(); deshacer = null; aviso.textContent = 'Vuelve a estar en el pliego.'; });
            aviso.append(' ', b);
        }
    }

    document.addEventListener('click', e => {
        const g = e.target.closest('[data-guardar]');
        if (g) { api.alternar(g.dataset.guardar); return; }
        const q = e.target.closest('[data-quitar]');
        if (q) api.alternar(q.dataset.quitar);
    });
    etiqueta.addEventListener('input', () => {
        estado.recolector = etiqueta.recolector.value.trim();
        estado.lugar = etiqueta.lugar.value.trim();
        escribir(estado); pintar();
    });
    etiqueta.addEventListener('submit', e => e.preventDefault());
    ciano.addEventListener('change', () => hoja.classList.toggle('es-cianotipia', ciano.checked));
    raiz.querySelectorAll('[data-descargar]').forEach(b => b.addEventListener('click', () => descargar(b.dataset.descargar === 'cianotipia')));
    document.querySelectorAll('[data-guardar]').forEach(b => { b.hidden = false; });

    async function descargar(cianotipia) {
        await document.fonts.ready;
        const W = 2030, H = 2940;                       // 29 × 42 cm a 70 px/cm
        const lienzo = document.createElement('canvas');
        lienzo.width = W; lienzo.height = H;
        const c = lienzo.getContext('2d');
        c.fillStyle = cianotipia ? '#24559f' : '#f4f3ee';
        c.fillRect(0, 0, W, H);
        const tinta = cianotipia ? '#f1f4fb' : '#1f241d';
        const ids = estado.plantas;
        const hs = huecos(ids.length);
        for (let i = 0; i < ids.length; i++) {
            const p = porId[ids[i]], h = hs[i];
            const img = await cargarImagen(`media/${p.id}/planta-1400.webp`);
            const caja = { x: h.x * W, y: h.y * H, w: h.w * W, h: h.h * H - 90 };
            const e = Math.min(caja.w / img.width, caja.h / img.height);
            const iw = img.width * e, ih = img.height * e;
            const x = caja.x + (caja.w - iw) / 2, y = caja.y + caja.h - ih;
            if (cianotipia) {
                const sil = document.createElement('canvas');
                sil.width = img.width; sil.height = img.height;
                const s = sil.getContext('2d');
                s.drawImage(img, 0, 0);
                s.globalCompositeOperation = 'source-in';
                s.fillStyle = tinta; s.fillRect(0, 0, sil.width, sil.height);
                c.drawImage(sil, x, y, iw, ih);
            } else c.drawImage(img, x, y, iw, ih);
            c.fillStyle = tinta; c.textAlign = 'center';
            c.font = 'italic 34px "Bodoni Moda"'; c.fillText(p.latin, caja.x + caja.w / 2, caja.y + caja.h + 44);
            c.font = '30px Spectral'; c.fillText(p.nombre, caja.x + caja.w / 2, caja.y + caja.h + 82);
        }
        // Etiqueta
        const ex = W * 0.53, ey = H * 0.855, ew = W * 0.42, eh = H * 0.11;
        c.strokeStyle = tinta; c.globalAlpha = 0.5; c.lineWidth = 2;
        c.strokeRect(ex, ey, ew, eh);
        c.globalAlpha = 1; c.fillStyle = tinta; c.textAlign = 'left';
        c.font = 'italic 56px "Bodoni Moda"';
        c.fillText(`Herbario${estado.recolector ? ` de ${estado.recolector}` : ' del año'}`.slice(0, 40), ex + 36, ey + 82, ew - 72);
        c.font = '32px Spectral';
        if (estado.lugar) c.fillText(estado.lugar, ex + 36, ey + 140, ew - 72);
        c.fillText(`${ids.length} ${ids.length === 1 ? 'planta' : 'plantas'} · ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, ex + 36, ey + (estado.lugar ? 190 : 140), ew - 72);
        c.font = '24px Spectral';
        c.fillText('Láminas: Biodiversity Heritage Library · pedrogomez.dev/proyecto/herbario', W * 0.05, H - 40);
        lienzo.toBlob(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = cianotipia ? 'herbario-cianotipia.png' : 'herbario.png';
            document.body.append(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        }, 'image/png');
    }

    pintar();
    return api;
}

function cargarImagen(src) {
    return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
}
