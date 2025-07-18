<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  id: String,
  type: String,
  initialX: Number,
  initialY: Number,
  side: String,
  isSelected: Boolean,
  // Новые свойства
  width: Number,
  height: Number,
  backgroundColor: String,
  borderColor: String,
  borderWidth: Number,
  borderRadius: Number,
  opacity: Number,
  hasShadow: Boolean,
  text: Object
});

const emit = defineEmits(['update:position', 'select']);

const elementRef = ref(null);
const isDragging = ref(false);
const isEditing = ref(false);
const isResizing = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });
const position = ref({ x: props.initialX || 0, y: props.initialY || 0 });
const size = ref({ 
  width: props.width || 100, 
  height: props.height || 80 
});

// Следим за изменениями пропсов и обновляем локальные значения
watch(() => props.width, (newWidth) => {
  if (newWidth !== undefined) {
    size.value.width = newWidth;
  }
});

watch(() => props.height, (newHeight) => {
  if (newHeight !== undefined) {
    size.value.height = newHeight;
  }
});

watch(() => props.initialX, (newX) => {
  if (newX !== undefined) {
    position.value.x = newX;
  }
});

watch(() => props.initialY, (newY) => {
  if (newY !== undefined) {
    position.value.y = newY;
  }
});

// Начало перетаскивания
function onMouseDown(e) {
  if (e.button !== 0) return;
  
  if (props.type === 'text' && isEditing.value) return;
  
  if (e.target.classList.contains('resize-handle')) {
    startResize(e);
    return;
  }
  
  if (!props.isSelected) {
    emit('select', props.id);
  }
  
  isDragging.value = true;
  
  const rect = elementRef.value.getBoundingClientRect();
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  
  document.body.style.cursor = 'grabbing';
  e.preventDefault();
}

// Начало изменения размера
function startResize(e) {
  isResizing.value = true;
  
  const rect = elementRef.value.getBoundingClientRect();
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: size.value.width,
    height: size.value.height
  };
  
  document.body.style.cursor = 'nw-resize';
  e.preventDefault();
  e.stopPropagation();
}

// Перетаскивание
function onMouseMove(e) {
  if (isDragging.value) {
    const cardContainer = elementRef.value.closest('.card-side');
    if (!cardContainer) return;
    
    const cardRect = cardContainer.getBoundingClientRect();
    const newX = e.clientX - cardRect.left - dragOffset.value.x;
    const newY = e.clientY - cardRect.top - dragOffset.value.y;
    
    const maxX = cardRect.width - size.value.width;
    const maxY = cardRect.height - size.value.height;
    
    position.value = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    };
  }
  
  if (isResizing.value) {
    const deltaX = e.clientX - resizeStart.value.x;
    const deltaY = e.clientY - resizeStart.value.y;
    
    const minWidth = props.type === 'text' ? 80 : 50;
    const minHeight = props.type === 'text' ? 40 : 30;
    
    const newWidth = Math.max(minWidth, resizeStart.value.width + deltaX);
    const newHeight = Math.max(minHeight, resizeStart.value.height + deltaY);
    
    const cardContainer = elementRef.value.closest('.card-side');
    if (cardContainer) {
      const cardRect = cardContainer.getBoundingClientRect();
      const maxWidth = cardRect.width - position.value.x;
      const maxHeight = cardRect.height - position.value.y;
      
      size.value = {
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      };
    } else {
      size.value = { width: newWidth, height: newHeight };
    }
  }
}

// Завершение перетаскивания или изменения размера
function onMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    document.body.style.cursor = 'default';
    emit('update:position', { id: props.id, position: position.value });
  }
  
  if (isResizing.value) {
    isResizing.value = false;
    document.body.style.cursor = 'default';
  }
}

