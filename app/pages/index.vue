<template> 
<div v-if="!authenticated">
  Bienvenue, voulez-vous vous <NuxtLink to="/login">connecter</NuxtLink> <br>
  Ou peut-être vous <NuxtLink to="/register">inscrire</NuxtLink>?
</div>
<div v-else>
  <p>Bienvenue {{ authenticated.user_name }}. Voulez-vous <button @click="$logout()">Vous déconnecter?</button></p>
  <p v-if="authenticated.role === config.public.superAdminRoleId || authenticated.role === config.public.adminRoleId">
    Aller sur la <a :href="config.public.directusUrl + '/admin/content'">Page d'administration</a>
  </p>

</div>
</template> 
<script setup lang="ts">
  const { $isAuthenticated } = useNuxtApp()   
  const config = useRuntimeConfig()
  const authenticated = await $isAuthenticated()
</script>