<script setup lang="ts">
import { triggerFlow } from '@directus/sdk';
const route = useRoute();
const { $directus } = useNuxtApp();

onMounted(async () => {
  const userToken = route.query.token as string
  
  if (!userToken) {
    navigateTo({name: 'index'})
  }

  try {
    // We send a POST to your specific Reactivation Flow
    await $directus.request(
      triggerFlow('POST', '9efd2b8b-12f1-4308-9f23-b2d161ce7c53', { 
        token: userToken  
      })
    );
  } catch (e) {
    console.error(e);
  }
});
</script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="mx-auto max-w-250 p-8 bg-pure-white rounded-2xl shadow-sm text-center">
      <h1 class="text-h1 pb-4">Bon retour!</h1>
      <p class="pb-2">Nous sommes heureux de vous revoir dans la communauté</p>
      <p class="pb-2">Vous pouvez des à présent vous connecter</p>
      <AppButton theme="dark-navy" :to="{name: 'index'}">Retour a l'accueil</AppButton>
    </div>
  </section>
</template>
<style></style>