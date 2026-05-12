<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/zod";
import {reportPageSchema, type ReportPageFormValues} from '~/components/Form/ReportPageSchema'

const validationSchema = toTypedSchema(reportPageSchema)
const { handleSubmit, setErrors, resetForm } = useForm<ReportPageFormValues>({
  validationSchema
})


const props = defineProps<{
  isOpen: boolean;
  pageId: number;
  userId: string;
}>();

const emit = defineEmits(['close']);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

const submitForm = handleSubmit(async (values) => {
  const { $toast } = useNuxtApp()
  try {
    const payloadBody = { ...values, user: props.userId, page: props.pageId }

    const response = await $fetch('/api/reportpage', {
      method: 'POST',
      body: payloadBody
    })

    $toast.success("Votre signalement à bien été reçu")
    resetForm()
    emit('close')

  } catch (e: any) {

    const errorMessage = e.data?.message || "Une erreur inattendue est survenue."
    
    if (e.data?.data) {
       setErrors(e.data.data) 
    }
    $toast.error(errorMessage)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-navy/40 backdrop-blur-sm" @click="emit('close')"></div>

        <div class="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl overflow-hidden border border-dark-navy/5">
          <h2 class="text-center text-h2 pb-4">Signalement de page</h2>
          <p class="text-center pb-4">Ce contenu vous semble inapproprié? Entrez la raison ci-dessus et après considération nous prendrons les actions appropriées</p>
          <form @submit.prevent="submitForm" class="responsive-layout">
            <FormReportPage/>
            <div class="flex gap-4">
              <AppButton class="w-full" @click="emit('close')" theme="emerald-blue">Annuler</AppButton>
              <AppButton class="w-full" type="submit" theme="rose-red">Envoyer</AppButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>