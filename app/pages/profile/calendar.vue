<script setup lang="ts">
const user = useDirectusUser() 
const { $directus, $readItems } = useNuxtApp()

const { data: completedPages, error} = await useAsyncData(`${user.value.id}-completed-pages`, () => {
  return $directus.request(
    $readItems('completed_pages', {
      filter: { library_from: { user: { _eq: user.value.id } } },
      fields: [
        "id",
        "date_finished",
        { image: ["id", "filename_download", "title"]},
      ]
    })
  )
})
</script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <h1 class="text-h1 text-center pb-2">Calendrier des réalisations</h1>
    <p class="text-center pb-10">Visualisez votre rythme et les jours où vous avez terminé vos œuvres d'art.</p>
    <AppCalendar v-if="completedPages" :completed_pages="completedPages"/>
  </section>
</template>
<style scoped></style>