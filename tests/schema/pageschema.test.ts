// tests/schemas/pageSchema.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { addPageSchema, editPageSchema } from '../../app/components/Form/PageSchema'

const createMockFile = (name: string, sizeInBytes: number, mimeType: string): File => {
  const file = new File([''], name, { type: mimeType })
  Object.defineProperty(file, 'size', { value: sizeInBytes, writable: false })
  return file
}

describe('Schemas: Add & Edit Page (Factories)', () => {
  const validFile = createMockFile('page1.png', 1024 * 200, 'image/png') // 200KB
  const maxPageValue = 50

  // Contient tous les champs requis par pagePartial
  const getBasePayload = (pageNumber: number) => ({
    page_number: pageNumber,
    date_finished: '2026-05-19', // Date valide, non future
    detailed_info: 'Ma superbe mise en couleur aux crayons de couleur.'
  })

  describe('addPageSchema', () => {
    const schema = addPageSchema(maxPageValue)

    it('devrait valider un payload d’ajout complet et correct', () => {
      const data = {
        ...getBasePayload(12),
        image: [validFile]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait échouer si le numéro de page dépasse le max_page autorisé', () => {
      const data = {
        ...getBasePayload(51),
        image: [validFile]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si la date_finished est dans le futur', () => {
      const data = {
        ...getBasePayload(12),
        date_finished: '2030-01-01', // Date future par rapport à mai 2026
        image: [validFile]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si l’image est absente lors de l’ajout', () => {
      const data = {
        ...getBasePayload(1),
        image: []
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().image?._errors).toContain("Vous devez donner la page de couverture")
      }
    })

    it('devrait échouer si le fichier dépasse 512ko', () => {
      const heavyFile = createMockFile('huge.png', 1024 * 600, 'image/png')
      const data = {
        ...getBasePayload(1),
        image: [heavyFile]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(JSON.stringify(result.error.format())).toContain("Fichier trop volumineux. Limite : 512Ko")
      }
    })
  })

  describe('editPageSchema', () => {
    const schema = editPageSchema(maxPageValue)

    it('devrait valider une édition complète avec une nouvelle image', () => {
      const data = {
        ...getBasePayload(5),
        image: [validFile]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait valider si on change le numéro de page sans renvoyer d’image', () => {
      const data = {
        ...getBasePayload(6),
        image: undefined
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.image).toEqual([])
      }
    })

    it('devrait échouer si plus d’un fichier est envoyé lors de la modification', () => {
      const file1 = createMockFile('p1.jpg', 10000, 'image/jpeg')
      const file2 = createMockFile('p2.jpg', 10000, 'image/jpeg')
      const data = {
        ...getBasePayload(6),
        image: [file1, file2]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().image?._errors).toContain("Pas plus d'un fichier")
      }
    })

    it('devrait échouer si le type de fichier n’est pas accepté', () => {
      const badFile = createMockFile('malveillant.exe', 5000, 'application/x-msdownload')
      const data = {
        ...getBasePayload(6),
        image: [badFile]
      }
      const result = schema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(JSON.stringify(result.error.format())).toContain("Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP")
      }
    })
  })
})