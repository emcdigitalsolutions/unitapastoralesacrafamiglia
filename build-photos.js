// Ottimizzazione foto reali della comunità → assets/img/
// Ridimensiona + comprime (sharp) le foto scelte dall'archivio locale images/.
// Le sorgenti in images/ restano fuori dal repo (.gitignore): si committano solo gli output.
const path = require('path');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'assets', 'img');

const ANNIV   = 'Festeggiamo del 24 Anniversario di Sacerdozio del nostro Parroco P. Marco Damanti';
const MADONNA = 'Prima domenica di settembre Madonna del Pozzo';
const LECTIO  = 'Lectio Divina Serale Estiva';
const LIVATINO= "eventi 21 settembre ricordo dell'uccisione del giudice Livatino. Conferenza e a seguire santa Messa . Presieduta da don Giuseppe Livatino";
const ACQUA   = 'Battaglia per l acqua e per la contrada Maddalusa di Agrigento';

// [sorgente, destinazione, larghezzaMax, qualità]
const JOBS = [
  // Banner immersivo "i nostri pastori" (orizzontale)
  ['donmarcoepadreagostinoinsieme.jpg', 'pastori-banner.jpg', 1700, 84],
  // Momenti di comunità (card gallery, sfondo)
  [path.join(ANNIV,    '65f7cddd-46ff-4ba2-84e4-27dd1fb79524.jpg'), 'evento-anniversario.jpg',  1200, 80],
  [path.join(ANNIV,    '142f9826-38b3-458e-965e-636e30e3aef7.jpg'), 'evento-anniversario-torta.jpg', 1000, 80],
  [path.join(MADONNA,  '03a88c1f-e1b8-4af2-b223-bace905cf3ed.jpg'), 'evento-madonna-pozzo.jpg', 1100, 72],
  [path.join(LECTIO,   'f5e04b09-c1e4-4946-bdba-d9b27964752f.jpg'), 'evento-lectio.jpg',        1200, 80],
  [path.join(LIVATINO, 'ee12efb7-2f0c-41fe-8eb6-926cdd9a3e22.jpg'), 'evento-livatino.jpg',      1100, 74],
  [path.join(ACQUA,    'b18840e7-026d-4a69-8d70-49c005608353.jpg'), 'evento-acqua.jpg',         1200, 80],
  // Locandine (verticali)
  ['doposcuola.jpg',  'doposcuola.jpg',      820, 84],
  ['orariomesse.jpg', 'locandina-orari.jpg', 850, 84],
];

(async () => {
  for (const [src, dst, w, q] of JOBS) {
    const inPath = path.join(SRC, src);
    const outPath = path.join(OUT, dst);
    const img = sharp(inPath).rotate(); // rispetta EXIF orientation
    const meta = await img.metadata();
    await img
      .resize({ width: Math.min(w, meta.width || w), withoutEnlargement: true })
      .jpeg({ quality: q, mozjpeg: true, progressive: true })
      .toFile(outPath);
    const kb = Math.round(require('fs').statSync(outPath).size / 1024);
    console.log(`ok  ${dst}  (${kb} KB)`);
  }
  console.log('— fatto —');
})().catch(e => { console.error(e); process.exit(1); });
