<script setup lang="ts">
import {serialize} from 'object-to-formdata'
import {toTypedSchema} from "@vee-validate/zod";
import {editProfileSchema, type editProfileValues} from '~/components/Form/editProfileSchema'

const { $toast, $fetchUser } = useNuxtApp()
const user = useDirectusUser()

const validationSchema = toTypedSchema(editProfileSchema)

const { values: formValues, handleSubmit, setErrors, meta } = useForm<editProfileValues>({
  initialValues: {
    discord_pseudonym: user.value.discord_pseudonym || null,
    instagram_link: user.value.instagram_link || null,
    password: null,
    confirm_password: null,
    delete_avatar: false,
    avatar: []
  },
  validationSchema: validationSchema
})


const submitForm = handleSubmit(async (values) => {
  if (!meta.value.dirty) {
    $toast.error("Vous n'avez modifié aucune information")
    return
  }
  try {

    const payloadBody = (values.avatar && values.avatar.length > 0)
        ? serialize({ ...values, id: user.value.id })
        : { ...values, id: user.value.id }
    
    await $fetch('/api/editprofile', {
      method: 'POST',
      body: payloadBody
    })

    if (values.password) {
      user.value = null
      $toast.success("Mot de passe modifié. Veuillez vous reconnecter.")
      navigateTo({ name: 'login' })
      return 
    }

    await $fetchUser(true)
    $toast.success("Vos informations ont été modifiée avec succès")
    navigateTo({ name : 'profile' })

  } catch (e: any) {
    if (e.data?.data) {
       setErrors(e.data.data)
    }
    $toast.error("Une erreur est survenue")
  }

}) 
</script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <div class="pb-6">
      <AppLink :to="{ name: 'profile' }">⬅ Retour au profil</AppLink>
    </div>
    <form @submit.prevent="submitForm" class="bg-pure-white rounded-2xl shadow-sm mx-auto max-w-3xl p-12">
      <h1 class="text-h1 text-center pb-2">Modifier mon profil</h1>
      <p class="text-center pb-6">Mettez à jour vos informations personnelles et votre mot de passe</p>
      <FormEditProfile>
        <template #profilePicture>
          <div class="w-32">
            <div class="w-32 h-32 rounded-full pb-1 border-2 mx-auto border-skin-orange overflow-clip">
              <nuxt-picture v-if="user?.avatar != null" provider="directus" :src="`${user?.avatar.id}/${user?.avatar.filename_download}`" :alt="user?.avatar.title" />
              <nuxt-picture v-else src="/img/defaultavatar.jpg" alt="avatar par défaut" />
            </div>
            <div v-show="user.avatar && formValues.avatar?.length === 0" class="mt-4 flex items-center gap-2">
              <InputCheckbox
                label="politique de confidentialité"
                name="delete_avatar"
                checked-value="true"
                class="text-center">
                  Supprimer votre avatar
                </InputCheckbox>
            </div>
          </div>
        </template>
      </FormEditProfile>

      <AppButton theme="dark-navy" type="submit">Modifier mes informations</AppButton>
    </form>
  </section>
</template>
<style scoped></style>