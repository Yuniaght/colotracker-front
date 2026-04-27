<script setup lang="ts">
import User from '~/components/Card/User.vue'

const { $directus, $readItem } = useNuxtApp()
const route = useRoute()
const id = route.params.id as string
const slug = route.params.slug as string
const libraryId = parseInt(id.split('-')[0] || '0') as number

const { data: data } = await useAsyncData(`book-${id}`, () => {
  return $directus.request(
    $readItem('library', libraryId, {
      fields: [
        "id",
        {
          book: [
            "name",
            "page_count",
            {
              author: [
                "full_name"
              ]
            },
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
            "id",
            "page_number",
            {
              image: [
                "id",
                "filename_download",
                "title"
              ]
            }
          ]
        }
      ]
    })
  )
})

if (!data.value || data.value.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Livre introuvable' })
}

const completed_pages = computed(() => {
  if (!data.value?.completed_pages) return []
  return data.value.completed_pages
})

const showLimit = computed(() => {
  if (book.value?.page_count > 100) return 100
  else return book.value?.page_count
})
const book = computed(() => { return data.value?.book })

const getCompletedPage = (pageNumber: number) => {
  return completed_pages.value.find((p: any) => p.page_number === pageNumber)
}
</script>

<template>
  <section class="responsive-padding-y responsive-padding-x">
    <div class="pb-6">
      <AppLink :to="{name : 'libraries-slug', params: {slug: slug}}">⬅ Retour</AppLink>
    </div>
    <div class="grid xl:grid-cols-[343.5px_auto] bg-linear-180 from-light-green to-emerald-blue rounded-2xl overflow-clip">
      <div class="text-center p-6 ">
        <div class="w-48 mb-4 border-2 border-dark-navy rounded-2xl mx-auto overflow-clip">
          <nuxt-picture 
            provider="directus" 
            :src="`${book?.front_cover?.id}/${book?.front_cover?.filename_download}`" 
            :alt="book?.front_cover.title" 
            :img-attrs="{ class: 'w-full h-full object-cover' }" 
            sizes="200px"/>
        </div>
        <div class="bg-dim-white/50 rounded-2xl pb-4 px-2">
          <h1 class="text-h1 py-2">{{ book?.name }}</h1>
          <p class="text-h2 pb-4">{{ book?.author.full_name }}</p>
          <div>
            <p>{{ completed_pages.length }} / {{ book?.page_count }} Coloriages terminé</p>
            <p class="flex justify-between"><span>Avancement</span> <span>{{ calculateProgress(completed_pages.length, book?.page_count) }}</span></p>
            <div class="w-full bg-dark-navy/20 rounded-full h-2">
              <div class="h-2 bg-linear-90 from-rose-red to-skin-orange rounded-full" :style="'width:' + calculateProgress(completed_pages.length, book?.page_count)" />
              </div>  
          </div>
        </div>
      </div>
      <div class="grid grid-cols-5 md:grid-cols-10 content-start p-4 gap-3">
        <div v-for="n in showLimit" class="aspect-square bg-dim-white rounded relative flex items-center justify-center overflow-clip">
          <nuxt-link :to="{name: 'libraries-slug-id-page', params: {slug: slug, id: route.params.id, page: `${libraryId}-page-${n}`}}" v-if="getCompletedPage(n)" class="cursor-pointer w-full h-full">
            <nuxt-picture 
              provider="directus"
              :src="`${getCompletedPage(n)?.image?.id}/${getCompletedPage(n)?.image?.filename_download}`" 
              :alt="getCompletedPage(n)?.image?.title"
              :img-attrs="{ class: 'w-full h-full object-cover' }"
              loading="lazy"
              sizes="150px"
              /> 
          </nuxt-link>
          <p v-else class="text-h2">{{ n }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
