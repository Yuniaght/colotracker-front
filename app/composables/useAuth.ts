export const useAuth = () => {
  const { $directus } = useNuxtApp()

  const email = ref('')
  const password = ref('')
  const result = ref(false)

  const login = async (email: string, password: string) => {
    const response = await $directus.login({ email: email, password: password }, {mode: 'session'})
  }

  return { login }
}