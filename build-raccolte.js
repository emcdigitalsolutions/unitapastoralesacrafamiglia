// Raccolte fondi: ritaglio della statua del Cristo Risorto dalla locandina (images/raccolte/),
// coprendo i frammenti di testo della locandina col colore dello sfondo.
const path = require('path');
const sharp = require('C:/workspace/social-image-generator/node_modules/sharp');
const SRC = path.join(__dirname, 'images', 'raccolte', 'cristo-risorto-locandina.jpg');
const OUT = path.join(__dirname, 'assets', 'img', 'raccolta-cristo-risorto.jpg');
(async () => {
  const crop = await sharp(SRC).extract({ left: 540, top: 140, width: 415, height: 1000 }).toBuffer();
  const px = async (x, y) => { const { data } = await sharp(crop).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true }); return `rgb(${data[0]},${data[1]},${data[2]})`; };
  const c1 = await px(20, 300), c2 = await px(20, 470), c3 = await px(20, 960);
  // toppe a colore pieno con sfumatura sul bordo destro (verso la statua)
  const patch = (w, h, rgb, feather = 14) => {
    const buf = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, a = Math.min(1, (w - x) / feather, (y + 1) / 6, (h - y) / 6);
      buf[i] = rgb[0]; buf[i + 1] = rgb[1]; buf[i + 2] = rgb[2]; buf[i + 3] = Math.round(255 * Math.max(0, a));
    }
    return { input: buf, raw: { width: w, height: h, channels: 4 } };
  };
  const rgb = s => s.match(/\d+/g).map(Number);
  // coordinate in pixel dell'immagine finale (620px di larghezza)
  const patches = [
    { ...patch(16, 150, rgb(c1), 6), left: 0, top: 20 },
    { ...patch(150, 110, rgb(c2)), left: 0, top: 525 },
    { ...patch(152, 380, rgb(c2)), left: 0, top: 846 },
    { ...patch(198, 86, rgb(c3)), left: 0, top: 1266 },
    { ...patch(146, 34, rgb(c3), 8), left: 0, top: 1460 },
    { ...patch(210, 20, rgb(c3), 8), left: 0, top: 1472 },
  ];
  const base = await sharp(crop).resize({ width: 620 }).toBuffer();
  await sharp(base).composite(patches).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(OUT);
  console.log('ok', c1, c2, c3);
})().catch(e => { console.error(e); process.exit(1); });
