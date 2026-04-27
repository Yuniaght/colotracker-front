<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const { $toast } = useNuxtApp()

const { item, showButton } = defineProps<{
  item: {
    id: string,
    user_name: string,
    joined_at: string,
    slug: string,
    discord_pseudonym: string | null,
    instagram_link: string | null,
    avatar: {
      id: string,
      filename_download: string,
      title: string
    } | null
  }, 
  showButton?: boolean
}>()

const {data: userStats} = useTrackersStats(item.id, item.slug)

const { copy } = useClipboard()

function copyToClipboard(stringToCopy: string){
  copy(stringToCopy)
  $toast.success("Copié dans le presse-papier")
}

</script>
<template>
  <div class="relative w-full min-w-75 max-w-108 bg-pure-white rounded-lg p-6 shadow-md">
    <div class="w-16 h-16 rounded-full border-2 border-skin-orange overflow-clip mb-2 mx-auto">
      <nuxt-picture v-if="item.avatar != null" provider="directus"
        :src="`${item.avatar.id}/${item.avatar.filename_download}`" :alt="item.avatar.title" />
      <nuxt-picture v-else src="/img/defaultavatar.jpg" alt="avatar par défaut" />
    </div>
    <h2 class="text-h2 text-center">{{ item.user_name }}</h2>
    <p class="text-center pb-2">Membre depuis le <nuxt-time :datetime="item.joined_at" locale="fr-FR" year="numeric" month="long" day="numeric"/></p>
    <div class="text-center pb-2">
      <AppLink v-if="item.instagram_link" :to="item.instagram_link" class="text-2xl pr-6"><i class="icon icon-instagram"/></AppLink>
      <span v-else class="text-dark-navy/20 text-2xl pr-6"><i class="icon icon-instagram"/></span>
      <span class="text-2xl" :title="item.discord_pseudonym" :class="item.discord_pseudonym ? 'text-dark-navy transition-colors duration-200 hover:text-skin-orange active:text-rose-red' : 'text-dark-navy/20'" @click="copyToClipboard(item.discord_pseudonym)"><i class="icon icon-discord"/></span>
    </div>
    <div class="pb-6 flex gap-4 text-center">
      <div class="bg-light-green rounded-xl w-full p-3">
        <p class="text-h3 text-emerald-blue font-bold">{{ userStats?.bookCount }}</p>
        <p>Livres</p>
      </div>
      <div class="bg-skin-orange rounded-xl w-full p-3">
        <p class="text-h3 text-rose-red font-bold">{{ userStats?.completedPagesCount }}</p>
        <p>Coloriage</p>
      </div>
    </div>
    <div :class="showButton ? 'pb-6' : ''">
      <p class="flex justify-between pb-1"><span>Progression</span><span>{{ calculateProgress(userStats?.completedPagesCount, userStats?.totalPages) }}</span></p>
      <div class="w-full bg-dark-navy/20 rounded-full h-2">
        <div class="h-2 bg-linear-90 from-rose-red to-skin-orange rounded-full" :style="'width:' + calculateProgress(userStats?.completedPagesCount, userStats?.totalPages)" />
      </div>
    </div>
    <AppButton v-if="showButton" theme="emerald-blue" class="w-full" :to="{name:'libraries-slug' , params: {slug: item.slug}}">Voir ses trackers</AppButton>
  </div>
</template>
<style scoped></style>