<script setup>
defineProps(['elements']);

import { ref } from 'vue';

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
}

// Происходит отпускание кнопки
function onMouseUp() {
    isPanning.value = false;
    document.body.style.cursor = 'default';
}

</script>

<template>
    <div 
        class="canvas-wrapper"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
        @mouseleave="onMouseUp"
        :style="{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.1s ease',
        }"
    >
        <div class="canvas-card">

        </div>
    </div>
</template>

<style scoped>
.canvas-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.canvas-card {
    width: 525px;
    height: 300px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    border: 1px solid #ccc;
    position: relative;
    overflow: hidden;
    padding: 16px;
    box-sizing: border-box;
}
</style>