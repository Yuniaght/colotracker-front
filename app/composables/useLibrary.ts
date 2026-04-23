import { createItem } from "@directus/sdk"

export const useLibrary = () => {

  const { $directus, $readItems } = useNuxtApp()
  const user = useDirectusUser()
  const isConfirmModalOpen = ref(false)
  const bookToProcess = ref<string | null>(null)
  const isPending = ref(false)

  async function handleAddBook(bookId: string) {
    if (!user.value) return
    isPending.value = true
    try {
      const existing = await $directus.request(
        $readItems('library', {
          filter: {
            _and: [
              { user: { _eq: user.value.id } },
              { book: { _eq: bookId } }
            ]
          },
          params: { _t: Date.now() }
        })
      )

      if (existing.length > 0) {
        bookToProcess.value = bookId
        isConfirmModalOpen.value = true
      } else {
        await executeCreation(bookId)
      }
    } finally {
      isPending.value = false
    }
  }

  async function executeCreation(bookId: string) {
    const { $toast } = useNuxtApp()
    try {
      await $directus.request(
        createItem('library', {
          user: user.value.id,
          book: bookId
        })
      )
      $toast.success('Livre ajouté à votre bibliothèque !')
    } catch (e) {
      $toast.error("Erreur lors de l'ajout")
      console.error(e)
    }
  }

  function handleModalConfirm() {
    if (bookToProcess.value) {
      executeCreation(bookToProcess.value)
      isConfirmModalOpen.value = false
      bookToProcess.value = null
    } else {
      console.log("test")
    }
  }

  return {
    handleAddBook,
    handleModalConfirm,
    isConfirmModalOpen,
    isPending
  }
}
