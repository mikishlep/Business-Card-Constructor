<script setup>
import { ref } from 'vue';
import DraggableItem from './DraggableItem.vue';

const props = defineProps({
    elements: Array,
    flipped: Boolean
});

const emit = defineEmits(['add-element', 'update-position', 'select-element', 'deselect-all']);

// Координаты
const offset = ref({ x: 0, y: 0 });
const start = ref({ x: 0, y: 0 });
// Данный параметр у нас будет отвечать за активность перемещения колесом мыши
const isPanning = ref(false);

// Тут происходит нажатие колеса мыши
function onMouseDown(e) {
    if (e.button !== 1) return;
    
    isPanning.value = true;
    start.value = { x: e.clientX, y: e.clientY }; // Стартовые координаты пользователя
    document.body.style.cursor = 'grabbing';

    e.preventDefault();
}

// Движение мыши
function onMouseMove(e) {
    if (!isPanning.value) return;

    // Просчет перемещений
    const dx = e.clientX - start.value.x;
    const dy = e.clientY - start.value.y;

    offset.value.x += dx;
    offset.value.y += dy;

    // Обновляем стартовые позиции
    start.value = { x: e.clientX, y: e.clientY };

    document.body.style.cursor = 'grab';
}

// Происходит отпускание кнопки
function onMouseUp() {
    if (isPanning.value) {
        isPanning.value = false;
        document.body.style.cursor = 'default';
    }
}

// Обработка клика по канвасу для снятия выбора
function onCanvasClick(e) {
    // Если кликнули по канвасу, а не по элементу, снимаем выбор
    if (e.target.classList.contains('canvas-card') || e.target.classList.contains('card-side')) {
        emit('deselect-all');
    }
}

// Обработка выбора элемента
function onSelectElement(elementId) {
    emit('select-element', elementId);
}
</script>

<template>
    <div class="pan-wrapper"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
        @mouseleave="onMouseUp"
        @click="onCanvasClick">
        
        <!-- Добавляем новый контейнер для трансформаций -->
        <div class="transform-container" :style="{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.6s ease'
        }">
            <!-- Основной контейнер карточки -->
            <div class="canvas-card" :class="{ flipped: props.flipped }">
                <div class="card-side front">
                    <!--<p>Передняя сторона визитки</p>-->
                    <!-- Перетаскиваемые элементы для передней стороны -->
                    <DraggableItem
                        v-for="element in props.flipped ? [] : (props.elements || [])"
                        :key="element.id"
                        :id="element.id"
                        :type="element.type"
                        :initial-x="element.x"
                        :initial-y="element.y"
                        :side="'front'"
                        :is-selected="element.isSelected"
                        :width="element.width"
                        :height="element.height"
                        :background-color="element.backgroundColor"
                        :border-color="element.borderColor"
                        :border-width="element.borderWidth"
                        :border-radius="element.borderRadius"
                        :opacity="element.opacity"
                        :has-shadow="element.hasShadow"
                        :text="element.text"
                        @update:position="(data) => emit('update-position', data)"
                        @select="onSelectElement"
                    />
                </div>
                <div class="card-side back">
                    <!--<p>Обратная сторона визитки</p>-->
                    <!-- Перетаскиваемые элементы для обратной стороны -->
                    <DraggableItem
                        v-for="element in props.flipped ? (props.elements || []) : []"
                        :key="element.id"
                        :id="element.id"
                        :type="element.type"
                        :initial-x="element.x"
                        :initial-y="element.y"
                        :side="'back'"
                        :is-selected="element.isSelected"
                        :width="element.width"
                        :height="element.height"
                        :background-color="element.backgroundColor"
                        :border-color="element.borderColor"
                        :border-width="element.borderWidth"
                        :border-radius="element.borderRadius"
                        :opacity="element.opacity"
                        :has-shadow="element.hasShadow"
                        :text="element.text"
                        @update:position="(data) => emit('update-position', data)"
                        @select="onSelectElement"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pan-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.transform-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    perspective: 1000px; /* Добавляем перспективу для 3D-эффекта */
}

/* Остальные стили с исправлениями */
.canvas-card {
    width: 525px;
    height: 300px;
    position: relative;
    transform-style: preserve-3d; /* Важно для 3D-трансформаций */
    transition: transform 0.6s ease;
    cursor: default;
}

.canvas-card.flipped {
    transform: rotateY(180deg);
}

.card-side {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden; /* Скрываем обратную сторону */
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    padding: 16px;
    box-sizing: border-box;
}

.front {
    background-color: #fff;
    transform: rotateY(0deg); /* Явно указываем поворот */
}

.back {
    background-color: #f0f0f0;
    transform: rotateY(180deg); /* Изначально перевернута */
}
</style>