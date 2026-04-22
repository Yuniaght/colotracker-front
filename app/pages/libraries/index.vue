<script setup lang="ts">
const { $directus, $readUsers } = useNuxtApp()
const { data: users } = await useAsyncData('users-list', () => {
  return $directus.request(
    $readUsers({
      fields: [
        "id",
        "user_name",
        "joined_at",
        "slug",
        "discord_pseudonym",
        "instagram_link",
        {
          avatar: [
            "id",
            "filename_download",
            "title"
          ]
        }
        
      ],
      sort: ['user_name'],
      filter: {
        _and: [
          { status: { _eq: "active" } }
        ]
      }
    })
  )
})

</script>

<template>
  <section class="responsive-padding-y responsive-padding-x">
    <h1 class="text-h1 text-center pb-4">Trackers</h1>
    <p class="text-center pb-8 ">Retrouvez les trackers des membres de la communauté</p>
    <div class="responsive-layout grid gap-6 justify-center grid-cols-[minmax(0,27rem)] md:grid-cols-[repeat(2,minmax(0,27rem))] lg:grid-cols-[repeat(3,minmax(0,27rem))]">
      <CardUser v-for="user in users" :key="user.id" :item="user" show-button />
    </div>
  </section>
</template>

