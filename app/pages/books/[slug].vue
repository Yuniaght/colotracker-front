<script setup lang="ts">
const { handleAddBook, isConfirmModalOpen, handleModalConfirm } = useLibrary()
const user = useDirectusUser()
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const slug = route.params.slug as string

const { data: book, pending, error } = await useAsyncData('book-list', () => {
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
          category_list : [
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

const categories = computed(() => {
  if (!book.value?.category_list) return []
  
  return book.value.category_list.map((item: any) => ({
    id: item.category_list_id.id,
    name: item.category_list_id.name
  }))
})

const userConnected = computed(() => !!user.value)
</script>

<template>
  <section class="responsive-padding-y responsive-padding-x">
    <div class="mb-6">  
      <AppLink to="/books" class="text-emerald-blue">
       ⬅ Retour aux livres
      </AppLink>
    </div>

    <div v-if="pending">Chargement du livre...</div>

    <div v-else-if="error || !book">
      <h1 class="text-red-500 text-2xl">Livre introuvable</h1>
      <p>Il semble que ce livre n'existe pas ou a été déplacé.</p>
    </div>

    <div v-else class="bg-pure-white shadow-sm rounded-3xl px-4 lg:px-10 py-10 lg:grid-cols-[max-content_1fr] lg:grid gap-10">
      <div class="max-w-105 h-fit mx-auto lg:mx-0 pb-10 lg:pb-0">
        <nuxt-picture 
          provider="directus"
          :src="`${book.front_cover.id}/${book.front_cover.filename_download}`"
          :alt="book.front_cover.title"
          :img-attrs="{ class: 'object-cover w-full h-full rounded-xl mb-6' }"
        />
        <div v-if="userConnected" class="w-full">
          <AppButton theme="emerald-blue" class="w-full" @click="handleAddBook(book.id)">
            Ajouter à ma bibliothèque
          </AppButton>
        </div>
      </div>

      <div>
        <h1 class="text-h1 pb-2">{{ book.name }}</h1>
        <AppLink class="text-h2 text-emerald-blue pb-8" :to="{name: 'books' ,query: {search: book.author.full_name}}"> {{ book.author.full_name }}</AppLink>
        <div class="p-6">
          <p class="pb-2 border-b-2 border-dark-navy/15">Informations</p>
          <p class="flex justify-between"><span>Nombre de pages :</span><span>{{ book.page_count }}</span></p>
          <p class="flex justify-between"><span>Date de sortie :</span><span>{{ formatDate(book.release_date) }}</span></p>
          <p class="flex justify-between"><span>Lien d'achat :</span><AppLink :to="book.store_link" class="text-emerald-blue">Acheter ce livre</AppLink></p>
        </div>
        <div>
          <p class="pb-2">Catégories</p>
          <div class="flex flex-wrap gap-2">
            <nuxt-link v-for="cat in categories" :to="{name: 'books' , query: {categories: cat.id}}" class="inline-block p-2 rounded-full transition-colors duration-200 text-sm font-medium bg-light-green text-dark-navy/70 hover:bg-skin-orange">{{ cat.name }}</nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </section>
    <ModalConfirm 
    :is-open="isConfirmModalOpen"
    title="Livre déjà possédé"
    message="Vous avez déjà ce livre dans votre collection. Voulez-vous vraiment ajouter un exemplaire supplémentaire ?"
    @close="isConfirmModalOpen = false"
    @confirm="handleModalConfirm"
  />    
</template>

