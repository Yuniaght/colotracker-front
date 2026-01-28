<template>
  <div>
    <div>
      <h2 class="text-2xl">{{ book?.name }}</h2>
      <p>Auteur : {{ book?.author.full_name }}</p>
      <p>Nombre de page : {{ book?.page_count }}</p>
      <p>Date de sortie : <NuxtTime :datetime="book.release_date"></NuxtTime>
      </p>
      <div class="flex items-center gap-2">
        Catégories :
        <ul class="flex gap-2">
          <li v-for="category in categories">
            {{ category }}
          </li>
        </ul>
      </div>
    </div>
    <div>
      <h2 class="text-2xl">Statistiques</h2>
      <p>{{ completed_pages.length }} / {{ book.page_count }} - {{ calculateProgress(completed_pages.length,
        book?.page_count) }}</p>
    </div>
    <div>
      <h2 class="text-2xl">Tracker</h2>
      <div class="flex flex-wrap justify-center gap-2">
        <div v-for="n in book?.page_count" class="w-40 h-40 text-center border grid place-content-center break-all">
          <div v-if="getCompletedPage(n)">
            <appLink :to='`/libraries/${slug}/${id}/${getCompletedPage(n)?.id}`'>
              <NuxtImg provider="directus" :src="getCompletedPage(n)?.image" width="200" height="200" fit="cover" />
            </appLink>
          </div>
          <div v-else>{{ n }}</div>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">

const { $directus, $readItem } = useNuxtApp()
const route = useRoute()
const id = route.params.id as string
const slug = route.params.slug as string
const libraryId = parseInt(id.split('-')[0]) as number

const { data: data, error } = await useAsyncData(`book-${id}`, () => {
  return $directus.request(
    $readItem('library', libraryId, {
      fields: [
        "id",
        "book.*",
        "book.author.full_name",
        "book.category_list.category_list_id.name",
        "completed_pages.id",
        "completed_pages.image",
        "completed_pages.page_number",
      ] as any
    })
  )
})

if (!data.value || data.value.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Livre introuvable' })
}

const categories = computed(() => {
  if (!data.value?.book?.category_list) return []
  return data.value.book.category_list
    .map((item: any) => item.category_list_id?.name)
    .filter(Boolean)
})

const completed_pages = computed(() => {
  if (!data.value?.completed_pages) return []
  return data.value.completed_pages
})

const book = data.value.book

const getCompletedPage = (pageNumber: number) => {
  return completed_pages.value.find(p => p.page_number === pageNumber)
}
</script>