<script setup>
import { ref, computed } from 'vue';
import DraggableItem from './DraggableItem.vue';

const props = defineProps({
    elements: Array,
    flipped: Boolean,
    background: Object
});

const emit = defineEmits(['add-element', 'update-position', 'select-element', 'deselect-all']);

// Координаты
const offset = ref({ x: 0, y: 0 });
const start = ref({ x: 0, y: 0 });
const isPanning = ref(false);

// Управление границами
const showBorders = ref(false);
const borderMode = ref('all'); // 'pre-cut', 'final', 'safe', 'all'

// Размеры визитки в мм
const cardSizes = {
    preCut: { width: 92, height: 52 },    // Дообрезной формат
    final: { width: 90, height: 50 },     // Готовое изделие
    safe: { width: 84, height: 44 }       // Безопасная зона
};

// Конвертация мм в пиксели (300 DPI)
const mmToPx = (mm) => mm * 11.811; // 300 DPI = 11.811 px/mm

// Вычисление размеров границ в пикселях
const borderSizes = computed(() => ({
    preCut: {
        width: mmToPx(cardSizes.preCut.width),
        height: mmToPx(cardSizes.preCut.height)
    },
    final: {
        width: mmToPx(cardSizes.final.width),
        height: mmToPx(cardSizes.final.height)
    },
    safe: {
        width: mmToPx(cardSizes.safe.width),
        height: mmToPx(cardSizes.safe.height)
    }
}));

// Вычисление позиций границ (центрирование)
const borderPositions = computed(() => {
    const cardWidth = 1087; // Ширина карточки в пикселях
    const cardHeight = 614; // Высота карточки в пикселях
    
    return {
        preCut: {
            x: (cardWidth - borderSizes.value.preCut.width) / 2,
            y: (cardHeight - borderSizes.value.preCut.height) / 2
        },
        final: {
            x: (cardWidth - borderSizes.value.final.width) / 2,
            y: (cardHeight - borderSizes.value.final.height) / 2
        },
        safe: {
            x: (cardWidth - borderSizes.value.safe.width) / 2,
            y: (cardHeight - borderSizes.value.safe.height) / 2
        }
    };
});

// Функции управления границами
function toggleBorders() {
    showBorders.value = !showBorders.value;
}

function switchBorderMode(mode) {
    borderMode.value = mode;
    showBorders.value = true;
}

// Экспортируем функции
defineExpose({
    toggleBorders,
    switchBorderMode,
    showBorders,
    borderMode,
    borderSizes,
    borderPositions
});

// Тут происходит нажатие колеса мыши
function onMouseDown(e) {
    if (e.button !== 1) return;
    
    isPanning.value = true;
    start.value = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
}

// Движение мыши
function onMouseMove(e) {
    if (!isPanning.value) return;

    const dx = e.clientX - start.value.x;
    const dy = e.clientY - start.value.y;

    offset.value.x += dx;
    offset.value.y += dy;

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
    if (e.target.classList.contains('canvas-card') || e.target.classList.contains('card-side')) {
        emit('deselect-all');
    }
}

// Обработка выбора элемента
function onSelectElement(elementId) {
    emit('select-element', elementId);
}

