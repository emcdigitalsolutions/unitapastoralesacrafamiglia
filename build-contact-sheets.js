// Provini (contact sheet) per evento: dedup per hash, salta file troppo piccoli,
// tila le miniature in una griglia con indice, così posso rivedere tutto in pochi PNG.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');

const SRC = path.join(__dirname, 'images');
const OUT = path.join(__dirname, '_shots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const EVENTS = {
  anniversario: 'Festeggiamo del 24 Anniversario di Sacerdozio del nostro Parroco P. Marco Damanti',
  'madonna-pozzo': 'Prima domenica di settembre Madonna del Pozzo',
  lectio: 'Lectio Divina Serale Estiva',
  livatino: "eventi 21 settembre ricordo dell'uccisione del giudice Livatino. Conferenza e a seguire santa Messa . Presieduta da don Giuseppe Livatino",
  acqua: 'Battaglia per l acqua e per la contrada Maddalusa di Agrigento',
};

const THUMB = 300, COLS = 4, PAD = 8, LABEL = 22;

(async () => {
  for (const [key, folder] of Object.entries(EVENTS)) {
    const dir = path.join(SRC, folder);
    const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f));
    const seen = new Set();
    const kept = [];
    for (const f of files.sort()) {
      const p = path.join(dir, f);
      const buf = fs.readFileSync(p);
      const h = crypto.createHash('md5').update(buf).digest('hex');
      const kb = Math.round(buf.length / 1024);
      if (seen.has(h)) { console.log(`  dup   ${key}/${f}`); continue; }
      seen.add(h);
      kept.push({ f, kb });
    }
    // costruisci griglia
    const n = kept.length;
    const rows = Math.ceil(n / COLS);
    const cellW = THUMB + PAD, cellH = THUMB + PAD + LABEL;
    const W = COLS * cellW + PAD, H = rows * cellH + PAD;
    const composites = [];
    for (let i = 0; i < n; i++) {
      const { f } = kept[i];
      const thumb = await sharp(path.join(dir, f)).rotate()
        .resize(THUMB, THUMB, { fit: 'cover' })
        .extend({ bottom: LABEL, background: '#111634' })
        .composite([{ input: Buffer.from(`<svg width="${THUMB}" height="${THUMB + LABEL}"><text x="6" y="${THUMB + 15}" font-family="Arial" font-size="13" fill="#dcc082">${String(i).padStart(2, '0')}  ${f.slice(0, 14)} (${kept[i].kb}KB)</text></svg>`), top: 0, left: 0 }])
        .jpeg().toBuffer();
      const col = i % COLS, row = Math.floor(i / COLS);
      composites.push({ input: thumb, top: PAD + row * cellH, left: PAD + col * cellW });
    }
    await sharp({ create: { width: W, height: H, channels: 3, background: '#faf5ec' } })
      .composite(composites).jpeg({ quality: 82 }).toFile(path.join(OUT, `sheet-${key}.jpg`));
    console.log(`ok  sheet-${key}.jpg  (${n} foto)`);
  }
})().catch(e => { console.error(e); process.exit(1); });
