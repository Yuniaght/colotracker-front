<template>
  <header class="flex justify-between py-1 px-3 content-center items-center border-b">
    <h1 class="text-4xl"><NuxtLink to="/" class="flex items-center gap-1"><NuxtImg src="logo.png" width="50" height="50"></NuxtImg>Colotracker</NuxtLink></h1>
    <nav> 
      <ul class="flex justify-between gap-2">
        <li><AppLink to="/">Accueil</AppLink></li>
        <li><AppLink to="/books">Livres</AppLink></li>
        <li><AppLink to="/libraries">Trackers</AppLink></li>
      </ul>
    </nav>
    <div>
      <div v-if="!user">
        <AppLink to="/login">Connexion</AppLink>
         - 
        <AppLink to="/register">S'inscrire</AppLink>
      </div>
      <div v-else>
        <AppLink to="/profile">Mon profil</AppLink> - 
        <button @click="$logout()">Déconnexion</button>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
  const user = useDirectusUser()
</script>