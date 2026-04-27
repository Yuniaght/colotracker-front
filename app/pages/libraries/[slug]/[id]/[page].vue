<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const page = computed(() => parseInt((route.params.page as string).split("-")[2] || '0'))
const libraryID = computed(() => parseInt((route.params.id as string)))


const { data: data, pending, error } = await useAsyncData(`page-${page}-${route.params.id}`, () => {
  return $directus.request(
    $readItems('completed_pages', {
      fields: [
        "page_number",
        "date_finished",
        "detailed_info",
        {
          image: [
            "id",
            "filename_download",
            "title"
          ]
        },
        {
          library_from: [
            {
              user: [
                "user_name",
                {
                  avatar: [
                    "id",
                    "filename_download",
                    "title"
                  ]
                }
              ]
            },
            {
              book: [
                "name"
              ]
            }
          ]
        }
      ],
      filter: {
        _and: [
          {
            library_from: {
              _eq: libraryID.value
            }
          },
          {
            page_number: {
              _eq: page.value
            }
          }
        ]
      },
      limit: 1
    } ,)
  )
},
{
  transform: (data) => {
    return data[0]
  }
})

const user = computed(() => data.value?.library_from?.user)
const book = computed(() => data.value?.library_from?.book)
</script>

<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="pb-6">
      <AppLink :to="{ name: 'libraries-slug-id', params: { slug: route.params.slug, id: route.params.id } }">⬅ Retour au
        tracker</AppLink>
    </div>
    <div class="grid md:grid-cols-2 rounded-2xl overflow-clip">
      <div>
        <nuxt-picture 
            provider="directus" 
            :src="`${data?.image?.id}/${data?.image?.filename_download}`" 
            :alt="data?.image?.title" 
            :img-attrs="{ class: 'w-full h-full object-cover' }" 
            />
      </div>
      <div class="p-8 bg-pure-white shadow-xl">
        <div class="flex items-center gap-3 pb-3">
          <div class="w-16 h-16 rounded-full border-2 border-skin-orange overflow-clip">
              <nuxt-picture 
                v-if="user != null" 
                provider="directus"
                :src="`${user.avatar?.id}/${user.avatar.filename_download}`" 
                :alt="user.avatar.title" 
                sizes="64px"
                />
              <nuxt-picture v-else src="/img/defaultavatar.jpg" alt="avatar par défaut" />
          </div>
          <div >
            <p class="text-xs text-dark-navy/50">Colorié par</p>
            <p>{{ user.user_name }}</p>
          </div>
        </div>
        <h1 class="text-h1 pb-2">Page N°{{ data?.page_number }}</h1>
        <p class="pb-8 text-emerald-blue">Livre : {{ book.name }}</p>
        <div class="p-6 bg-dim-white rounded-xl">
          <p class="border-b-2 pb-2 border-dark-navy/20">Details</p>
          <p class="pt-4 text-sm text-dark-navy/50">Date de réalisation</p>
          <nuxt-time :datetime="data?.date_finished" locale="fr-FR" year="numeric" month="long" day="numeric"/>
          <p class="pt-4 text-sm text-dark-navy/50">Info détaillées</p>
          <p>{{ data?.detailed_info }}</p>
        </div>
      </div>
    </div>
  </section>
</template>