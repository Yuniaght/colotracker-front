<script setup lang="ts">
const { handleAddBook, isConfirmModalOpen, handleModalConfirm } = useLibrary()
const { $directus, $readItems } = useNuxtApp()
const user = useDirectusUser()
const route = useRoute()
const BooksPerPage = 16

const { values, defineField } = useForm<{
  search: string,
  categories: Number[]
}>({
  initialValues: {
    search: (route.query.search as string) || "",
    categories: Array.isArray(route.query.categories)
      ? route.query.categories.map(c => Number(c))
      : route.query.categories
        ? [Number(route.query.categories)]
        : [],
  }
})

const [searchedQuery] = defineField('search')
const [selectedCategories] = defineField('categories')

const debouncedSearch = refDebounced(searchedQuery, 400)

const userConnected = computed(() => !!user.value)

const fetchFilters = computed(() => {
  const queryFilter: any = { _and: [] }

  if (debouncedSearch.value) {
    queryFilter._and.push({
      _or: [
        { name: { _icontains: debouncedSearch.value } },
        { author: { full_name: { _icontains: debouncedSearch.value } } }
      ]
    })
  }

  if (selectedCategories.value && selectedCategories.value.length > 0) {
    queryFilter._and.push({
      category_list: {
        category_list_id: {
          id: { _in: selectedCategories.value }
        }
      }
    })
  }

  return queryFilter
})

const { data: books, pending, error: bookFetchError } = await useLazyAsyncData(
  'books-list',
  () => $directus.request(
    $readItems('books', {
      fields: [
        "id",
        "name",
        "slug",
        { front_cover: ["id", "filename_download", "title"] },
        { author: ["full_name"] }
      ],
      limit: BooksPerPage,
      filter: fetchFilters.value,
      sort: ['name']
    })
  ),
  {
    watch: [fetchFilters]
  }
)

const { data: categories, error: categoriesFetchError } = await useLazyAsyncData(
  'categories-list',
  () => $directus.request(
    $readItems('category_list', {
      fields: [
        "id",
        "name",
      ],
      sort: ['name']
    })
  )
)

watch([searchedQuery, selectedCategories], ([newSearch, newCats]) => {
  navigateTo({
    query: {
      ...route.query,
      search: newSearch || undefined,
      categories: newCats?.length ? newCats : undefined
    }
  }, { replace: true })
})

</script>

<template>
  <section class="responsive-padding-y responsive-padding-x">
    <h1 class="text-h1 text-center pb-6 ">Bibliothèque des livres</h1>
    <div>
      <form @submit.prevent class="mb-10 space-y-6">
        <div class="responsive-layout">
          <input v-model="searchedQuery" id="search" type="text" placeholder="Rechercher un livre, un illustrateur..."
            class="text-sm shadow-sm w-full px-6 py-4 border border-dark-navy/50 rounded-4xl" />
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <label v-for="cat in categories" :key="cat.id" class="cursor-pointer">
            <input type="checkbox" v-model="selectedCategories" :value="cat.id" class="sr-only" />

            <span :class="[
              'inline-block p-2 rounded-full transition-colors duration-200 text-sm font-medium',
              selectedCategories.includes(cat.id)
                ? 'bg-rose-red text-dim-white'
                : 'bg-light-green text-dark-navy/70 hover:bg-skin-orange'
            ]">
              {{ cat.name }}
            </span>
          </label>
        </div>

      </form>
    </div>
    <div v-if="pending" class="text-h2">Chargement des livres</div>
    <div v-else-if="bookFetchError" class="text-rose-red">
      Une erreur est survenue lors de la récupération des livres.
    </div>
    <div v-if="books && books.length > 0"
      class="grid responsive-layout justify-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <CardBook v-for="item in books" :key="item.slug" :item :user-connected="userConnected" @add-to-library="handleAddBook" />
    </div>
    <div v-else>
      Il n'y a pas de livre
    </div>
  </section>
  <section class="responsive-padding-y responsive-padding-x text-center">
    <h2 class="text-h2 mb-6">Votre livre n'est pas dans la liste?</h2>
    <p><nuxt-link :to="{name: 'askbook'}" class="underline underline-offset-2 hover:text-rose-red transition-colors duration-200">Faites une demande d'ajout</nuxt-link> et nous étudierons la possibilité d'ajouter le livre dès que
      possible</p>
  </section>
  <ModalConfirm 
    :is-open="isConfirmModalOpen"
    title="Livre déjà possédé"
    message="Vous avez déjà ce livre dans votre collection. Voulez-vous vraiment ajouter un exemplaire supplémentaire ?"
    @close="isConfirmModalOpen = false"
    @confirm="handleModalConfirm"
  />    
</template>
