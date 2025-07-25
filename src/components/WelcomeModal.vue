<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const currentStep = ref(0);
const isFirstVisit = ref(true);

// Шаги обучения
const steps = [
  {
    title: 'Добро пожаловать!',
    description: 'Это новый редактор визиток компании "Главреклама". Давайте познакомимся с основными возможностями.',
    image: null,
    highlight: null
  },
  {
    title: 'Панель инструментов',
    description: 'Здесь вы можете добавлять элементы (текст, изображения), управлять слоями и настройками визитки.',
    image: null,
    highlight: '.toolPanel-wrapper'
  },
  {
    title: 'Редактор визитки',
    description: 'Основная область для создания визитки. Кликайте на элементы для выделения и редактирования.',
    image: null,
    highlight: '.editor-container'
  },
  {
    title: 'Панель свойств',
    description: 'При выделении элемента здесь появляются настройки размера, цвета, шрифта и других параметров.',
    image: null,
    highlight: '.properties-panel'
  },
  {
    title: 'Панель фона',
    description: 'Настройте фон визитки: выберите цвет или загрузите изображение.',
    image: null,
    highlight: '.background-panel'
  },
  {
    title: 'Сохранение и экспорт',
    description: 'Сохраните визитку в различных форматах: PNG, JPEG, PDF или SVG.',
    image: null,
    highlight: '.save-button'
  },
  {
    title: 'Готово!',
    description: 'Теперь вы готовы создавать красивые визитки! Начните с добавления текста или изображения.',
    image: null,
    highlight: null
  }
];

// Проверяем, первый ли это визит
onMounted(() => {
  const hasVisited = localStorage.getItem('hasVisitedBefore');
  if (!hasVisited) {
    isFirstVisit.value = true;
  } else {
    isFirstVisit.value = false;
  }
});

// Сброс шага при открытии модального окна
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    currentStep.value = 0;
  }
});

// Переход к следующему шагу
function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    completeTutorial();
  }
}

// Переход к предыдущему шагу
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

// Завершение обучения
function completeTutorial() {
  localStorage.setItem('hasVisitedBefore', 'true');
  emit('close');
}

// Пропуск обучения
function skipTutorial() {
  localStorage.setItem('hasVisitedBefore', 'true');
  emit('close');
}

// Получение текущего шага
const currentStepData = computed(() => steps[currentStep.value]);

// Подсветка элемента
const highlightElement = computed(() => {
  if (!currentStepData.value.highlight) return null;
  
  const element = document.querySelector(currentStepData.value.highlight);
  if (element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }
  return null;
});
</script>

<template>
  <!-- Затемнение фона -->
  <div 
    v-if="isVisible" 
    class="welcome-overlay"
    @click="skipTutorial"
  >
    <!-- Подсветка элемента -->
    <div 
      v-if="highlightElement" 
      class="highlight-element"
      :style="{
        top: highlightElement.top + 'px',
        left: highlightElement.left + 'px',
        width: highlightElement.width + 'px',
        height: highlightElement.height + 'px'
      }"
    ></div>

    <!-- Модальное окно -->
    <div 
      class="welcome-modal"
      @click.stop
    >
      <!-- Заголовок -->
      <div class="modal-header">
        <h2>{{ currentStepData.title }}</h2>
        <button 
          class="close-button" 
          @click="skipTutorial"
          title="Пропустить обучение"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Содержимое -->
      <div class="modal-content">
        <p class="description">{{ currentStepData.description }}</p>
        
        <!-- Прогресс -->
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: ((currentStep + 1) / steps.length) * 100 + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ currentStep + 1 }} из {{ steps.length }}</span>
        </div>
      </div>

      <!-- Кнопки навигации -->
      <div class="modal-footer">
        <button 
          v-if="currentStep > 0"
          class="nav-button prev-button" 
          @click="prevStep"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          Назад
        </button>
        
        <div class="nav-spacer"></div>
        
        <button 
          class="nav-button next-button" 
          @click="nextStep"
        >
          <span v-if="currentStep < steps.length - 1">Далее</span>
          <span v-else>Завершить</span>
          <svg v-if="currentStep < steps.length - 1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Индикаторы шагов -->
      <div class="step-indicators">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-dot"
          :class="{ 
            'active': index === currentStep,
            'completed': index < currentStep 
          }"
          @click="currentStep = index"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.highlight-element {
  position: absolute;
  border: 3px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  animation: pulse 2s infinite;
  z-index: 9999;
}

.welcome-modal {
  background: #2c2c2c;
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.close-button {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-content {
  margin-bottom: 30px;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: #ccc;
  margin: 0 0 20px 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #888;
  min-width: 60px;
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-spacer {
  flex: 1;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prev-button {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

.prev-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.next-button {
  background: #007bff;
  color: white;
}

.next-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.step-dot.active {
  background: #007bff;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #28a745;
}

.step-dot:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(0, 123, 255, 0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .welcome-modal {
    padding: 20px;
    margin: 20px;
  }
  
  .modal-header h2 {
    font-size: 20px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .nav-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style> 