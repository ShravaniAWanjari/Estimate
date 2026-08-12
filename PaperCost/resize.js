const sharp = require('sharp');
const path = require('path');

async function resizeIcons() {
  const input = path.join(__dirname, 'public', 'logo.png');
  const size192 = path.join(__dirname, 'public', 'logo192.png');
  const size512 = path.join(__dirname, 'public', 'logo512.png');

  // Resize using object-fit cover with a transparent/white background if needed
  // We'll use "contain" to ensure the whole logo is visible inside a square, with a transparent background.
  await sharp(input)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile(size192);

  await sharp(input)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile(size512);

  console.log('Icons resized successfully');
}

resizeIcons().catch(console.error);
