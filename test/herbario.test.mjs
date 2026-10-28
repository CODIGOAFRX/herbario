// Datos completos, archivos de cada lámina, cálculos de floración y HTML generado.
// En Windows, `node --test` se queda colgado: ejecuta este archivo con `node test/herbario.test.mjs`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { rangoMeses, tramos, queFlorece, regionPorCoordenadas, mesesDeFlor } from '../app/floracion.js';
import { rellenar } from '../scripts/render.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const datos = JSON.parse(await readFile(resolve(repo, 'app/datos/plantas.json'), 'utf8'));

test('doce meses de tres plantas, sin repetir', () => {
    assert.equal(datos.meses.length, 12);
    const ids = datos.meses.flatMap(m => m.plantas);
    assert.equal(ids.length, 36);
    assert.equal(new Set(ids).size, 36);
    assert.deepEqual(new Set(datos.plantas.map(p => p.id)), new Set(ids));
});

test('cada planta tiene su ficha, su crédito y su floración', () => {
    for (const p of datos.plantas) {
        for (const k of ['nombre', 'latin', 'familia', 'texto', 'bhl', 'flickr']) assert.ok(p[k], `${p.id}: falta ${k}`);
        assert.match(p.bhl, /^https:\/\/www\.biodiversitylibrary\.org\/page\/\d+$/);
        assert.ok(p.obra.autor && p.obra.titulo && p.obra.anio, `${p.id}: obra incompleta`);
        assert.ok(['flor', 'fruto'].includes(p.estado));
        const regiones = Object.keys(p.floracion);
        assert.ok(regiones.length > 0, `${p.id}: sin floración`);
        for (const r of regiones) {
            assert.ok(datos.regiones[r], `${p.id}: región ${r}`);
            for (const m of p.floracion[r]) assert.ok(Number.isInteger(m) && m >= 1 && m <= 12);
        }
    }
});

test('las protagonistas en flor florecen en su mes en alguna región', () => {
    for (const [i, m] of datos.meses.entries()) {
        const p = datos.plantas.find(x => x.id === m.plantas[0]);
        if (p.estado === 'flor') assert.ok(mesesDeFlor(p).includes(i + 1), `${p.id} no florece en ${m.id}`);
    }
});

test('cada lámina tiene sus recortes en app/media', async () => {
    for (const p of datos.plantas) {
        const dir = resolve(repo, 'app/media', p.id);
        for (const f of ['planta-1400.webp', 'planta-700.webp', 'lamina-900.webp']) await access(resolve(dir, f));
        for (let i = 1; i <= p.detalles.length; i++) await access(resolve(dir, `detalle-${i}.webp`));
        const { x, y, w, h } = p.planta;
        assert.ok(x >= 0 && y >= 0 && x + w <= 1.0001 && y + h <= 1.0001, `${p.id}: planta fuera de la lámina`);
    }
});

test('rangos de meses, también a través del año', () => {
    assert.equal(rangoMeses([3, 4, 5]), 'mar–may');
    assert.equal(rangoMeses([12, 1, 2]), 'dic–feb');
    assert.equal(rangoMeses([10]), 'oct');
    assert.equal(rangoMeses([2, 3, 9, 10]), 'feb–mar y sep–oct');
    assert.equal(rangoMeses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), 'todo el año');
    assert.deepEqual(tramos([11, 12, 1]), [[11, 1]]);
    assert.equal(rangoMeses([10, 11], true), 'octubre–noviembre');
});

test('qué florece: en flor y a punto', () => {
    const azafran = datos.plantas.find(p => p.id === 'crocus-sativus');
    const octubre = queFlorece(datos.plantas, 'interior', 10);
    assert.ok(octubre.enFlor.includes(azafran));
    const septiembre = queFlorece(datos.plantas, 'interior', 9);
    assert.ok(septiembre.aPunto.includes(azafran));
    assert.ok(!queFlorece(datos.plantas, 'atlantica', 10).enFlor.includes(azafran));
});

test('región por coordenadas', () => {
    const casos = [
        [40.4168, -3.7038, 'interior'],      // Madrid
        [37.3891, -5.9845, 'sur'],           // Sevilla
        [39.4699, -0.3763, 'mediterranea'],  // Valencia
        [37.9922, -1.1307, 'mediterranea'],  // Murcia
        [41.3874, 2.1686, 'mediterranea'],   // Barcelona
        [39.5696, 2.6502, 'mediterranea'],   // Palma
        [43.263, -2.935, 'atlantica'],       // Bilbao
        [42.2406, -8.7207, 'atlantica'],     // Vigo
        [42.5704, -0.5498, 'montana'],       // Jaca
        [41.6488, -0.8891, 'interior'],      // Zaragoza
        [28.4636, -16.2518, null],           // Santa Cruz de Tenerife
    ];
    for (const [lat, lon, r] of casos) assert.equal(regionPorCoordenadas(lat, lon), r, `${lat}, ${lon}`);
});

test('el HTML generado tiene los doce meses y ninguna marca sin rellenar', async () => {
    const plantilla = await readFile(resolve(repo, 'app/index.html'), 'utf8');
    const html = rellenar(plantilla, datos);
    assert.equal((html.match(/<article class="mes"/g) || []).length, 12);
    assert.equal((html.match(/class="ficha"/g) || []).length, 36);
    assert.doesNotMatch(html.replace(/\{\{(v:[^}]+|BASE)\}\}/g, ''), /\{\{/);
    for (const m of datos.meses) assert.match(html, new RegExp(`id="${m.id}"`));
});