// Двойной клик для редактирования текста
function onDoubleClick(e) {
  if (props.type === 'text') {
    e.preventDefault();
    e.stopPropagation();
    isEditing.value = true;
    
    const textElement = elementRef.value.querySelector('.text-element p');
    if (textElement) {
      textElement.focus();
      const range = document.createRange();
      range.selectNodeContents(textElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

// Обработка потери фокуса для текстового элемента
function onBlur() {
  if (props.type === 'text') {
    isEditing.value = false;
  }
}

// Обработка нажатия Escape для выхода из режима редактирования
function onKeyDown(e) {
  if (e.key === 'Escape' && isEditing.value) {
    isEditing.value = false;
    e.target.blur();
  }
}

// Вычисляем стили элемента
const elementStyles = computed(() => {
  const styles = {
    left: position.value.x + 'px',
    top: position.value.y + 'px',
    width: size.value.width + 'px',
    height: size.value.height + 'px',
    transform: isDragging.value || isResizing.value ? 'scale(1.02)' : 'scale(1)',
    transition: (isDragging.value || isResizing.value) ? 'none' : 'transform 0.1s ease',
    opacity: props.opacity || 1
  };
  
  if (props.hasShadow) {
    styles.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  }
  
  return styles;
});

// Вычисляем стили контента
const contentStyles = computed(() => {
  return {
    backgroundColor: props.backgroundColor || '#ffffff',
    borderColor: props.isSelected ? (props.borderColor || '#007bff') : 'transparent',
    borderWidth: (props.borderWidth || 2) + 'px',
    borderRadius: (props.borderRadius || 6) + 'px'
  };
});

// Вычисляем стили текста
const textStyles = computed(() => {
  if (props.type !== 'text' || !props.text) {
    return {};
  }
  
  return {
    color: props.text.color || '#000000',
    fontSize: (props.text.fontSize || 14) + 'px',
    fontFamily: props.text.fontFamily || 'Arial',
    textAlign: props.text.textAlign || 'center',
    fontWeight: props.text.bold ? 'bold' : 'normal',
    fontStyle: props.text.italic ? 'italic' : 'normal',
    textDecoration: props.text.underline ? 'underline' : 'none'
  };
});

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});
</script>

<template>
  <div
    ref="elementRef"
    :style="elementStyles"
    class="draggable-element"
    :class="{ 
      'is-dragging': isDragging,
      'is-editing': isEditing,
      'is-resizing': isResizing,
      'is-selected': isSelected
    }"
    @mousedown="onMouseDown"
    @dblclick="onDoubleClick"
  >
    <div class="element-content" :style="contentStyles">
      <template v-if="type === 'text'">
        <div class="text-element">
          <p 
            contenteditable="true" 
            @blur="onBlur"
            @keydown="onKeyDown"
            :class="{ 'editing': isEditing }"
            :style="textStyles"
          >
            {{ text?.content || 'Текст' }}
          </p>
        </div>
      </template>
      <template v-else-if="type === 'image'">
        <div class="image-element">
          <img src="../assets/icons/add.svg" alt="Изображение" />
        </div>
      </template>
      <template v-else>
        <div class="default-element">
          <div class="element-placeholder">Элемент</div>
        </div>
      </template>
    </div>
    
    <!-- Элемент изменения размера -->
    <div 
      v-if="isSelected"
      class="resize-handle"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<style scoped>
.draggable-element {
  position: absolute;
  cursor: move;
  user-select: none;
  z-index: 10;
}

.draggable-element.is-dragging {
  z-index: 100;
  opacity: 0.9;
}

.draggable-element.is-editing {
  z-index: 50;
}

.draggable-element.is-resizing {
  z-index: 100;
  opacity: 0.9;
}

.element-content {
  width: 100%;
  height: 100%;
  padding: 8px;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.text-element {
  pointer-events: auto;
  width: 100%;
  height: 100%;
}

.text-element p {
  margin: 0;
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  background: transparent;
  cursor: text;
  padding: 4px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.text-element p.editing {
  background-color: rgba(0, 123, 255, 0.1);
  border: 1px solid #007bff;
  cursor: text;
}

.text-element p:focus {
  background-color: rgba(0, 123, 255, 0.1);
  border: 1px solid #007bff;
}

.image-element {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-element img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.default-element {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-placeholder {
  font-size: 12px;
  color: #666;
}

.resize-handle {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #007bff;
  border: 2px solid white;
  border-radius: 50%;
  cursor: nw-resize;
  z-index: 20;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.resize-handle:hover {
  transform: scale(1.2);
  background: #0056b3;
}
</style>