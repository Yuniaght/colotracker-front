<script setup lang="ts">
const {public: {directusUrl: directusUrl}} = useRuntimeConfig();

useHead({
  title: "Colotracker",
  meta: [
    { name: 'description', content: "Votre application de suivi de livre de coloriage" }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
    { rel: 'preconnect', href: directusUrl || 'http://localhost:8055', crossorigin: '' },
    { rel: 'preload', as: 'style', href: '/css/font.css' },
    { rel: 'stylesheet', href: '/css/font.css' },
    { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/CraftyGirls.ttf', crossorigin: 'anonymous' },
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-regular.woff2', crossorigin: 'anonymous' },
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-semibold.woff2', crossorigin: 'anonymous' },
  ],
})
</script>

<template>
  <div class="min-h-screen flex flex-col overflow-hidden">
    <NuxtRouteAnnouncer />
    <appNav />
    <main class="flexgrow responsive-menu-padding-t">
      <NuxtPage />
    </main>
    <appFooter />
  </div>
</template>