<script setup lang="ts">
const { isDeleteModalOpen, confirmDelete, executeDeletion } = useLibrary()
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const page = computed(() => parseInt((route.params.page as string).split("-")[2] || '0'))
const libraryID = computed(() => parseInt((route.params.id as string)))


const { data: data, error } = await useAsyncData(`page-${page.value}-${route.params.id}`, () => {
  return $directus.request(
    $readItems('completed_pages', {
      fields: [
        "id",
        "page_number",
        "date_finished",
        "detailed_info",
        {
          image: [
            "id",
            "filename_download",
            "title"
          ]
        },
        {
          library_from: [
            {
              user: [
                "user_name",
                {
                  avatar: [
                    "id",
                    "filename_download",
                    "title"
                  ]
                }
              ]
            },
            {
              book: [
                "name"
              ]
            }
          ]
        }
      ],
      filter: {
        _and: [
          {
            library_from: {
              _eq: libraryID.value
            }
          },
          {
            page_number: {
              _eq: page.value
            }
          }
        ]
      },
      limit: 1
    } ,)
  )
},
{
  transform: (data) => {
    return data[0]
  }
})
const book = computed(() => data.value?.library_from?.book)
const confirmDeletionAndRefresh = async () => {
  await executeDeletion('completed_pages', () => {
    return navigateTo({ name: 'profile-mylibrary-id' , params: {id: route.params.id }})
  })
}
</script>

<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="pb-6">
      <AppLink :to="{ name: 'profile-mylibrary-id', params: { id: route.params.id } }">⬅ Retour au
        tracker</AppLink>
    </div>
    <div class="grid md:grid-cols-2 rounded-2xl overflow-clip">
      <div>
        <nuxt-picture 
            provider="directus" 
            :src="`${data?.image?.id}/${data?.image?.filename_download}`" 
            :alt="data?.image?.title" 
            :img-attrs="{ class: 'w-full h-full object-cover' }"
            width="190px"
            />
      </div>
      <div class="p-8 bg-pure-white shadow-xl">
        <h1 class="text-h1 pb-2">Page N°{{ data?.page_number }}</h1>
        <p class="pb-8 text-emerald-blue">Livre : {{ book.name }}</p>
        <div class="p-6 mb-8 bg-dim-white rounded-xl">
          <p class="border-b-2 pb-2 border-dark-navy/20">Details</p>
          <p class="pt-4 text-sm text-dark-navy/50">Date de réalisation</p>
          <nuxt-time :datetime="data?.date_finished" locale="fr-FR" year="numeric" month="long" day="numeric"/>
          <p class="pt-4 text-sm text-dark-navy/50">Info détaillées</p>
          <p>{{ data?.detailed_info }}</p>
        </div>
        <div class="p-8 bg-dim-white rounded-xl flex flex-col md:flex-row gap-4">
          <AppButton theme="dark-navy" class="w-full" :to="{name: 'profile-mylibrary-id-page-edit', params: {id: route.params.id, page: route.params.page}}">Modifier la page</AppButton> 
          <AppButton theme="rose-red" class="w-full" @click="confirmDelete(data!.id)">Supprimer la page</AppButton>
        </div>
      </div>
    </div>
  </section>
  <ModalConfirm 
    :is-open="isDeleteModalOpen"
    @close="isDeleteModalOpen = false"
    @confirm="confirmDeletionAndRefresh"
  >
  <template #title>
    Suppression de page
  </template>
  <template #message>
    <p class="pb-2">
      Êtes-vous sur de vouloir supprimer cette page de votre tracker? 
    </p>
    <p class="pb-2 text-rose-red font-bold">
      Cette action est irréversible.
    </p>
  </template>
  <template #confirmText>
    Retirer la page
  </template>
  </ModalConfirm>   
</template>