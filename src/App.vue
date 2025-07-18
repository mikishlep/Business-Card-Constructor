<script setup>
import ToolPanel from './components/ToolPanel.vue';
import Editor from './components/Editor.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import { ref, computed } from 'vue';

const isFlipped = ref(false);
const isPropertiesPanelVisible = ref(true);
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

// Переключение видимости панели свойств
function togglePropertiesPanel() {
  isPropertiesPanelVisible.value = !isPropertiesPanelVisible.value;
}

// Получение выбранного элемента
const selectedElement = computed(() => {
  if (editorRef.value) {
    return editorRef.value.getSelectedElement();
  }
  return null;
});
</script>

<template>
  <ToolPanel 
    @revert="handleRevert" 
    @add-element="handleAddElement"
    @delete-selected="handleDeleteSelected"
  />
  <Editor ref="editorRef" :flipped="isFlipped" />
  <PropertiesPanel 
    :selected-element="selectedElement"
    :is-visible="isPropertiesPanelVisible"
    @update-element="handleUpdateElement"
    @toggle-visibility="togglePropertiesPanel"
  />
</template>

<style scoped>

</style>
