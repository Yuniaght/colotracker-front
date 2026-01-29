<template>
  <div>
    <form @submit.prevent="register">
      <h1>S'inscrire</h1>
      <div v-if="result">
        <p>Successfully registered</p>
      </div>
      <div>
        <label for="Email">Votre Email</label>
        <input required type="text" v-model="email" name="email" placeholder="Email" />
      </div>
      <div>
        <label for="password">Votre mot de passe</label>
        <input required type="password" v-model="password" name="password" placeholder="Mot de passe" />
      </div>
      <button type="submit">S'inscrire</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const { $directus, $registerUser } = useNuxtApp()

const email = ref('')
const password = ref('')
const result = ref(false)

const register = async () => {
  try {
    await $directus.request($registerUser(email.value, password.value))
    result.value = true
    password.value = ''
  } catch (error) {
    console.error(error)
    result.value = false
    password.value = ''
  }
}
</script>