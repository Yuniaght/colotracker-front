import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed } from 'vue'
import { useTrackersStats } from '../../app/composables/useTrackersStats'

const mockRequest = vi.fn()
const mockReadItems = vi.fn((collection, query) => ({ collection, query }))

vi.stubGlobal('useNuxtApp', () => ({
  $directus: { request: mockRequest },
  $readItems: mockReadItems
}))

vi.stubGlobal('useLazyAsyncData', async (key: string, handler: Function, options: any) => {
  const result = await handler()
  return { data: result, pending: false, error: null }
})

vi.stubGlobal('computed', computed)

describe('Composable: useTrackersStats', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Requête API et Filtrage', () => {
    it('doit appeler Directus avec le bon ID utilisateur et la bonne collection', async () => {
      mockRequest.mockResolvedValueOnce([])
      await useTrackersStats('user-123', 'pseudo-test')
      expect(mockReadItems).toHaveBeenCalledWith('library', {
        fields: ['id', 'book.page_count', 'completed_pages.id'],
        filter: {
          user: {
            _eq: 'user-123'
          }
        }
      })
      expect(mockRequest).toHaveBeenCalled()
    })
  })

  describe('Calcul des Statistiques (Reduce)', () => {
    it('doit calculer correctement avec des données complètes et valides', async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 1, book: { page_count: 50 }, completed_pages: [1, 2, 3] },   
        { id: 2, book: { page_count: 100 }, completed_pages: [4] },
      ])

      const { data } = await useTrackersStats('user-123', 'pseudo-test') as any

      expect(data).toEqual({
        bookCount: 2,
        totalPages: 150,
        completedPagesCount: 4
      })
    })

    it('doit renvoyer des zéros si l\'utilisateur n\'a aucun livre (tableau vide)', async () => {
      mockRequest.mockResolvedValueOnce([])

      const { data } = await useTrackersStats('user-123', 'pseudo-test') as any

      expect(data).toEqual({
        bookCount: 0,
        totalPages: 0,
        completedPagesCount: 0
      })
    })

    it('doit ignorer les erreurs si un livre n\'a pas de paramètre "page_count"', async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 1, book: {}, completed_pages: [1, 2] }
      ])

      const { data } = await useTrackersStats('user-123', 'pseudo-test') as any

      expect(data).toEqual({
        bookCount: 1,
        totalPages: 0, 
        completedPagesCount: 2
      })
    })

    it('doit ignorer les erreurs si la liste "completed_pages" est vide ou manquante', async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 1, book: { page_count: 30 } },
        { id: 2, book: { page_count: 20 }, completed_pages: [] }
      ])

      const { data } = await useTrackersStats('user-123', 'pseudo-test') as any

      expect(data).toEqual({
        bookCount: 2,
        totalPages: 50,
        completedPagesCount: 0 
      })
    })

    it('doit gérer correctement un item sans objet "book" (Donnée corrompue)', async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 1, book: null, completed_pages: [1] }
      ])

      const { data } = await useTrackersStats('user-123', 'pseudo-test') as any

      expect(data).toEqual({
        bookCount: 0,
        totalPages: 0,
        completedPagesCount: 1
      })
    })
  })
})