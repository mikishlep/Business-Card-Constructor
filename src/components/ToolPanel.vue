<script setup>
const emit = defineEmits(['revert', 'add-element', 'delete-selected', 'toggle-properties-panel', 'toggle-background-panel', 'open-save-modal', 'bring-to-front', 'send-to-back', 'bring-forward', 'send-backward']);

// Обработка клика по кнопке добавления
function handleAddElement() {
    emit('add-element', 'default');
}

// Обработка клика по кнопке удаления
function handleDeleteSelected() {
    emit('delete-selected');
}

// Обработка клика по кнопке переключения панели свойств
function handleTogglePropertiesPanel() {
    emit('toggle-properties-panel');
}

// Обработка клика по кнопке переключения панели фона
function handleToggleBackgroundPanel() {
    emit('toggle-background-panel');
}

// Обработка клика по кнопке добавления изображения
function handleAddImage() {
    emit('add-element', 'image');
}

// Обработка клика по кнопке сохранения
function handleSave() {
    emit('open-save-modal');
}

// Функции управления слоями
function handleBringToFront() {
    emit('bring-to-front');
}

function handleSendToBack() {
    emit('send-to-back');
}

function handleBringForward() {
    emit('bring-forward');
}

function handleSendBackward() {
    emit('send-backward');
}
</script>

<template>
  <section class="toolPanel-wrapper">
    <div class="toolPanel">
        <div class="toolPanel-container">
            <button id="add-tool" class="toolPanel-buttons" @click="handleAddElement">
                <img src="../assets/icons/add.svg" alt="Добавить компонент">
            </button>
            <button id="save-tool" class="toolPanel-buttons" @click="handleSave">
                <img src="../assets/icons/save.svg" alt="Сохранить визитку">
            </button>
            <button id="delete-tool" class="toolPanel-buttons" @click="handleDeleteSelected">
                <img src="../assets/icons/trash.svg" alt="Удалить компонент">
            </button>
            <button id="add-text-tool" class="toolPanel-buttons" @click="() => emit('add-element', 'text')">
                <img src="../assets/icons/letter.svg" alt="Добавить текст">
            </button>
            <button id="add-image-tool" class="toolPanel-buttons" @click="handleAddImage">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <path d="M21 15l-5-5L5 21"></path>
                </svg>
            </button>
        </div>
    </div>
    
    <!-- Панель управления слоями -->
    <div class="layers-panel">
        <div class="layers-buttons">
            <button 
                class="toolPanel-buttons layer-button" 
                @click="handleBringToFront"
                title="На передний план"
            >
                <img src="../assets/icons/top.svg" alt="Верхний слой">
            </button>
            <button 
                class="toolPanel-buttons layer-button" 
                @click="handleBringForward"
                title="Поднять на один слой"
            >
                <img src="../assets/icons/up.svg" alt="На слой вверх">
            </button>
            <button 
                class="toolPanel-buttons layer-button" 
                @click="handleSendBackward"
                title="Опустить на один слой"
            >
                <img src="../assets/icons/down.svg" alt="На слой вниз">
            </button>
            <button 
                class="toolPanel-buttons layer-button" 
                @click="handleSendToBack"
                title="На задний план"
            >
                <img src="../assets/icons/bottom.svg" alt="Нижний слой">
            </button>
        </div>
    </div>
    
    <div class="turn-panel">
        <button 
            id="revert-tool" 
            class="toolPanel-buttons"
            @click="emit('revert')"
        >
            <img src="../assets/icons/revert.svg" alt="Повернуть визитку">
        </button>
        <button 
            id="background-tool" 
            class="toolPanel-buttons"
            @click="handleToggleBackgroundPanel"
            title="Панель фона"
        >
            <img src="../assets/icons/settings.svg" alt="" style="width: 18px; height: 18px;">
        </button>
    </div>
  </section>
</template>

<style scoped>
.toolPanel {
    padding: 16px;
    border-radius: 14px;
    background: #2c2c2c;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 10;
    transition: all 0.3s ease;
}

.toolPanel-wrapper {
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    gap: 15px;
    z-index: 10;
}

.toolPanel-container {
    display: grid;
    /*grid-template-columns: repeat(2, 1fr);*/
    gap: 25px;
}

.toolPanel-buttons {
    cursor: pointer;
    transition: transform 0.2s;
}

.toolPanel-buttons:hover {
    transform: scale(1.05);
}

.toolPanel-buttons img {
    width: 18px;
    height: 18px;
    object-fit: contain;
}

/* Панель слоёв */
.layers-panel {
    padding: 16px;
    border-radius: 14px;
    background: #2c2c2c;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 10;
    transition: all 0.3s ease;
}

.layers-buttons {
    display: grid;
    gap: 25px;
}

.turn-panel {
    padding: 16px;
    border-radius: 14px;
    background: #2c2c2c;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 10;
    transition: all 0.3s ease;
    display: grid;
    gap: 25px;
}
</style>