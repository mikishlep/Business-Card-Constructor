<script setup>

</script>

<template>
  <section class="toolPanel">
    <div class="toolPanel-container">
        <button id="add-tool" class="toolPanel-buttons">
            <img src="../assets/icons/add.svg" alt="Добавить компонент">
        </button>
        <button id="move-tool" class="toolPanel-buttons">
            <img src="../assets/icons/move.svg" alt="Передвинуть">
        </button>
        <button id="save-tool" class="toolPanel-buttons">
            <img src="../assets/icons/save.svg" alt="Сохранить визитку">
        </button>
        <button id="delete-tool" class="toolPanel-buttons">
            <img src="../assets/icons/trash.svg" alt="Удалить компонент">
        </button>
        <button id="add-text-tool" class="toolPanel-buttons">
            <img src="../assets/icons/letter.svg" alt="Добавить текст">
        </button>
        <button id="look-tool" class="toolPanel-buttons">
            <img src="../assets/icons/eye.svg" alt="Осмотреть визитку">
        </button>
    </div>
  </section>
  <div class="turn-panel">
    <button 
        id="revert-tool" 
        class="toolPanel-buttons"
        @click="emit('revert')"
    >
        <img src="../assets/icons/revert.svg" alt="Повернуть визитку">
    </button>
  </div>
  <div class="text-edit-panel">
    
  </div>
</template>

<style scoped>
.toolPanel {
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);

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

.toolPanel-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.toolPanel-buttons {
  cursor: pointer;
  transition: transform 0.2s;
}

.toolPanel-buttons:hover {
  transform: scale(1.05);
}

.toolPanel-buttons img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.turn-panel {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translatey(-50%);

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

.text-edit-panel {
    position: fixed;
    right: 20px;
    top: 20px;
    bottom: 20px;

    padding: 16px;
    border-radius: 14px;
    background: #2c2c2c;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 10;
    transition: all 0.3s ease;
    width: 300px;
    height: auto;
}
</style>