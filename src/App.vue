<script setup>
import ToolPanel from './components/ToolPanel.vue';
import Editor from './components/Editor.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import BackgroundPanel from './components/BackgroundPanel.vue';
import { ref, computed } from 'vue';

const isFlipped = ref(false);
const isPropertiesPanelVisible = ref(false);
const isBackgroundPanelVisible = ref(false);
const editorRef = ref(null);

// Разворот визитки
function handleRevert() {
  isFlipped.value = !isFlipped.value;
}

// Добавление элемента
function handleAddElement(type) {
  if (editorRef.value) {
    editorRef.value.addElement(type);
  }
}

// Удаление выбранных элементов
function handleDeleteSelected() {
  if (editorRef.value) {
    editorRef.value.deleteSelected();
  }
}

// Обновление свойств элемента
function handleUpdateElement(updateData) {
  if (editorRef.value) {
    editorRef.value.updateElement(updateData);
  }
}

// Обновление фона
function handleUpdateBackground(backgroundData) {
  if (editorRef.value) {
    editorRef.value.updateBackground(backgroundData);
  }
}

// Переключение видимости панели свойств
function togglePropertiesPanel() {
  isPropertiesPanelVisible.value = !isPropertiesPanelVisible.value;
}

// Переключение видимости панели фона
function toggleBackgroundPanel() {
  isBackgroundPanelVisible.value = !isBackgroundPanelVisible.value;
}

// Получение выбранного элемента
const selectedElement = computed(() => {
  if (editorRef.value) {
    return editorRef.value.getSelectedElement();
  }
  return null;
});

// Получение активного фона
const activeBackground = computed(() => {
  if (editorRef.value) {
    return editorRef.value.activeBackground;
  }
  return null;
});
</script>

<template>
  <ToolPanel 
    @revert="handleRevert" 
    @add-element="handleAddElement"
    @delete-selected="handleDeleteSelected"
    @toggle-properties-panel="togglePropertiesPanel"
    @toggle-background-panel="toggleBackgroundPanel"
  />
  <Editor ref="editorRef" :flipped="isFlipped" />
  <PropertiesPanel 
    :selected-element="selectedElement"
    :is-visible="isPropertiesPanelVisible"
    @update-element="handleUpdateElement"
    @toggle-visibility="togglePropertiesPanel"
  />
  <BackgroundPanel
    :background="activeBackground"
    :is-visible="isBackgroundPanelVisible"
    @update-background="handleUpdateBackground"
    @toggle-visibility="toggleBackgroundPanel"
  />
</template>

<style scoped>

</style>
