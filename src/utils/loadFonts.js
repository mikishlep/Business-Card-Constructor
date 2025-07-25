import { fonts } from './fonts.js';

// Очищает base64-строку от пробелов и переносов
function clean(base64) {
  return typeof base64 === 'string' ? base64.replace(/\s+/g, '') : '';
}

// Загружает и регистрирует все шрифты через FontFace API
export async function loadFonts() {
  console.log('Начинаю загрузку шрифтов...');
  const promises = [];

  Object.entries(fonts).forEach(([fontName, data]) => {
    console.log('→ Загружаю шрифт:', fontName);

    if (data.normal) {
      const face = new FontFace(
        fontName,
        `url(data:application/x-font-ttf;charset=utf-8;base64,${clean(data.normal)}) format('truetype')`,
        { weight: '400', style: 'normal', display: 'swap' }
      );
      promises.push(
        face.load()
          .then(loaded => {
            document.fonts.add(loaded);
            console.log(`✅ ${fontName} (normal) загружен`);
          })
          .catch(err => {
            console.error(`❌ Ошибка загрузки ${fontName} (normal):`, err);
          })
      );
    }

    if (data.bold) {
      const face = new FontFace(
        fontName,
        `url(data:application/x-font-ttf;charset=utf-8;base64,${clean(data.bold)}) format('truetype')`,
        { weight: '700', style: 'normal', display: 'swap' }
      );
      promises.push(
        face.load()
          .then(loaded => {
            document.fonts.add(loaded);
            console.log(`✅ ${fontName} (bold) загружен`);
          })
          .catch(err => {
            console.error(`❌ Ошибка загрузки ${fontName} (bold):`, err);
          })
      );
    }
  });

  await Promise.all(promises);
  console.log('✅ Все шрифты загружены');
}