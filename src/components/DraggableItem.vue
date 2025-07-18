<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  id: String,
  type: String,
  initialX: Number,
  initialY: Number,
  side: String, // 'front' или 'back'
  isSelected: Boolean // Новый проп для выбора
});

const emit = defineEmits(['update:position', 'select', 'deselect']);

const elementRef = ref(null);
const isDragging = ref(false);
const isEditing = ref(false);
const isResizing = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });
const position = ref({ x: props.initialX || 0, y: props.initialY || 0 });
const size = ref({ width: 100, height: 80 }); // Начальный размер

// Начало перетаскивания
function onMouseDown(e) {
  if (e.button !== 0) return; // Только левая кнопка мыши
  
  // Если это текстовый элемент и мы в режиме редактирования, не начинаем перетаскивание
  if (props.type === 'text' && isEditing.value) return;
  
  // Проверяем, не кликнули ли мы по элементу изменения размера
  if (e.target.classList.contains('resize-handle')) {
    startResize(e);
    return;
  }
  
  // Выбираем элемент при клике
  if (!props.isSelected) {
    emit('select', props.id);
  }
  
  isDragging.value = true;
  
  // Вычисляем смещение курсора относительно элемента
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
    // Находим родительский контейнер карточки
    const cardContainer = elementRef.value.closest('.card-side');
    if (!cardContainer) return;
    
    const cardRect = cardContainer.getBoundingClientRect();
    
    // Вычисляем новую позицию относительно карточки
    const newX = e.clientX - cardRect.left - dragOffset.value.x;
    const newY = e.clientY - cardRect.top - dragOffset.value.y;
    
    // Ограничиваем позицию границами карточки
    const maxX = cardRect.width - size.value.width;
    const maxY = cardRect.height - size.value.height;
    
    position.value = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    };
  }
  
  if (isResizing.value) {
    // Вычисляем новый размер
    const deltaX = e.clientX - resizeStart.value.x;
    const deltaY = e.clientY - resizeStart.value.y;
    
    // Минимальный размер зависит от типа элемента
    const minWidth = props.type === 'text' ? 80 : 50;
    const minHeight = props.type === 'text' ? 40 : 30;
    
    const newWidth = Math.max(minWidth, resizeStart.value.width + deltaX);
    const newHeight = Math.max(minHeight, resizeStart.value.height + deltaY);
    
    // Ограничиваем размер границами карточки
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
    
    // Фокусируемся на текстовом элементе
    const textElement = elementRef.value.querySelector('.text-element p');
    if (textElement) {
      textElement.focus();
      // Выделяем весь текст
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

// Обработчики событий
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
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      width: size.width + 'px',
      height: size.height + 'px',
      transform: isDragging || isResizing ? 'scale(1.02)' : 'scale(1)',
      transition: (isDragging || isResizing) ? 'none' : 'transform 0.1s ease'
    }"
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
    <div class="element-content">
      <template v-if="type === 'text'">
        <div class="text-element">
          <p 
            contenteditable="true" 
            @blur="onBlur"
            @keydown="onKeyDown"
            :class="{ 'editing': isEditing }"
          >
            Текст
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
    
    <!-- Элемент изменения размера (для всех типов элементов) -->
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
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid transparent; /* Прозрачная граница по умолчанию */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none; /* Предотвращаем конфликты с перетаскиванием */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

/* Синяя обводка только для выбранных элементов */
.draggable-element.is-selected .element-content {
  border-color: #007bff;
}

.text-element {
  pointer-events: auto; /* Разрешаем редактирование текста */
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

/* Элемент изменения размера */
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