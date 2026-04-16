<template>
  <div>
    <div>
      <h1 class="text-3xl">Trackers de : {{ user?.user_name }}</h1>
      <p v-if="user?.joined_at">Membre depuis :
        <NuxtTime :datetime="user?.joined_at" />
      </p>
      <AppLink v-if="user?.instagram_link" :to="user?.instagram_link">Instagram</AppLink>
      <p v-if="user?.discord_pseudonym">Discord : {{ user?.discord_pseudonym }}</p>
    </div>
    <div v-if="library && library?.length > 0">
      <h2 class="text-2xl">Statistiques</h2>
      <p>Pages complétée : {{ globalstats?.done }} / {{ globalstats?.total }} - {{ globalstats?.percent }}</p>
      <div>
        <h2 class="text-2xl">Collection</h2>
        <div>
          <div v-for="book in library" :key="book.id">
            <appLink :to='`/libraries/${user?.slug}/${book?.id}-${book.book.slug}`'>
              <h3>{{ book.book?.name }}</h3>
              <p>{{ book.completed_pages.length }} / {{ book.book?.page_count }} - {{
                calculateProgress(book.completed_pages.length, book.book?.page_count) }}</p>
            </appLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Cet utilisateur n'a pas encore de livre dans sa collection</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Library, Book } from '~~/shared/types/directus';
type EnrichedLibraryItem = Library & {
  book: Book;
  completed_pages: { id: number }[];
};
const { $directus, $readUsers, $readItems } = useNuxtApp()
const route = useRoute()

const userSlug = computed(() =>route.params.slug as string)

const { data: users } = await useAsyncData(`user_${userSlug.value}`, () => {
  return $directus.request(
    $readUsers({
      fields: ['user_name', "slug", 'avatar', 'id', "joined_at", "instagram_link", "discord_pseudonym"],
      filter: {
        _and: [
          { slug: { _eq: userSlug.value } }
        ]
      },
      limit: 1
    })
  )
})

if (!users.value || users.value.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
}

const user = users.value[0]

const { data: libraryRaw } = await useAsyncData(`library_${userSlug.value}`, () => {
  return $directus.request(
    $readItems('library', {
      filter: {
        user: { _eq: user?.id }
      },
      fields: ["id", "book.id", "book.name", "book.front_cover", "book.page_count", "book.slug", "completed_pages.id"] as any
    })
  )
})

const library = computed(() => {
  return (libraryRaw.value || []) as unknown as EnrichedLibraryItem[]
})

const globalstats = computed(() => {
  if (!library.value || library.value.length <= 0) return

  let totalDone = 0 as number
  let totalPages = 0 as number

  library.value.forEach(item => {
    totalDone += item.completed_pages?.length || 0
    totalPages += item.book?.page_count || 0
  })

  return {
    done: totalDone,
    total: totalPages,
    percent: totalPages > 0 ? ((totalDone / totalPages) * 100).toFixed(2) + "%" : 0
  }
})
</script>