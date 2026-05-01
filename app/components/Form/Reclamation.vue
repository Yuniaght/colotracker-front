<script setup lang="ts"></script>
<template>
  <div class="flex flex-col md:flex-row gap-6">
    <InputText
      class="w-full"
      label="lastName"
      name="lastName"
      input-id="lastName"
      placeholder="Votre nom">
    <label class="font-semibold block mb-2" for="lastName">Nom</label>
  </InputText>
  <InputText
      class="w-full"
      label="firstName"
      name="firstName"
      input-id="firstName"
      placeholder="Votre Prénom">
    <label class="font-semibold block mb-2" for="firstName">Prénom</label>
  </InputText>
  </div>
  <InputText
      label="email"
      name="email"
      input-id="email"
      placeholder="mail@mail.com">
    <label class="font-semibold block mb-2" for="email">Email</label>
  </InputText>
  <InputText
      label="subject"
      name="subject"
      input-id="subject"
      placeholder="Objet de votre message">
    <label class="font-semibold block mb-2" for="subject">Sujet</label>
  </InputText>
  <InputText
      label="problematicUrl"
      name="problematicUrl"
      input-id="problematicUrl"
      placeholder="http://www.colotracker.be/...">
    <label class="font-semibold block mb-2" for="problematicUrl">Url Problématique</label>
  </InputText>
  <InputTextArea
      label="message"
      name="message"
      input-id="message"
      placeholder="Votre message"
      type="text">
    <label class="font-semibold block mb-2" for="message">Votre message</label>
  </InputTextArea>
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
    <AppButton theme="dark-navy" type="submit" class="w-full md:w-fit">Envoyer le message</AppButton>
</template>
<style scoped></style>