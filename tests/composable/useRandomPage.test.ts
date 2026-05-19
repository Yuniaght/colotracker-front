import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useRandomPage } from '../../app/composables/useRandomPage'

vi.stubGlobal('ref', ref)

const mockUser = ref<{ id: string } | null>({ id: 'user-123' })
vi.stubGlobal('useDirectusUser', () => mockUser)

const mockRequest = vi.fn()
const mockReadItems = vi.fn((collection, query) => ({ collection, query }))

vi.stubGlobal('useNuxtApp', () => ({
  $directus: { request: mockRequest },
  $readItems: mockReadItems
}))


describe('Composable: useRandomPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = { id: 'user-123' }
    
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  describe('fetchRandomPage()', () => {

    it('doit s\'interrompre immédiatement si l\'utilisateur n\'est pas connecté', async () => {
      mockUser.value = null 
      
      const { fetchRandomPage, loading, isModalOpen } = useRandomPage()
      await fetchRandomPage()

      expect(mockRequest).not.toHaveBeenCalled()
      expect(loading.value).toBe(false)
      expect(isModalOpen.value).toBe(false)
    })

    it('doit sélectionner un livre et une page non complétée (Cas nominal)', async () => {
      mockRequest.mockResolvedValueOnce([
        {
          id: 'lib-entry-1',
          book: {
            name: 'Livre de Test',
            page_count: 3,
            front_cover: { id: 'img-456', filename_download: 'cover.jpg', title: 'Couverture' }
          },
          completed_pages: [{ page_number: 1 }]
        }
      ])

      const { fetchRandomPage, suggestion, isModalOpen, loading } = useRandomPage()
      await fetchRandomPage()

      expect(suggestion.value).toEqual({
        title: 'Livre de Test',
        front_cover: { id: 'img-456', filename_download: 'cover.jpg', title: 'Couverture' },
        page: 2
      })
      expect(isModalOpen.value).toBe(true)
      expect(loading.value).toBe(false)

      expect(mockReadItems).toHaveBeenCalledWith('library', expect.objectContaining({
        filter: { user: { _eq: 'user-123' } }
      }))
    })

    it('EDGE CASE : ne doit rien ouvrir ni suggérer si la bibliothèque est vide', async () => {
      mockRequest.mockResolvedValueOnce([])

      const { fetchRandomPage, suggestion, isModalOpen } = useRandomPage()
      await fetchRandomPage()

      expect(suggestion.value).toBeNull()
      expect(isModalOpen.value).toBe(false)
    })

    it('EDGE CASE : ne doit rien suggérer si TOUS les livres de la bibliothèque sont déjà 100% terminés', async () => {
      mockRequest.mockResolvedValueOnce([
        {
          id: 'lib-entry-finished',
          book: { name: 'Livre Fini', page_count: 2, front_cover: null },
          completed_pages: [{ page_number: 1 }, { page_number: 2 }]
        }
      ])

      const { fetchRandomPage, suggestion, isModalOpen } = useRandomPage()
      await fetchRandomPage()

      expect(suggestion.value).toBeNull()
      expect(isModalOpen.value).toBe(false)
    })

    it('EDGE CASE : doit forcer loading à false même si l\'appel Directus crash', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Directus Network Error'))

      const { fetchRandomPage, loading, suggestion, isModalOpen } = useRandomPage()
      
      try {
        await fetchRandomPage()
      } catch (e) {

      }

      expect(loading.value).toBe(false)
      expect(suggestion.value).toBeNull()
      expect(isModalOpen.value).toBe(false)
    })
  })
})