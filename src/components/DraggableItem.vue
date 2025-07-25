<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  id: String,
  type: String,
  initialX: Number,
  initialY: Number,
  side: String,
  isSelected: Boolean,
  width: Number,
  height: Number,
  zIndex: Number,
  backgroundColor: String,
  borderColor: String,
  borderWidth: Number,
  borderRadius: Number,
  borderRadiusTopLeft: Number,
  borderRadiusTopRight: Number,
  borderRadiusBottomLeft: Number,
  borderRadiusBottomRight: Number,
  opacity: Number,
  hasShadow: Boolean,
  text: Object,
  imageUrl: String
});

const emit = defineEmits(['update:position', 'select']);

const elementRef = ref(null);
const textElement = ref(null);
const isDragging = ref(false);
const isEditing = ref(false);
const isResizing = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });
const resizeCorner = ref(''); // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
const position = ref({ x: props.initialX || 0, y: props.initialY || 0 });

const size = ref({ 
  width: props.width || (props.type === 'text' ? 120 : 100), 
  height: props.height || (props.type === 'text' ? 60 : 80) 
});

// Синхронизация содержимого при изменении пропсов
watch(() => props.text?.content, (newContent) => {
  if (textElement.value && newContent !== undefined && !isEditing.value) {
    nextTick(() => {
      if (textElement.value.textContent !== newContent) {
        textElement.value.textContent = newContent;
      }
    });
  }
}, { immediate: true });

// Следим за изменениями пропсов
watch(() => props.width, (newWidth) => {
  if (newWidth !== undefined && newWidth !== null) {
    size.value.width = newWidth;
  }
}, { immediate: true });

watch(() => props.height, (newHeight) => {
  if (newHeight !== undefined && newHeight !== null) {
    size.value.height = newHeight;
  }
}, { immediate: true });

watch(() => props.initialX, (newX) => {
  if (newX !== undefined && newX !== null) {
    position.value.x = newX;
  }
}, { immediate: true });

watch(() => props.initialY, (newY) => {
  if (newY !== undefined && newY !== null) {
    position.value.y = newY;
  }
}, { immediate: true });

// Начало перетаскивания
function onMouseDown(e) {
  if (e.button !== 0) return;
  
  if (props.type === 'text' && isEditing.value) return;
  
  if (e.target.classList.contains('resize-handle')) {
    const corner = e.target.dataset.corner;
    startResize(e, corner);
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
function startResize(e, corner) {
  console.log('startResize called with corner:', corner);
  isResizing.value = true;
  resizeCorner.value = corner;
  
  const rect = elementRef.value.getBoundingClientRect();
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: size.value.width,
    height: size.value.height,
    startX: position.value.x,
    startY: position.value.y
  };
  
  console.log('Resize start values:', resizeStart.value);
  
  // Устанавливаем курсор в зависимости от угла
  const cursors = {
    'top-left': 'nw-resize',
    'top-right': 'ne-resize',
    'bottom-left': 'sw-resize',
    'bottom-right': 'se-resize'
  };
  document.body.style.cursor = cursors[corner] || 'nw-resize';
  
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
    
    // Убираем ограничения - элементы можно перетаскивать за пределы визитки
    position.value = {
      x: newX,
      y: newY
    };
  }
  
  if (isResizing.value) {
    const deltaX = e.clientX - resizeStart.value.x;
    const deltaY = e.clientY - resizeStart.value.y;
    
    const minWidth = props.type === 'text' ? 80 : 50;
    const minHeight = props.type === 'text' ? 40 : 30;
    
    let newWidth = resizeStart.value.width;
    let newHeight = resizeStart.value.height;
    let newX = resizeStart.value.startX;
    let newY = resizeStart.value.startY;
    
    // Изменяем размер в зависимости от угла
    switch (resizeCorner.value) {
      case 'top-left':
        newWidth = Math.max(minWidth, resizeStart.value.width - deltaX);
        newHeight = Math.max(minHeight, resizeStart.value.height - deltaY);
        newX = resizeStart.value.startX + (resizeStart.value.width - newWidth);
        newY = resizeStart.value.startY + (resizeStart.value.height - newHeight);
        break;
      case 'top-right':
        newWidth = Math.max(minWidth, resizeStart.value.width + deltaX);
        newHeight = Math.max(minHeight, resizeStart.value.height - deltaY);
        newY = resizeStart.value.startY + (resizeStart.value.height - newHeight);
        break;
      case 'bottom-left':
        newWidth = Math.max(minWidth, resizeStart.value.width - deltaX);
        newHeight = Math.max(minHeight, resizeStart.value.height + deltaY);
        newX = resizeStart.value.startX + (resizeStart.value.width - newWidth);
        break;
      case 'bottom-right':
        newWidth = Math.max(minWidth, resizeStart.value.width + deltaX);
        newHeight = Math.max(minHeight, resizeStart.value.height + deltaY);
        break;
    }
    
    // Убираем ограничения границами карточки при изменении размера
    size.value = { width: newWidth, height: newHeight };
    position.value = { x: newX, y: newY };
  }
}

