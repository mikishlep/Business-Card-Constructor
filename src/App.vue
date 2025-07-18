<script setup>
import ToolPanel from './components/ToolPanel.vue';
import Editor from './components/Editor.vue';
import { ref } from 'vue';

const isFlipped = ref(false);
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
</script>

<template>
  <ToolPanel 
    @revert="handleRevert" 
    @add-element="handleAddElement"
    @delete-selected="handleDeleteSelected"
  />
  <Editor ref="editorRef" :flipped="isFlipped" />
</template>

<style scoped>

</style>
