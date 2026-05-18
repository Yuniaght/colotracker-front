<script setup lang="ts">
const { $directus } = useNuxtApp()
const router = useRouter()

const emit = defineEmits(['switch', 'success'])

const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const isLoading = ref(false)

const login = async () => {
    isLoading.value = true
    errorMsg.value = null

    try {
        await $directus.login({ email: email.value, password: password.value })
        
        emit('success')
        router.push('/profile')

    } catch (error: any) {
        try {
            const { status } = await $fetch('/api/auth/checkstatus', {
                method: 'POST',
                body: { email: email.value }
            })

            if (status === 'suspended') {
                errorMsg.value = "Votre compte a été suspendu par un administrateur."
            } else if (status === 'unverified') {
                errorMsg.value = "Votre compte n'est pas encore activé. Veuillez vérifier vos e-mails."
            } else {
                errorMsg.value = "Email ou mot de passe incorrect."
            }
        } catch (checkError) {
            errorMsg.value = "Email ou mot de passe incorrect."
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div>
        <h2 class="text-2xl font-bold text-dark-navy mb-6 text-center">Connexion</h2>
        
        <div v-if="errorMsg" class="mb-4 p-3 rounded-md bg-skin-orange/20 text-rose-red text-sm font-medium border border-skin-orange/50">
            {{ errorMsg }}
        </div>

        <form @submit.prevent="login" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-dark-navy mb-1">Email</label>
                <input 
                    required 
                    type="email" 
                    v-model="email" 
                    placeholder="votre@email.com" 
                    class="w-full px-4 py-2 border border-dark-navy/20 rounded-md focus:border-dark-navy focus:ring focus:ring-dark-navy/10 outline-none transition-colors text-dark-navy"
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-dark-navy mb-1">Mot de passe</label>
                <input 
                    required 
                    type="password" 
                    v-model="password" 
                    placeholder="••••••••" 
                    class="w-full px-4 py-2 border border-dark-navy/20 rounded-md focus:border-dark-navy focus:ring focus:ring-dark-navy/10 outline-none transition-colors text-dark-navy"
                />
            </div>

            <div class="flex justify-end">
                <button type="button" @click="emit('switch', 'forgotPassword')" class="text-sm text-emerald-blue hover:underline">
                    Mot de passe oublié ?
                </button>
            </div>

            <AppButton 
                type="submit" 
                :disabled="isLoading"
                theme="dark-navy"
                class="w-full"
            >
                {{ isLoading ? 'Connexion...' : 'Se connecter' }}
            </AppButton>
        </form>

        <div class="mt-6 text-center text-sm text-dark-navy">
            Pas encore de compte ? 
            <button @click="emit('switch', 'register')" class="font-bold text-rose-red hover:underline">
                S'inscrire
            </button>
        </div>
    </div>
</template>