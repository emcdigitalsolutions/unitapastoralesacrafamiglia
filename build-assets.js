// Generazione asset raster: favicon.ico, icone PWA, apple-touch-icon, og-cover.jpg
// Usa sharp + puppeteer-core (da social-image-generator) + Chrome di sistema.
const fs = require('fs');
const path = require('path');
const SIG = 'C:/workspace/social-image-generator/node_modules';
const sharp = require(SIG + '/sharp');
const puppeteer = require(SIG + '/puppeteer-core');

const IMG = path.join(__dirname, 'assets', 'img');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const svg = fs.readFileSync(path.join(IMG, '..', '..', 'favicon.svg'));

function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

const ogHtml = `<!DOCTYPE html><html><head><meta charset="utf8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;
background:radial-gradient(120% 100% at 72% 8%,#2c356b,#1a2040 48%,#111634);color:#fff;position:relative}
.glow{position:absolute;top:-120px;right:-100px;width:640px;height:640px;border-radius:50%;
background:radial-gradient(circle,rgba(220,192,130,.35),rgba(220,192,130,.05) 45%,transparent 70%)}
.wrap{position:absolute;inset:0;display:flex;align-items:center;gap:60px;padding:0 90px}
.crest{width:230px;height:auto;flex:none;filter:drop-shadow(0 20px 50px rgba(0,0,0,.4))}
.ey{font-family:'Segoe UI',Arial,sans-serif;font-size:22px;letter-spacing:6px;text-transform:uppercase;color:#dcc082;font-weight:600}
h1{font-size:74px;line-height:1.05;margin:16px 0 20px;font-weight:500}
h1 em{font-style:italic;color:#dcc082}
.sub{font-size:30px;color:#cdd0e6;line-height:1.35}
.rule{width:120px;height:3px;background:linear-gradient(90deg,#dcc082,transparent);margin-top:26px}
</style></head><body>
<div class="glow"></div>
<div class="wrap">
<div>${svg.toString().replace('width="180"','').replace('viewBox="0 0 64 64"','viewBox="0 0 64 64" class="crest"')}</div>
<div>
<div class="ey">Arcidiocesi di Agrigento &middot; Campobello di Licata</div>
<h1>Unit&agrave; Pastorale<br><em>Sacra Famiglia</em></h1>
<div class="sub">Parrocchie Ges&ugrave; e Maria e San Giuseppe</div>
<div class="rule"></div>
</div>
</div>
</body></html>`;

(async () => {
  // 1) Icone PWA + apple-touch da favicon.svg (fondo navy, ottimo come app icon)
  const sizes = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 };
  for (const [name, size] of Object.entries(sizes)) {
    await sharp(svg, { density: 512 }).resize(size, size).png().toFile(path.join(IMG, name));
    console.log('ok', name);
  }
  // 2) favicon.ico (48x48 PNG in contenitore ICO)
  const png48 = await sharp(svg, { density: 512 }).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, 'favicon.ico'), pngToIco(png48, 48));
  console.log('ok favicon.ico');

  // 3) og-cover.jpg 1200x630
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(ogHtml, { waitUntil: 'networkidle0' });
  const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(IMG, 'og-cover.jpg'), buf);
  await browser.close();
  console.log('ok og-cover.jpg');
})().catch(e => { console.error(e); process.exit(1); });
