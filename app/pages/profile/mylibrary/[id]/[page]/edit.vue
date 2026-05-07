<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {editPageSchema, type EditPageFormValues} from '~/components/Form/pageSchema'

const { $directus, $readItem, $readItems, $toast } = useNuxtApp()
const route = useRoute()
const id = route.params.id as string
const libraryId = parseInt(id.split('-')[0] || '0') as number
const page = route.params.page as string
const pageNumber = parseInt(page.split('-')[2] || '0')

const { data } = await useAsyncData(`editpage-${id}-${page}`, () => {
  return $directus.request(
    $readItem('library', libraryId, {
      fields: [ { book: [ "page_count"] } ],
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

const { data: pageInfo, error } = await useAsyncData(`pageinfo-${page}-${route.params.id}`, () => {
  return $directus.request(
    $readItems('completed_pages', {
      fields: [ "id", "page_number", "date_finished", "detailed_info",
        { image: [ "id", "filename_download", "title" ] } ],
      filter: {
        _and: [
          { library_from: { _eq: libraryId } },
          { page_number: { _eq: pageNumber } }
        ]
      },
      limit: 1
    })
  )
},
{
  transform: (data) => {
    return data[0]
  }
})

const validationSchema = computed(() => {
  if (!data.value) return undefined
  return toTypedSchema(editPageSchema(data.value.page_count))
})

const { values: formValues, handleSubmit, setErrors } = useForm<EditPageFormValues>({
  initialValues: {
    page_number: pageInfo.value.page_number,
    date_finished: pageInfo.value.date_finished,
    detailed_info: pageInfo.value.detailed_info,
  },
  validationSchema: validationSchema.value
})


const submitForm = handleSubmit(async (values) => {
  try {

    const payloadBody = (values.image && values.image.length > 0)
        ? serialize({ ...values, library_from: libraryId, id: pageInfo.value.id })
        : { ...values, library_from: libraryId, id: pageInfo.value.id }
    
    const response = await $fetch('/api/editpage', {
      method: 'POST',
      body: payloadBody
    })

    await refreshNuxtData(`book-${id}`)

    $toast.success("Votre page a été modifiée avec succès")
    navigateTo({ name: 'profile-mylibrary-id-page', params: {id: id, page: response.newPage}})

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
      <AppLink :to="{name : 'profile-mylibrary-id-page', params: {id: id, page: page}}">⬅ Retour</AppLink>
    </div>
    <div class="mb-10 mx-auto w-50 h-50">
      <nuxt-picture 
            provider="directus" 
            :src="`${pageInfo.image.id}/${pageInfo?.image?.filename_download}`" 
            :alt="pageInfo?.image?.title" 
            :img-attrs="{ class: 'w-full h-full object-cover' }"
            width="190px"
            />
    </div>
    <h1 class="text-h1 pb-10">Edition de la page N°{{ pageNumber }}</h1>
    <form v-if="pageInfo" @submit.prevent="submitForm" class="p-10 responsive-layout">
      <FormPage :max_page="data!.page_count" />
      <AppButton theme="dark-navy" type="submit">Modifier la page</AppButton>
    </form>
  </section>
</template>
<style scoped></style>