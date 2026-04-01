<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {registrationSchema, type RegistrationFormValues} from '~/components/Form/registrationSchema'
import * as zod from 'zod'

const result = ref()

const validationSchema =  toTypedSchema(registrationSchema)

const { values: formValues, handleSubmit, setFieldValue, resetForm } = useForm<RegistrationFormValues>({
  validationSchema
})

const submitForm = handleSubmit(async (values) => {

  try {
    const payloadBody = (values.avatar && values.avatar.length > 0)
        ? serialize({ ...values})
        : { ...values }
    
    await $fetch('/api/register', {
      method: 'POST',
      body: payloadBody
    })

    result.value = true

    resetForm()

  } catch (e) {

    console.error(e)
    result.value = false
  }

}) 
</script>

<template>
  <div class="px-12 py-6">
    <h1 class="text-2xl">Rejoignez Colotracker</h1>
    <form @submit.prevent="submitForm">

      <div v-if="result">
        <p>Successfully registered</p>
      </div>
      <FormRegistration />
    </form>
  </div>
</template>