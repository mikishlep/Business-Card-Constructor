<script setup>
import ToolPanel from './components/ToolPanel.vue';
import Editor from './components/Editor.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import BackgroundPanel from './components/BackgroundPanel.vue';
import SaveModal from './components/SaveModal.vue';
import WelcomeModal from './components/WelcomeModal.vue';
import { ref, computed, onMounted } from 'vue';

const isFlipped = ref(false);
const isPropertiesPanelVisible = ref(false);
const isBackgroundPanelVisible = ref(false);
const isSaveModalVisible = ref(false);
const isWelcomeModalVisible = ref(false);
const editorRef = ref(null);

// Разворот визитки
function handleRevert() {
  isFlipped.value = !isFlipped.value;
}

// Добавление элемента
function handleAddElement(type) {
  if (editorRef.value) {
    editorRef.value.addElement(type);
  }
}

// Удаление выбранных элементов
function handleDeleteSelected() {
  if (editorRef.value) {
    editorRef.value.deleteSelected();
  }
}

// Функции управления слоями
function handleBringToFront() {
  if (editorRef.value) {
    editorRef.value.bringToFront();
  }
}

function handleSendToBack() {
  if (editorRef.value) {
    editorRef.value.sendToBack();
  }
}

function handleBringForward() {
  if (editorRef.value) {
    editorRef.value.bringForward();
  }
}

function handleSendBackward() {
  if (editorRef.value) {
    editorRef.value.sendBackward();
  }
}

// Функции управления границами
function handleToggleBorders() {
  if (editorRef.value) {
    editorRef.value.toggleBorders();
  }
}

function handleSwitchBorderMode(mode) {
  if (editorRef.value) {
    editorRef.value.switchBorderMode(mode);
  }
}

// Сброс выделения
function handleGlobalClick(e) {
  // Проверяем, что клик был по рабочей области, а не по панелям/кнопкам
  if (e.target.closest('.toolPanel-wrapper') || 
      e.target.closest('.properties-panel') || 
      e.target.closest('.background-panel') ||
      e.target.closest('.save-modal') ||
      e.target.closest('.expand-button') ||
      e.target.closest('.draggable-element')) {
    return; // Не снимаем выделение
  }
  
  // Снимаем выделение
  if (editorRef.value) {
    editorRef.value.deselectAll();
  }
}

// Обновление свойств элемента
function handleUpdateElement(updateData) {
  if (editorRef.value) {
    editorRef.value.updateElement(updateData);
  }
}

// Обновление фона
function handleUpdateBackground(backgroundData) {
  if (editorRef.value) {
    editorRef.value.updateBackground(backgroundData);
  }
}

// Переключение видимости панели свойств
function togglePropertiesPanel() {
  isPropertiesPanelVisible.value = !isPropertiesPanelVisible.value;
}

// Переключение видимости панели фона
function toggleBackgroundPanel() {
  isBackgroundPanelVisible.value = !isBackgroundPanelVisible.value;
}

// Открытие модального окна сохранения
function openSaveModal() {
  isSaveModalVisible.value = true;
}

// Закрытие модального окна сохранения
function closeSaveModal() {
  isSaveModalVisible.value = false;
}

