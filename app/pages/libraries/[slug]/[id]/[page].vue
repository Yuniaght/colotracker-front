<template>
  <div>
    <h1 class="text-3xl">Page {{ data?.page_number }} du livre {{ data?.library_from?.book.name }} de {{
      data?.library_from?.user.user_name }}</h1>
    <div class="my-4">
      <NuxtImg provider="directus" :src="data?.image" width="500" fit="cover" />
    </div>
    <div class="space-y-2">
      <p><strong>Description :</strong> {{ data?.detailed_info }}</p>
      <p>
        <strong>Terminé le :</strong>
        <NuxtTime :datetime="data?.date_finished" />
      </p>
      <p>
        <strong>Ajouté le :</strong>
        <NuxtTime :datetime="data?.date_added" />
      </p>
    </div>
    <appLink :to='`/libraries/${route.params.slug}/${route.params.id}`'>Retour au tracker</appLink>
  </div>

</template>
<script setup lang="ts">
const { $directus, $readItem } = useNuxtApp()
const route = useRoute()
const page = parseInt((route.params.page as string) || '0')


const { data: data, error } = await useAsyncData(`page-${page}`, () => {
  return $directus.request(
    $readItem('completed_pages', page, {
      fields: [
        "*",
        "library_from.book.name",
        "library_from.user.user_name"
      ] as any
    })
  )
})

</script>