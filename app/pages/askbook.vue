<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {askABookSchema, type askABookFormValues} from '~/components/Form/askBookSchema'

const validationSchema =  toTypedSchema(askABookSchema)

const askABookStatus = ref<{ type: 'idle' | 'success' | 'error', message?: string }>({ 
  type: 'idle' 
})

const { values: formValues, handleSubmit, setFieldValue, resetForm, setErrors } = useForm<askABookFormValues>({
  validationSchema
})

const submitForm = handleSubmit(async (values) => {

  askABookStatus.value = { type: 'idle' }

  try {
    const payloadBody = (values.avatar && values.avatar.length > 0)
        ? serialize({ ...values})
        : { ...values }
    
    const response = await $fetch('/api/askbook', {
      method: 'POST',
      body: payloadBody
    })

    askABookStatus.value = { 
      type: 'success', 
      message: response.message || 'Inscription réussie !' 
    }

    resetForm()

  } catch (e: any) {

    const errorMessage = e.data?.message || "Une erreur inattendue est survenue."
    
    askABookStatus.value = { 
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
  <section class="responsive-padding-x responsive-padding-y">
    <h1 class="text-h1 text-center pb-2 ">Suggérez un nouveau livre</h1>
    <p class="text-center max-w-175 pb-10 mx-auto">Vous ne trouvez pas votre livre de coloriage dans notre base de données ? Remplissez ce formulaire pour que notre équipe l'ajoute au catalogue !</p>
    
    <form @submit.prevent="console.log('fonction')">
      <FormAskABook />
    </form>
  </section>
</template>
<style scoped></style>
