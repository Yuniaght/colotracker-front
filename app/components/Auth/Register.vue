<script setup lang="ts">
import { serialize } from 'object-to-formdata'
import { toTypedSchema } from "@vee-validate/zod"
import { registrationSchema, type RegistrationFormValues } from '~/components/Form/registrationSchema'

const emit = defineEmits(['switch'])
const { $toast } = useNuxtApp()

const registrationStatus = ref<{ type: 'idle' | 'success' | 'error', message?: string }>({ type: 'idle' })
const validationSchema = toTypedSchema(registrationSchema)

const { handleSubmit, resetForm, setErrors } = useForm<RegistrationFormValues>({
    validationSchema
})

const { executeRecaptcha } = useGoogleRecaptcha()
const isLoading = ref(false)

const submitForm = handleSubmit(async (values) => {
    isLoading.value = true
    let res: Awaited<ReturnType<typeof executeRecaptcha>> | null = null
    registrationStatus.value = { type: 'idle' }

    try {
        res = await executeRecaptcha('form')

        if (!res || !res.token) {
            $toast.error('Résolution du captcha échouée, veuillez réessayer.')
            isLoading.value = false
            return
        }

        const payloadBody = (values.avatar && values.avatar.length > 0)
            ? serialize({ ...values, token: res.token })
            : { ...values, token: res.token }
        
        const response = await $fetch('/api/register', {
            method: 'POST',
            body: payloadBody
        })

        registrationStatus.value = { 
            type: 'success', 
            message: response.message || "Inscription réussie ! Vérifiez vos e-mails pour activer votre compte." 
        }

        resetForm()

    } catch (e: any) {
        const errorMessage = e.data?.message || "Une erreur inattendue est survenue."
        registrationStatus.value = { type: 'error', message: errorMessage }
        
        if (e.data?.data) {
            setErrors(e.data.data)
        }
    } finally {
        isLoading.value = false
    }
}) 
</script>

<template>
    <div>
        <h2 class="text-2xl font-bold text-dark-navy mb-6 text-center">Créer un compte</h2>

        <div v-if="registrationStatus.type === 'success'" class="mb-6 text-center">
            <div class="p-4 mb-4 text-emerald-blue bg-light-green/20 rounded-md border border-light-green/50">
                <p class="font-medium">{{ registrationStatus.message }}</p>
            </div>
            <button @click="emit('switch', 'login')" class="w-full bg-dark-navy text-pure-white py-2 rounded-md hover:opacity-90 transition-opacity font-semibold">
                Retour à la connexion
            </button>
        </div>
        
        <div v-else>
            <div v-if="registrationStatus.type === 'error'" class="mb-4 p-3 text-rose-red bg-skin-orange/20 rounded-md border border-skin-orange/50 text-sm font-medium">
                <p>{{ registrationStatus.message }}</p>
            </div>

            <form @submit.prevent="submitForm">
                <FormRegistration />
                
                <button 
                    type="submit" 
                    :disabled="isLoading"
                    class="w-full bg-rose-red text-pure-white font-semibold py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-70 mt-6"
                >
                    {{ isLoading ? 'Création en cours...' : 'S\'inscrire' }}
                </button>
            </form>

            <div class="mt-6 text-center text-sm text-dark-navy">
                Vous avez déjà un compte ? 
                <button type="button" @click="emit('switch', 'login')" class="font-bold text-emerald-blue hover:underline">
                    Se connecter
                </button>
            </div>
        </div>
    </div>
</template>