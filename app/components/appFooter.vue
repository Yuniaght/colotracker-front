<script lang="ts" setup>
const links = [
  {path: '/', name: "Accueil"},
  {path: 'books', name: "Livres"},
  {path: 'libraries', name: "Trackers"},
  {path: 'about', name: "A propos"},
  {path: 'contact', name: "Contact"},
  ]
</script>

<template>
  <footer class="bg-emerald-blue bo mt-auto">
    <div class="">
      <div>
        <div class="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between px-6 md:px-12 pt-12 pb-4">
          <div class="flex items-center">
          <nuxt-picture src="logo.png" width="127"></nuxt-picture>
          <p class="text-title">ColoTracker</p>
          </div>
          <nav class="flex gap-2 justify-center grow text-sm md:text-base">
            <AppLink v-for="link in links" :to="link.path">
              {{ link.name }}
            </AppLink>
          </nav>
        </div>
        <p class="text-xs text-center py-4 px-2">
          © Colotracker {{ new Date().getFullYear() }} Tous droits réservés | <AppLink to="/cgu" class="hover:text-blue-600 transition-colors">
            Mentions légales & politique des cookies
          </AppLink> | Design by Jean-Baptiste de Vulder
        </p>
      </div>
    </div>
  </footer>
</template>