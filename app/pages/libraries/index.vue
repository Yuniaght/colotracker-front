<script setup lang="ts">
const { $directus, $readUsers } = useNuxtApp()

const { data: users } = await useAsyncData('users-list', () => {
  return $directus.request(
    $readUsers({
      fields: ['user_name', "slug", 'avatar'],
      sort: ['-user_name'],
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
  <div>
    <h1 class="text-3xl">Liste des utilisateurs</h1>
    <ul>
      <li v-for="user in users" :key="user.slug">
        <appLink :to='`/libraries/${user.slug}`'>{{ user.user_name }}</appLink>
      </li>
    </ul>
  </div>
</template>

