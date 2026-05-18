<script setup lang="ts">
const route = useRoute()
const token = route.query.token as string

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('Vérification de votre compte en cours...')

onMounted(async () => {
  if (!token) {
    status.value = 'error'
    message.value = 'Le jeton de vérification est manquant ou invalide.'
    return
  }

  try {
    const response = await $fetch('/api/auth/verify', {
      method: 'POST',
      body: { token }
    })

    status.value = 'success'
    message.value = response.message || 'Votre compte a été activé !'
  } catch (err: any) {
    status.value = 'error'
    message.value = err.data?.message || 'Une erreur est survenue lors de la validation de votre compte.'
  }
})

const emailToResend = ref('')
const resendStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const resendMessage = ref('')

const resendEmail = async () => {
  if (!emailToResend.value) return;
  resendStatus.value = 'loading'
  
  try {
    const res = await $fetch('/api/auth/resendverification', {
      method: 'POST',
      body: { email: emailToResend.value }
    })
    resendStatus.value = 'success'
    resendMessage.value = res.message
  } catch (err: any) {
    resendStatus.value = 'error'
    resendMessage.value = err.data?.message || 'Erreur lors du renvoi.'
  }
}

useSeoMeta({
  title: "Vérifiez votre email",
  robots: 'noindex, nofollow',
}
)
</script>

<template>
  <section class="max-w-md mx-auto h-full my-auto px-6 py-8 bg-pure-white rounded-lg shadow-md text-center">
    <h1 class="text-2xl font-bold mb-6 text-dark-navy">Vérification de compte</h1>

    <div v-if="status === 'loading'" class="space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-navy mx-auto"></div>
      <p class="text-emerald-blue">{{ message }}</p>
    </div>

    <div v-if="status === 'success'" class="space-y-6">
      <div class="bg-light-green/20 text-emerald-blue p-4 rounded-md font-medium border border-light-green/50">
        {{ message }}
      </div>
      <p class="text-dark-navy">Vous pouvez dès à présent vous connecter à votre espace personnel.</p>
      <AppButton :to="{name: 'login'}" theme="dark-navy">Se connecter</AppButton>
    </div>

    <div v-if="status === 'error'" class="space-y-6">
      <div class="bg-skin-orange/20 text-rose-red p-4 rounded-md font-medium border border-skin-orange/50">
        {{ message }}
      </div>
      <p class="text-dark-navy text-sm">
        Le lien est peut-être expiré (durée de validité : 24h) ou a déjà été utilisé.
      </p>

      <div class="bg-pure-white p-6 rounded-md border border-dark-navy/20 mt-6 text-left shadow-sm">
        <h3 class="font-bold text-dark-navy mb-2">Recevoir un nouveau lien</h3>
        <p class="text-sm text-dark-navy/70 mb-4">Entrez l'adresse e-mail associée à votre compte pour recevoir un nouveau lien d'activation.</p>
        
        <form @submit.prevent="resendEmail" class="space-y-3">
          <input 
            v-model="emailToResend" 
            type="email" 
            placeholder="Votre adresse e-mail" 
            required
            class="w-full px-3 py-2 mb-2 border border-dark-navy/30 rounded-md focus:border-dark-navy focus:ring focus:ring-dark-navy/20 outline-none text-dark-navy placeholder-dark-navy/50 bg-pure-white transition-all"
          />
          <button 
            type="submit" 
            :disabled="resendStatus === 'loading'"
            class="w-full bg-rose-red text-pure-white py-2 rounded-md hover:bg-dark-navy transition-colors disabled:opacity-50 font-medium"
          >
            {{ resendStatus === 'loading' ? 'Envoi en cours...' : 'Renvoyer le lien' }}
          </button>
        </form>

        <p v-if="resendStatus === 'success'" class="text-emerald-blue text-sm mt-3 font-medium">{{ resendMessage }}</p>
        <p v-if="resendStatus === 'error'" class="text-rose-red text-sm mt-3 font-medium">{{ resendMessage }}</p>
      </div>

      <div class="pt-4 border-t border-dark-navy/20">
        <NuxtLink 
          to="/register" 
          class="text-rose-red hover:text-dark-navy transition-colors hover:underline font-medium text-sm"
        >
          Retourner à l'inscription
        </NuxtLink>
      </div>
    </div>
  </section>
</template>