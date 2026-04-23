<script setup lang="ts">
const { $directus, $readUsers } = useNuxtApp()
const route = useRoute()
const userPerPage = 9

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
  const queryFilter: any = { _and: [{ status: { _eq: "active" } }] }

  if (debouncedSearch.value) {
    queryFilter._and.push({
      _or: [
        { user_name: { _icontains: debouncedSearch.value } },
      ]
    })
  }

  return queryFilter
})

const { data: users, pending, error } = await useAsyncData('users-list', () => {
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
      sort: ['user_name'],
      limit: userPerPage,
      filter: fetchFilters.value,
    })
  )
},   
{
  watch: [fetchFilters]
})

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
    <h1 class="text-h1 text-center pb-4">Trackers</h1>
    <p class="text-center pb-8 ">Retrouvez les trackers des membres de la communauté</p>
    <form @submit.prevent class="mb-10 space-y-6">
      <div class="responsive-layout">
        <input v-model="searchedQuery" id="search" type="text" placeholder="Rechercher un utilisateur..." class="text-sm shadow-sm w-full px-6 py-4 border border-dark-navy/50 rounded-4xl" />
      </div>
    </form>
    <div v-if="pending" class="text-h2 text-center">
      Chargement des utilisateurs en cours
    </div>
    <div v-if="users" class="responsive-layout grid gap-6 justify-center grid-cols-[minmax(0,27rem)] md:grid-cols-[repeat(2,minmax(0,27rem))] lg:grid-cols-[repeat(3,minmax(0,27rem))]">
      <CardUser v-for="user in users" :key="user.id" :item="user" show-button />
    </div>
  </section>
</template>

