<script setup lang="ts">
const { item, userSlug} = defineProps<{
  item: {
    id: number,
    book: {
      name: string,
      page_count: number,
      slug: string;
      front_cover: {
        id: string,
        filename_download: string,
        title: string
      }
    },
    completed_pages: number,
  },
  userSlug: string
}>()
</script>
<template>
  <nuxt-link :to="{ 
    name: 'libraries-slug-id', 
    params: {   
      slug: userSlug, 
      id: `${item.id}-${item.book.slug}` 
    } 
  }"class="bg-pure-white w-full rounded-2xl shadow block overflow-hidden">
    <div class="flex items-stretch min-h-[120px]">
  
  <div class="w-26 shrink-0 relative overflow-hidden bg-gray-100">
    <nuxt-picture 
      provider="directus"
      loading="lazy"
      :src="`${item.book.front_cover.id}/${item.book.front_cover.filename_download}`"
      :alt="item.book.front_cover.title"
      class="absolute inset-0 w-full h-full"
      :img-attrs="{ class: 'w-full h-full object-cover' }"
    />
  </div>

  <div class="p-4 flex flex-col justify-center flex-1">
    <h2 class="text-h3">{{ item.book.name }}</h2>
    <p class="text-dark-navy/50 text-sm">
      {{ item.book.page_count }} pages
    </p>
  </div>
</div>
    <div class="p-4">
      <p class="flex justify-between pb-1"><span>Progression</span><span>{{ calculateProgress(item?.completed_pages, item?.book.page_count) }}</span></p>
      <div class="w-full bg-dark-navy/20 rounded-full h-2">
        <div class="h-2 bg-linear-90 from-rose-red to-skin-orange rounded-full" :style="'width:' + calculateProgress(item?.completed_pages, item?.book.page_count)" />
      </div>
    </div>
  </nuxt-link>
</template>
<style scoped>

</style>