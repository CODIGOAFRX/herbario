# Fichas de las 36 plantas y de las obras de las que salen sus láminas.
#
# Floración por región, en meses (1 = enero). Son épocas aproximadas, tomadas de Flora iberica
# (Real Jardín Botánico, CSIC) y de las fichas de Anthos para la península y Baleares; cada año se
# adelantan o se retrasan con el tiempo que haga, y en la montaña dependen de la altitud.
#
# Regiones:
#   atlantica    Galicia, Asturias, Cantabria, País Vasco y norte de Navarra
#   montana      Pirineos, cordillera Cantábrica alta, Sistema Central e Ibérico, Sierra Nevada
#   interior     las dos mesetas, el valle del Ebro y Extremadura
#   mediterranea litoral de Cataluña, Valencia y Murcia, y Baleares
#   sur          Andalucía, salvo la alta montaña
#
# estado: lo que hace la planta en el mes de su escena ('flor' o 'fruto'). La escena se detiene en
# esa fase.

REGIONES = {
    'atlantica': 'Norte atlántico',
    'montana': 'Montaña',
    'interior': 'Interior',
    'mediterranea': 'Litoral mediterráneo',
    'sur': 'Sur',
}

OBRAS_INFO = {
    'Deutschlands flora': {
        'autor': 'Jacob Sturm', 'titulo': 'Deutschlands Flora in Abbildungen nach der Natur',
        'lugar': 'Núremberg', 'anio': '1798-1862', 'tecnica': 'grabado coloreado a mano'},
    "Köhler's Medizinal-Pflanzen": {
        'autor': 'Franz Eugen Köhler', 'titulo': "Köhler's Medizinal-Pflanzen",
        'lugar': 'Gera-Untermhaus', 'anio': '1883-1914', 'tecnica': 'cromolitografía'},
    'Flore médicale': {
        'autor': 'François-Pierre Chaumeton y Pierre Jean François Turpin', 'titulo': 'Flore médicale',
        'lugar': 'París', 'anio': '1828-1835', 'tecnica': 'grabado punteado coloreado a mano'},
    'Sämmtliche Giftgewächse': {
        'autor': 'Eduard Winkler', 'titulo': 'Sämmtliche Giftgewächse Deutschlands',
        'lugar': 'Leipzig', 'anio': '1854', 'tecnica': 'litografía coloreada a mano'},
    'Herbarium Blackwellianum': {
        'autor': 'Elizabeth Blackwell', 'titulo': 'Herbarium Blackwellianum',
        'lugar': 'Núremberg', 'anio': '1750-1773', 'tecnica': 'grabado coloreado a mano'},
    'Plantarum indigenarum': {
        'autor': 'Anónimo', 'titulo': 'Plantarum indigenarum et exoticarum icones ad vivum coloratae',
        'lugar': '', 'anio': '1788', 'tecnica': 'grabado coloreado a mano'},
    "Edwards's botanical register": {
        'autor': 'John Lindley (ed.)', 'titulo': "Edwards's Botanical Register",
        'lugar': 'Londres', 'anio': '1829-1847', 'tecnica': 'grabado coloreado a mano'},
    'Billeder af nordens flora': {
        'autor': 'August Mentz y C. H. Ostenfeld', 'titulo': 'Billeder af Nordens Flora',
        'lugar': 'Copenhague', 'anio': '1917-1927', 'tecnica': 'litografía en color'},
}

