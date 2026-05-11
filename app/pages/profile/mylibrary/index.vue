<script setup lang="ts">
const { isDeleteModalOpen, confirmDelete, executeDeletion } = useLibrary()
const { $directus, $readItems, $toast } = useNuxtApp()
const user = useDirectusUser()
const route = useRoute()
const booksData = ref(null) 
const fetchingBooks = ref(false)
const { page, items: booksItems, hasMore, handleLoadMore, resetPagination, pageSize } = useInfiniteScroll(booksData, fetchingBooks, { pageSize: 12 })
const { defineField } = useForm<{
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

const { data: books, pending, refresh, error } = await useAsyncData(`library_${user.value!.slug}`, () => {
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
      limit: pageSize,
      page: page.value,
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
    watch: [fetchFilters, page]
  },
)

syncRefs(books, booksData)
syncRefs(pending, fetchingBooks)

const confirmDeletionAndRefresh = () => {
  executeDeletion('library', () => refresh())
}

watch(fetchFilters, () => {
  resetPagination()
})

watch([searchedQuery], ([newSearch]) => {
  navigateTo({
    query: {
      ...route.query,
      search: newSearch || undefined,
    }
  }, { replace: true })
})

if (error.value && !debouncedSearch.value) {
  throw createError({
    statusCode: 500,
    statusMessage: "Impossible d'accéder à votre bibliothèque.",
    fatal: true
  })
}

watch(error, (newErr) => {
  if (newErr && debouncedSearch.value) {
    $toast.error("Erreur lors de la recherche...")
  }
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
    <div v-if="pending && booksItems.length === 0" class="text-center py-20">
      Recherche en cours...
    </div>
    <div v-else-if="error" class="text-center py-10 bg-rose-50 rounded-xl">
      <p>Une erreur est survenue lors de la récupération des livres.</p>
      <AppButton @click="refresh" class="mt-2">Réessayer</AppButton>
    </div>
    <div v-else-if="booksItems.length === 0" class="text-center py-20">
      <p v-if="debouncedSearch">Aucun livre ne correspond à "{{ debouncedSearch }}"</p>
      <p v-else>Votre bibliothèque est vide. <AppLink to="/catalogue">Ajouter un livre</AppLink></p>
    </div>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity"
        :class="{ 'opacity-50 pointer-events-none': pending }">
      <CardLibraryBook v-for="item in booksItems" :key="item.id" :item="item" target="profile-mylibrary-id" delete-button @remove-from-library="confirmDelete"/>
    </div>
    <AppInfiniteScrollingTrigger v-if="!pending && hasMore" @trigger="handleLoadMore"/> 
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