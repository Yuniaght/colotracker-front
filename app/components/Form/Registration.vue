<script setup lang="ts">
</script>
<template>
  <InputText
      label="user_name"
      name="user_name"
      input-id="user_name"
      placeholder="Nom d'utilisateur">
    <label class="font-semibold text-sm block mb-2" for="lastname">Nom d'utilisateur</label>
  </InputText>
    <InputText
      label="email"
      name="email"
      input-id="email"
      placeholder="Email">
    <label class="font-semibold text-sm block mb-2" for="email">E-mail</label>
  </InputText>
    <InputText
      label="password"
      type="password"
      name="password"
      input-id="password"
      placeholder="Mot de passe">
    <label class="font-semibold text-sm block mb-2" for="email">Mot de passe</label>
  </InputText>
  <InputMultipleFile
      input-id="avatar"
      placeholder="avatar"
      name="avatar">
    <label class="font-semibold text-sm block mb-2" for="motivation">Avatar</label>

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
    <button type="submit">S'inscrire</button>
</template>
<style scoped>
</style>