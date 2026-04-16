<script setup lang="ts">
const { item, userConnected } = defineProps<{
  item: {
    id: number,
    front_cover: {
      id: string;
      filename_download: string;
      title: string;
    };
    name: string;
    slug: string;
    author: {
      full_name: string;
    };
  };
  userConnected: boolean;
}>();

defineEmits(['addToLibrary'])
</script>

<template>
  <div class="relative group w-full max-w-[325px] md:max-w-full rounded-lg overflow-hidden bg-pure-white shadow-sm">
    <nuxt-link 
      :to="`/books/${item.slug}`" 
      class="block"
      :aria-label="`View details for ${item.name}`"
    >
      <div class="aspect-square relative overflow-hidden bg-gray-100">
        <nuxt-picture 
          provider="directus"
          :src="`${item.front_cover.id}/${item.front_cover.filename_download}`"
          :alt="item.front_cover.title"
          loading="lazy"
          width="325"
          height="325"
          :img-attrs="{ class: 'object-cover w-full h-full' }"
        />
      </div>

      <div class="p-4">
        <h3 class="text-h3 truncate">{{ item.name }}</h3>
        <p class="text-blue-navy/70 mb-4">{{ item.author.full_name }}</p>
      </div>
    </nuxt-link>

    <div v-if="userConnected" class="px-4 pb-4">
      <AppButton theme="emerald-blue" class="w-full" @click="$emit('addToLibrary', item.id)">
        Ajouter à ma bibliothèque
      </AppButton>
    </div>
  </div>
</template>