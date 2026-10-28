# Descarga a <trabajo>/raw la lámina de cada planta de seleccion.py y escribe <trabajo>/fuentes.json.
# Las láminas se buscan en el canal público de la BHL en Flickr por su etiqueta
# taxonomy:binomial (buscar.py) y se descargan a resolución completa desde biodiversitylibrary.org.
import json, os, sys, time, unicodedata, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from seleccion import MESES, OBRAS, PAGINA

trabajo = sys.argv[1]
raw = os.path.join(trabajo, 'raw')
os.makedirs(raw, exist_ok=True)
feed = json.load(open(os.path.join(trabajo, 'feed.json'), encoding='utf-8'))
UA = {'User-Agent': 'Mozilla/5.0 (herbario; pedrogomez.dev)'}

fuentes = {}
for mes, plantas in MESES:
    for sp in plantas:
        items = feed.get(sp, [])
        elegido = None
        if sp in PAGINA:
            elegido = next((i for i in items if i['page'] == PAGINA[sp]), {'page': PAGINA[sp], 'obra': '', 'flickr': ''})
        else:
            for obra in OBRAS:
                elegido = next((i for i in items if unicodedata.normalize('NFC', i['obra']).startswith(obra)), None)
                if elegido: break
        if not elegido:
            print('SIN LÁMINA', sp); continue
        fn = os.path.join(raw, elegido['page'] + '.jpg')
        if not os.path.exists(fn):
            datos = urllib.request.urlopen(urllib.request.Request(
                'https://www.biodiversitylibrary.org/pageimage/' + elegido['page'], headers=UA), timeout=120).read()
            open(fn, 'wb').write(datos)
            time.sleep(1.5)
        fuentes[sp] = {'mes': mes, **elegido}
        print(mes, sp, elegido['page'], elegido['obra'][:60], flush=True)
json.dump(fuentes, open(os.path.join(trabajo, 'fuentes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
