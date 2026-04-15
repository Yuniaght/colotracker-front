<script setup lang="ts">
import type { SwiperOptions } from 'swiper/types'
import { aggregate } from '@directus/sdk'
const { $directus, $readItems } = useNuxtApp()

const {data, error} = await useAsyncData('latest-drawings', () => {
  return $directus.request(
    $readItems('completed_pages', {
      fields: [
        "id",
        "page_number",
        { 
          image: [
            "id",
            "filename_download",
            "title"
          ],
          library_from: [
            "id",
            {
              user: [
                "slug",
                "user_name"
              ],
              book: [
                "slug",
                "name"
              ]
            }
          ]
        }
      ],
      limit: 12,
      sort: '-date_finished'
    })
  )
})

const {data: drawingCount} = useAsyncData(
    'drawings-count',
    () => $directus.request(
      aggregate('completed_pages', {aggregate: {count: '*'}})),
    {server: false, transform: (aggregate) => (aggregate[0]?.count || 0) as number, }
)

const {data: booksCount} = useAsyncData(
    'books-count',
    () => $directus.request(
      aggregate('books', {aggregate: {count: '*'}})),
    {server: false, transform: (aggregate) => (aggregate[0]?.count || 0) as number, }
)

const {data: usersCount} = useAsyncData(
    'users-count',
    () => $directus.request(
      aggregate('directus_users', {aggregate: {count: '*'}, query: {filter: {status: {_eq: 'active'}}}})),
    {server: false, transform: (aggregate) => (aggregate[0]?.count || 0) as number, }
)

const options = {
  slidesPerView: 'auto',
  speed: 8000,
  loop: true,
  loopAdditionalSlides: 3,
  allowTouchMove: true,
  grabCursor: true,
  spaceBetween: 16,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  injectStyles: [
    `.swiper-wrapper { transition-timing-function: linear !important; }`
  ],
} as SwiperOptions
</script>

<template>
  <section class="w-full h-[550px] md:h-100 relative overflow-hidden ">
    <div class="absolute inset-0 bg-linear-180 from-rose-red to-skin-orange"></div>
    <div class="absolute inset-0 bg-linear-135 from-transparent via-transparent to-light-green"></div>
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center gap-4 px-6 py-16">
      <h1 class="text-h1">
        Suivez vos chefs-d'œuvre page par page
      </h1>
      <p class="text-h3 max-w-200">
        Organisez votre bibliothèque de livres de coloriage, suivez votre progression et découvrez le réalisations de la communauté.
      </p>
      <div class="flex justify-center gap-4">
        <AppButton :to="{name: 'books'}" theme="rose-red" title="Voir les livres">Voir les livres</AppButton>
        <AppButton :to="{name: 'libraries'}" theme="dark-navy" title="Voir les trackers">Voir les trackers</AppButton>
      </div>
    </div>
  </section>
  <SectionSlider class="responsive-padding-y responsive-padding-x text-center" :x-spacing="0" :options="options">
    <template #header>
      <h2 class="text-h2 mb-4">Les dernières réalisations</h2>
      <p class="text-h3 text-emerald-blue mb-4">Regardez les derniers coloriages de nos membres</p>
    </template>
    <swiper-slide v-for="(drawing, i) in data" class="relative h-112.5 max-w-[333.33px]">
        <nuxt-link 
          :to="`/libraries/${drawing.library_from?.user?.slug}/${drawing.library_from?.id}-${drawing.library_from?.book?.slug}/${drawing.id}-page-${drawing.page_number}`"
          class="absolute inset-0"> 
          <nuxt-picture
          provider="directus"
          :src="`${drawing.image?.id}/${drawing.image?.filename_download}`"
          :alt="drawing.image?.title"
          loading="lazy"
          :img-attrs="{ class: 'object-cover size-full absolute inset-0 -z-10 ' }" />
          <div class="absolute w-full bottom-0 p-6 bg-dark-navy/50 text-dim-white"> 
            {{ drawing.library_from?.user?.user_name }}
          </div>
        </nuxt-link>
    </swiper-slide>
  </SectionSlider>
  <section class="bg-light-green responsive-padding-y responsive-padding-x text-center">
    <h2 class="text-h2 mb-6">
      Quelques chiffres
    </h2>
    <div class="w-full flex flex-col items-center justify-center xl:flex-row gap-6 font-bold">
      <div class="w-full max-w-[430px] p-6 bg-dim-white rounded-2xl">
        <p class="text-h2  text-rose-red">{{ booksCount }}</p>
        <p class="text-sm uppercase">Livres répertoriés</p>
      </div>
      <div class="w-full max-w-[430px] p-6 bg-dim-white rounded-2xl">
        <p class="text-h2 text-emerald-blue">{{ drawingCount }}</p>
        <p class="text-sm uppercase">Coloriages terminés</p>
      </div>
      <div class="w-full max-w-[430px] p-6 bg-dim-white rounded-2xl">
        <p class="text-h2 text-skin-orange">{{ usersCount }}</p>
        <p class="text-sm uppercase">Utilisateurs actifs</p>
      </div>
    </div>
  </section>
</template>
