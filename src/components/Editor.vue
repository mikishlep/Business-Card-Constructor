<script setup>
import { ref, computed } from 'vue';
import Canvas from './Canvas.vue';
import ToolPanel from './ToolPanel.vue'

// Получаем проп flipped из App.vue
const props = defineProps({ flipped: Boolean });

const frontElements = ref([]);
const backElements = ref([]);

// Получение стороны визитки
const activeElements = computed(() => {
    props.flipped ? backElements.value : frontElements.value
})
</script>

<template>
    <div class="editor">
        <Canvas :flipped="flipped" />
    </div>
</template>

<style scoped>

</style>