// Функция для создания PDF
async function downloadAsPDF({ side }) {
  try {
    // Используем jsPDF для создания PDF
    const { jsPDF } = await import('jspdf');
    
    // Импортируем Base64-строки всех шрифтов
    const arialBase64 = await import('./fonts/arialmt-normal.js');
    const arialBoldBase64 = await import('./fonts/arialmt-bold.js');
    const montserratRegularBase64 = await import('./fonts/montserrat-regular.js');
    const montserratBoldBase64 = await import('./fonts/montserrat-bold.js');
    const ralewayRegularBase64 = await import('./fonts/raleway-regular.js');
    const ralewayBoldBase64 = await import('./fonts/raleway-bold.js');
    const caveatRegularBase64 = await import('./fonts/caveat-regular.js');
    const caveatBoldBase64 = await import('./fonts/caveat-bold.js');
    const rubikRegularBase64 = await import('./fonts/rubik-regular.js');
    const rubikBoldBase64 = await import('./fonts/rubik-bold.js');
    const exo2RegularBase64 = await import('./fonts/exo2-regular.js');
    const exo2BoldBase64 = await import('./fonts/exo2-bold.js');
    const latoRegularBase64 = await import('./fonts/lato-regular.js');
    const latoBoldBase64 = await import('./fonts/lato-bold.js');
    const oswaldRegularBase64 = await import('./fonts/oswald-regular.js');
    const oswaldBoldBase64 = await import('./fonts/oswald-bold.js');
    const opensansRegularBase64 = await import('./fonts/opensans-regular.js');
    const opensansBoldBase64 = await import('./fonts/opensans-bold.js');
    const ubuntuRegularBase64 = await import('./fonts/ubuntu-regular.js');
    const ubuntuBoldBase64 = await import('./fonts/ubuntu-bold.js');
    
    // Размеры в мм (соответствуют размерам визитки 1063x591 пикселей при 300 DPI)
    const cardWidth = 90; // мм
    const cardHeight = 50; // мм
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [cardWidth, cardHeight]
    });
    
    // Добавляем все шрифты в PDF
    // Arial
    doc.addFileToVFS('arial.ttf', arialBase64.default);
    doc.addFont('arial.ttf', 'Arial', 'normal');
    doc.addFileToVFS('arial-bold.ttf', arialBoldBase64.default);
    doc.addFont('arial-bold.ttf', 'Arial', 'bold');
    
    // Montserrat
    doc.addFileToVFS('montserrat.ttf', montserratRegularBase64.default);
    doc.addFont('montserrat.ttf', 'Montserrat', 'normal');
    doc.addFileToVFS('montserrat-bold.ttf', montserratBoldBase64.default);
    doc.addFont('montserrat-bold.ttf', 'Montserrat', 'bold');
    
    // Raleway
    doc.addFileToVFS('raleway.ttf', ralewayRegularBase64.default);
    doc.addFont('raleway.ttf', 'Raleway', 'normal');
    doc.addFileToVFS('raleway-bold.ttf', ralewayBoldBase64.default);
    doc.addFont('raleway-bold.ttf', 'Raleway', 'bold');
    
    // Caveat
    doc.addFileToVFS('caveat.ttf', caveatRegularBase64.default);
    doc.addFont('caveat.ttf', 'Caveat', 'normal');
    doc.addFileToVFS('caveat-bold.ttf', caveatBoldBase64.default);
    doc.addFont('caveat-bold.ttf', 'Caveat', 'bold');
    
    // Rubik
    doc.addFileToVFS('rubik.ttf', rubikRegularBase64.default);
    doc.addFont('rubik.ttf', 'Rubik', 'normal');
    doc.addFileToVFS('rubik-bold.ttf', rubikBoldBase64.default);
    doc.addFont('rubik-bold.ttf', 'Rubik', 'bold');
    
    // Exo 2
    doc.addFileToVFS('exo2.ttf', exo2RegularBase64.default);
    doc.addFont('exo2.ttf', 'Exo 2', 'normal');
    doc.addFileToVFS('exo2-bold.ttf', exo2BoldBase64.default);
    doc.addFont('exo2-bold.ttf', 'Exo 2', 'bold');
    
    // Lato
    doc.addFileToVFS('lato.ttf', latoRegularBase64.default);
    doc.addFont('lato.ttf', 'Lato', 'normal');
    doc.addFileToVFS('lato-bold.ttf', latoBoldBase64.default);
    doc.addFont('lato-bold.ttf', 'Lato', 'bold');
    
    // Oswald
    doc.addFileToVFS('oswald.ttf', oswaldRegularBase64.default);
    doc.addFont('oswald.ttf', 'Oswald', 'normal');
    doc.addFileToVFS('oswald-bold.ttf', oswaldBoldBase64.default);
    doc.addFont('oswald-bold.ttf', 'Oswald', 'bold');
    
    // Open Sans
    doc.addFileToVFS('opensans.ttf', opensansRegularBase64.default);
    doc.addFont('opensans.ttf', 'Open Sans', 'normal');
    doc.addFileToVFS('opensans-bold.ttf', opensansBoldBase64.default);
    doc.addFont('opensans-bold.ttf', 'Open Sans', 'bold');
    
    // Ubuntu
    doc.addFileToVFS('ubuntu.ttf', ubuntuRegularBase64.default);
    doc.addFont('ubuntu.ttf', 'Ubuntu', 'normal');
    doc.addFileToVFS('ubuntu-bold.ttf', ubuntuBoldBase64.default);
    doc.addFont('ubuntu-bold.ttf', 'Ubuntu', 'bold');
    
    doc.setFont('Arial');
    
    // Получаем данные о визитке
    const frontElements = editorRef.value.frontElements || [];
    const backElements = editorRef.value.backElements || [];
    const frontBackground = editorRef.value.frontBackground || { type: 'color', value: '#ffffff' };
    const backBackground = editorRef.value.backBackground || { type: 'color', value: '#f0f0f0' };
    
    // Функция для исправления ориентации изображения
    function fixImageOrientation(img) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      });
    }
    
    // Вспомогательная функция для отрисовки закруглённого прямоугольника
    function drawRoundedRect(ctx, x, y, width, height, radii) {
      const { topLeft, topRight, bottomRight, bottomLeft } = radii;
      ctx.beginPath();
      ctx.moveTo(x + topLeft, y);
      ctx.lineTo(x + width - topRight, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
      ctx.lineTo(x + width, y + height - bottomRight);
      ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
      ctx.lineTo(x + bottomLeft, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
      ctx.lineTo(x, y + topLeft);
      ctx.quadraticCurveTo(x, y, x + topLeft, y);
      ctx.closePath();
    }

    // Функция для отрисовки стороны визитки в PDF
    async function drawCardSidePDF(elements, background, isBack = false) {
      // Рисуем фон
      if (background.type === 'color') {
        doc.setFillColor(background.value || '#ffffff');
        doc.rect(0, 0, cardWidth, cardHeight, 'F');
      } else if (background.type === 'image' || background.type === 'collection') {
        // Обрабатываем фоновое изображение
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = background.value;
          });
          
          // Исправляем ориентацию фонового изображения
          const fixedImageData = await fixImageOrientation(img);
          
          // Добавляем фоновое изображение на всю визитку
          doc.addImage(fixedImageData, 'JPEG', 0, 0, cardWidth, cardHeight, undefined, 'FAST');
        } catch (error) {
          console.error('Ошибка при добавлении фонового изображения в PDF:', error);
          // Если не удалось загрузить изображение, рисуем белый фон
          doc.setFillColor('#ffffff');
          doc.rect(0, 0, cardWidth, cardHeight, 'F');
        }
      } else {
        // Если тип фона не распознан, рисуем белый фон
        doc.setFillColor('#ffffff');
        doc.rect(0, 0, cardWidth, cardHeight, 'F');
      }
      
      // Сортируем элементы по z-index
      const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      // Рисуем элементы
      for (const element of sortedElements) {
        // Пропускаем элементы другой стороны
        if ((isBack && element.side === 'front') || (!isBack && element.side === 'back')) {
          continue;
        }
        
        // Конвертируем координаты из пикселей в мм (1063px = 90mm, 591px = 50mm)
        const x = (element.x / 1087) * cardWidth;
        const y = (element.y / 614) * cardHeight;
        const width = (element.width / 1087) * cardWidth;
        const height = (element.height / 614) * cardHeight;
        
        // Рисуем фон элемента с закруглениями
        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
          doc.setFillColor(element.backgroundColor);
          
          // Проверяем, есть ли закругления
          const hasRoundedCorners = element.borderRadius > 0 || 
                                   element.borderRadiusTopLeft > 0 || 
                                   element.borderRadiusTopRight > 0 || 
                                   element.borderRadiusBottomLeft > 0 || 
                                   element.borderRadiusBottomRight > 0;
          
          if (hasRoundedCorners) {
            // Используем максимальное значение закругления
            const radius = Math.max(
              element.borderRadius || 0,
              element.borderRadiusTopLeft || 0,
              element.borderRadiusTopRight || 0,
              element.borderRadiusBottomLeft || 0,
              element.borderRadiusBottomRight || 0
            );
            const radiusMm = (radius / 1087) * cardWidth;
            
            // Рисуем закругленный прямоугольник
            doc.setFillColor(element.backgroundColor);
            doc.roundedRect(x, y, width, height, radiusMm, radiusMm, 'F');
          } else {
            // Рисуем обычный прямоугольник
            doc.rect(x, y, width, height, 'F');
          }
        }
        
        // Рисуем границу элемента с закруглениями
        if (element.borderWidth > 0) {
          doc.setDrawColor(element.borderColor);
          doc.setLineWidth((element.borderWidth / 1087) * cardWidth);
          
          const hasRoundedCorners = element.borderRadius > 0 || 
                                   element.borderRadiusTopLeft > 0 || 
                                   element.borderRadiusTopRight > 0 || 
                                   element.borderRadiusBottomLeft > 0 || 
                                   element.borderRadiusBottomRight > 0;
          
          if (hasRoundedCorners) {
            const radius = Math.max(
              element.borderRadius || 0,
              element.borderRadiusTopLeft || 0,
              element.borderRadiusTopRight || 0,
              element.borderRadiusBottomLeft || 0,
              element.borderRadiusBottomRight || 0
            );
            const radiusMm = (radius / 1087) * cardWidth;
            
            doc.roundedRect(x, y, width, height, radiusMm, radiusMm, 'S');
          } else {
            doc.rect(x, y, width, height, 'S');
          }
        }
        
        // Рисуем текст
        if (element.type === 'text' && element.text) {
          doc.setTextColor(element.text.color || '#000000');
          const fontPx = element.text.fontSize || 14;
          const scaleFactor = cardWidth / 1087;
          const fontMm = fontPx * scaleFactor;
          const fontPt = fontMm * (72 / 25.4);
          doc.setFontSize(fontPt);
          
          // Определяем шрифт и стиль
          const fontFamily = element.text.fontFamily || 'Arial';
          const fontWeight = element.text.bold ? 'bold' : 'normal';
          
          // Устанавливаем шрифт в зависимости от выбора
          doc.setFont(fontFamily, fontWeight);

          const content = element.text.content || 'Текст';
          const lines = doc.splitTextToSize(content, width);
          const lineHeightMm = fontPt * (1/72) * 25.4;
          const textHeight = lines.length * lineHeightMm;
          const startY = y + (height / 2) - (textHeight / 2) + lineHeightMm / 2;

          doc.text(
            lines,
            x + width / 2,
            startY,
            {
              align: 'center',
              baseline: 'middle',
              maxWidth: width
            }
          );
        }
        
        // Рисуем изображение с правильным масштабированием
        if (element.type === 'image' && element.imageUrl) {
          try {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = element.imageUrl;
            });

            // Размеры canvas (300 DPI)
            const dpi = 300;
            const pxPerMm = dpi / 25.4;
            const canvasWidth = width * pxPerMm;
            const canvasHeight = height * pxPerMm;

            // Создаём временный canvas
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');

            // --- ТВОЯ ЛОГИКА ОТРИСОВКИ СКРУГЛЕНИЙ (как для PNG/JPEG) ---
            // Например:
            const rTL = (element.borderRadiusTopLeft || element.borderRadius || 0) * pxPerMm / (1087 / cardWidth);
            const rTR = (element.borderRadiusTopRight || element.borderRadius || 0) * pxPerMm / (1087 / cardWidth);
            const rBR = (element.borderRadiusBottomRight || element.borderRadius || 0) * pxPerMm / (1087 / cardWidth);
            const rBL = (element.borderRadiusBottomLeft || element.borderRadius || 0) * pxPerMm / (1087 / cardWidth);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(rTL, 0);
            ctx.lineTo(canvasWidth - rTR, 0);
            ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, rTR);
            ctx.lineTo(canvasWidth, canvasHeight - rBR);
            ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - rBR, canvasHeight);
            ctx.lineTo(rBL, canvasHeight);
            ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - rBL);
            ctx.lineTo(0, rTL);
            ctx.quadraticCurveTo(0, 0, rTL, 0);
            ctx.closePath();
            ctx.clip();

            // object-fit: cover
            const imageAspect = img.width / img.height;
            const canvasAspect = canvasWidth / canvasHeight;
            let drawWidth, drawHeight, offsetX, offsetY;
            if (imageAspect > canvasAspect) {
              drawHeight = canvasHeight;
              drawWidth = drawHeight * imageAspect;
              offsetX = (canvasWidth - drawWidth) / 2;
              offsetY = 0;
            } else {
              drawWidth = canvasWidth;
              drawHeight = drawWidth / imageAspect;
              offsetX = 0;
              offsetY = (canvasHeight - drawHeight) / 2;
            }
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            ctx.restore();

            // Вставляем canvas в PDF
            const canvasData = canvas.toDataURL('image/png');
            doc.addImage(canvasData, 'PNG', x, y, width, height, undefined, 'FAST');
          } catch (error) {
            console.error('Ошибка при добавлении изображения в PDF:', error);
          }
        }
      }
    }
    
    // Рисуем выбранные стороны
    if (side === 'front' || side === 'both') {
      await drawCardSidePDF(frontElements, frontBackground, false);
    }
    
    if (side === 'back' || side === 'both') {
      if (side === 'both') {
        doc.addPage();
      }
      await drawCardSidePDF(backElements, backBackground, true);
    }
    
    // Сохраняем PDF
    doc.save(`business-card-${side}.pdf`);
    
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    alert('Произошла ошибка при создании PDF. Убедитесь, что установлен пакет jspdf.');
  }
}

