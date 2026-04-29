<script setup lang="ts">
const { $directus, $readUsers, $readItems } = useNuxtApp()
const route = useRoute()
const bookPerPage = 20
const userSlug = computed(() => route.params.slug as string)

const { data: users, pending, error } = await useAsyncData(`user_${userSlug.value}`, () => {
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


if (!users.value || users.value.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
}

const user = users.value[0]

const { data: library } = await useLazyAsyncData(`library_${userSlug.value}`, () => {
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
  watch: [users, fetchFilters] 
},
)

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
        <div class="grid lg:grid-cols-2 gap-2">
          <CardLibraryBook v-for="item in library" :key="item.id" :item="item" :user-slug="user.slug" />
        </div>
      </div>
    </div>
  </section>
</template>
