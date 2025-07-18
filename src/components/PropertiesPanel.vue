<script setup>
import { computed } from 'vue';

const props = defineProps({
  selectedElement: Object
});

const emit = defineEmits(['update-element']);

// Вычисляем, есть ли выбранный элемент
const hasSelection = computed(() => {
  return props.selectedElement && props.selectedElement.isSelected;
});

// Обновление свойств элемента
function updateProperty(property, value) {
  if (props.selectedElement) {
    emit('update-element', {
      id: props.selectedElement.id,
      property: property,
      value: value
    });
  }
}

// Обновление текстовых свойств
function updateTextProperty(property, value) {
  if (props.selectedElement && props.selectedElement.type === 'text') {
    emit('update-element', {
      id: props.selectedElement.id,
      property: `text.${property}`,
      value: value
    });
  }
}
</script>

<template>
  <div class="properties-panel" v-if="hasSelection">
    <div class="panel-header">
      <h3>Свойства элемента</h3>
      <span class="element-type">{{ selectedElement?.type === 'text' ? 'Текст' : 'Элемент' }}</span>
    </div>

    <!-- Общие свойства -->
    <div class="section">
      <h4>Размер и позиция</h4>
      <div class="property-group">
        <label>Ширина (px)</label>
        <input 
          type="number" 
          :value="selectedElement?.width || 100"
          @input="updateProperty('width', parseInt($event.target.value))"
          min="20"
          max="500"
        />
      </div>
      <div class="property-group">
        <label>Высота (px)</label>
        <input 
          type="number" 
          :value="selectedElement?.height || 80"
          @input="updateProperty('height', parseInt($event.target.value))"
          min="20"
          max="500"
        />
      </div>
      <div class="property-group">
        <label>X позиция</label>
        <input 
          type="number" 
          :value="selectedElement?.x || 0"
          @input="updateProperty('x', parseInt($event.target.value))"
          min="0"
        />
      </div>
      <div class="property-group">
        <label>Y позиция</label>
        <input 
          type="number" 
          :value="selectedElement?.y || 0"
          @input="updateProperty('y', parseInt($event.target.value))"
          min="0"
        />
      </div>
    </div>

    <!-- Стили элемента -->
    <div class="section">
      <h4>Стили</h4>
      <div class="property-group">
        <label>Цвет фона</label>
        <input 
          type="color" 
          :value="selectedElement?.backgroundColor || '#ffffff'"
          @input="updateProperty('backgroundColor', $event.target.value)"
        />
      </div>
      <div class="property-group">
        <label>Цвет границы</label>
        <input 
          type="color" 
          :value="selectedElement?.borderColor || '#007bff'"
          @input="updateProperty('borderColor', $event.target.value)"
        />
      </div>
      <div class="property-group">
        <label>Толщина границы (px)</label>
        <input 
          type="number" 
          :value="selectedElement?.borderWidth || 2"
          @input="updateProperty('borderWidth', parseInt($event.target.value))"
          min="0"
          max="20"
        />
      </div>
      <div class="property-group">
        <label>Закругление углов (px)</label>
        <input 
          type="number" 
          :value="selectedElement?.borderRadius || 6"
          @input="updateProperty('borderRadius', parseInt($event.target.value))"
          min="0"
          max="50"
        />
      </div>
    </div>

    <!-- Специальные свойства для текста -->
    <div class="section" v-if="selectedElement?.type === 'text'">
      <h4>Текст</h4>
      <div class="property-group">
        <label>Содержимое</label>
        <textarea 
          :value="selectedElement?.text?.content || 'Текст'"
          @input="updateTextProperty('content', $event.target.value)"
          rows="3"
          placeholder="Введите текст..."
        ></textarea>
      </div>
      <div class="property-group">
        <label>Цвет текста</label>
        <input 
          type="color" 
          :value="selectedElement?.text?.color || '#000000'"
          @input="updateTextProperty('color', $event.target.value)"
        />
      </div>
      <div class="property-group">
        <label>Размер шрифта (px)</label>
        <input 
          type="number" 
          :value="selectedElement?.text?.fontSize || 14"
          @input="updateTextProperty('fontSize', parseInt($event.target.value))"
          min="8"
          max="72"
        />
      </div>
      <div class="property-group">
        <label>Семейство шрифтов</label>
        <select 
          :value="selectedElement?.text?.fontFamily || 'Arial'"
          @change="updateTextProperty('fontFamily', $event.target.value)"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
      <div class="property-group">
        <label>Выравнивание</label>
        <select 
          :value="selectedElement?.text?.textAlign || 'center'"
          @change="updateTextProperty('textAlign', $event.target.value)"
        >
          <option value="left">По левому краю</option>
          <option value="center">По центру</option>
          <option value="right">По правому краю</option>
          <option value="justify">По ширине</option>
        </select>
      </div>
      <div class="property-group checkbox-group">
        <label>
          <input 
            type="checkbox" 
            :checked="selectedElement?.text?.bold || false"
            @change="updateTextProperty('bold', $event.target.checked)"
          />
          Жирный
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="selectedElement?.text?.italic || false"
            @change="updateTextProperty('italic', $event.target.checked)"
          />
          Курсив
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="selectedElement?.text?.underline || false"
            @change="updateTextProperty('underline', $event.target.checked)"
          />
          Подчеркнутый
        </label>
      </div>
    </div>

    <!-- Специальные свойства для обычных элементов -->
    <div class="section" v-if="selectedElement?.type !== 'text'">
      <h4>Дополнительные свойства</h4>
      <div class="property-group">
        <label>Прозрачность</label>
        <input 
          type="range" 
          :value="selectedElement?.opacity || 1"
          @input="updateProperty('opacity', parseFloat($event.target.value))"
          min="0"
          max="1"
          step="0.1"
        />
        <span class="range-value">{{ Math.round((selectedElement?.opacity || 1) * 100) }}%</span>
      </div>
      <div class="property-group">
        <label>Тень</label>
        <input 
          type="checkbox" 
          :checked="selectedElement?.hasShadow || false"
          @change="updateProperty('hasShadow', $event.target.checked)"
        />
      </div>
    </div>
  </div>
  
  <!-- Сообщение, когда ничего не выбрано -->
  <div class="properties-panel empty" v-else>
    <div class="empty-message">
      <p>Выберите элемент для редактирования свойств</p>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  position: fixed;
  right: 20px;
  top: 20px;
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
  transition: all 0.3s ease;
  overflow-y: auto;
  color: white;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.element-type {
  background: rgba(0, 123, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #007bff;
}

.section {
  margin-bottom: 25px;
}

.section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-group {
  margin-bottom: 15px;
}

.property-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
}

.property-group input[type="number"],
.property-group input[type="text"],
.property-group select,
.property-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.property-group input[type="number"]:focus,
.property-group input[type="text"]:focus,
.property-group select:focus,
.property-group textarea:focus {
  outline: none;
  border-color: #007bff;
  background: rgba(255, 255, 255, 0.15);
}

.property-group input[type="color"] {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.property-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
}

.property-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.property-group input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.range-value {
  display: inline-block;
  margin-left: 10px;
  font-size: 12px;
  color: #aaa;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.checkbox-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007bff;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  text-align: center;
  color: #666;
}

.empty-message p {
  margin: 0;
  font-size: 14px;
}

/* Скроллбар */
.properties-panel::-webkit-scrollbar {
  width: 6px;
}

.properties-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.properties-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.properties-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 