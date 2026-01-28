<template>
  <div class="min-h-screen flex flex-col">
    <NuxtRouteAnnouncer />
    <appNav />
    <main  class="flexgrow">
      <NuxtPage />
    </main>
    <appFooter />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Colotracker",
  meta: [
    { name: 'description', content: "Votre application de suivi de livre de coloriage" }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
  ],
})
</script>