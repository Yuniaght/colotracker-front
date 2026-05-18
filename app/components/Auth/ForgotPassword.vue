<script setup lang="ts">
import { passwordRequest } from '@directus/sdk'
const { $directus } = useNuxtApp()
const emit = defineEmits(['switch'])
const config = useRuntimeConfig()

const email = ref('')
const isLoading = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const message = ref('')

const requestReset = async () => {
  isLoading.value = true
  status.value = 'idle'
  
  try {
    
    const resetUrl = `${config.public.publicUrl}/reset-password`
    await $directus.request(passwordRequest(email.value, resetUrl))

    status.value = 'success'
    message.value = "Si un compte existe pour cet e-mail, vous recevrez un lien de réinitialisation sous peu."
  } catch (error: any) {
    status.value = 'success' 
    message.value = "Si un compte existe pour cet e-mail, vous recevrez un lien de réinitialisation sous peu."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-dark-navy mb-6 text-center">Mot de passe oublié</h2>

    <div v-if="status === 'success'" class="space-y-6">
      <div class="p-4 bg-light-green/20 text-emerald-blue rounded-md border border-light-green/50 text-sm font-medium">
        {{ message }}
      </div>
      <button @click="emit('switch', 'login')" class="w-full bg-dark-navy text-pure-white py-3 rounded-md font-semibold">
        Retour à la connexion
      </button>
    </div>

    <div v-else>
      <p class="text-dark-navy/70 text-sm mb-6 text-center">
        Saisissez votre adresse e-mail. Nous vous enverrons un lien pour créer un nouveau mot de passe.
      </p>

      <form @submit.prevent="requestReset" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-dark-navy mb-1">Email</label>
          <input 
            required 
            type="email" 
            v-model="email" 
            placeholder="votre@email.com" 
            class="w-full px-4 py-2 border border-dark-navy/20 rounded-md focus:border-dark-navy focus:ring focus:ring-dark-navy/10 outline-none transition-colors text-dark-navy"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-rose-red text-pure-white font-semibold py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-70"
        >
          {{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button @click="emit('switch', 'login')" class="text-sm font-bold text-emerald-blue hover:underline">
          Retour à la connexion
        </button>
      </div>
    </div>
  </div>
</template>