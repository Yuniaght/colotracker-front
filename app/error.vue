<script setup lang="ts">
import type {NuxtError} from "#app";

defineProps({
  error: Object as () => NuxtError
})

const handleError = () => {
  clearError({redirect: '/'});
}

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

const errorContent = [
  "Notre site web fait actuellement l'objet d'une maintenance programmée",
  "Nous travaillons dur pour améliorer votre expérience en ligne. Pendant cette période, certaines fonctionnalités peuvent être temporairement indisponibles",
  "Nous vous remercions de votre patience et de votre compréhension",
]
</script>

<template>
<div id="Error" class="relative">
    <div class="error__background">
      <nuxt-img
          src="/error/error.jpg" />
    </div>
    <div class="container">
      <div class="wrapper bg-dark-navy/75 rounded-2xl">
        <template v-if="error?.status === 404">
          <h1 class="text-h1 font-semibold uppercase">Page <span class="bg-rose-red">introuvable</span></h1>
          <p class="mt-4">La page que vous recherchez est introuvable.</p>

          <AppButton @click="handleError" class="w-fit btn mt-6" theme="rose-red">Revenir à l'accueil</AppButton>
        </template>

        <template v-else-if="error?.status === 410">
          <h1 class="text-h2 text-rose-red">Lien expiré</h1>

          <p class="mt-4" v-if="!error.message">
            Ce lien est expiré
          </p>
          <p class="mt-4" v-else>{{error.message}}</p>
        </template>

        <template v-else-if="error?.status === 503">
          <h1 class="text-h2 text-rose-red">Nous nous mettons à jour pour mieux vous servir !</h1>

          <p class="mt-4" v-for="(item, i) in errorContent" :key="i">{{item}}</p>
        </template>

        <template v-else>
          <h1 class="text-h2 text-rose-red uppercase">Oups</h1>
          <p class="mt-4">Une erreur est survenue. Revenez plus tard.</p>

          <AppButton @click="handleError" class="w-fit btn mt-6" theme="rose-red">Revenir à l'accueil</AppButton>
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped>
@reference "assets/css/tailwind.css";

#Error {
  @apply min-h-screen w-full text-center relative text-white flex justify-center items-center py-12;
}

.wrapper {
  padding: 40px 20px;
}

.wrapper {
  @apply min-h-0;
}

.container {
  @apply relative left-0 right-0 m-auto top-0 bottom-0 flex flex-col flex-wrap justify-center items-center;
  max-width: 796px;
  width: 90%;
}

h1 {
  margin-bottom: 20px;
}

p {
  @apply mx-auto;
  max-width: 60ch;
  margin-bottom: 10px;
}

a {
  font-size: 1.3em;
}

h1 {
  margin-top: 0
}

.error__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;

  img {
    position: absolute;
    object-fit: cover;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>