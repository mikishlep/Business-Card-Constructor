<script setup>
import ToolPanel from './components/ToolPanel.vue';
import Editor from './components/Editor.vue';
import { ref } from 'vue';

const isFlipped = ref(false);

// Разворот визитки
function handleRevert() {
  isFlipped.value = !isFlipped.value;
}
</script>

<template>
  <ToolPanel @revert="handleRevert" />
  <Editor :flipped="isFlipped" />
</template>

<style scoped>

</style>
