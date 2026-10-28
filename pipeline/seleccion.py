# Las 36 plantas del año: tres por mes, la primera es la protagonista de la escena.
# Para cada una se elige la lámina de la Biodiversity Heritage Library según el orden de OBRAS
# (la primera obra que la tenga), salvo que PAGINA fije una página concreta.
MESES = [
    ('enero', ['Galanthus nivalis', 'Helleborus foetidus', 'Calendula officinalis']),
    ('febrero', ['Prunus spinosa', 'Crocus vernus', 'Tussilago farfara']),
    ('marzo', ['Viola odorata', 'Anemone nemorosa', 'Rosmarinus officinalis']),
    ('abril', ['Citrus aurantium', 'Cistus ladanifer', 'Thymus vulgaris']),
    ('mayo', ['Papaver rhoeas', 'Centaurea cyanus', 'Rosa canina']),
    ('junio', ['Hypericum perforatum', 'Digitalis purpurea', 'Tilia cordata']),
    ('julio', ['Cichorium intybus', 'Echium vulgare', 'Malva sylvestris']),
    ('agosto', ['Nerium oleander', 'Vitis vinifera', 'Ficus carica']),
    ('septiembre', ['Colchicum autumnale', 'Punica granatum', 'Calluna vulgaris']),
    ('octubre', ['Crocus sativus', 'Arbutus unedo', 'Hedera helix']),
    ('noviembre', ['Olea europaea', 'Cydonia vulgaris', 'Mespilus germanica']),
    ('diciembre', ['Ilex aquifolium', 'Viscum album', 'Ruscus aculeatus']),
]

OBRAS = [
    'Deutschlands flora in abbild',
    "Köhler's Medizinal-Pflanzen",
    'Flore médicale',
    'Sämmtliche Giftgewächse',
    'Herbarium Blackwellianum',
    'Description, vertus et usage',
    'Plantarum indigenarum et exo',
    'Histoire des arbres forestie',
    "Edwards's botanical register",
    "Curtis's botanical magazine",
    'Billeder af nordens flora',
]

PAGINA = {}

# Ajustes a mano por lámina, comprobados en las hojas de prueba:
#   pie / cabeza: a partir de qué fracción del alto se corta el texto impreso abajo / arriba
#   umbral: distancia mínima al papel para contar como tinta (más bajo en láminas pálidas)
#   huecos: área máxima (fracción de la lámina) de un hueco cerrado que se rellena con papel
AJUSTES = {
    'Nerium oleander': {'pie': 0.865},
}
