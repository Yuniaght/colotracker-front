<script setup lang="ts">
const user = useDirectusUser()
</script>

<template>
  <section class="w-full h-[550px] md:h-100 relative overflow-hidden ">
    <div class="absolute inset-0 bg-linear-180 from-rose-red to-skin-orange"></div>
    <div class="absolute inset-0 bg-linear-135 from-transparent via-transparent to-light-green"></div>
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center gap-4 px-6 py-16">
      <h1 class="text-h1">
        Suivez vos chefs-d'œuvre page par page
      </h1>
      <p class="text-h3">
        Organisez votre bibliothèque de livres de coloriage, suivez votre progression et découvrez le réalisations de la communauté.
      </p>
      <div class="flex justify-center gap-4">
        <AppButton :to="{name: 'books'}" theme="rose-red" title="Voir les livres">Voir les livres</AppButton>
        <AppButton :to="{name: 'libraries'}" theme="dark-navy" title="Voir les trackers">Voir les trackers</AppButton>
      </div>
    </div>
  </section>
  <section>
    
  </section>
</template>
