<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  loading: boolean // Added loading prop
  suggestion: {
    title: string
    page: number
    front_cover?: {
      id: string
      filename_download: string
      title: string
    }
  } | null
}>()

const emit = defineEmits(['close', 'reroll'])
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center p-4">
      
      <div 
        class="absolute inset-0 bg-dark-navy/40 backdrop-blur-md" 
        @click="emit('close')" 
      />

      <Transition name="modal-bounce" appear>
        <div v-if="isOpen" class="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl overflow-hidden border border-dark-navy/5">
          
          <!-- Wrapper to handle reroll transition and loading state -->
          <div 
            v-if="suggestion" 
            class="flex flex-col items-center text-center transition-opacity duration-300"
            :class="{ 'opacity-40 pointer-events-none': loading }"
          >
            <h2 class="text-h2 pb-4 anim-delay-1">🎲 Surprise !</h2>

            <!-- Key-changing the ID or Title here forces the animation to re-run on reroll -->
            <div :key="suggestion.title" class="flex flex-col items-center w-full">
              <div v-if="suggestion.front_cover" class="cover-animation w-40 h-52 mb-6 rounded-lg shadow-lg overflow-hidden border-2 border-dark-navy/10">
                <nuxt-picture 
                  provider="directus" 
                  :src="`${suggestion.front_cover.id}/${suggestion.front_cover.filename_download}`" 
                  :alt="suggestion.front_cover.title || 'Couverture du livre'"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="anim-delay-2">
                <p class="text-sm uppercase tracking-widest text-dark-navy/60 font-bold mb-1">
                  Votre défi du jour
                </p>
                <h3 class="text-h3 font-bold text-dark-navy mb-4">
                  {{ suggestion.title }}
                </h3>
              </div>

              <div class="bg-rose-red/10 border-2 border-rose-red rounded-2xl px-8 py-3 anim-delay-3">
                <span class="block text-xs font-bold text-rose-red uppercase">Page</span>
                <span class="text-4xl font-black text-rose-red tabular-nums">{{ suggestion.page }}</span>
              </div>
            </div>
        
            <p class="my-6 text-sm text-dark-navy/80 italic anim-delay-4">
              Prenez vos crayons, cette page n'attend que vous !
            </p>

            <div class="flex gap-2 w-full">
              <AppButton 
                theme="rose-red" 
                @click="emit('reroll')" 
                class="anim-delay-5 w-full"
                :disabled="loading"
              >
                {{ loading ? 'Piochage...' : 'Relancer' }}
              </AppButton>
              
              <AppButton 
                theme="skin-orange" 
                @click="emit('close')" 
                class="anim-delay-5 w-full"
                :disabled="loading"
              >
                C'est parti
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-bounce-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-bounce-leave-active {
  transition: all 0.3s ease-in;
}
.modal-bounce-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.cover-animation {
  animation: entrance-rotate 0.8s ease-out both;
  animation-delay: 0.2s;
}

@keyframes entrance-rotate {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.anim-delay-1 { animation: fade-up 0.5s ease-out both 0.1s; }
.anim-delay-2 { animation: fade-up 0.5s ease-out both 0.2s; }
.anim-delay-3 { animation: fade-up 0.5s ease-out both 0.3s; }
.anim-delay-4 { animation: fade-up 0.5s ease-out both 0.4s; }
.anim-delay-5 { animation: fade-up 0.5s ease-out both 0.5s; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>