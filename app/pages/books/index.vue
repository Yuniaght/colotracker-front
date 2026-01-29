<template>
  <div>
    <h1 class="text-3xl">Liste des livres</h1>
    <div v-if="books" class="flex flex-wrap gap-5">
      <div v-for="book in books" :key="book.slug">
        <AppLink :to='`/books/${book.slug}`'>
        <h2>{{ book.name }}</h2>
        <NuxtImg provider="directus" :src="book.front_cover" width="200" height="200" fit="cover"></NuxtImg>
        </AppLink>
      </div>
    </div>
    <div v-else>
      Il n'y a pas de livre
    </div>
  </div>
</template>

<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()

const { data: books } = await useAsyncData(() => {
  return $directus.request(
    $readItems('books', {
      fields: [
        "name",
        "front_cover",
        "slug"
      ] as any
    }
    )
  )
}
)
</script>