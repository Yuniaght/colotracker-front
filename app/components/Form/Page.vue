<script setup lang="ts">
defineProps<{
  max_page: number
}>()
</script>
<template>
  <InputText
      class="w-full"
      label="page_number"
      name="page_number"
      input-id="page_number"
      type="number"
      :max="max_page"
      placeholder="ex: 1,2,3,...">
    <label class="font-semibold block mb-2" for="page_number">N° de la page</label>
  </InputText>
  <InputText
      class="w-full"
      label="date_finished"
      name="date_finished"
      input-id="date_finished"
      placeholder="25-02-2026"
      type="date">
    <label class="font-semibold block mb-2" for="date_finished">Date de réalisation</label>
  </InputText>
  <InputTextArea
      label="detailed_info"
      name="detailed_info"
      input-id="detailed_info"
      placeholder="Informations détaillées : Détails, avis, matériel utilisé, etc"
      >
    <label class="font-semibold block mb-2" for="detailed_info">Informations détaillées sur le coloriage</label>
  </InputTextArea>
  <InputMultipleFile
      input-id="image"
      placeholder="image"
      name="image">
    <label class="font-semibold block mb-2" for="image">Photo du coloriage</label>

    <template #footer>
      <p class="italic">Formats autorisés : webp, png, jpg, jpeg</p>
      <p class="italic">Taille max : 512ko</p>
    </template>
  </InputMultipleFile>
  <AppButton theme="dark-navy" type="submit">Ajouter la page</AppButton>
</template>
<style scoped></style>