// Locandine della pagina "Fede e vita": versione grande (lato max 1600) + miniatura (560w)
// in assets/img/avvisi/. Sorgenti in images/avvisi/ (gitignored).
const fs = require('fs');
const path = require('path');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');
const SRC = path.join(__dirname, 'images', 'avvisi');
const OUT = path.join(__dirname, 'assets', 'img', 'avvisi');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(SRC).filter(f => /\.jpe?g$/i.test(f))) {
    const base = f.replace(/\.jpe?g$/i, '');
    const img = sharp(path.join(SRC, f)).rotate();
    const m = await img.metadata();
    await img.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${base}.jpg`));
    await img.clone().resize({ width: 560, withoutEnlargement: true })
      .jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${base}-t.jpg`));
    console.log('ok', base, m.width + 'x' + m.height);
  }
})().catch(e => { console.error(e); process.exit(1); });
