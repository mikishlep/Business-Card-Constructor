<script setup>
import { ref, computed } from 'vue';
import Canvas from './Canvas.vue';

// Получаем проп flipped из App.vue
const props = defineProps({ flipped: Boolean });

const frontElements = ref([]);
const backElements = ref([]);

// Получение стороны визитки
const activeElements = computed(() => {
    return props.flipped ? backElements.value : frontElements.value;
});

// Добавление нового элемента
function addElement(type = 'default') {
    const newElement = {
        id: `element-${Date.now()}`,
        type: type,
        x: 50,
        y: 50,
        side: props.flipped ? 'back' : 'front'
    };
    
    if (props.flipped) {
        backElements.value.push(newElement);
    } else {
        frontElements.value.push(newElement);
    }
}

// Обновление позиции элемента
function updateElementPosition({ id, position }) {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const element = elements.find(el => el.id === id);
    if (element) {
        element.x = position.x;
        element.y = position.y;
    }
}

// Экспортируем функции для использования в родительском компоненте
defineExpose({
    addElement,
    updateElementPosition
});
</script>

<template>
    <div class="editor">
        <Canvas 
            :flipped="flipped" 
            :elements="activeElements"
            @add-element="addElement"
            @update-position="updateElementPosition"
        />
    </div>
</template>

<style scoped>

</style>