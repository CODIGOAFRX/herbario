// Genera dist/proyecto/herbario (servido en pedrogomez.dev/proyecto/herbario) desde app/:
// escribe en el HTML los doce meses, el calendario y el catálogo a partir de app/datos/plantas.json
// (así la página se lee entera sin JavaScript), versiona CSS y JS con un hash de su contenido y deja
// _headers en la raíz de dist, donde lo lee el Worker de archivos estáticos.
import { cp, readFile, rm, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { rellenar } from './render.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = '/proyecto/herbario';
const dist = resolve(repo, 'dist');
const out = resolve(dist, base.slice(1));

await rm(dist, { recursive: true, force: true });
await cp(resolve(repo, 'app'), out, { recursive: true });
await rename(resolve(out, '_headers'), resolve(dist, '_headers'));

const datos = JSON.parse(await readFile(resolve(repo, 'app/datos/plantas.json'), 'utf8'));
const hash = async file => createHash('sha256').update(await readFile(resolve(out, file))).digest('hex').slice(0, 10);

let html = rellenar(await readFile(resolve(out, 'index.html'), 'utf8'), datos);
for (const [, file] of html.matchAll(/\{\{v:([^}]+)\}\}/g)) html = html.replace(`{{v:${file}}}`, await hash(file));
html = html.replaceAll('{{BASE}}', base);
if (/\{\{/.test(html)) throw new Error('Queda una marca sin rellenar en index.html');
await writeFile(resolve(out, 'index.html'), html);
console.log(`Generado ${out} (${datos.plantas.length} plantas)`);
