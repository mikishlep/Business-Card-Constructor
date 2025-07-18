<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  id: String,
  type: String,
  initialX: Number,
  initialY: Number,
  side: String // 'front' или 'back'
});

const emit = defineEmits(['update:position']);

const elementRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: props.initialX || 0, y: props.initialY || 0 });

// Начало перетаскивания
function onMouseDown(e) {
  if (e.button !== 0) return; // Только левая кнопка мыши
  
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

// Перетаскивание
function onMouseMove(e) {
  if (!isDragging.value) return;
  
  // Находим родительский контейнер карточки
  const cardContainer = elementRef.value.closest('.card-side');
  if (!cardContainer) return;
  
  const cardRect = cardContainer.getBoundingClientRect();
  
  // Вычисляем новую позицию относительно карточки
  const newX = e.clientX - cardRect.left - dragOffset.value.x;
  const newY = e.clientY - cardRect.top - dragOffset.value.y;
  
  // Ограничиваем позицию границами карточки
  const maxX = cardRect.width - elementRef.value.offsetWidth;
  const maxY = cardRect.height - elementRef.value.offsetHeight;
  
  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  };
}

// Завершение перетаскивания
function onMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    document.body.style.cursor = 'default';
    emit('update:position', { id: props.id, position: position.value });
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
      transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      transition: isDragging ? 'none' : 'transform 0.1s ease'
    }"
    class="draggable-element"
    :class="{ 'is-dragging': isDragging }"
    @mousedown="onMouseDown"
  >
    <div class="element-content">
      <template v-if="type === 'text'">
        <div class="text-element">
          <p contenteditable="true" @click.stop>Текст</p>
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

.element-content {
  min-width: 50px;
  min-height: 30px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #007bff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none; /* Предотвращаем конфликты с перетаскиванием */
}

.text-element {
  pointer-events: auto; /* Разрешаем редактирование текста */
}

.text-element p {
  margin: 0;
  min-width: 100px;
  min-height: 20px;
  outline: none;
  border: none;
  background: transparent;
  cursor: text;
}

.image-element img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.default-element {
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-placeholder {
  font-size: 12px;
  color: #666;
}
</style>