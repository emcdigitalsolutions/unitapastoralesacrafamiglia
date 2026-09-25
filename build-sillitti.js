// Galleria "Visita alla casa di riposo IPAB I. e G. Sillitti" (16/9/2026) + copertina video Bibbirria.
// Ritaglia il timestamp in sovrimpressione delle foto da smartphone (03, 04).
const fs = require('fs');
const path = require('path');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');
const SRC = path.join(__dirname, 'images', 'sillitti');
const OUT = path.join(__dirname, 'assets', 'img', 'gallery', 'sillitti');
// ordine: cover (foto di gruppo) → vestizione → sacerdoti → Messa → letture → coro → gruppo ristretto
const ORDER = ['06-c86b8a10.jpg', '01-6d65dabe.jpg', '02-851feaf4.jpg', '03-f2475812.jpg', '05-78536012.jpg', '04-f0c8cd6b.jpg', '07-21751e0c.jpg'];
const CROP_BOTTOM = { '03-f2475812.jpg': 70, '04-f0c8cd6b.jpg': 70 };
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  let i = 0;
  for (const f of ORDER) {
    i++; const nn = String(i).padStart(2, '0');
    const meta = await sharp(path.join(SRC, f)).metadata();
    const buf = await sharp(path.join(SRC, f)).rotate()
      .extract({ left: 0, top: 0, width: meta.width, height: meta.height - (CROP_BOTTOM[f] || 0) }).toBuffer();
    await sharp(buf).resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${nn}.jpg`));
    await sharp(buf).resize({ width: 260, height: 195, fit: 'cover', position: 'attention' }).jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(OUT, `${nn}-t.jpg`));
  }
  // copertina card evento
  await sharp(path.join(SRC, '06-c86b8a10.jpg')).rotate().resize({ width: 900, height: 700, fit: 'cover', position: 'north' })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(__dirname, 'assets', 'img', 'evento-sillitti.jpg'));
  // copertina video (niente richieste a i.ytimg.com prima del play)
  for (const w of [1280, 640]) await sharp(path.join(__dirname, 'images', 'video-acqua-thumb.jpg')).resize({ width: w })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(path.join(__dirname, 'assets', 'img', `video-acqua${w === 640 ? '-sm' : ''}.jpg`));
  console.log('ok sillitti:', i, 'foto');
})().catch(e => { console.error(e); process.exit(1); });
