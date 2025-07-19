<script setup>
const emit = defineEmits(['revert', 'add-element', 'delete-selected']);

// Обработка клика по кнопке добавления
function handleAddElement() {
    emit('add-element', 'default');
}

// Обработка клика по кнопке удаления
function handleDeleteSelected() {
    emit('delete-selected');
}
</script>

<template>
  <section class="toolPanel-wrapper">
    <div class="toolPanel">
        <div class="toolPanel-container">
            <button id="add-tool" class="toolPanel-buttons" @click="handleAddElement">
                <img src="../assets/icons/add.svg" alt="Добавить компонент">
            </button>
            <button id="move-tool" class="toolPanel-buttons">
                <img src="../assets/icons/move.svg" alt="Передвинуть">
            </button>
            <button id="save-tool" class="toolPanel-buttons">
                <img src="../assets/icons/save.svg" alt="Сохранить визитку">
            </button>
            <button id="delete-tool" class="toolPanel-buttons" @click="handleDeleteSelected">
                <img src="../assets/icons/trash.svg" alt="Удалить компонент">
            </button>
            <button id="add-text-tool" class="toolPanel-buttons" @click="() => emit('add-element', 'text')">
                <img src="../assets/icons/letter.svg" alt="Добавить текст">
            </button>
            <button id="look-tool" class="toolPanel-buttons">
                <img src="../assets/icons/eye.svg" alt="Осмотреть визитку">
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
    gap: 15px;
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
}
</style>