// Вычисляем стили фона
const backgroundStyles = computed(() => {
    if (!props.background) return {};
    
    switch (props.background.type) {
        case 'transparent':
            return { backgroundColor: 'transparent' };
        case 'image':
        case 'collection':
            return { 
                backgroundImage: `url(${props.background.value})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            };
        case 'color':
        default:
            return { backgroundColor: props.background.value || '#ffffff' };
    }
});
</script>

<template>
    <div class="pan-wrapper"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
        @mouseleave="onMouseUp"
        @click="onCanvasClick">
        
        <div class="transform-container" :style="{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.6s ease'
        }">
            <div class="canvas-card" :class="{ flipped: props.flipped }">
                <div class="card-side front" :style="backgroundStyles">
                    <!-- Визуальные границы -->
                    <div v-if="showBorders" class="print-borders">
                        <!-- Дообрезной формат (92x52) -->
                        <div 
                            v-if="borderMode === 'pre-cut' || borderMode === 'all'"
                            class="border-line pre-cut-border"
                            :style="{
                                left: borderPositions.preCut.x + 'px',
                                top: borderPositions.preCut.y + 'px',
                                width: borderSizes.preCut.width + 'px',
                                height: borderSizes.preCut.height + 'px'
                            }"
                            title="Дообрезной формат (92×52 мм)"
                        ></div>
                        
                        <!-- Готовое изделие (90x50) -->
                        <div 
                            v-if="borderMode === 'final' || borderMode === 'all'"
                            class="border-line final-border"
                            :style="{
                                left: borderPositions.final.x + 'px',
                                top: borderPositions.final.y + 'px',
                                width: borderSizes.final.width + 'px',
                                height: borderSizes.final.height + 'px'
                            }"
                            title="Готовое изделие (90×50 мм, 300 DPI)"
                        ></div>
                        
                        <!-- Безопасная зона (84x44) -->
                        <div 
                            v-if="borderMode === 'safe' || borderMode === 'all'"
                            class="border-line safe-border"
                            :style="{
                                left: borderPositions.safe.x + 'px',
                                top: borderPositions.safe.y + 'px',
                                width: borderSizes.safe.width + 'px',
                                height: borderSizes.safe.height + 'px'
                            }"
                            title="Безопасная зона (84×44 мм)"
                        ></div>
                    </div>
                    
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
                        :z-index="element.zIndex"
                        :background-color="element.backgroundColor"
                        :border-color="element.borderColor"
                        :border-width="element.borderWidth"
                        :border-radius="element.borderRadius"
                        :border-radius-top-left="element.borderRadiusTopLeft"
                        :border-radius-top-right="element.borderRadiusTopRight"
                        :border-radius-bottom-left="element.borderRadiusBottomLeft"
                        :border-radius-bottom-right="element.borderRadiusBottomRight"
                        :opacity="element.opacity"
                        :has-shadow="element.hasShadow"
                        :text="element.text"
                        :image-url="element.imageUrl"
                        @update:position="(data) => emit('update-position', data)"
                        @select="onSelectElement"
                    />
                </div>
                <div class="card-side back" :style="backgroundStyles">
                    <!-- Визуальные границы -->
                    <div v-if="showBorders" class="print-borders">
                        <!-- Дообрезной формат (92x52) -->
                        <div 
                            v-if="borderMode === 'pre-cut' || borderMode === 'all'"
                            class="border-line pre-cut-border"
                            :style="{
                                left: borderPositions.preCut.x + 'px',
                                top: borderPositions.preCut.y + 'px',
                                width: borderSizes.preCut.width + 'px',
                                height: borderSizes.preCut.height + 'px'
                            }"
                            title="Дообрезной формат (92×52 мм)"
                        ></div>
                        
                        <!-- Готовое изделие (90x50) -->
                        <div 
                            v-if="borderMode === 'final' || borderMode === 'all'"
                            class="border-line final-border"
                            :style="{
                                left: borderPositions.final.x + 'px',
                                top: borderPositions.final.y + 'px',
                                width: borderSizes.final.width + 'px',
                                height: borderSizes.final.height + 'px'
                            }"
                            title="Готовое изделие (90×50 мм, 300 DPI)"
                        ></div>
                        
                        <!-- Безопасная зона (84x44) -->
                        <div 
                            v-if="borderMode === 'safe' || borderMode === 'all'"
                            class="border-line safe-border"
                            :style="{
                                left: borderPositions.safe.x + 'px',
                                top: borderPositions.safe.y + 'px',
                                width: borderSizes.safe.width + 'px',
                                height: borderSizes.safe.height + 'px'
                            }"
                            title="Безопасная зона (84×44 мм)"
                        ></div>
                    </div>
                    
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
                        :z-index="element.zIndex"
                        :background-color="element.backgroundColor"
                        :border-color="element.borderColor"
                        :border-width="element.borderWidth"
                        :border-radius="element.borderRadius"
                        :border-radius-top-left="element.borderRadiusTopLeft"
                        :border-radius-top-right="element.borderRadiusTopRight"
                        :border-radius-bottom-left="element.borderRadiusBottomLeft"
                        :border-radius-bottom-right="element.borderRadiusBottomRight"
                        :opacity="element.opacity"
                        :has-shadow="element.hasShadow"
                        :text="element.text"
                        :image-url="element.imageUrl"
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
    perspective: 1000px;
}

.canvas-card {
    width: 1087px;
    height: 614px;
    position: relative;
    transform-style: preserve-3d;
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
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.card-side.back {
    transform: rotateY(180deg);
}

/* Стили для визуальных границ */
.print-borders {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
}

.border-line {
    position: absolute;
    border: 2px dashed;
    pointer-events: none;
}

.pre-cut-border {
    border-color: #ff6b6b;
}

.final-border {
    border-color: #4ecdc4;
}

.safe-border {
    border-color: #45b7d1;
}
</style>