// Обновленная функция скачивания
async function downloadCard({ format, side }) {
  if (!editorRef.value) return;

  // Для PDF используем специальную функцию
  if (format === 'pdf') {
    await downloadAsPDF({ side });
    closeSaveModal();
    return;
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Размеры визитки
    const cardWidth = 525;
    const cardHeight = 300;
    
    if (side === 'both') {
      canvas.width = cardWidth * 2 + 20; // Две стороны + отступ
      canvas.height = cardHeight;
    } else {
      canvas.width = cardWidth;
      canvas.height = cardHeight;
    }
    
    // Белый фон
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Получаем данные о визитке
    const frontElements = editorRef.value.frontElements || [];
    const backElements = editorRef.value.backElements || [];
    const frontBackground = editorRef.value.frontBackground || { type: 'color', value: '#ffffff' };
    const backBackground = editorRef.value.backBackground || { type: 'color', value: '#f0f0f0' };
    
    // Функция для отрисовки стороны визитки
    async function drawCardSide(elements, background, x, y, isBack = false) {
      // Рисуем фон
      if (background.type === 'color') {
        ctx.fillStyle = background.value || '#ffffff';
        ctx.fillRect(x, y, cardWidth, cardHeight);
      } else if (background.type === 'image' || background.type === 'collection') {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = background.value;
        });
        ctx.drawImage(img, x, y, cardWidth, cardHeight);
      }
      
      // Сортируем элементы по z-index для правильного порядка слоёв
      const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      // Рисуем элементы в правильном порядке слоёв
      for (const element of sortedElements) {
        // Пропускаем элементы другой стороны
        if ((isBack && element.side === 'front') || (!isBack && element.side === 'back')) {
          continue;
        }
        
        // Проверяем, находится ли элемент на визитке (хотя бы частично)
        const elementRight = element.x + element.width;
        const elementBottom = element.y + element.height;
        
        // Если элемент полностью за пределами визитки, пропускаем его
        if (element.x >= cardWidth || element.y >= cardHeight || elementRight <= 0 || elementBottom <= 0) {
          continue;
        }
        
        // Вычисляем видимую область элемента
        const visibleX = Math.max(0, element.x);
        const visibleY = Math.max(0, element.y);
        const visibleWidth = Math.min(element.width, cardWidth - visibleX);
        const visibleHeight = Math.min(element.height, cardHeight - visibleY);
        
        // Рисуем фон элемента (только видимую часть)
        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
          ctx.fillStyle = element.backgroundColor;
          
          // Применяем закругления
          if (element.borderRadius > 0 || element.borderRadiusTopLeft > 0) {
            ctx.save();
            ctx.beginPath();
            
            // Определяем радиусы для каждого угла
            const topLeft = element.borderRadiusTopLeft || element.borderRadius || 0;
            const topRight = element.borderRadiusTopRight || element.borderRadius || 0;
            const bottomRight = element.borderRadiusBottomRight || element.borderRadius || 0;
            const bottomLeft = element.borderRadiusBottomLeft || element.borderRadius || 0;
            
            // Рисуем закругленный прямоугольник
            ctx.moveTo(x + visibleX + topLeft, y + visibleY);
            ctx.lineTo(x + visibleX + visibleWidth - topRight, y + visibleY);
            ctx.quadraticCurveTo(x + visibleX + visibleWidth, y + visibleY, x + visibleX + visibleWidth, y + visibleY + topRight);
            ctx.lineTo(x + visibleX + visibleWidth, y + visibleY + visibleHeight - bottomRight);
            ctx.quadraticCurveTo(x + visibleX + visibleWidth, y + visibleY + visibleHeight, x + visibleX + visibleWidth - bottomRight, y + visibleY + visibleHeight);
            ctx.lineTo(x + visibleX + bottomLeft, y + visibleY + visibleHeight);
            ctx.quadraticCurveTo(x + visibleX, y + visibleY + visibleHeight, x + visibleX, y + visibleY + visibleHeight - bottomLeft);
            ctx.lineTo(x + visibleX, y + visibleY + topLeft);
            ctx.quadraticCurveTo(x + visibleX, y + visibleY, x + visibleX + topLeft, y + visibleY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else {
            ctx.fillRect(x + visibleX, y + visibleY, visibleWidth, visibleHeight);
          }
        }
        
        // Рисуем границу элемента (только видимую часть)
        if (element.borderWidth > 0) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = element.borderWidth;
          
          // Применяем закругления для границы
          if (element.borderRadius > 0 || element.borderRadiusTopLeft > 0) {
            ctx.save();
            ctx.beginPath();
            
            const topLeft = element.borderRadiusTopLeft || element.borderRadius || 0;
            const topRight = element.borderRadiusTopRight || element.borderRadius || 0;
            const bottomRight = element.borderRadiusBottomRight || element.borderRadius || 0;
            const bottomLeft = element.borderRadiusBottomLeft || element.borderRadius || 0;
            
            ctx.moveTo(x + visibleX + topLeft, y + visibleY);
            ctx.lineTo(x + visibleX + visibleWidth - topRight, y + visibleY);
            ctx.quadraticCurveTo(x + visibleX + visibleWidth, y + visibleY, x + visibleX + visibleWidth, y + visibleY + topRight);
            ctx.lineTo(x + visibleX + visibleWidth, y + visibleY + visibleHeight - bottomRight);
            ctx.quadraticCurveTo(x + visibleX + visibleWidth, y + visibleY + visibleHeight, x + visibleX + visibleWidth - bottomRight, y + visibleY + visibleHeight);
            ctx.lineTo(x + visibleX + bottomLeft, y + visibleY + visibleHeight);
            ctx.quadraticCurveTo(x + visibleX, y + visibleY + visibleHeight, x + visibleX, y + visibleY + visibleHeight - bottomLeft);
            ctx.lineTo(x + visibleX, y + visibleY + topLeft);
            ctx.quadraticCurveTo(x + visibleX, y + visibleY, x + visibleX + topLeft, y + visibleY);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.strokeRect(x + visibleX, y + visibleY, visibleWidth, visibleHeight);
          }
        }
        
        // Рисуем текст (только если он видим)
        if (element.type === 'text' && element.text && visibleWidth > 0 && visibleHeight > 0) {
          ctx.fillStyle = element.text.color || '#000000';
          ctx.font = `${element.text.fontSize || 14}px ${element.text.fontFamily || 'Arial'}`;
          ctx.textAlign = element.text.textAlign || 'center';
          
          const textX = x + visibleX + visibleWidth / 2;
          const textY = y + visibleY + visibleHeight / 2 + 5;
          
          ctx.fillText(element.text.content || 'Текст', textX, textY);
        }
        
        // Рисуем изображение (только видимую часть)
        if (element.type === 'image' && element.imageUrl && visibleWidth > 0 && visibleHeight > 0) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = element.imageUrl;
          });
          
          // Применяем закругления для изображения
          if (element.borderRadius > 0 || element.borderRadiusTopLeft > 0) {
            ctx.save();
            ctx.beginPath();
            
            const topLeft = element.borderRadiusTopLeft || element.borderRadius || 0;
            const topRight = element.borderRadiusTopRight || element.borderRadius || 0;
            const bottomRight = element.borderRadiusBottomRight || element.borderRadius || 0;
            const bottomLeft = element.borderRadiusBottomLeft || element.borderRadius || 0;
            
            ctx.moveTo(x + visibleX + topLeft, y + visibleY);
            ctx.lineTo(x + visibleX + visibleWidth - topRight, y + visibleY);
            ctx.quadraticCurveTo(x + visibleX + visibleWidth, y + visibleY, x + visibleX + visibleWidth, y + visibleY + topRight);
            ctx.lineTo(x + visibleX + visibleWidth, y + visibleY + visibleHeight - bottomRight);
            ctx.quadraticCurveTo(x + visibleX + visibleWidth, y + visibleY + visibleHeight, x + visibleX + visibleWidth - bottomRight, y + visibleY + visibleHeight);
            ctx.lineTo(x + visibleX + bottomLeft, y + visibleY + visibleHeight);
            ctx.quadraticCurveTo(x + visibleX, y + visibleY + visibleHeight, x + visibleX, y + visibleY + visibleHeight - bottomLeft);
            ctx.lineTo(x + visibleX, y + visibleY + topLeft);
            ctx.quadraticCurveTo(x + visibleX, y + visibleY, x + visibleX + topLeft, y + visibleY);
            ctx.closePath();
            ctx.clip();
          }
          
          // Рисуем изображение с правильными размерами
          ctx.drawImage(
            img, 
            0, 0, img.width, img.height, // источник (вся картинка)
            x + visibleX, y + visibleY, visibleWidth, visibleHeight // назначение (размеры элемента)
          );
          
          if (element.borderRadius > 0 || element.borderRadiusTopLeft > 0) {
            ctx.restore();
          }
        }
      }
    }
    
    // Рисуем выбранные стороны
    if (side === 'front' || side === 'both') {
      await drawCardSide(frontElements, frontBackground, 0, 0, false);
    }
    
    if (side === 'back' || side === 'both') {
      const backX = side === 'both' ? cardWidth + 20 : 0;
      await drawCardSide(backElements, backBackground, backX, 0, true);
    }
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = `business-card.${format}`;
    
    if (format === 'svg') {
      // Для SVG создаем простую разметку
      const svgContent = `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="white"/>
          <text x="50%" y="50%" text-anchor="middle" fill="black">Business Card</text>
        </svg>
      `;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
    } else {
      // Для PNG и JPEG
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob((blob) => {
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }, mimeType);
      return; // Выходим раньше, так как toBlob асинхронный
    }
    
    link.click();
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error('Ошибка при скачивании:', error);
    alert('Произошла ошибка при скачивании визитки');
  }
  
  closeSaveModal();
}

