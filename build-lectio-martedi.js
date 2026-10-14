// Galleria "Lectio Divina del martedì" (Chiesa di Gesù e Maria) + copertina card evento in evidenza.
const fs = require('fs');
const path = require('path');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');
const SRC = path.join(__dirname, 'images', 'Lectio Divina del Martedì');
const OUT = path.join(__dirname, 'assets', 'img', 'gallery', 'lectio-martedi');
// ordine: assemblea in ascolto → P. Marco → Messa (dall'alto, altare) → momento di fraternità all'esterno
const ORDER = ['8ba25af6-8c65-46d5-a841-4a7c4549a5c3.jpg', '41aeac9f-e178-41a5-bf3f-d943559a773e.jpg',
  '24c80ba0-c55a-47fe-87af-bd25878bede3.jpg', 'd883e11d-be18-43a9-9af5-1627e8786db3.jpg',
  '3b4c8f5e-24ea-43fa-bdee-18767f8e4290.jpg', '3f9db84b-05b0-4f31-87d1-bad067295e1c.jpg',
  '70c82978-ad58-421a-a3a4-5bc01781741f.jpg'];
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  let i = 0;
  for (const f of ORDER) {
    i++; const nn = String(i).padStart(2, '0');
    const img = sharp(path.join(SRC, f)).rotate();
    await img.clone().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${nn}.jpg`));
    await img.clone().resize({ width: 260, height: 195, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(OUT, `${nn}-t.jpg`));
  }
  // copertina card in evidenza (larga): assemblea in ascolto
  await sharp(path.join(SRC, ORDER[0])).rotate().resize({ width: 1600, height: 900, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(__dirname, 'assets', 'img', 'evento-lectio-martedi.jpg'));
  console.log('ok lectio-martedi:', i, 'foto');
})().catch(e => { console.error(e); process.exit(1); });
