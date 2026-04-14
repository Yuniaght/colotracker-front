<script setup lang="ts">
const user = useDirectusUser()
console.log(user.value)
const isOpen = ref(false)
const isProfileOpen = ref(false)

if (import.meta.client) {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('#profile-dropdown')) {
      isProfileOpen.value = false
    }
  })
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const publicLink = [
  {path: "/", name: "Accueil"},
  {path: "books", name: "Livres"},
  {path: "libraries", name: "Trackers"},
  {path: "about", name: 'A propos'}
]
</script>

<template>
  <header class="absolute w-full h-18 px-8 py-3 z-50">
    <div class="relative w-full flex justify-between items-center">
      <div>
        <NuxtLink to="/" class="flex items-center gap-1">
          <NuxtImg src="logo.png" width="50" height="50" />
          <span class="text-title">Colotracker</span>
        </NuxtLink>
      </div>

      <nav class="hidden lg:block">
      <ul class="flex gap-4 items-center">
        <li v-for="link in publicLink" :key="link.path">
          <AppLink :to="link.path">{{ link.name }}</AppLink>
        </li>
        
        <li v-if="!user">
          <AppLink :to="{path: 'login'}">Connexion</AppLink>
        </li>

        <li v-else class="relative" id="profile-dropdown">
          <button 
            @click="toggleProfile" 
            class="flex items-center focus:outline-none cursor-pointer pt-1"
          >
            <div class="w-10 h-10 rounded-full border-2 border-skin-orange overflow-clip hover:border-opacity-70 transition-all">
              <nuxt-picture 
                v-if="user.avatar != null" 
                provider="directus" 
                :src="`${user.avatar.id}/${user.avatar.filename_download}`" 
                :alt="user.avatar.title"
                class="w-full h-full object-cover"
              />
              <nuxt-picture 
                v-else 
                src="/img/defaultavatar.jpg" 
                alt="avatar par défaut"
                class="w-full h-full object-cover"
              />
            </div>
          </button>

          <div 
            v-if="isProfileOpen" 
            class="absolute right-0 mt-2 w-48 bg-dim-white py-2 flex flex-col items-center z-60"
          >
            <AppLink 
              to="/profile" 
              class="w-full text-center py-2 hover:bg-gray-50"
              @click="toggleProfile"
            >
              Mon profil
            </AppLink>
            <button 
              @click="$logout(); toggleProfile" 
              class="w-full text-center py-2 cursor-pointer text-rose-red hover:text-dark-navy"
            >
              Déconnexion
            </button>
          </div>
        </li>
      </ul>
    </nav>

      <button @click="toggleMenu" class="lg:hidden p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <div v-if="isOpen" class="lg:hidden absolute top-full left-0 w-full z-100 bg-dim-white">
      <div class="flex flex-col items-center py-6 space-y-4">
        <div v-if="user" class="flex flex-col items-center space-y-4 w-full">
          <div class="w-16 h-16 rounded-full border-2 border-skin-orange overflow-clip">
            <nuxt-picture v-if="user.avatar != null" provider="directus" :src="`${user.avatar.id}/${user.avatar.filename_download}`" :alt="user.avatar.title"/>
            <nuxt-picture v-else src="/img/defaultavatar.jpg" alt="avatar par défaut"/>
          </div>
          <AppLink @click="isOpen = false" to="/profile">Mon profil</AppLink>
        </div>
        
        <AppLink v-for="link in publicLink"  @click="isOpen = false" :to="link.path">{{ link.name }}</AppLink>
        <template v-if="!user">
          <AppLink @click="isOpen = false" to="/login">Connexion</AppLink>
          <AppLink @click="isOpen = false" to="/register">S'inscrire</AppLink>
        </template>
        <template v-if="user">
          <button @click="$logout(); isOpen = false">Déconnexion</button>
        </template>
      </div>
    </div>
  </header>
</template>