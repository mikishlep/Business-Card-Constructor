<script setup>
import { ref, computed } from 'vue';
import Canvas from './Canvas.vue';

// Получаем проп flipped из App.vue
const props = defineProps({ flipped: Boolean });

const frontElements = ref([]);
const backElements = ref([]);

// Фоны для сторон визитки
const frontBackground = ref({
    type: 'color', // 'color', 'image', 'transparent'
    value: '#ffffff'
});

const backBackground = ref({
    type: 'color',
    value: '#f0f0f0'
});

// Получение стороны визитки
const activeElements = computed(() => {
    return props.flipped ? backElements.value : frontElements.value;
});

// Получение активного фона
const activeBackground = computed(() => {
    return props.flipped ? backBackground.value : frontBackground.value;
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
        width: type === 'text' ? 120 : 100,
        height: type === 'text' ? 60 : 80,
        side: props.flipped ? 'back' : 'front',
        isSelected: true,
        // Для текстовых элементов по умолчанию прозрачный фон
        backgroundColor: type === 'text' ? 'transparent' : '#ffffff',
        borderColor: '#000000',
        borderWidth: 0,
        borderRadius: 0,
        borderRadiusTopLeft: 0,
        borderRadiusTopRight: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
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
        } : null,
        imageUrl: type === 'image' ? null : null
    };
    
    // Если это изображение, открываем диалог выбора файла
    if (type === 'image') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newElement.imageUrl = e.target.result;
                    // Обновляем элемент в массиве
                    const elements = props.flipped ? backElements.value : frontElements.value;
                    const elementIndex = elements.findIndex(el => el.id === newElement.id);
                    if (elementIndex !== -1) {
                        elements[elementIndex] = { ...newElement };
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
    
    // Снимаем выбор со всех других элементов
    const elements = props.flipped ? backElements.value : frontElements.value;
    elements.forEach(el => el.isSelected = false);
    
    if (props.flipped) {
        backElements.value.push(newElement);
    } else {
        frontElements.value.push(newElement);
    }
}

// Обновление позиции и размера элемента
function updateElementPosition({ id, position, size }) {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const element = elements.find(el => el.id === id);
    if (element) {
        element.x = position.x;
        element.y = position.y;
        if (size) {
            element.width = size.width;
            element.height = size.height;
        }
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

// Обновление фона
function updateBackground(backgroundData) {
    if (props.flipped) {
        backBackground.value = { ...backBackground.value, ...backgroundData };
    } else {
        frontBackground.value = { ...frontBackground.value, ...backgroundData };
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
    updateBackground,
    selectElement,
    deselectAll,
    deleteSelected,
    getSelectedElement,
    activeBackground,
    frontElements,
    backElements,
    frontBackground,
    backBackground
});
</script>

<template>
    <div class="editor">
        <Canvas 
            :flipped="flipped" 
            :elements="activeElements"
            :background="activeBackground"
            @add-element="addElement"
            @update-position="updateElementPosition"
            @select-element="selectElement"
            @deselect-all="deselectAll"
        />
    </div>
</template>

<style scoped>
.editor {
    position: relative;
    width: 100%;
    height: 100vh;
}
</style>