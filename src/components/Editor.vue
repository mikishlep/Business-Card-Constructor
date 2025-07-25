<script setup>
import { ref, computed } from 'vue';
import Canvas from './Canvas.vue';

// Получаем проп flipped из App.vue
const props = defineProps({ flipped: Boolean });

const frontElements = ref([]);
const backElements = ref([]);
const canvasRef = ref(null);

// Инициализация zIndex для существующих элементов
function initializeZIndex() {
  // Для front элементов
  frontElements.value.forEach((element, index) => {
    if (element.zIndex === undefined) {
      element.zIndex = index;
    }
  });
  
  // Для back элементов
  backElements.value.forEach((element, index) => {
    if (element.zIndex === undefined) {
      element.zIndex = index;
    }
  });
}

// Вызываем инициализацию при создании компонента
initializeZIndex();

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
    const elements = props.flipped ? backElements.value : frontElements.value;
    
    // Определяем максимальный z-index для нового элемента
    const maxZIndex = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex || 0)) : 0;
    
    const newElement = {
        id: `element-${Date.now()}`,
        type: type,
        x: 50,
        y: 50,
        width: type === 'text' ? 120 : 100,
        height: type === 'text' ? 60 : 80,
        side: props.flipped ? 'back' : 'front',
        isSelected: true,
        zIndex: maxZIndex + 1, // Новый элемент всегда сверху
        // Для текстовых элементов по умолчанию прозрачный фон
        backgroundColor: type === 'text' || type === 'image' ? 'transparent' : '#D9D9D9',
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
            content: '',
            color: '#000000',
            fontSize: 14,
            fontFamily: 'Montserrat',
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
        
        // Добавляем элемент в массив перед открытием диалога
        if (props.flipped) {
            backElements.value.push(newElement);
        } else {
            frontElements.value.push(newElement);
        }
        
        // Снимаем выбор со всех других элементов
        elements.forEach(el => el.isSelected = false);
        
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
            } else {
                // Если файл не выбран, удаляем элемент
                removeElement(newElement.id);
            }
        };
        
        // Добавляем обработчик для отмены выбора
        input.oncancel = () => {
            // Проверяем через небольшую задержку, был ли выбран файл
            setTimeout(() => {
                const elements = props.flipped ? backElements.value : frontElements.value;
                const element = elements.find(el => el.id === newElement.id);
                if (element && !element.imageUrl) {
                    removeElement(newElement.id);
                }
            }, 100);
        };
        
        input.click();
        return; // Выходим из функции
    }
    
    // Снимаем выбор со всех других элементов
    elements.forEach(el => el.isSelected = false);
    
    if (props.flipped) {
        backElements.value.push(newElement);
    } else {
        frontElements.value.push(newElement);
    }
}

// Функция для удаления элемента
function removeElement(elementId) {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
        elements.splice(elementIndex, 1);
    }
}

// Обновление позиции и размера элемента
function updateElementPosition({ id, position, size, property, value }) {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const element = elements.find(el => el.id === id);
    if (element) {
        if (position) {
            element.x = position.x;
            element.y = position.y;
        }
        if (size) {
            element.width = size.width;
            element.height = size.height;
        }
        // Добавляем обработку обновления свойств
        if (property && value !== undefined) {
            if (property.includes('.')) {
                const [parent, child] = property.split('.');
                if (!element[parent]) element[parent] = {};
                element[parent][child] = value;
            } else {
                element[property] = value;
            }
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

// Функции управления слоями
function bringToFront() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const selectedElement = elements.find(el => el.isSelected);
    
    if (selectedElement) {
        // Находим все элементы кроме выбранного
        const otherElements = elements.filter(el => el.id !== selectedElement.id);
        
        if (otherElements.length > 0) {
            // Находим максимальный z-index среди остальных элементов
            const maxZIndex = Math.max(...otherElements.map(el => el.zIndex || 0));
            // Устанавливаем z-index на 1 больше максимального
            selectedElement.zIndex = maxZIndex + 1;
        } else {
            // Если это единственный элемент, устанавливаем z-index = 0
            selectedElement.zIndex = 0;
        }
    }
}

function sendToBack() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const selectedElement = elements.find(el => el.isSelected);
    
    if (selectedElement) {
        // Находим все элементы кроме выбранного
        const otherElements = elements.filter(el => el.id !== selectedElement.id);
        
        if (otherElements.length > 0) {
            // Находим минимальный z-index среди остальных элементов
            const minZIndex = Math.min(...otherElements.map(el => el.zIndex || 0));
            // Устанавливаем z-index на 1 меньше минимального, но не меньше 0
            selectedElement.zIndex = Math.max(0, minZIndex - 1);
        } else {
            // Если это единственный элемент, устанавливаем z-index = 0
            selectedElement.zIndex = 0;
        }
    }
}

function bringForward() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const selectedElement = elements.find(el => el.isSelected);
    
    if (selectedElement) {
        const currentZIndex = selectedElement.zIndex || 0;
        const nextElement = elements
            .filter(el => el.id !== selectedElement.id)
            .filter(el => (el.zIndex || 0) > currentZIndex)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))[0];
        
        if (nextElement) {
            selectedElement.zIndex = nextElement.zIndex;
            nextElement.zIndex = currentZIndex;
        }
    }
}

function sendBackward() {
    const elements = props.flipped ? backElements.value : frontElements.value;
    const selectedElement = elements.find(el => el.isSelected);
    
    if (selectedElement) {
        const currentZIndex = selectedElement.zIndex || 0;
        const prevElement = elements
            .filter(el => el.id !== selectedElement.id)
            .filter(el => (el.zIndex || 0) < currentZIndex)
            .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
        
        if (prevElement) {
            selectedElement.zIndex = prevElement.zIndex;
            prevElement.zIndex = currentZIndex;
        }
    }
}

// Функции управления границами
function toggleBorders() {
    if (canvasRef.value) {
        canvasRef.value.toggleBorders();
    }
}

function switchBorderMode(mode) {
    if (canvasRef.value) {
        canvasRef.value.switchBorderMode(mode);
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
    backBackground,
    // Новые функции для слоёв
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    // Функции управления границами
    toggleBorders,
    switchBorderMode
});
</script>

<template>
    <div class="editor">
        <Canvas 
            ref="canvasRef"
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