<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits(['confirm', 'close']);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-navy/40 backdrop-blur-sm" @click="emit('close')"></div>

        <div class="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl overflow-hidden border border-dark-navy/5">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-dark-navy mb-4">{{ title }}</h3>
            <p class="text-gray-600 mb-8 leading-relaxed">
              {{ message }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              @click="emit('close')" 
              class="flex-1 px-6 py-4 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="emit('confirm')" 
              class="flex-1 px-6 py-4 rounded-full bg-rose-red text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-rose-red/20"
            >
              Oui, ajouter
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>