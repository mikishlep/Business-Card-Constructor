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
      
      // Рисуем элементы
      for (const element of elements) {
        // Пропускаем элементы другой стороны
        if ((isBack && element.side === 'front') || (!isBack && element.side === 'back')) {
          continue;
        }
        
        // Рисуем фон элемента
        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(x + element.x, y + element.y, element.width, element.height);
        }
        
        // Рисуем границу элемента
        if (element.borderWidth > 0) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = element.borderWidth;
          ctx.strokeRect(x + element.x, y + element.y, element.width, element.height);
        }
        
        // Рисуем текст
        if (element.type === 'text' && element.text) {
          ctx.fillStyle = element.text.color || '#000000';
          ctx.font = `${element.text.fontSize || 14}px ${element.text.fontFamily || 'Arial'}`;
          ctx.textAlign = element.text.textAlign || 'center';
          
          const textX = x + element.x + element.width / 2;
          const textY = y + element.y + element.height / 2 + 5;
          
          ctx.fillText(element.text.content || 'Текст', textX, textY);
        }
        
        // Рисуем изображение
        if (element.type === 'image' && element.imageUrl) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = element.imageUrl;
          });
          ctx.drawImage(img, x + element.x, y + element.y, element.width, element.height);
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
</template>

<style scoped>

</style>
