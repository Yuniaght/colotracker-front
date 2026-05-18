<script setup lang="ts">

const { authOpen, currentView, closeModal, switchView } = useAuthModal();

// Gestion de la touche Echap
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && authOpen.value) closeModal();
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="authOpen" class="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4">
        
        <div class="absolute inset-0 bg-dark-navy/40 backdrop-blur-sm" @click="closeModal"></div>

        <div class="relative bg-pure-white w-full max-w-lg rounded-4xl sm:rounded-[2.5rem] shadow-2xl border border-dark-navy/5 flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          
          <button 
            @click="closeModal" 
            class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 bg-pure-white/90 backdrop-blur-sm rounded-full text-dark-navy/50 hover:text-dark-navy hover:bg-gray-100 transition-all"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div class="p-6 sm:p-8 overflow-y-auto">
            <AuthLogin v-if="currentView === 'login'" @switch="switchView" @success="closeModal" />
            <AuthRegister v-else-if="currentView === 'register'" @switch="switchView" />
            <AuthForgotPassword v-else-if="currentView === 'forgotPassword'" @switch="switchView" />
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