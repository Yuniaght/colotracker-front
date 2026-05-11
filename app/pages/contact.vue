<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {subjectEnum} from '#shared/zod'
import {baseFields, type FormValues, reclamationFields} from "~/components/Form/contactSchema"
import * as zod from 'zod'

const {$toast} = useNuxtApp()
const route = useRoute()
const router = useRouter()

const baseSchema = zod.object({type: subjectEnum})

const componentByType = {
  message: resolveComponent('FormMessage'),
  copyright: resolveComponent('FormReclamation'),
  offensive_content: resolveComponent('FormReclamation'),
} as const

const schemaByType = {
  message: baseFields,
  copyright: reclamationFields,
  offensive_content: reclamationFields,
} as const

const DEFAULT: FormValues['type'] = 'message'
const selectedType = ref<FormValues['type']>(DEFAULT)

const validationSchema = computed(() => {
  return toTypedSchema(
      zod.object({
        ...baseSchema.shape,
        ...schemaByType[selectedType.value].shape,
      })
  )
})

const { values: formValues, handleSubmit, resetForm } = useForm<FormValues>({
  initialValues: { type: route.query.type as FormValues['type'] || DEFAULT },
  validationSchema,
})

const submitForm = handleSubmit(async (values) => {
  try {
    const payloadBody = { ...values }
    const queryParams = { form_type: values.type }
    
    await $fetch('/api/contact', {
        method: 'POST',
        body: payloadBody,
        query: queryParams
      })
  
    $toast.success('Merci pour votre message, nous vous recontactons dès que possible !');
  
    resetForm()
  } catch(e) {
    $toast.error('Une erreur est survenue');
  }

})

watch(
    () => formValues.type,
    (newType) => {
      selectedType.value = newType

      if (route.query.type === newType) return

      router.replace({
        path: route.path,
        query: {...route.query, type: newType}
      })
    },
    {immediate: true}
)

</script>
<template>
<section class="responsive-padding-x responsive-padding-y">
  <h1 class="text-h1 text-center pb-2">Contact</h1>
  <p class="text-center pb-10">Une question, une atteinte au droit d’auteur, prenez le temps de nous envoyer un message et nous reviendrons vers vous dès que votre demande sera traitée</p>
  <form @submit="submitForm" class="mt-12 mx-auto max-w-200">
     <div class="flex flex-wrap gap-2 mb-6">
              <InputRadio name="type" checked-value="message" class="uppercase">
                Message
              </InputRadio>

              <InputRadio name="type" checked-value="copyright" class="uppercase">
                Droit d'auteur
              </InputRadio>

              <InputRadio name="type" checked-value="offensive_content" class="uppercase">
                Contenu offensant
              </InputRadio>
            </div>
    <component :is="componentByType[formValues.type]" ref="theForm"/>
  </form>
</section>
</template>
<style scoped></style>