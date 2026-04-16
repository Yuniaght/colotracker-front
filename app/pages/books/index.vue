<script setup lang="ts">
const user = useDirectusUser()
const { $directus, $readItems } = useNuxtApp()

const userConnected = computed(() => !!user.value)

const { data: books, pending, error } = await useLazyAsyncData(() => {
  return $directus.request(
    $readItems('books', {
      fields: [
        "name",
        "slug",
        {
          front_cover: [
            "id",
            "filename_download",
            "title"
          ]
        },
        {
          author: [
            "full_name"
          ]
        }
      ]
    }
    )
  )
}
)
</script>

<template>
  <section class="responsive-padding-y responsive-padding-x">
    <h1 class="text-h1 text-center pb-6 ">Bibliothèque des livres</h1>
    <div v-if="pending" class="text-h2">Chargement des livres</div>
    <div v-else-if="error" class="text-rose-red">
      Une erreur est survenue lors de la récupération des livres.
    </div>
    <div v-if="books && books.length > 0" class="grid justify-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <CardBook v-for="item in books" :key="item.slug" :item :user-connected="userConnected" />
    </div>
    <div v-else>
      Il n'y a pas de livre
    </div>
  </section>
  <section class="responsive-padding-y responsive-padding-x text-center">
    <h2 class="text-h2 mb-6">Votre livre n'est pas dans la liste?</h2>
    <p><nuxt-link>Faites une demande d'ajout</nuxt-link> et nous étudierons la possibilité d'ajouter le livre dès que possible</p>
  </section>
</template>

