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

if (error.value) {
  throw createError({
    statusCode: 500,
    statusMessage: "Impossible de charger votre calendrier pour le moment.",
    fatal: true
  })
}

</script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <h1 class="text-h1 text-center pb-2">Calendrier des réalisations</h1>
    <p class="text-center pb-10">Visualisez votre rythme et les jours où vous avez terminé vos œuvres d'art.</p>
    <div v-if="completedPages?.length === 0" class="text-center py-12">
      <p>Vous n'avez pas encore de réalisations enregistrées.</p>
      <AppButton :to="{name: 'profile-mylibrary'}" class="mt-4">Commencer un coloriage</AppButton>
    </div>
    <AppCalendar v-else :completed_pages="completedPages"/>
  </section>
</template>
<style scoped></style>