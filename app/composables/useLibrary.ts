import { createItem, deleteItem } from "@directus/sdk"

export const useLibrary = () => {
  const { $directus, $readItems } = useNuxtApp()
  const user = useDirectusUser()
  

  const isConfirmModalOpen = ref(false)
  const bookToProcess = ref<string | null>(null)
  const isPending = ref(false)
  const isDeleteModalOpen = ref(false)
  const itemToDelete = ref<string | number | null>(null)

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

  function confirmDelete(libraryId: string | number) {
    itemToDelete.value = libraryId
    isDeleteModalOpen.value = true
  }

  async function executeDeletion(collection, onSuccess?: () => void) {
    if (!itemToDelete.value) return
    
    const { $toast } = useNuxtApp()
    isPending.value = true
    try {
      await $directus.request(deleteItem(collection, itemToDelete.value))
      $toast.success('L\'objet a été supprimé de votre compte')
      if (onSuccess) await onSuccess()
    } catch (e) {
      $toast.error("Erreur lors de la suppression")
      console.error(e)
    } finally {
      isPending.value = false
      isDeleteModalOpen.value = false
      itemToDelete.value = null
    }
  }

  function handleModalConfirm() {
    if (bookToProcess.value) {
      executeCreation(bookToProcess.value)
      isConfirmModalOpen.value = false
      bookToProcess.value = null
    }
  }

  return {
    handleAddBook,
    handleModalConfirm,
    confirmDelete,      
    executeDeletion,    
    isConfirmModalOpen,
    isDeleteModalOpen, 
    isPending
  }
}