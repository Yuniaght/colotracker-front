<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {registrationSchema, type RegistrationFormValues} from '~/components/Form/registrationSchema'
import * as zod from 'zod'

const registrationStatus = ref<{ type: 'idle' | 'success' | 'error', message?: string }>({ 
  type: 'idle' 
})

const validationSchema =  toTypedSchema(registrationSchema)

const { values: formValues, handleSubmit, setFieldValue, resetForm, setErrors } = useForm<RegistrationFormValues>({
  validationSchema
})

const submitForm = handleSubmit(async (values) => {

  registrationStatus.value = { type: 'idle' }

  try {
    const payloadBody = (values.avatar && values.avatar.length > 0)
        ? serialize({ ...values})
        : { ...values }
    
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