PLANTAS = {
    'Galanthus nivalis': dict(
        nombre='Campanilla de invierno', familia='Amarilidáceas', estado='flor',
        floracion={'atlantica': [1, 2, 3], 'montana': [2, 3, 4]},
        texto='Abre con la nieve todavía en el suelo: el bulbo guarda desde el otoño todo lo que necesita. '
              'En España crece silvestre en los bosques húmedos del norte y del Pirineo.'),
    'Helleborus foetidus': dict(
        nombre='Eléboro fétido', familia='Ranunculáceas', estado='flor',
        floracion={'atlantica': [1, 2, 3, 4], 'montana': [2, 3, 4, 5], 'interior': [1, 2, 3, 4],
                   'mediterranea': [12, 1, 2, 3], 'sur': [12, 1, 2, 3]},
        texto='Sus campanas verdes con el borde granate salen en pleno invierno, cuando casi nada florece. '
              'Toda la planta es venenosa y huele mal al estrujarla, de ahí su nombre.'),
    'Calendula officinalis': dict(
        nombre='Caléndula', familia='Asteráceas', estado='flor',
        floracion={'atlantica': [3, 4, 5, 6, 7, 8, 9, 10], 'montana': [5, 6, 7, 8, 9],
                   'interior': [4, 5, 6, 7, 8, 9, 10], 'mediterranea': [1, 2, 3, 4, 5, 6, 10, 11, 12],
                   'sur': [1, 2, 3, 4, 5, 6, 10, 11, 12]},
        texto='Se cultiva desde hace siglos y en la costa florece casi todo el año, también en enero. '
              'Su pariente silvestre, la maravilla, llena en invierno los bordes de los caminos del sur.'),
    'Prunus spinosa': dict(
        nombre='Endrino', familia='Rosáceas', estado='flor',
        floracion={'atlantica': [3, 4], 'montana': [4, 5], 'interior': [3, 4], 'mediterranea': [2, 3], 'sur': [2, 3]},
        texto='Florece en blanco sobre las ramas todavía desnudas, antes de sacar las hojas. '
              'Sus frutos, las endrinas, maduran en otoño y son las del pacharán.'),
    'Crocus vernus': dict(
        nombre='Azafrán de primavera', familia='Iridáceas', estado='flor',
        floracion={'atlantica': [2, 3, 4], 'montana': [3, 4, 5, 6]},
        texto='Sale en los prados de montaña en cuanto se retira la nieve, a veces atravesándola. '
              'Es pariente del azafrán de octubre, pero florece en primavera y no da especia.'),
    'Tussilago farfara': dict(
        nombre='Fárfara', familia='Asteráceas', estado='flor',
        floracion={'atlantica': [2, 3, 4], 'montana': [3, 4, 5], 'interior': [2, 3, 4], 'mediterranea': [2, 3]},
        texto='Primero salen las flores, amarillas y sin hojas, en taludes y orillas de ríos. '
              'Las hojas grandes, con forma de huella de caballo, llegan cuando ya ha florecido.'),
    'Viola odorata': dict(
        nombre='Violeta', familia='Violáceas', estado='flor',
        floracion={'atlantica': [2, 3, 4], 'montana': [3, 4, 5], 'interior': [2, 3, 4],
                   'mediterranea': [1, 2, 3], 'sur': [1, 2, 3]},
        texto='Se encuentra antes por el olor que por la vista, al pie de setos y muros umbríos. '
              'Además de las flores que se ven, da otras cerradas, cerca del suelo, que se fecundan solas.'),
    'Anemone nemorosa': dict(
        nombre='Anémona de bosque', familia='Ranunculáceas', estado='flor',
        floracion={'atlantica': [3, 4, 5], 'montana': [4, 5, 6]},
        texto='Cubre el suelo de los hayedos y robledales antes de que los árboles echen hoja y le quiten la luz. '
              'Cada flor se cierra de noche y los días nublados.'),
    'Rosmarinus officinalis': dict(
        nombre='Romero', familia='Lamiáceas', estado='flor',
        floracion={'interior': [2, 3, 4, 5, 9, 10], 'mediterranea': [1, 2, 3, 4, 5, 9, 10, 11, 12],
                   'sur': [1, 2, 3, 4, 10, 11, 12]},
        texto='En el monte mediterráneo florece casi todo el año, con dos picos: el final del invierno y el otoño. '
              'Es una de las primeras flores que encuentran las abejas cada año.'),
    'Citrus aurantium': dict(
        nombre='Naranjo amargo', familia='Rutáceas', estado='flor',
        floracion={'mediterranea': [3, 4, 5], 'sur': [3, 4]},
        texto='Es el naranjo de las calles de Sevilla y de los patios de Córdoba. Su flor es el azahar, '
              'que perfuma las ciudades en abril, y su fruto, demasiado amargo para comerlo, se hace mermelada.'),
    'Cistus ladanifer': dict(
        nombre='Jara pringosa', familia='Cistáceas', estado='flor',
        floracion={'interior': [4, 5, 6], 'mediterranea': [4, 5], 'sur': [3, 4, 5]},
        texto='Cubre montes enteros del oeste y del centro. Cada flor dura un solo día y las hojas '
              'sueltan una resina pegajosa, el ládano, que huele a monte caliente.'),
    'Thymus vulgaris': dict(
        nombre='Tomillo', familia='Lamiáceas', estado='flor',
        floracion={'montana': [5, 6, 7], 'interior': [3, 4, 5, 6], 'mediterranea': [2, 3, 4, 5], 'sur': [2, 3, 4, 5]},
        texto='Una mata baja de tierra seca y caliza que en primavera se cubre de flores pequeñas, '
              'blancas o rosadas. Su olor sale de unas glándulas diminutas en las hojas.'),
    'Papaver rhoeas': dict(
        nombre='Amapola', familia='Papaveráceas', estado='flor',
        floracion={'atlantica': [5, 6, 7], 'montana': [6, 7], 'interior': [4, 5, 6],
                   'mediterranea': [3, 4, 5], 'sur': [3, 4, 5]},
        texto='Llegó a la península con los primeros cereales y vive donde se ara la tierra. '
              'Cada flor dura dos o tres días; la cápsula suelta sus semillas por unos poros, como un salero.'),
    'Centaurea cyanus': dict(
        nombre='Aciano', familia='Asteráceas', estado='flor',
        floracion={'atlantica': [6, 7], 'montana': [6, 7], 'interior': [5, 6], 'mediterranea': [4, 5]},
        texto='Era la flor azul de los trigales. Los herbicidas y la semilla limpia lo han vuelto raro, '
              'y hoy se ve más en los bordes de las fincas que entre la mies.'),
    'Rosa canina': dict(
        nombre='Rosal silvestre', familia='Rosáceas', estado='flor',
        floracion={'atlantica': [5, 6, 7], 'montana': [6, 7], 'interior': [5, 6], 'mediterranea': [4, 5, 6], 'sur': [4, 5]},
        texto='Florece en setos y lindes a final de primavera. En otoño da los escaramujos, rojos, '
              'que pasan el invierno en la rama y son comida para los pájaros.'),
    'Hypericum perforatum': dict(
        nombre='Hipérico', familia='Hipericáceas', estado='flor',
        floracion={'atlantica': [6, 7, 8], 'montana': [6, 7, 8], 'interior': [5, 6, 7],
                   'mediterranea': [5, 6, 7], 'sur': [4, 5, 6]},
        texto='Es la hierba de San Juan: está en plena flor el 24 de junio. Al trasluz, sus hojas '
              'parecen agujereadas por cientos de puntos claros, que son bolsas de aceite.'),
    'Digitalis purpurea': dict(
        nombre='Dedalera', familia='Plantagináceas', estado='flor',
        floracion={'atlantica': [5, 6, 7], 'montana': [6, 7, 8], 'interior': [5, 6], 'sur': [4, 5, 6]},
        texto='Crece en suelos ácidos del oeste, en claros de bosque y taludes. De ella se sacó la '
              'digitalina, un medicamento para el corazón; la planta entera es muy venenosa.'),
    'Tilia cordata': dict(
        nombre='Tilo', familia='Malváceas', estado='flor',
        floracion={'atlantica': [6, 7], 'montana': [6, 7], 'interior': [6], 'mediterranea': [5, 6], 'sur': [5, 6]},
        texto='Silvestre en los bosques del norte y plantado en muchas calles y plazas, '
              'donde en junio se le oye antes de verlo: zumba de abejas. Sus flores son la tila.'),
    'Cichorium intybus': dict(
        nombre='Achicoria', familia='Asteráceas', estado='flor',
        floracion={'atlantica': [7, 8, 9], 'montana': [7, 8], 'interior': [6, 7, 8, 9],
                   'mediterranea': [5, 6, 7, 8, 9], 'sur': [5, 6, 7, 8]},
        texto='Sus flores azules se abren por la mañana y se cierran hacia el mediodía, cada una un solo día. '
              'Crece en cunetas y barbechos en lo más seco del verano.'),
    'Echium vulgare': dict(
        nombre='Viborera', familia='Boragináceas', estado='flor',
        floracion={'atlantica': [6, 7, 8], 'montana': [6, 7, 8], 'interior': [5, 6, 7], 'mediterranea': [4, 5, 6], 'sur': [4, 5]},
        texto='Las flores abren rosadas y se vuelven azules al madurar. El nombre le viene de la '
              'semilla, que se parece a la cabeza de una víbora.'),
    'Malva sylvestris': dict(
        nombre='Malva', familia='Malváceas', estado='flor',
        floracion={'atlantica': [5, 6, 7, 8, 9], 'montana': [6, 7, 8], 'interior': [4, 5, 6, 7, 8, 9],
                   'mediterranea': [2, 3, 4, 5, 6, 7, 8, 9, 10], 'sur': [2, 3, 4, 5, 6, 7, 8, 9, 10]},
        texto='Vive junto a las casas, en solares y caminos, y florece durante meses. '
              'Su fruto es un disco de semillas en corro, como un queso pequeño.'),
    'Nerium oleander': dict(
        nombre='Adelfa', familia='Apocináceas', estado='flor',
        floracion={'interior': [6, 7, 8], 'mediterranea': [5, 6, 7, 8, 9], 'sur': [5, 6, 7, 8, 9, 10]},
        texto='Silvestre en ramblas y cauces secos del sur y del levante, florece cuando todo lo demás se agosta. '
              'Es una de las plantas más venenosas de la flora española.'),
    'Vitis vinifera': dict(
        nombre='Vid', familia='Vitáceas', estado='fruto',
        floracion={'atlantica': [6], 'interior': [5, 6], 'mediterranea': [5], 'sur': [4, 5]},
        texto='Florece a final de primavera con racimos verdes que casi no se ven. En agosto la uva '
              'cambia de color, el envero, y empieza la cuenta atrás de la vendimia.'),
    'Ficus carica': dict(
        nombre='Higuera', familia='Moráceas', estado='fruto',
        floracion={'interior': [5, 6, 7], 'mediterranea': [5, 6, 7], 'sur': [4, 5, 6, 7]},
        texto='Sus flores no se ven nunca: están dentro del higo, que es un receptáculo cerrado. '
              'Da dos cosechas, las brevas en junio y los higos a final de verano.'),
    'Colchicum autumnale': dict(
        nombre='Cólquico', familia='Colchicáceas', estado='flor',
        floracion={'atlantica': [8, 9, 10], 'montana': [8, 9, 10], 'interior': [9, 10]},
        texto='Sus flores salen solas del prado en otoño, sin hojas. Las hojas y el fruto aparecen '
              'en la primavera siguiente. Es muy tóxico.'),
    'Punica granatum': dict(
        nombre='Granado', familia='Litráceas', estado='fruto',
        floracion={'interior': [5, 6, 7], 'mediterranea': [5, 6, 7], 'sur': [4, 5, 6, 7]},
        texto='Llegó de Oriente y se quedó: la granada da nombre a la ciudad y está en el escudo de España. '
              'Florece en rojo a principios de verano y la fruta madura en septiembre y octubre.'),
    'Calluna vulgaris': dict(
        nombre='Brecina', familia='Ericáceas', estado='flor',
        floracion={'atlantica': [7, 8, 9, 10], 'montana': [8, 9, 10], 'interior': [8, 9, 10]},
        texto='Tiñe de rosa los brezales del norte y de las sierras al final del verano. '
              'Las flores secas se quedan en la planta durante el invierno, sin perder la forma.'),
    'Crocus sativus': dict(
        nombre='Azafrán', familia='Iridáceas', estado='flor',
        floracion={'interior': [10, 11]},
        texto='En La Mancha, la «rosa» del azafrán sale durante unas tres semanas entre octubre y noviembre. '
              'Se recoge al amanecer y los tres estigmas rojos de cada flor se separan a mano: son la especia.'),
    'Arbutus unedo': dict(
        nombre='Madroño', familia='Ericáceas', estado='flor',
        floracion={'atlantica': [10, 11, 12], 'interior': [10, 11, 12], 'mediterranea': [10, 11, 12, 1],
                   'sur': [10, 11, 12, 1]},
        texto='Florece en otoño a la vez que madura el fruto del año anterior: en la misma rama hay '
              'campanillas blancas y madroños rojos. Es el árbol del escudo de Madrid.'),
    'Hedera helix': dict(
        nombre='Hiedra', familia='Araliáceas', estado='flor',
        floracion={'atlantica': [9, 10, 11], 'montana': [8, 9, 10], 'interior': [9, 10, 11],
                   'mediterranea': [9, 10, 11], 'sur': [9, 10, 11, 12]},
        texto='Florece cuando casi todo ha terminado, y sus umbelas verdes son la última comida '
              'de muchos insectos antes del invierno. Las bayas negras maduran en primavera.'),
    'Olea europaea': dict(
        nombre='Olivo', familia='Oleáceas', estado='fruto',
        floracion={'interior': [5, 6], 'mediterranea': [4, 5], 'sur': [4, 5]},
        texto='Florece en mayo y la aceituna madura despacio todo el verano y el otoño. '
              'En noviembre empieza la recogida, que en Jaén dura hasta el invierno.'),
    'Cydonia vulgaris': dict(
        nombre='Membrillero', familia='Rosáceas', estado='fruto', latin='Cydonia oblonga',
        floracion={'atlantica': [4, 5], 'interior': [4, 5], 'mediterranea': [3, 4], 'sur': [3, 4]},
        texto='Da una flor grande, sola y rosada en primavera, y en otoño un fruto duro y perfumado '
              'que no se come crudo. Cocido con azúcar es el dulce de membrillo.'),
    'Mespilus germanica': dict(
        nombre='Níspero europeo', familia='Rosáceas', estado='fruto',
        floracion={'atlantica': [5, 6], 'montana': [5, 6], 'interior': [5]},
        texto='No es el níspero que se vende en primavera, que vino de Japón. Este madura en noviembre '
              'y sólo se come pasado, cuando las heladas lo ablandan.'),
    'Ilex aquifolium': dict(
        nombre='Acebo', familia='Aquifoliáceas', estado='fruto',
        floracion={'atlantica': [4, 5, 6], 'montana': [5, 6], 'interior': [5, 6]},
        texto='Las bolas rojas sólo las dan los pies femeninos y duran todo el invierno. '
              'Está protegido en muchas comunidades: no se debe cortar del monte.'),
    'Viscum album': dict(
        nombre='Muérdago', familia='Santaláceas', estado='fruto',
        floracion={'atlantica': [2, 3], 'montana': [2, 3, 4], 'interior': [2, 3, 4], 'mediterranea': [2, 3]},
        texto='Vive sobre las ramas de otros árboles y les toma el agua. Sus bayas blancas, pegajosas, '
              'maduran en invierno; los zorzales se las comen y lo siembran en otras ramas.'),
    'Ruscus aculeatus': dict(
        nombre='Rusco', familia='Asparagáceas', estado='fruto',
        floracion={'atlantica': [1, 2, 3, 4], 'montana': [3, 4], 'interior': [2, 3, 4],
                   'mediterranea': [12, 1, 2, 3], 'sur': [12, 1, 2, 3]},
        texto='Lo que parecen hojas pinchudas son tallos aplanados, y en el centro de cada uno sale la flor '
              'y luego la baya roja. Se llamaba «brusco» y se usaba para barrer.'),
}
