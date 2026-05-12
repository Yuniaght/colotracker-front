<script setup lang="ts">
const { handleAddBook, isConfirmModalOpen, handleModalConfirm } = useLibrary()
const user = useDirectusUser()
const config = useRuntimeConfig()
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const slug = route.params.slug as string

const { data: book, error } = await useAsyncData(`book-detail-${slug}`, () => {
  return $directus.request(
    $readItems('books', {
      filter: {
        slug: {
          _eq: slug
        }
      },
      fields: [
        "id",
        "name",
        "page_count",
        "release_date",
        "store_link",
        {
          author: [
            "full_name"
          ]
        },
        {
          category_list: [
            {
              category_list_id: [
                "id",
                "name"
              ]
            }
          ]
        },
        {
          front_cover: [
            "id",
            "title",
            "filename_download"
          ]
        },
      ],
      limit: 1
    },
    )
  )
}, {
  transform: (data: any[]) => data && data.length > 0 ? data[0] : null
}
)

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Erreur serveur', fatal: true })
}

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Livre introuvable', fatal: true })
}

const categories = computed(() => {
  if (!book.value?.category_list) return []

  return book.value.category_list.map((item: any) => ({
    id: item.category_list_id.id,
    name: item.category_list_id.name
  }))
})

const userConnected = computed(() => !!user.value)
const bookImageUrl = book.value?.front_cover ? `${config.public.directusUrl}/assets/${book.value.front_cover.id}` : '/logo.png'

useSeoMeta({
  title: () => `${book.value?.name} - ${book.value?.author?.full_name}`,
  description: () => `Consultez les détails sur le livre "${book.value?.name}".`,
  ogTitle: () => `Livre : ${book.value?.name}`,
  ogDescription: () => `Découvrez ${book.value?.name} sur ColoTracker.`,
  ogImage: bookImageUrl,
  twitterImage: bookImageUrl,
  twitterCard: 'summary_large_image'
})

useSchemaOrg([
  defineBook({
    name: book.value.name,
    author: {
      name: book.value.author.full_name,
    },
    numberOfPages: book.value.page_count,
    datePublished: book.value.release_date,
    image: bookImageUrl
  })
])
</script>

<template>
  <section class="responsive-padding-y responsive-padding-x">
    <div class="mb-6">
      <AppLink to="/books" class="text-emerald-blue">
        ⬅ Retour aux livres
      </AppLink>
    </div>
    <article
      class="bg-pure-white shadow-sm rounded-3xl px-4 lg:px-10 py-10 lg:grid-cols-[max-content_1fr] lg:grid gap-10">
      <div class="max-w-105 h-fit mx-auto lg:mx-0 pb-10 lg:pb-0">
        <nuxt-picture provider="directus" :src="`${book.front_cover.id}/${book.front_cover.filename_download}`"
          :alt="book.front_cover.title" :img-attrs="{ class: 'object-cover w-full h-full rounded-xl mb-6' }" loading="eager" fetchpriority="high" />
        <div v-if="userConnected" class="w-full">
          <AppButton theme="emerald-blue" class="w-full" @click="handleAddBook(book.id)">
            Ajouter à ma bibliothèque
          </AppButton>
        </div>
      </div>

      <div>
        <h1 class="text-h1 pb-2">{{ book.name }}</h1>
        <AppLink class="text-h2 text-emerald-blue pb-8" :to="{ name: 'books', query: { search: book.author.full_name } }">
          {{ book.author.full_name }}</AppLink>
        <div class="p-6">
          <p class="pb-2 border-b-2 border-dark-navy/15">Informations</p>
          <ul class="list-none p-0">
            <li class="flex justify-between pb-2">
              <span>Nombre de pages :</span>
              <span>{{ book.page_count }}</span>
            </li>
            <li class="flex justify-between pb-2">
              <span>Date de sortie :</span>
              <nuxt-time 
                :datetime="book.release_date"
                year="numeric" 
                month="long" 
                day="numeric" 
              />
            </li>
            <li v-if="book.store_link" class="flex justify-between pb-2">
              <span>Lien d'achat :</span>
              <AppLink 
                :to="book.store_link" 
                class="text-emerald-blue" >
                Acheter ce livre
              </AppLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="pb-2">Catégories</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="cat in categories">
              <nuxt-link :to="{ name: 'books', query: { categories: cat.id } }"
                class="inline-block p-2 rounded-full transition-colors duration-200 text-sm font-medium bg-light-green text-dark-navy/70 hover:bg-skin-orange">{{
                cat.name }}</nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </article>
  </section>
  <ModalConfirm :is-open="isConfirmModalOpen" @close="isConfirmModalOpen = false" @confirm="handleModalConfirm">
    <template #title>
      Livre déjà possédé
    </template>
    <template #message>
      <p class="pb-2">
        Vous avez déjà ce livre dans votre collection. Voulez-vous vraiment ajouter un exemplaire supplémentaire ?
      </p>
    </template>
    <template #confirmText>
      Ajouter le livre
    </template>
  </ModalConfirm>
</template>