// Завершение перетаскивания или изменения размера
function onMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    document.body.style.cursor = 'default';
    emit('update:position', { 
      id: props.id, 
      position: position.value,
      size: size.value
    });
  }
  
  if (isResizing.value) {
    isResizing.value = false;
    resizeCorner.value = '';
    document.body.style.cursor = 'default';
    emit('update:position', { 
      id: props.id, 
      position: position.value,
      size: size.value
    });
  }
}

// Двойной клик для редактирования текста
function onDoubleClick(e) {
  if (props.type === 'text') {
    e.preventDefault();
    e.stopPropagation();
    isEditing.value = true;
    
    if (textElement.value) {
      textElement.value.focus();
      const range = document.createRange();
      range.selectNodeContents(textElement.value);
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
    // Также сохраняем изменения при потере фокуса
    if (textElement.value) {
      const newContent = textElement.value.textContent || textElement.value.innerText;
      emit('update:position', {
        id: props.id,
        property: 'text.content',
        value: newContent
      });
    }
  }
}

// Обработка нажатия Escape для выхода из режима редактирования
function onKeyDown(e) {
  if (e.key === 'Escape' && isEditing.value) {
    isEditing.value = false;
    e.target.blur();
  }
}

// Обработка ввода текста
function onTextInput(e) {
  if (props.type === 'text') {
    const newContent = e.target.textContent || e.target.innerText;
    // Эмитим событие для обновления текста в родительском компоненте
    emit('update:position', {
      id: props.id,
      property: 'text.content',
      value: newContent
    });
  }
}

// Обработка начала композиции IME
function onCompositionStart(e) {
  // Приостанавливаем обновление во время композиции
  isEditing.value = true;
}

// Обработка окончания композиции IME
function onCompositionEnd(e) {
  // Обновляем содержимое после завершения композиции
  const newContent = e.target.textContent || e.target.innerText;
  emit('update:position', {
    id: props.id,
    property: 'text.content',
    value: newContent
  });
}

// Вычисляем стили элемента
const elementStyles = computed(() => {
  const styles = {
    left: position.value.x + 'px',
    top: position.value.y + 'px',
    width: size.value.width + 'px',
    height: size.value.height + 'px',
    zIndex: props.zIndex || 0,
    //transform: isDragging.value || isResizing.value ? 'scale(1.02)' : 'scale(1)',
    transition: (isDragging.value || isResizing.value) ? 'none' : 'transform 0.1s ease',
    opacity: props.opacity || 1
  };
  
  return styles;
});

// Вычисляем стили контента
const contentStyles = computed(() => {
  const styles = {
    borderWidth: (props.borderWidth || 0) + 'px',
    borderStyle: 'solid',
    borderColor: props.borderColor || 'transparent'
  };

  // Обрабатываем прозрачный фон
  if (props.backgroundColor === 'transparent') {
    styles.backgroundColor = 'transparent';
  } else {
    styles.backgroundColor = props.backgroundColor || '#ffffff';
  }

  if (props.borderRadiusTopLeft || props.borderRadiusTopRight || props.borderRadiusBottomLeft || props.borderRadiusBottomRight) {
    styles.borderRadius = `${props.borderRadiusTopLeft || 0}px ${props.borderRadiusTopRight || 0}px ${props.borderRadiusBottomRight || 0}px ${props.borderRadiusBottomLeft || 0}px`;
  } else {
    styles.borderRadius = (props.borderRadius || 0) + 'px';
  }

  if (props.hasShadow) {
    styles.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  }

  return styles;
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

// Вычисляем стили выделения
const selectionStyles = computed(() => {
  if (!props.isSelected) return {};
  
  return {
    outline: `2px solid #007bff`,
    outlineOffset: '2px'
  };
});

const imageElementStyles = computed(() => {
  // Собираем border-radius для всех углов
  let radius = '';
  if (
    props.borderRadiusTopLeft ||
    props.borderRadiusTopRight ||
    props.borderRadiusBottomLeft ||
    props.borderRadiusBottomRight
  ) {
    radius = `${props.borderRadiusTopLeft || 0}px ${props.borderRadiusTopRight || 0}px ${props.borderRadiusBottomRight || 0}px ${props.borderRadiusBottomLeft || 0}px`;
  } else {
    radius = (props.borderRadius || 0) + 'px';
  }
  return {
    borderRadius: radius,
    overflow: 'hidden', // обязательно!
    width: '100%',
    height: '100%',
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
            ref="textElement"
            contenteditable="true" 
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            @blur="onBlur"
            @input="onTextInput"
            @keydown="onKeyDown"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            :class="{ 'editing': isEditing }"
            :style="textStyles"
          >
          </p>
        </div>
      </template>
      <template v-else-if="type === 'image'">
        <div
          class="image-element"
          :style="imageElementStyles"
        >
          <img 
            :src="imageUrl || '../assets/icons/add.svg'" 
            alt="Изображение"
            @error="handleImageError"
          />
        </div>
      </template>
      <template v-else>
        <div class="default-element">
          <div class="element-placeholder"></div>
        </div>
      </template>
    </div>
    
    <!-- Resize handles во всех 4 углах -->
    <div 
      v-if="isSelected"
      class="resize-handle top-left"
      data-corner="top-left"
      @mousedown="(e) => startResize(e, 'top-left')"
    ></div>
    <div 
      v-if="isSelected"
      class="resize-handle top-right"
      data-corner="top-right"
      @mousedown="(e) => startResize(e, 'top-right')"
    ></div>
    <div 
      v-if="isSelected"
      class="resize-handle bottom-left"
      data-corner="bottom-left"
      @mousedown="(e) => startResize(e, 'bottom-left')"
    ></div>
    <div 
      v-if="isSelected"
      class="resize-handle bottom-right"
      data-corner="bottom-right"
      @mousedown="(e) => startResize(e, 'bottom-right')"
    ></div>

    <!-- Индикатор выделения -->
    <div 
      v-if="isSelected"
      class="selection-indicator"
      :style="selectionStyles"
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
  /* padding: 8px; */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
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
  justify-content: center;
  align-items: center;
  overflow: hidden; /* обязательно для обрезки углов */
}

.image-element img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit; /* наследует от .image-element */
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

/* Resize handles во всех 4 углах */
.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #007bff;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 20;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.resize-handle:hover {
  transform: scale(1.2);
  background: #0056b3;
}

.resize-handle.top-left {
  top: -12px;
  left: -12px;
  cursor: nwse-resize;
}

.resize-handle.top-right {
  top: -12px;
  right: -12px;
  cursor: nesw-resize;
}

.resize-handle.bottom-left {
  bottom: -12px;
  left: -12px;
  cursor: nesw-resize;
}

.resize-handle.bottom-right {
  bottom: -12px;
  right: -12px;
  cursor: nwse-resize;
}

.selection-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}
</style>