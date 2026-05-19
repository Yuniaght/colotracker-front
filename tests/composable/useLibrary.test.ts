import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useLibrary } from '../../app/composables/useLibrary'

vi.stubGlobal('ref', ref)

const mockUser = ref<{ id: string } | null>({ id: 'user-123' })
vi.stubGlobal('useDirectusUser', () => mockUser)

const mockRequest = vi.fn()
const mockReadItems = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.stubGlobal('useNuxtApp', () => ({
  $directus: { request: mockRequest },
  $readItems: mockReadItems,
  $toast: { success: mockToastSuccess, error: mockToastError }
}))

vi.mock('@directus/sdk', () => ({
  createItem: vi.fn(),
  deleteItem: vi.fn()
}))


describe('Composable: useLibrary', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = { id: 'user-123' }
  })

  describe('handleAddBook()', () => {
    it('doit s\'interrompre si l\'utilisateur n\'est pas connecté', async () => {
      mockUser.value = null
      const { handleAddBook, isPending } = useLibrary()

      await handleAddBook('book-1')

      expect(mockRequest).not.toHaveBeenCalled()
      expect(isPending.value).toBe(false)
    })

    it('doit ouvrir la modale de confirmation si le livre est DÉJÀ dans la bibliothèque', async () => {
      mockRequest.mockResolvedValueOnce([{ id: 'existing-record' }])
      
      const { handleAddBook, isConfirmModalOpen } = useLibrary()

      await handleAddBook('book-1')

      expect(isConfirmModalOpen.value).toBe(true)
      expect(mockToastSuccess).not.toHaveBeenCalled()
    })

    it('doit créer le livre si aucun doublon n\'est trouvé', async () => {
      mockRequest.mockResolvedValueOnce([]) 
      mockRequest.mockResolvedValueOnce({ id: 'new-record' }) 
      
      const { handleAddBook, isConfirmModalOpen } = useLibrary()

      await handleAddBook('book-2')

      expect(isConfirmModalOpen.value).toBe(false)
      expect(mockToastSuccess).toHaveBeenCalledWith('Livre ajouté à votre bibliothèque !')
    })

    it('EDGE CASE : doit libérer isPending même si la création échoue (bloc finally)', async () => {
      mockRequest.mockResolvedValueOnce([]) 
      mockRequest.mockRejectedValueOnce(new Error('Network Crash'))
      
      const { handleAddBook, isPending } = useLibrary()

      await handleAddBook('book-fail')

      expect(mockToastError).toHaveBeenCalledWith("Erreur lors de l'ajout")
      expect(isPending.value).toBe(false)
    })
  })

  describe('handleModalConfirm()', () => {
    it('doit exécuter la création et fermer la modale', async () => {
      mockRequest.mockResolvedValueOnce([{ id: 'existing-record' }]) 
      mockRequest.mockResolvedValueOnce({ id: 'new-record' }) 
      
      const { handleAddBook, handleModalConfirm, isConfirmModalOpen } = useLibrary()
      
      await handleAddBook('book-3')
      expect(isConfirmModalOpen.value).toBe(true)

      await handleModalConfirm()

      expect(mockToastSuccess).toHaveBeenCalledWith('Livre ajouté à votre bibliothèque !')
      expect(isConfirmModalOpen.value).toBe(false)
    })
  })

  describe('confirmDelete()', () => {
    it('doit ouvrir la modale de suppression', () => {
      const { confirmDelete, isDeleteModalOpen } = useLibrary()

      confirmDelete('record-99')

      expect(isDeleteModalOpen.value).toBe(true)
    })

    it('EDGE CASE : doit accepter un ID numérique sans altérer le comportement', () => {
      const { confirmDelete, isDeleteModalOpen } = useLibrary()

      confirmDelete(42)

      expect(isDeleteModalOpen.value).toBe(true)
    })
  })

  describe('executeDeletion()', () => {
    it('doit s\'interrompre si confirmDelete n\'a pas été appelé avant', async () => {
      const { executeDeletion, isPending } = useLibrary()
      
      await executeDeletion('library')
      
      expect(mockRequest).not.toHaveBeenCalled()
      expect(isPending.value).toBe(false)
    })

    it('doit appeler l\'API et fermer la modale en cas de succès avec callback', async () => {
      const onSuccessSpy = vi.fn()
      mockRequest.mockResolvedValueOnce(true)
      
      const { confirmDelete, executeDeletion, isDeleteModalOpen } = useLibrary()
      
      confirmDelete('record-99') 
      expect(isDeleteModalOpen.value).toBe(true)

      await executeDeletion('library', onSuccessSpy)

      expect(mockToastSuccess).toHaveBeenCalledWith("L'objet a été supprimé de votre compte")
      expect(onSuccessSpy).toHaveBeenCalled()
      expect(isDeleteModalOpen.value).toBe(false)
    })

    it('EDGE CASE : doit fonctionner correctement même sans fournir de fonction onSuccess (callback absent)', async () => {
      mockRequest.mockResolvedValueOnce(true)
      
      const { confirmDelete, executeDeletion, isDeleteModalOpen } = useLibrary()
      
      confirmDelete('record-100') 

      await executeDeletion('library')

      expect(mockToastSuccess).toHaveBeenCalledWith("L'objet a été supprimé de votre compte")
      expect(isDeleteModalOpen.value).toBe(false)
    })

    it('doit afficher une erreur en cas d\'échec API, mais fermer la modale (finally)', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Erreur API'))
      
      const { confirmDelete, executeDeletion, isDeleteModalOpen, isPending } = useLibrary()
      
      confirmDelete('record-99')

      await executeDeletion('library')

      expect(mockToastError).toHaveBeenCalledWith("Erreur lors de la suppression")
      expect(isDeleteModalOpen.value).toBe(false)
      expect(isPending.value).toBe(false)
    })
  })
})