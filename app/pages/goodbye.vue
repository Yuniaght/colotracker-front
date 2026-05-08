<script setup lang="ts"></script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="mx-auto max-w-250 p-8 bg-pure-white rounded-2xl shadow-sm text-center">
      <h1 class="text-h1 pb-4">Au revoir!</h1>
      <p class="pb-2">Nous sommes tristes de vous voir partir</p>
      <p class="pb-2">Vous avez 30 jours pour annuler votre demande. Passé ce délai, votre compte sera totalement supprimé.</p>
      <AppButton theme="dark-navy" :to="{name: 'index'}">Retour a l'accueil</AppButton>
    </div>
  </section>
</template>
<style></style>