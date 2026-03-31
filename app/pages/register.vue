<script setup lang="ts">
const { $directus, $createUser } = useNuxtApp()
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {formSchema, type FormValues, registrationFields} from '~/components/Form/schema'
import * as zod from 'zod'

const result = ref()

const validationSchema =  toTypedSchema(zod.object({
  type: zod.literal('registration'),
  ...registrationFields
}))

const { values: formValues, handleSubmit, setFieldValue, resetForm } = useForm<FormValues>({
  validationSchema,
  initialValues: {
    type: 'registration'
  }
})

const submitForm = handleSubmit(async (values) => {

  try {
    const payloadBody = (values.avatar && values.avatar.length > 0)
        ? serialize({ ...values})
        : { ...values }
        console.log(payloadBody)
    
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