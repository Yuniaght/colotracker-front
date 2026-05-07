<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {addPageSchema, type AddPageFormValues} from '~/components/Form/pageSchema'

const { $directus, $readItem, $toast } = useNuxtApp()
const route = useRoute()
const id = route.params.id as string
const libraryId = parseInt(id.split('-')[0] || '0') as number

const { data: data } = await useAsyncData(`addbook-${id}`, () => {
  return $directus.request(
    $readItem('library', libraryId, {
      fields: [ { book: [ "name","page_count"] } ],
      limit: 1,
    })
  )
},
{
  transform: (data) => {
    return {
      name: data.book?.name as string,
      page_count: data.book?.page_count as number
    }
  }
})

const validationSchema = computed(() => {
  if (!data.value) return undefined
  return toTypedSchema(addPageSchema(data.value.page_count))
})

const { values: formValues, handleSubmit, setErrors } = useForm<AddPageFormValues>({
  validationSchema: validationSchema.value
})

const submitForm = handleSubmit(async (values) => {
  try {
    const payloadBody = serialize({ 
      ...values,
      library_from: libraryId
    })
    
    await $fetch('/api/addpage', {
      method: 'POST',
      body: payloadBody
    })

    await refreshNuxtData(`book-${id}`)

    $toast.success("Votre page a été ajoutée avec succès")
    navigateTo({ name: 'profile-mylibrary-id', params: {id: id}})

  } catch (e: any) {
    if (e.data?.data) {
       setErrors(e.data.data)
    }
    $toast.error("Une erreur est survenue")
  }

}) 

</script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="pb-6">
      <AppLink :to="{name : 'profile-mylibrary-id', params: {id: id}}">⬅ Retour</AppLink>
    </div>
    <h1 class="text-h1">Ajouter un coloriage au livre : {{ data!.name }}</h1>
    <form @submit.prevent="submitForm" class="p-10 responsive-layout">
      <FormPage :max_page="data!.page_count" />
      <AppButton theme="dark-navy" type="submit">Ajouter la page</AppButton>
    </form>
  </section>
</template>
<style scoped></style>