<script setup>

</script>

<template>
  <section class="toolPanel">
    <div class="toolPanel-container">
        <button class="toolPanel-buttons">
            <img src="../assets/icons/add.svg" alt="Добавить компонент">
        </button>
        <button class="toolPanel-buttons">
            <img src="../assets/icons/move.svg" alt="Добавить компонент">
        </button>
        <button class="toolPanel-buttons">
            <img src="../assets/icons/save.svg" alt="Добавить компонент">
        </button>
        <button class="toolPanel-buttons">
            <img src="../assets/icons/trash.svg" alt="Добавить компонент">
        </button>
    </div>
  </section>
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
</style>