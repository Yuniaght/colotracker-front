<script setup lang="ts">
const { $directus, $readUsers, $readItems } = useNuxtApp()
const route = useRoute()
const userSlug = computed(() => route.params.slug as string)
const libraryData = ref(null) 
const fetchingBooks = ref(false)
const { page, items: libraryItems, hasMore, handleLoadMore, resetPagination, pageSize } = useInfiniteScroll(libraryData, fetchingBooks, { pageSize: 10 })

const { data: users, error: fetchUserError } = await useAsyncData(`user_${userSlug.value}`, () => {
  return $directus.request(
    $readUsers({
      fields: [
        "id",
        "user_name",
        "joined_at",
        "slug",
        "discord_pseudonym",
        "instagram_link",
        {
          avatar: [
            "id",
            "filename_download",
            "title"
          ]
        }

      ],
      filter: {
        _and: [
          { slug: { _eq: userSlug.value } }
        ]
      },
      limit: 1
    })
  )
})

if (fetchUserError.value || !users.value || users.value.length === 0) {
  throw createError({ 
    statusCode: 404, 
    statusMessage: "Ce membre n'existe pas",
    fatal: true 
  })
}

const user = users.value[0]

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
  if (!user?.id) return { id: { _null: true } }
  const queryFilter: any = { _and: [{ user: { _eq: user?.id } }] }

  if (debouncedSearch.value) {
    queryFilter._and.push({
      book:{
        _or: [
          { name: { _icontains: debouncedSearch.value } },
          { author: { full_name: { _icontains: debouncedSearch.value } } }
        ]
      }
    })
  }
  return queryFilter
})

const { data: library, pending, error: libraryError } = await useLazyAsyncData(`library_${userSlug.value}`, () => {
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
  watch: [users, fetchFilters, page] 
},
)

syncRefs(library, libraryData)
syncRefs(pending, fetchingBooks)

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

const config = useRuntimeConfig()
const avatarUrl = user?.avatar ? `${config.public.directusUrl}/assets/${user.avatar.id}` : '/logo.png'

useSeoMeta({
  title: () => `Bibliothèque de ${user?.user_name || 'un membre'}`,
  description: () => `Découvrez les livres et les coloriages de ${user?.user_name}.`,
  ogTitle: () => `Collection de ${user?.user_name}`,
  ogImage: avatarUrl,
  twitterCard: 'summary',
})
</script>

<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="mb-6 responsive-layout">
      <AppLink to="/libraries" class="text-emerald-blue">
        ⬅ Retour aux trackers
      </AppLink>
    </div>
    <div class="grid items-start md:grid-cols-[minmax(0,27rem)_minmax(0,40rem)] lg:grid-cols-[minmax(0,27rem)_minmax(20rem,auto)] gap-8 responsive-layout">
      <aside class="flex justify-center md:justify-start md:sticky md:top-20 z-10">
        <CardUser :item="user"/>
      </aside>
      
      <div>
        <h1 class="text-h1 pb-6">Bibliothèque de {{ user?.user_name }}</h1>
        <form @submit.prevent class="mb-10 space-y-6">
        <div class="responsive-layout">
          <input v-model="searchedQuery" id="search" type="text" placeholder="Rechercher un livre, un illustrateur..."
            class="text-sm shadow-sm w-full px-6 py-4 border border-dark-navy/50 rounded-4xl" />
        </div>
      </form>
        <div v-if="pending && libraryItems.length === 0" class="py-10 text-center">
          Chargement des livres...
        </div>

        <div v-else-if="libraryError" class="p-6 bg-rose-50 text-rose-red rounded-xl">
          Impossible de charger la bibliothèque de ce membre pour le moment.
        </div>

        <div v-else-if="libraryItems.length === 0" class="py-20 text-center italic">
          {{ debouncedSearch ? 'Aucun livre ne correspond à votre recherche.' : 'Ce membre n\'a pas encore de livres dans sa bibliothèque.' }}
        </div>

        <ul v-else class="grid lg:grid-cols-2 gap-2" :class="{ 'opacity-50 pointer-events-none': pending }">
          <li v-for="item in libraryItems">
            <CardLibraryBook :key="item.id" :item="item" :user-slug="user.slug" target="libraries-slug-id" />
          </li>
        </ul>
        <AppInfiniteScrollingTrigger v-if="!pending && hasMore" @trigger="handleLoadMore"/> 
      </div>
    </div>
  </section>
</template>
