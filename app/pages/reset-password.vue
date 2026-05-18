<script setup lang="ts">
import { passwordReset } from "@directus/sdk";
import {toTypedSchema} from "@vee-validate/zod";
import {forgotPasswordSchema, type forgotPasswordValues} from '~/components/Form/forgotPasswordSchema'

const { $directus } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const token = route.query.token as string
const isLoading = ref(false)
const errorMsg = ref('')

const { $toast } = useNuxtApp()
const validationSchema =  toTypedSchema(forgotPasswordSchema)
const { handleSubmit } = useForm<forgotPasswordValues>({
  validationSchema
})

const {executeRecaptcha} = useGoogleRecaptcha();

const submitForm = handleSubmit(async (values) => {
  let res: Awaited<ReturnType<typeof executeRecaptcha>> | null = null;
  isLoading.value = true
  errorMsg.value = ""

  try {
    res = await executeRecaptcha('form')
    if (!res || !res.token) {

      $toast.error('Résolution du captcha échouée, veuillez réessayer.');
      return;
    }

    await $directus.request(passwordReset(token, values.password))
    router.push('/')
  } catch (err: any) {
    errorMsg.value = "Le lien est invalide ou a expiré."
  } finally {
    isLoading.value = false
  }
})

useSeoMeta({ title: "Nouveau mot de passe", robots: 'noindex, nofollow' })
</script>

<template>
  <section class="max-w-md mx-auto my-20 px-6 py-10 bg-pure-white rounded-[2.5rem] shadow-xl border border-dark-navy/5">
    <h1 class="text-2xl font-bold text-dark-navy mb-6 text-center">Nouveau mot de passe</h1>

    <div v-if="!token" class="text-rose-red text-center">
      Jeton manquant. Veuillez utiliser le lien reçu par e-mail.
    </div>

    <form v-else @submit.prevent="submitForm" class="space-y-4">
      <div v-if="errorMsg" class="p-3 bg-skin-orange/20 text-rose-red rounded-md text-sm font-medium border border-skin-orange/50">
        {{ errorMsg }}
      </div>

      <FormForgotPassword />

      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full bg-dark-navy text-pure-white font-semibold py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-70"
      >
        {{ isLoading ? 'Mise à jour...' : 'Changer le mot de passe' }}
      </button>
    </form>
  </section>
</template>