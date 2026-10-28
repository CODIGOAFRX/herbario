# Escribe app/datos/plantas.json, la única fuente de datos de la web, y CREDITOS.md.
#
#   python pipeline/datos.py <trabajo>
#
# Junta la selección (seleccion.py), las fichas (contenido.py), las láminas descargadas
# (<trabajo>/fuentes.json) y las capas recortadas (<trabajo>/capas.json).
import json, math, os, sys, unicodedata
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from seleccion import MESES
from contenido import PLANTAS, REGIONES, OBRAS_INFO

trabajo = sys.argv[1]
raiz = os.path.join(os.path.dirname(__file__), '..')
fuentes = json.load(open(os.path.join(trabajo, 'fuentes.json'), encoding='utf-8'))
capas = json.load(open(os.path.join(trabajo, 'capas.json'), encoding='utf-8'))

NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
               'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
ESTACION = ['invierno', 'invierno', 'primavera', 'primavera', 'primavera', 'verano', 'verano',
            'verano', 'otoño', 'otoño', 'otoño', 'invierno']


def luz(mes, lat=40.4168):
    """Horas de luz el día 15 del mes en Madrid (con la refracción y el radio del sol)."""
    n = sum([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][:mes - 1]) + 15
    dec = math.radians(23.44) * math.sin(2 * math.pi * (284 + n) / 365)
    phi = math.radians(lat)
    cosw = (math.sin(math.radians(-0.833)) - math.sin(phi) * math.sin(dec)) / (math.cos(phi) * math.cos(dec))
    horas = 2 * math.degrees(math.acos(cosw)) / 15
    h, m = int(horas), round((horas - int(horas)) * 60)
    if m == 60:
        h, m = h + 1, 0
    return f'{h} h {m:02d} min'


def obra(texto):
    t = unicodedata.normalize('NFC', texto).lower()
    for clave, info in OBRAS_INFO.items():
        if t.startswith(clave.lower()):
            return info
    raise SystemExit('Obra sin ficha: ' + texto[:60])


plantas, meses = [], []
for i, (mes, especies) in enumerate(MESES, 1):
    ids = []
    for sp in especies:
        c, f, p = capas[sp], fuentes[sp], PLANTAS[sp]
        pid = sp.lower().replace(' ', '-')
        ids.append(pid)
        plantas.append({
            'id': pid,
            'latin': p.get('latin', sp),
            'latinLamina': sp,
            'nombre': p['nombre'],
            'familia': p['familia'],
            'mes': mes,
            'estado': p['estado'],
            'floracion': p['floracion'],
            'texto': p['texto'],
            'obra': obra(f['obra']),
            'bhl': 'https://www.biodiversitylibrary.org/page/' + f['page'],
            'flickr': f['flickr'],
            'lamina': c['lamina'],
            'planta': c['planta'],
            'detalles': c['detalles'],
        })
    meses.append({'id': mes, 'nombre': NOMBRES_MES[i - 1], 'numero': i, 'estacion': ESTACION[i - 1],
                  'luz': luz(i), 'plantas': ids})

datos = {'regiones': REGIONES, 'meses': meses, 'plantas': plantas}
json.dump(datos, open(os.path.join(raiz, 'app', 'datos', 'plantas.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))

# Créditos, lámina a lámina
lineas = ['# Créditos de las láminas', '',
          'Todas las láminas son de dominio público. Se descargaron de la Biodiversity Heritage Library '
          '(biodiversitylibrary.org), que las publica también en su cuenta de Flickr '
          '(flickr.com/photos/biodivlibrary). Cada lámina se recortó en capas para esta web '
          '(ver `pipeline/`); el original está en el enlace de su fila.', '',
          '| Mes | Planta | Obra | Autor | Lugar y año | Original |', '| --- | --- | --- | --- | --- | --- |']
for p in plantas:
    o = p['obra']
    lugar = ', '.join(x for x in (o['lugar'], o['anio']) if x)
    lineas.append(f"| {p['mes']} | {p['nombre']} (*{p['latinLamina']}*) | *{o['titulo']}* ({o['tecnica']}) | "
                  f"{o['autor']} | {lugar} | [BHL]({p['bhl']}) · [Flickr]({p['flickr']}) |")
lineas += ['', 'Tipografías: Bodoni Moda (Owen Earl) y Spectral (Production Type), con licencia SIL Open Font License 1.1.', '']
open(os.path.join(raiz, 'CREDITOS.md'), 'w', encoding='utf-8').write('\n'.join(lineas))
print(len(plantas), 'plantas,', len(meses), 'meses')

# Imagen para compartir (1200 × 630): las doce protagonistas en fila, como el muro de la portada
from PIL import Image
lienzo = Image.new('RGB', (1200, 630), (28, 27, 22))
ancho = 1200 / 6
for k, m in enumerate(meses):
    im = Image.open(os.path.join(raiz, 'app', 'media', m['plantas'][0], 'lamina-900.webp')).convert('RGB')
    alto = 315
    e = max(ancho / im.width, alto / im.height)
    im = im.resize((round(im.width * e), round(im.height * e)))
    x0, y0 = (im.width - round(ancho)) // 2, (im.height - alto) // 2
    lienzo.paste(im.crop((x0, y0, x0 + round(ancho), y0 + alto)), (round((k % 6) * ancho), (k // 6) * alto))
lienzo.save(os.path.join(raiz, 'app', 'media', 'portada.jpg'), quality=82)
