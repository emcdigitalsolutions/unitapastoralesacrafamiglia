// Gallerie per evento: dedup, esclusioni, ordina (cover prima), esporta versione
// grande (1400w) + miniatura (260w) in assets/img/gallery/<evento>/NN[-t].jpg.
// Stampa il conteggio per evento (serve per il manifest nel lightbox).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');

const SRC = path.join(__dirname, 'images');
const OUTROOT = path.join(__dirname, 'assets', 'img', 'gallery');

const EVENTS = {
  anniversario: {
    folder: 'Festeggiamo del 24 Anniversario di Sacerdozio del nostro Parroco P. Marco Damanti',
    cover: '65f7cddd-46ff-4ba2-84e4-27dd1fb79524.jpg',
  },
  'madonna-pozzo': {
    folder: 'Prima domenica di settembre Madonna del Pozzo',
    cover: '03a88c1f-e1b8-4af2-b223-bace905cf3ed.jpg',
  },
  lectio: {
    folder: 'Lectio Divina Serale Estiva',
    cover: 'f5e04b09-c1e4-4946-bdba-d9b27964752f.jpg',
  },
  livatino: {
    folder: "eventi 21 settembre ricordo dell'uccisione del giudice Livatino. Conferenza e a seguire santa Messa . Presieduta da don Giuseppe Livatino",
    cover: 'ee12efb7-2f0c-41fe-8eb6-926cdd9a3e22.jpg',
  },
  acqua: {
    folder: 'Battaglia per l acqua e per la contrada Maddalusa di Agrigento',
    cover: 'b18840e7-026d-4a69-8d70-49c005608353.jpg',
    // Escludi lo screenshot TV col watermark LanternaTV (+ suo duplicato)
    exclude: ['8787683e-7754-4047-a98f-2c43d98bfe1c.jpg', 'Battaglia per l acqua e per la contrada Maddalusa di Agrigento.jpg'],
  },
};

(async () => {
  const summary = {};
  for (const [key, cfg] of Object.entries(EVENTS)) {
    const dir = path.join(SRC, cfg.folder);
    const outDir = path.join(OUTROOT, key);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    const exclude = new Set(cfg.exclude || []);
    let files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f) && !exclude.has(f));

    // dedup per contenuto
    const seen = new Set(); const uniq = [];
    for (const f of files.sort()) {
      const h = crypto.createHash('md5').update(fs.readFileSync(path.join(dir, f))).digest('hex');
      if (seen.has(h)) continue; seen.add(h); uniq.push(f);
    }
    // cover prima
    uniq.sort((a, b) => (a === cfg.cover ? -1 : b === cfg.cover ? 1 : a.localeCompare(b)));

    let i = 0;
    for (const f of uniq) {
      i++;
      const nn = String(i).padStart(2, '0');
      const img = sharp(path.join(dir, f)).rotate();
      await img.clone().resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(outDir, `${nn}.jpg`));
      await img.clone().resize({ width: 260, height: 195, fit: 'cover' })
        .jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(outDir, `${nn}-t.jpg`));
    }
    summary[key] = i;
    const bytes = fs.readdirSync(outDir).reduce((s, f) => s + fs.statSync(path.join(outDir, f)).size, 0);
    console.log(`ok  ${key}: ${i} foto  (${Math.round(bytes / 1024)} KB tot)`);
  }
  console.log('\nMANIFEST:', JSON.stringify(summary));
})().catch(e => { console.error(e); process.exit(1); });
