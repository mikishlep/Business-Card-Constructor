<script setup>
import { ref } from 'vue';

const props = defineProps({
  background: Object,
  isVisible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update-background', 'toggle-visibility']);

const fileInput = ref(null);

// Обновление типа фона
function updateBackgroundType(type) {
  emit('update-background', { type });
}

// Обновление цвета фона
function updateBackgroundColor(color) {
  emit('update-background', { type: 'color', value: color });
}

// Загрузка изображения
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      emit('update-background', { 
        type: 'image', 
        value: e.target.result 
      });
    };
    reader.readAsDataURL(file);
  }
}

// Открытие диалога выбора файла
function openFileDialog() {
  fileInput.value.click();
}

// Переключение видимости панели
function togglePanel() {
  emit('toggle-visibility');
}
</script>

<template>
  <div 
    class="background-panel" 
    :class="{ 
      'panel-visible': isVisible,
      'panel-hidden': !isVisible
    }"
  >
    <div class="panel-header">
      <h3>Настройки фона</h3>
      <button class="close-button" @click="togglePanel" title="Свернуть панель">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
    </div>

    <div class="section">
      <h4>Тип фона</h4>
      <div class="background-type-buttons">
        <button 
          class="type-button"
          :class="{ active: background?.type === 'color' }"
          @click="updateBackgroundType('color')"
        >
          Цвет
        </button>
        <button 
          class="type-button"
          :class="{ active: background?.type === 'image' }"
          @click="updateBackgroundType('image')"
        >
          Изображение
        </button>
        <button 
          class="type-button"
          :class="{ active: background?.type === 'transparent' }"
          @click="updateBackgroundType('transparent')"
        >
          Прозрачный
        </button>
      </div>
    </div>

    <!-- Настройки для цветного фона -->
    <div v-if="background?.type === 'color'" class="section">
      <div class="property-group">
        <label>Цвет фона</label>
        <input 
          type="color" 
          :value="background.color || '#ffffff'"
          @input="updateBackgroundColor"
        >
      </div>
    </div>

    <!-- Настройки для изображения -->
    <div v-if="background?.type === 'image'" class="section">
      <div class="property-group">
        <label>Загрузить изображение</label>
        <input 
          type="file" 
          accept="image/*" 
          @change="handleImageUpload"
          class="upload-button"
          style="display: none;"
          ref="fileInput"
        >
        <button 
          class="upload-button" 
          @click="$refs.fileInput.click()"
        >
          Выбрать файл
        </button>
      </div>
      
      <div v-if="background?.imageUrl" class="image-preview">
        <img :src="background.imageUrl" alt="Предварительный просмотр">
      </div>
    </div>

    <!-- Информация о прозрачном фоне -->
    <div v-if="background?.type === 'transparent'" class="section">
      <p class="info-text">
        Фон будет прозрачным. Это полезно для создания визиток с прозрачным фоном.
      </p>
    </div>
  </div>
</template>

<style scoped>
.background-panel {
  position: fixed;
  left: 20px;
  bottom: 20px;
  width: 320px;
  padding: 20px;
  border-radius: 14px;
  background: #2c2c2c;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  z-index: 10;
  overflow-y: auto;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left bottom;
  max-height: 400px;
}

.background-panel::-webkit-scrollbar {
    width: 0;
}

.panel-visible {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
}

.panel-hidden {
  transform: translateX(-100%);
  opacity: 0;
  visibility: hidden;
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.section {
  margin-bottom: 20px;
}

.section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
}

.background-type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.type-button {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.type-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.type-button.active {
  background: #007bff;
  border-color: #007bff;
}

.property-group {
  margin-bottom: 15px;
}

.property-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #ccc;
}

.property-group input[type="color"] {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.upload-button {
  width: 100%;
  padding: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.upload-button:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.image-preview {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.image-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.info-text {
  font-size: 12px;
  color: #ccc;
  line-height: 1.4;
  margin: 0;
}
</style> 