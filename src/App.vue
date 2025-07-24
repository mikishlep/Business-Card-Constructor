<script setup>
import ToolPanel from './components/ToolPanel.vue';
import Editor from './components/Editor.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import BackgroundPanel from './components/BackgroundPanel.vue';
import SaveModal from './components/SaveModal.vue';
import { ref, computed } from 'vue';

const isFlipped = ref(false);
const isPropertiesPanelVisible = ref(false);
const isBackgroundPanelVisible = ref(false);
const isSaveModalVisible = ref(false);
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
    
    // Импортируем Base64-строку шрифта
    const arialBase64 = await import('./fonts/arialmt-normal.js');
    
    // Размеры в мм (соответствуют размерам визитки 1063x591 пикселей при 300 DPI)
    const cardWidth = 90; // мм
    const cardHeight = 50; // мм
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [cardWidth, cardHeight]
    });
    
    // Добавляем шрифт в PDF
    doc.addFileToVFS('arial.ttf', arialBase64.default);
    doc.addFont('arial.ttf', 'Arial', 'normal');
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

          // Конвертируем в PT для PDF
          const fontPx = element.text.fontSize || 14;
          // const fontPt = fontPx * 0.75;
          const scaleFactor = cardWidth / 1087;
          const fontMm = fontPx * scaleFactor;          // шрифт в мм
          const fontPt = fontMm * (72 / 25.4);
          // doc.setFontSize((fontPt) * (cardWidth / 1087));
          doc.setFontSize(fontPt);
          // Используем стандартный шрифт вместо Arial
          doc.setFont('Arial', 'normal');
          
          const textX = x + width / 2;
          const textY = y + height / 2;
          
          doc.text(element.text.content || 'Текст', textX, textY, { align: 'center', baseline: 'middle' });
        }
        
        // Рисуем изображение с правильным масштабированием
        if (element.type === 'image' && element.imageUrl) {
          try {
            // Загружаем изображение
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = element.imageUrl;
            });

            // Определяем размеры холста в пикселях (300 DPI)
            const dpi = 300;
            const pxPerMm = dpi / 25.4;
            const canvasWidth = width * pxPerMm;
            const canvasHeight = height * pxPerMm;

            // Создаём временный холст
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');

            // Рассчитываем масштабирование для object-fit: cover
            const imageAspect = img.width / img.height;
            const canvasAspect = canvasWidth / canvasHeight;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imageAspect > canvasAspect) {
              // Изображение шире, масштабируем по высоте
              drawHeight = canvasHeight;
              drawWidth = drawHeight * imageAspect;
              offsetX = (canvasWidth - drawWidth) / 2;
              offsetY = 0;
            } else {
              // Изображение выше, масштабируем по ширине
              drawWidth = canvasWidth;
              drawHeight = drawWidth / imageAspect;
              offsetX = 0;
              offsetY = (canvasHeight - drawHeight) / 2;
            }

            // Проверяем наличие закруглённых углов
            const hasRoundedCorners = element.borderRadius > 0 ||
              element.borderRadiusTopLeft > 0 ||
              element.borderRadiusTopRight > 0 ||
              element.borderRadiusBottomLeft > 0 ||
              element.borderRadiusBottomRight > 0;

            if (hasRoundedCorners) {
              ctx.save();
              ctx.beginPath();
              // Функция для отрисовки закруглённого прямоугольника
              drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, {
                topLeft: (element.borderRadiusTopLeft || element.borderRadius || 0) / 1087 * canvasWidth,
                topRight: (element.borderRadiusTopRight || element.borderRadius || 0) / 1087 * canvasWidth,
                bottomRight: (element.borderRadiusBottomRight || element.borderRadius || 0) / 1087 * canvasWidth,
                bottomLeft: (element.borderRadiusBottomLeft || element.borderRadius || 0) / 1087 * canvasWidth,
              });
              ctx.clip();
            }

            // Рисуем изображение на холсте
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            if (hasRoundedCorners) {
              ctx.restore();
            }

            // Добавляем холст в PDF
            const canvasData = canvas.toDataURL('image/jpeg', 1.0);
            doc.addImage(canvasData, 'JPEG', x, y, width, height, undefined, 'FAST');
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
  </div>
</template>

<style scoped>

</style>
