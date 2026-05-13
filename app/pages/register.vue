<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {registrationSchema, type RegistrationFormValues} from '~/components/Form/registrationSchema'
const { $toast } = useNuxtApp()

const registrationStatus = ref<{ type: 'idle' | 'success' | 'error', message?: string }>({ 
  type: 'idle' 
})

const validationSchema =  toTypedSchema(registrationSchema)

const { handleSubmit, resetForm, setErrors } = useForm<RegistrationFormValues>({
  validationSchema
})

const {executeRecaptcha} = useGoogleRecaptcha();

const submitForm = handleSubmit(async (values) => {

  let res: Awaited<ReturnType<typeof executeRecaptcha>> | null = null;
  registrationStatus.value = { type: 'idle' }

  try {
    res = await executeRecaptcha('form')

    if (!res || !res.token) {

      $toast.error('Résolution du captcha échouée, veuillez réessayer.');
      return;
    }
    const payloadBody = (values.avatar && values.avatar.length > 0)
        ? serialize({ ...values, token: res.token})
        : { ...values, token: res.token }
    
    const response = await $fetch('/api/register', {
      method: 'POST',
      body: payloadBody
    })

    registrationStatus.value = { 
      type: 'success', 
      message: response.message || 'Inscription réussie !' 
    }

    resetForm()

  } catch (e: any) {

    const errorMessage = e.data?.message || "Une erreur inattendue est survenue."
    
    registrationStatus.value = { 
      type: 'error', 
      message: errorMessage 
    }
    if (e.data?.data) {
       setErrors(e.data.data)
    }
  }

}) 
</script>

<template>
  <section class="px-12 py-6">
    <h1 class="text-2xl">Rejoignez Colotracker</h1>
    <div v-if="registrationStatus.type === 'success'" class="p-4 mb-4 text-green-700 bg-green-100 rounded">
      <p>{{ registrationStatus.message }}</p>
    </div>
    
    <div v-if="registrationStatus.type === 'error'" class="p-4 mb-4 text-red-700 bg-red-100 rounded">
      <p>{{ registrationStatus.message }}</p>
    </div>
    <form @submit.prevent="submitForm">
      <FormRegistration />
    </form>
  </section>
</template>