<script setup>
import { ref } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'download']);

const selectedFormat = ref('png');
const selectedSide = ref('both'); // 'front', 'back', 'both'

const formats = [
  { value: 'png', label: 'PNG', description: 'Высокое качество, прозрачность' },
  { value: 'jpeg', label: 'JPEG', description: 'Меньший размер файла' },
  { value: 'svg', label: 'SVG', description: 'Векторный формат, масштабируемый' },
  { value: 'pdf', label: 'PDF', description: 'Для печати и типографии' }
];

const sides = [
  { value: 'front', label: 'Лицевая сторона' },
  { value: 'back', label: 'Обратная сторона' },
  { value: 'both', label: 'Обе стороны' }
];

function handleDownload() {
  emit('download', {
    format: selectedFormat.value,
    side: selectedSide.value
  });
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <div v-if="isVisible" class="save-modal-overlay" @click="handleClose">
    <div class="save-modal" @click.stop>
      <div class="modal-header">
        <h3>Скачать визитку</h3>
        <button class="close-button" @click="handleClose">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div class="section">
          <h4>Формат файла</h4>
          <div class="format-options">
            <label 
              v-for="format in formats" 
              :key="format.value"
              class="format-option"
              :class="{ active: selectedFormat === format.value }"
            >
              <input 
                type="radio" 
                :value="format.value" 
                v-model="selectedFormat"
                style="display: none;"
              >
              <div class="format-info">
                <div class="format-name">{{ format.label }}</div>
                <div class="format-description">{{ format.description }}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="section">
          <h4>Сторона визитки</h4>
          <div class="side-options">
            <label 
              v-for="side in sides" 
              :key="side.value"
              class="side-option"
              :class="{ active: selectedSide === side.value }"
            >
              <input 
                type="radio" 
                :value="side.value" 
                v-model="selectedSide"
                style="display: none;"
              >
              <div class="side-name">{{ side.label }}</div>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="handleClose">Отмена</button>
        <button class="download-button" @click="handleDownload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Скачать
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.save-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.save-modal {
  background: #2c2c2c;
  border-radius: 14px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h3 {
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
  margin-bottom: 24px;
}

.section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
}

.format-options, .side-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.format-option, .side-option {
  cursor: pointer;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.format-option:hover, .side-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.format-option.active, .side-option.active {
  background: #007bff;
  border-color: #007bff;
}

.format-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.format-name {
  font-weight: 500;
  font-size: 14px;
}

.format-description {
  font-size: 12px;
  color: #ccc;
}

.side-name {
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-button, .download-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.download-button {
  background: #007bff;
  color: white;
}

.download-button:hover {
  background: #0056b3;
}
</style> 