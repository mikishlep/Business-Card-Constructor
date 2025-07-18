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

// Получение выбранного элемента
function getSelectedElement() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    return elements.find(el => el.isSelected) || null;
}

// Добавление нового элемента
function addElement(type = 'default') {
    const newElement = {
        id: `element-${Date.now()}`,
        type: type,
        x: 50,
        y: 50,
        width: 100,
        height: type === 'text' ? 80 : 60,
        side: props.flipped ? 'back' : 'front',
        isSelected: true,
        backgroundColor: '#ffffff',
        borderColor: '#007bff',
        borderWidth: 2,
        borderRadius: 6,
        opacity: 1,
        hasShadow: false,
        text: type === 'text' ? {
            content: 'Текст',
            color: '#000000',
            fontSize: 14,
            fontFamily: 'Arial',
            textAlign: 'center',
            bold: false,
            italic: false,
            underline: false
        } : null
    };
    
    // Снимаем выбор со всех других элементов
    const elements = props.flipped ? backElements.value : frontElements.value;
    elements.forEach(el => el.isSelected = false);
    
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

// Обновление свойств элемента
function updateElement({ id, property, value }) {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const element = elements.find(el => el.id === id);
    if (element) {
        if (property.includes('.')) {
            const [parent, child] = property.split('.');
            if (!element[parent]) element[parent] = {};
            element[parent][child] = value;
        } else {
            element[property] = value;
        }
    }
}

// Выбор элемента
function selectElement(elementId) {
    const elements = props.flipped ? backElements.value : frontElements.value;
    elements.forEach(el => {
        el.isSelected = el.id === elementId;
    });
}

// Снятие выбора со всех элементов
function deselectAll() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    elements.forEach(el => el.isSelected = false);
}

// Удаление выбранных элементов
function deleteSelected() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const selectedElements = elements.filter(el => el.isSelected);
    
    if (selectedElements.length > 0) {
        // Удаляем выбранные элементы
        if (props.flipped) {
            backElements.value = backElements.value.filter(el => !el.isSelected);
        } else {
            frontElements.value = frontElements.value.filter(el => !el.isSelected);
        }
    }
}

// Экспортируем функции для использования в родительском компоненте
defineExpose({
    addElement,
    updateElementPosition,
    updateElement,
    selectElement,
    deselectAll,
    deleteSelected,
    getSelectedElement
});
</script>

<template>
    <div class="editor">
        <Canvas 
            :flipped="flipped" 
            :elements="activeElements"
            @add-element="addElement"
            @update-position="updateElementPosition"
            @select-element="selectElement"
            @deselect-all="deselectAll"
        />
    </div>
</template>

<style scoped>

</style>