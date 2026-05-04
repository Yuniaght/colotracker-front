<script setup lang="ts">
const { isDeleteModalOpen, confirmDelete, executeDeletion } = useLibrary()
const { $directus, $readItems } = useNuxtApp()
const user = useDirectusUser()
const route = useRoute()
const bookPerPage = 20

const { values, defineField } = useForm<{
  search: string,
}>({
  initialValues: {
    search: (route.query.search as string) || "",
  }
})
const [searchedQuery] = defineField('search')
const debouncedSearch = refDebounced(searchedQuery, 400)
const fetchFilters = computed(() => {
  const queryFilter: any = { _and: [{ user: { _eq: user.value!.id } }] }

  if (debouncedSearch.value) {
    queryFilter._and.push({
      book: {
        _or: [
          { name: { _icontains: debouncedSearch.value } },
          { author: { full_name: { _icontains: debouncedSearch.value } } }
        ]
      }
    })
  }
  return queryFilter
})

const { data: library, refresh } = await useLazyAsyncData(`library_${user.value!.slug}`, () => {
  return $directus.request(
    $readItems('library', {
      fields: [
        "id",
        {
          book: [
            "id",
            "name",
            "page_count",
            "slug",
            {
              front_cover: [
                "id",
                "filename_download",
                "title"
              ]
            }
          ]
        },
        {
          completed_pages: [
            "id"
          ]
        }
      ],
      limit: bookPerPage,
      sort: ["book.name"],
      filter: fetchFilters.value
    })
  )
},
  {
    transform: (data) => {
      return data.map((item: any) => ({
        ...item,
        completed_pages: item.completed_pages?.length || 0
      }))
    },
    watch: [fetchFilters]
  },
)

const confirmDeletionAndRefresh = () => {
  executeDeletion(() => refresh())
}

watch([searchedQuery], ([newSearch]) => {
  navigateTo({
    query: {
      ...route.query,
      search: newSearch || undefined,
    }
  }, { replace: true })
})
</script>
<template>
  <section class="responsive-padding-y responsive-padding-x">
    <div class="pb-6">
      <AppLink :to="{ name: 'profile' }">⬅ Retour au profil</AppLink>
    </div>
    <h1 class="text-h1 pb-6">Ma bibliothèque</h1>
    <form @submit.prevent class="mb-10 space-y-6">
      <div class="responsive-layout">
        <input v-model="searchedQuery" id="search" type="text" placeholder="Rechercher un livre, un illustrateur..."
          class="text-sm shadow-sm w-full px-6 py-4 border border-dark-navy/50 rounded-4xl" />
      </div>
    </form>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <CardLibraryBook v-for="item in library" :key="item.id" :item="item" target="profile-mylibrary-id" delete-button @remove-from-library="confirmDelete"/>
    </div>
  </section>
  <ModalConfirm 
    :is-open="isDeleteModalOpen"
    @close="isDeleteModalOpen = false"
    @confirm="confirmDeletionAndRefresh"
  >
  <template #title>
    Suppression de livre
  </template>
  <template #message>
    <p class="pb-2">
      Êtes-vous sur de vouloir supprimer ce livre et ses coloriages de votre bibliothèque? 
    </p>
    <p class="pb-2 text-rose-red font-bold">
      Cette action est irréversible.
    </p>
  </template>
  <template #confirmText>
    Retirer le livre
  </template>
  </ModalConfirm>   
</template>
<style scoped></style>