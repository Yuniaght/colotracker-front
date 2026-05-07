<script setup lang="ts">
</script>
<template>
  <div class="flex flex-col md:flex-row items-center gap-6 pb-6 mb-6border-b-2 border-dark-navy/20">
    <slot name="profilePicture" />
    <InputMultipleFile
      input-id="image"
      placeholder="image"
      name="avatar"
      class="grow">
    <label class="font-semibold block mb-2" for="image">Photo de profil</label>

    <template #footer>
      <p class="italic">Formats autorisés : webp, png, jpg, jpeg</p>
      <p class="italic">Taille max : 512ko</p>
    </template>
  </InputMultipleFile>
  </div>
  <div class="flex flex-col md:flex-row gap-6 pb-6 mb-6border-b-2 border-dark-navy/20">
    <InputText
      class="w-full"
      label="discord_pseudonym"
      name="discord_pseudonym"
      input-id="discord_pseudonym"
      placeholder="felixfelicis">
      <label class="font-semibold block mb-2" for="discord_pseudonym">Pseudo Discord</label>
    </InputText>
    <InputText
      class="w-full"
      label="instagram_link"
      name="instagram_link"
      input-id="instagram_link"
      placeholder="https://www.instagram.com/...">
      <label class="font-semibold block mb-2" for="instagram_link">Lien instagram</label>
    </InputText>
  </div>
  <div class="pb-6">
    <h3 class="text-h3">Sécurité</h3>
    <div class="flex flex-col md:flex-row gap-6">
      <InputText
        class="w-full"
        label="password"
        name="password"
        input-id="password"
        type="password"
        placeholder="••••••••">
        <label class="font-semibold block mb-2" for="password">Mot de passe</label>
      </InputText>
      <InputText
        class="w-full"
        label="confirm_password"
        name="confirm_password"
        input-id="confirm_password"
        type="password"
        placeholder="••••••••">
        <label class="font-semibold block mb-2" for="confirm_password">Confirmer le mot de passe</label>
      </InputText>
    </div>
  </div>
</template>
<style scoped></style>