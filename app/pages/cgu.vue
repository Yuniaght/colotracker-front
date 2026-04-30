<script setup lang="ts">
import { readSingleton } from '@directus/sdk';
const { $directus } = useNuxtApp()

const {data} = await useAsyncData('cgu', () => {
  return $directus.request(
    readSingleton('cgu', {
      fields: [
        "id",
        "version",
        "update_date",
        "content"
      ]
    })
  )
})
</script>
<template>
  <section v-html="data?.content" class="responsive-padding-t responsive-padding-x responsive-layout directus-content" />
  <section class="responsive-layout responsive-padding-x responsive-padding-b pt-4">
    <p class="text-sm">Mis à jour le : <nuxt-time :datetime="data?.update_date" year="numeric" month="long" day="numeric"/>. Version : {{ data.version }}. <span @click="console.log('cookies')" class="cursor-pointer select-none">Préférence en matière de cookie</span></p>
  </section>
</template>
<style scoped>
</style>