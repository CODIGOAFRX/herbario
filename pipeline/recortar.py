# Recorta cada lámina en capas: la planta entera y las figuras de detalle (flor abierta, fruto, semilla).
#
#   python pipeline/recortar.py <trabajo> app/media
#
# 1. El papel se estima a baja resolución (un máximo local quita la tinta y un desenfoque lo alisa) y la
#    tinta es la distancia de cada píxel a ese papel. Así se ignoran las manchas y el amarilleo del escaneo.
# 2. La máscara de tinta se cierra y se le rellenan los huecos pequeños: los pétalos blancos, que en el
#    grabado son sólo un contorno, quedan con su papel dentro, como recortados a tijera.
# 3. Se quitan los marcos (filas o columnas casi enteras de tinta), lo que toca el borde (lomo del libro,
#    sombras del escaneo), el pie con el nombre impreso y el número de lámina.
# 4. Lo alto (al menos un 30 % del alto de la lámina) es la planta; lo demás son detalles, agrupados con
#    la letra que los nombra.
# Escribe app/media/<id>/planta-{1400,700}.webp, detalle-N.webp, lamina-900.webp y <trabajo>/capas.json.
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from seleccion import MESES, AJUSTES

trabajo, media = sys.argv[1], sys.argv[2]
solo = set(sys.argv[3:])
fuentes = json.load(open(os.path.join(trabajo, 'fuentes.json'), encoding='utf-8'))
TRABAJO_ALTO = 2400


def slug(sp):
    return sp.lower().replace(' ', '-')


