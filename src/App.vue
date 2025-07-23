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

// Скачивание визитки
async function downloadCard({ format, side }) {
  if (!editorRef.value) return;

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
      
      // Рисуем элементы, которые находятся на визитке
      for (const element of elements) {
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
          ctx.fillRect(x + visibleX, y + visibleY, visibleWidth, visibleHeight);
        }
        
        // Рисуем границу элемента (только видимую часть)
        if (element.borderWidth > 0) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = element.borderWidth;
          ctx.strokeRect(x + visibleX, y + visibleY, visibleWidth, visibleHeight);
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
          
          // Вычисляем смещение для обрезанного изображения
          const offsetX = Math.max(0, -element.x);
          const offsetY = Math.max(0, -element.y);
          
          ctx.drawImage(
            img, 
            offsetX, offsetY, visibleWidth, visibleHeight, // источник
            x + visibleX, y + visibleY, visibleWidth, visibleHeight // назначение
          );
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
