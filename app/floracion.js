// Cálculos de floración compartidos por la web y el build (sin DOM).

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];
const CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Une meses seguidos, también a través del cambio de año: [12, 1, 2] → «dic–feb».
export function tramos(lista) {
    const hay = new Set(lista);
    if (hay.size === 12) return [[1, 12]];
    const res = [];
    for (let m = 1; m <= 12; m++) {
        if (!hay.has(m) || hay.has(m === 1 ? 12 : m - 1)) continue;
        let fin = m;
        while (hay.has(fin === 12 ? 1 : fin + 1)) fin = fin === 12 ? 1 : fin + 1;
        res.push([m, fin]);
    }
    return res;
}

export function rangoMeses(lista, largo = false) {
    const nombres = largo ? MESES : CORTOS;
    const t = tramos(lista);
    if (t.length === 1 && t[0][0] === 1 && t[0][1] === 12) return 'todo el año';
    return t.map(([a, b]) => a === b ? nombres[a - 1] : `${nombres[a - 1]}–${nombres[b - 1]}`).join(' y ');
}

// Todos los meses en que florece en alguna región
export function mesesDeFlor(planta) {
    return [...new Set(Object.values(planta.floracion).flat())].sort((a, b) => a - b);
}

// Qué florece en una región un mes dado: en flor, a punto (empieza el mes siguiente)
export function queFlorece(plantas, region, mes) {
    const siguiente = mes === 12 ? 1 : mes + 1;
    const enFlor = [], aPunto = [];
    for (const p of plantas) {
        const meses = p.floracion[region];
        if (!meses) continue;
        if (meses.includes(mes)) enFlor.push(p);
        else if (meses.includes(siguiente)) aPunto.push(p);
    }
    return { enFlor, aPunto };
}

// Región aproximada a partir de las coordenadas, sin salir del navegador. La montaña depende de
// la altitud, así que sólo se propone en el Pirineo; quien viva en otra sierra la elige a mano.
export function regionPorCoordenadas(lat, lon) {
    if (lat < 34 || lat > 44.5 || lon < -10 || lon > 4.6) return null;   // fuera (Canarias incluida)
    if (lon > 1 && lat < 40.2 && lat > 38.5) return 'mediterranea';      // Baleares
    if (lat > 42.4 && lon > -1.6 && lon < 3.3) return 'montana';         // Pirineo
    if (lat > 42.6 && lon < -1.6) return 'atlantica';
    if (lat > 41.8 && lon < -6.8) return 'atlantica';                    // sur de Galicia
    if (lat < 38.3 && lon < -1.6) return 'sur';
    if (lon > 0.9 && lat > 40.5) return 'mediterranea';                  // litoral catalán
    if (lon > -1.6 && lat < 38.6) return 'mediterranea';                 // Murcia y Alicante
    if (lon > -0.9 && lat < 40.8) return 'mediterranea';                 // Valencia y Castellón
    return 'interior';
}