def papel(rgb, tono):
    """Color del papel en cada punto, interpolado sólo desde los píxeles que parecen papel: así una
    mancha grande de color (un pétalo) no se confunde con el fondo."""
    h, w, _ = rgb.shape
    peq = np.asarray(Image.fromarray(rgb).resize((w // 8, h // 8), Image.BILINEAR)).astype(np.float32)
    es = (np.sqrt(((peq - tono) ** 2).sum(-1)) / 255 < 0.13).astype(np.float32)
    peso = ndi.gaussian_filter(es, 6) + 1e-4
    fondo = np.stack([ndi.gaussian_filter(peq[..., c] * es, 6) / peso for c in range(3)], -1)
    fondo[peso < 0.02] = tono
    return np.asarray(Image.fromarray(fondo.clip(0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float32)


def pagina(rgb):
    """Caja de la página: filas y columnas donde domina el color del papel (fuera quedan el lomo,
    el fondo blanco del escáner y las sombras)."""
    lum = rgb.mean(-1)
    claros = rgb[(lum > np.percentile(lum, 40)) & (lum < np.percentile(lum, 97))]
    tono = np.median(claros, 0)
    parecido = np.sqrt(((rgb.astype(np.float32) - tono) ** 2).sum(-1)) / 255 < 0.12
    filas = np.where(parecido.mean(1) > 0.35)[0]
    cols = np.where(parecido.mean(0) > 0.35)[0]
    y0, y1, x0, x1 = filas[0], filas[-1] + 1, cols[0], cols[-1] + 1
    my, mx = int((y1 - y0) * 0.02), int((x1 - x0) * 0.02)
    return (slice(y0 + my, y1 - my), slice(x0 + mx, x1 - mx)), tono


def quitar_marcos(tinta):
    """Sólo líneas finas: una fila (o columna) casi entera de tinta con poco a ambos lados."""
    t = tinta.copy()
    f, c = t.mean(1), t.mean(0)
    for perfil, eje in ((f, 0), (c, 1)):
        n = len(perfil)
        for i in np.where(perfil > 0.45)[0]:
            if perfil[max(0, i - 10)] < 0.2 and perfil[min(n - 1, i + 10)] < 0.2:
                if eje == 0:
                    t[max(0, i - 5):i + 6, :] = False
                else:
                    t[:, max(0, i - 5):i + 6] = False
    return t


def rellenar_huecos(m, maximo):
    fuera, n = ndi.label(~m)
    if n == 0:
        return m
    areas = ndi.sum(np.ones_like(m), fuera, range(1, n + 1))
    borde = set(np.unique(np.concatenate([fuera[0], fuera[-1], fuera[:, 0], fuera[:, -1]])))
    rellenar = np.zeros(n + 1, bool)
    for i, a in enumerate(areas, 1):
        rellenar[i] = a < maximo and i not in borde
    return m | rellenar[fuera]


def recortar(sp, info):
    im = Image.open(os.path.join(trabajo, 'raw', info['page'] + '.jpg')).convert('RGB')
    esc = TRABAJO_ALTO / im.height
    if esc < 1:
        im = im.resize((round(im.width * esc), TRABAJO_ALTO), Image.LANCZOS)
    rgb = np.asarray(im.filter(ImageFilter.MedianFilter(3)))
    caja, tono = pagina(rgb)
    rgb = np.ascontiguousarray(rgb[caja])
    h, w, _ = rgb.shape
    aj = AJUSTES.get(sp, {})
    fondo = papel(rgb, tono)
    dist = np.sqrt(((fondo - rgb.astype(np.float32)) ** 2).sum(-1)) / 255
    tinta = quitar_marcos(dist > aj.get('umbral', 0.1))
    tinta = ndi.binary_opening(tinta, iterations=1)
    # Una franja junto al borde de la página nunca es lámina: lomo, sombras, número
    b = int(min(h, w) * 0.012)
    tinta[:b], tinta[-b:], tinta[:, :b], tinta[:, -b:] = False, False, False, False
    if 'pie' in aj:
        tinta[int(h * aj['pie']):] = False
    if 'cabeza' in aj:
        tinta[:int(h * aj['cabeza'])] = False

    # Componentes con la tinta cerrada (los trazos de una misma figura se unen)
    cerrada = ndi.binary_closing(ndi.binary_dilation(tinta, iterations=3), iterations=4)
    et, n = ndi.label(cerrada)
    objs = ndi.find_objects(et)
    areas = ndi.sum(cerrada, et, range(1, n + 1))
    quedan = []
    for i, (sl, a) in enumerate(zip(objs, areas), 1):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        bh, bw = y1 - y0, x1 - x0
        if a < h * w * 0.00012:
            continue
        toca = y0 <= 2 or x0 <= 2 or y1 >= h - 2 or x1 >= w - 2
        if toca and (bw < w * 0.04 or bh < h * 0.04):
            continue                                   # restos del lomo o de la sombra del escaneo
        if bh < h * 0.006 or bw < w * 0.006:
            continue                                   # restos de un filete del marco
        if (bw < w * 0.015 and bh > h * 0.25) or (bh < h * 0.015 and bw > w * 0.25):
            continue                                   # filete largo: borde de la lámina o del libro
        if y0 > h * 0.78 and bh < h * 0.06 and bw > bh * 1.6:
            continue                                   # pie con el nombre impreso
        if y1 < h * 0.12 and bh < h * 0.045 and bw > bh * 1.2:
            continue                                   # número de lámina o familia
        quedan.append((i, y0, y1, x0, x1, a))
    if not quedan:
        raise SystemExit(f'{sp}: no queda nada')

    alto = max(q[2] - q[1] for q in quedan)
    planta_ids = [q[0] for q in quedan if (q[2] - q[1]) >= min(max(h * 0.3, alto * 0.55), alto)]
    planta_ids += [q[0] for q in quedan if q[0] in aj.get('planta', [])]
    detalle_ids = [q[0] for q in quedan if q[0] not in planta_ids]

    def mascara(ids):
        m = np.isin(et, ids)
        m = rellenar_huecos(m, h * w * aj.get('huecos', 0.0015))
        return m

    # Detalles: se agrupan los que están cerca (la figura con su letra)
    det_m = mascara(detalle_ids) if detalle_ids else np.zeros((h, w), bool)
    grupos, ng = ndi.label(ndi.binary_dilation(det_m, iterations=int(h * 0.006)))
    grupos = grupos * det_m

    destino = os.path.join(media, slug(sp))
    os.makedirs(destino, exist_ok=True)
    for f in os.listdir(destino):
        os.remove(os.path.join(destino, f))

    def guardar(m, nombre, altos):
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        pad = 6
        y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
        y1, x1 = min(h, y1 + pad), min(w, x1 + pad)
        alfa = ndi.gaussian_filter(m[y0:y1, x0:x1].astype(np.float32), 1.2)
        rgba = np.dstack([rgb[y0:y1, x0:x1], (alfa * 255).clip(0, 255).astype(np.uint8)])
        pieza = Image.fromarray(rgba, 'RGBA')
        for a in altos:
            p = pieza if pieza.height <= a else pieza.resize((round(pieza.width * a / pieza.height), a), Image.LANCZOS)
            p.save(os.path.join(destino, f'{nombre}-{a}.webp' if len(altos) > 1 else f'{nombre}.webp'), quality=82, method=6)
        return {'x': x0 / w, 'y': y0 / h, 'w': (x1 - x0) / w, 'h': (y1 - y0) / h, 'px': [int(x1 - x0), int(y1 - y0)]}

    planta = guardar(mascara(planta_ids), 'planta', [1400, 700])
    detalles = []
    for g in range(1, ng + 1):
        m = grupos == g
        if m.sum() < h * w * 0.0004:
            continue
        caja = guardar(m, f'detalle-{len(detalles) + 1}', [560])
        detalles.append(caja)

    # Lámina entera, con el papel igualado, para el catálogo
    lam = Image.fromarray(rgb)
    lam = lam.resize((round(w * 900 / h), 900), Image.LANCZOS)
    lam.save(os.path.join(destino, 'lamina-900.webp'), quality=80, method=6)
    return {'lamina': [w, h], 'planta': planta, 'detalles': detalles}


salida = os.path.join(trabajo, 'capas.json')
capas = json.load(open(salida, encoding='utf-8')) if os.path.exists(salida) else {}
for mes, plantas in MESES:
    for sp in plantas:
        if solo and sp not in solo:
            continue
        capas[sp] = recortar(sp, fuentes[sp])
        print(mes, sp, len(capas[sp]['detalles']), 'detalles', flush=True)
json.dump(capas, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
