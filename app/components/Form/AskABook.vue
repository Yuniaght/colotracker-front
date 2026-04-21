<script setup lang="ts">

</script>

<template>
  <InputText
      label="book_name"
      name="book_name"
      input-id="book_name"
      placeholder="Titre du livre">
    <label class="font-semibold block mb-2" for="book_name">Titre du livre</label>
  </InputText>
  
  <InputText
      label="author"
      name="author"
      input-id="book_author"
      placeholder="Illustrateur/Maison d'édition">
    <label class="font-semibold block mb-2" for="book_author">Auteur/Maison d'édition</label>
  </InputText>

  <InputText
      label="page_count"
      name="page_count"
      input-id="page_count"
      placeholder="Nombre de page"
      type="number">
    <label class="font-semibold block mb-2" for="page_count">Nombre de coloriage</label>
  </InputText>
  
  <InputText
      label="release_date"
      name="release_date"
      input-id="release_date"
      type="date">
    <label class="font-semibold block mb-2" for="release_date">Date de sortie</label>
  </InputText>

  <InputText
      label="store_link"
      name="store_link"
      input-id="store_link"
      placeholder="Amazon, Etsy, autre...">
    <label class="font-semibold block mb-2" for="store_link">Date de sortie</label>
  </InputText>

    <InputMultipleFile
      input-id="book_front_cover"
      placeholder="book_front_cover"
      name="book_front_cover">
    <label class="font-semibold block mb-2" for="book_front_cover">Première de couverture</label>

    <template #footer>
      <p class="italic">Formats autorisés : webp, png, jpg, jpeg</p>
    </template>
  </InputMultipleFile>
  
  <InputCheckbox
    label="politique de confidentialité"
    name="privacy"
    checked-value="true">
      J'accepte les <nuxt-link
                    title="Politique de confidentialité"
                    class="link-decoration"
                    :to="{name: 'cgu'}">
                      condition générale d'utilisation
                    </nuxt-link>
    </InputCheckbox>
    <AppButton theme="dark-navy" type="submit" class="w-full md:w-fit">S'inscrire</AppButton>
  
</template>

<style scoped>
</style>