// Получение выбранного элемента
const selectedElement = computed(() => {
  if (editorRef.value) {
    return editorRef.value.getSelectedElement();
  }
  return null;
});

// Получение активного фона
const activeBackground = computed(() => {
  if (editorRef.value) {
    return editorRef.value.activeBackground;
  }
  return null;
});

// Функция для загрузки шрифтов из base64 для интерфейса
async function loadFontsForInterface() {
  try {
    // Импортируем все base64 шрифты
    const arialNormal = await import('./fonts/arialmt-normal.js');
    const arialBold = await import('./fonts/arialmt-bold.js');
    const montserratRegular = await import('./fonts/montserrat-regular.js');
    const montserratBold = await import('./fonts/montserrat-bold.js');
    const ralewayRegular = await import('./fonts/raleway-regular.js');
    const ralewayBold = await import('./fonts/raleway-bold.js');
    const caveatRegular = await import('./fonts/caveat-regular.js');
    const caveatBold = await import('./fonts/caveat-bold.js');
    const rubikRegular = await import('./fonts/rubik-regular.js');
    const rubikBold = await import('./fonts/rubik-bold.js');
    const exo2Regular = await import('./fonts/exo2-regular.js');
    const exo2Bold = await import('./fonts/exo2-bold.js');
    const latoRegular = await import('./fonts/lato-regular.js');
    const latoBold = await import('./fonts/lato-bold.js');
    const oswaldRegular = await import('./fonts/oswald-regular.js');
    const oswaldBold = await import('./fonts/oswald-bold.js');
    const opensansRegular = await import('./fonts/opensans-regular.js');
    const opensansBold = await import('./fonts/opensans-bold.js');
    const ubuntuRegular = await import('./fonts/ubuntu-regular.js');
    const ubuntuBold = await import('./fonts/ubuntu-bold.js');

    const fontData = [
      { name: 'Arial MT', normal: arialNormal.default, bold: arialBold.default },
      { name: 'Montserrat', normal: montserratRegular.default, bold: montserratBold.default },
      { name: 'Raleway', normal: ralewayRegular.default, bold: ralewayBold.default },
      { name: 'Caveat', normal: caveatRegular.default, bold: caveatBold.default },
      { name: 'Rubik', normal: rubikRegular.default, bold: rubikBold.default },
      { name: 'Exo 2', normal: exo2Regular.default, bold: exo2Bold.default },
      { name: 'Lato', normal: latoRegular.default, bold: latoBold.default },
      { name: 'Oswald', normal: oswaldRegular.default, bold: oswaldBold.default },
      { name: 'Open Sans', normal: opensansRegular.default, bold: opensansBold.default },
      { name: 'Ubuntu', normal: ubuntuRegular.default, bold: ubuntuBold.default }
    ];

    fontData.forEach(font => {
      // Создаем @font-face для обычного стиля
      const normalFontFace = `
        @font-face {
          font-family: '${font.name}';
          src: url('data:font/truetype;charset=utf-8;base64,${font.normal}') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
      
      // Создаем @font-face для жирного стиля
      const boldFontFace = `
        @font-face {
          font-family: '${font.name}';
          src: url('data:font/truetype;charset=utf-8;base64,${font.bold}') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `;
      
      // Добавляем стили в head
      const style = document.createElement('style');
      style.textContent = normalFontFace + boldFontFace;
      document.head.appendChild(style);
    });

    console.log('Шрифты успешно загружены для интерфейса');
  } catch (error) {
    console.error('Ошибка при загрузке шрифтов для интерфейса:', error);
  }
}

// Проверяем, нужно ли показать приветственное окно
onMounted(() => {
  // Загружаем шрифты для интерфейса
  loadFontsForInterface();
  const hasVisited = localStorage.getItem('hasVisitedBefore');
  if (!hasVisited) {
    // Небольшая задержка для плавного появления
    setTimeout(() => {
      isWelcomeModalVisible.value = true;
    }, 500);
  }
});

// Закрытие приветственного модального окна
function closeWelcomeModal() {
  isWelcomeModalVisible.value = false;
}

// Показать приветственное окно снова
function showHelp() {
  isWelcomeModalVisible.value = true;
}
</script>

<template>
  <div @click="handleGlobalClick">
      <ToolPanel 
    @revert="handleRevert" 
    @add-element="handleAddElement"
    @delete-selected="handleDeleteSelected"
    @toggle-properties-panel="togglePropertiesPanel"
    @toggle-background-panel="toggleBackgroundPanel"
    @open-save-modal="openSaveModal"
    @bring-to-front="handleBringToFront"
    @send-to-back="handleSendToBack"
    @bring-forward="handleBringForward"
    @send-backward="handleSendBackward"
    @toggle-borders="handleToggleBorders"
    @switch-border-mode="handleSwitchBorderMode"
    @show-help="showHelp"
  />
    <Editor ref="editorRef" :flipped="isFlipped" />
    <PropertiesPanel 
      :selected-element="selectedElement"
      :is-visible="isPropertiesPanelVisible"
      @update-element="handleUpdateElement"
      @toggle-visibility="togglePropertiesPanel"
    />
    <BackgroundPanel
      :background="activeBackground"
      :is-visible="isBackgroundPanelVisible"
      @update-background="handleUpdateBackground"
      @toggle-visibility="toggleBackgroundPanel"
    />
    <SaveModal
      :is-visible="isSaveModalVisible"
      @close="closeSaveModal"
      @download="downloadCard"
    />
    <WelcomeModal
      :is-visible="isWelcomeModalVisible"
      @close="closeWelcomeModal"
    />
  </div>
</template>

<style scoped>

</style>
