<template>
  <div>
    <h1>Connexion</h1>
    <form @submit.prevent="handleLogin">
        <label>Email</label>
        <input 
          v-model="email" 
          type="email" 
          placeholder="votre@email.com" 
          required>
        <label>Mot de passe</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="••••••••" 
          required>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
      <p v-if="error">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth()
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);



const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    await login(email.value, password.value)
    router.push('/');
  } catch (e: any) {
    console.error(e);
    if (e.errors?.[0]?.extensions?.code === 'INVALID_CREDENTIALS') {
      error.value = "Email ou mot de passe incorrect.";
    } else {
      error.value = "Une erreur est survenue lors de la connexion.";
    }
  } finally {
    loading.value = false;
  }
};
</script>