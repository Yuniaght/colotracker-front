<template>
  <div class="p-10 max-w-5xl mx-auto">

    <div class="mb-6">
      <AppLink to="/books" class="text-blue-600 hover:underline">
        ⬅️ Retour au catalogue
      </AppLink>
    </div>
    <div v-if="pending">Chargement du livre...</div>
    <div v-else-if="error || !book">
      <h1 class="text-red-500 text-2xl">Livre introuvable</h1>
      <p>Il semble que ce livre n'existe pas ou a été déplacé.</p>
    </div>
    <div v-else class="flex gap-10 items-start">
      <div class="w-1/3 shrink-0">
        <div class="border rounded-lg overflow-hidden shadow-lg">
          <NuxtImg provider="directus" :src="book.front_cover" :alt="book.name" width="400" height="600" fit="cover"
            class="w-full h-auto object-cover" />
        </div>
      </div>
      <div class="flex-1 space-y-4">
        <h1 class="text-4xl font-bold text-gray-800">{{ book.name }}</h1>
        <p class="text-xl text-gray-600">
          Par <span class="font-semibold text-gray-900">{{ book.author?.full_name }}</span>
        </p>
        <div class="flex gap-2">
          <span v-for="(cat, index) in book.category_list" :key="index"
            class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {{ cat.category_list_id?.name }}
          </span>
        </div>
        <hr class="border-gray-200 my-4" />
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span class="font-bold">Date de sortie :</span>
            {{ new Date(book.release_date).toLocaleDateString('fr-FR') }}
          </div>
          <div>
            <span class="font-bold">Nombre de coloriage :</span> {{ book.page_count }}
          </div>
        </div>
        <div class="pt-6">
          <a v-if="book.store_link" :href="book.store_link" target="_blank"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition inline-block">
            Acheter sur le store 🛒
          </a>
          <span v-else class="text-gray-500 italic">Non disponible à l'achat</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const slug = route.params.slug as string

const { data: book, error } = await useAsyncData('book-list', () => {
  return $directus.request(
    $readItems('books', {
      filter: {
        slug: {
          _eq: slug
        }
      },
      fields: [
        "*",
        "author.full_name",
        "category_list.category_list_id.name"
      ] as any,
      limit: 1
    },
    )
  )
}, {
  transform: (data: any[]) => data && data.length > 0 ? data[0] : null
}

)
</script>