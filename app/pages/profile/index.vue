<template> 
<div v-if="user">
 <p>Bienvenue {{ user.user_name }}. Voulez-vous <button @click="$logout()">Vous déconnecter?</button></p>
  <p v-if="user.role === config.public.superAdminRoleId || user.role === config.public.adminRoleId">
    Aller sur la <a :href="config.public.directusUrl + '/admin/content'">Page d'administration</a>
  </p>
</div>

</template> 
<script setup lang="ts">
  const user = useDirectusUser()  
  const config = useRuntimeConfig()
</script>