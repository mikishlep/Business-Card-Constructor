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
    width: 525px;
    height: 300px;
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
    padding: 16px;
    box-sizing: border-box;
    transform-style: preserve-3d;
}

.front {
    transform: rotateY(0deg);
}

.back {
    transform: rotateY(180deg);
}

.card-side * {
    transform-style: preserve-3d;
}
</style>