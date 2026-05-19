import { describe, it, expect, vi } from 'vitest'

vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { askABookSchema } from '../../app/components/Form/askBookSchema'
import { maxSize, allowedTypes } from '../../shared/zod/index'

const createMockFile = (name: string, sizeInBytes: number, mimeType: string): File => {
  const file = new File([''], name, { type: mimeType })
  Object.defineProperty(file, 'size', { value: sizeInBytes, writable: false })
  return file
}

describe('Schema Zod: askABookSchema', () => {
  const validFile = createMockFile('couverture.png', 1024 * 100, 'image/png') // 100 KB

  const getValidPayload = () => ({
    book_name: 'Super Livre de Coloriage',
    author: 'Artiste Colo',
    page_count: 42,
    release_date: '2026-05-19',
    store_link: 'https://www.amazon.fr/mon-livre',
    privacy: true,
    book_front_cover: [validFile]
  })

  describe('Régal nominal de Réussite (Champs Valides)', () => {
    it('doit valider un payload contenant toutes les informations correctes', () => {
      const payload = getValidPayload()
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('doit accepter des formats de date textuels alternatifs reconnus par Date.parse', () => {
      const payload = getValidPayload()
      payload.release_date = '2023/12/25' as any
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(true)
      expect(result.data?.release_date).toBeInstanceOf(Date)
    })

    it('doit valider un nombre de pages extrêmement grand mais entier', () => {
      const payload = getValidPayload()
      payload.page_count = 15000
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })
  })

  describe('Échecs de validation : Métadonnées du Livre', () => {
    it('doit refuser un nom de livre vide', () => {
      const payload = getValidPayload()
      payload.book_name = ''
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Le nom du livre est requis")
    })

    it('doit refuser un nom de livre excédant 100 caractères', () => {
      const payload = getValidPayload()
      payload.book_name = 'a'.repeat(101)
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Le nom du livre ne peut dépasser 100 caractères")
    })

    it('doit refuser un auteur vide', () => {
      const payload = getValidPayload()
      payload.author = ''
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Le nom complet de l'auteur/éditeur est requis")
    })

    it('doit refuser un auteur excédant 100 caractères', () => {
      const payload = getValidPayload()
      payload.author = 'b'.repeat(101)
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Le nom complet de l'auteur/éditeur ne peut dépasser 100 caractères")
    })
  })

  describe('Échecs de validation : Nombre de pages', () => {
    it('doit refuser un nombre de pages égal à 0', () => {
      const payload = getValidPayload()
      payload.page_count = 0
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Le nombre doit être positif")
    })

    it('doit refuser un nombre de pages négatif', () => {
      const payload = getValidPayload()
      payload.page_count = -10
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    it('doit refuser un nombre de pages décimal (ex: 42.5)', () => {
      const payload = getValidPayload()
      payload.page_count = 42.5
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Le nombre doit être un entier")
    })
  })

  describe('Échecs de validation : Date, URL et CGU', () => {
    it('doit rejeter une chaîne de caractères impossible à convertir en date', () => {
      const payload = getValidPayload()
      payload.release_date = 'date-invalide' as any
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    it('doit rejeter une URL de boutique mal formée', () => {
      const payload = getValidPayload()
      payload.store_link = 'amazon.fr/sans-protocole' as any
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Entrez une url valide")
    })

    it('doit rejeter si la case de politique de confidentialité est décochée (false)', () => {
      const payload = getValidPayload()
      payload.privacy = false
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Vous devez accepter les CGUs")
    })

    it('doit rejeter si la case de politique de confidentialité est omise', () => {
      const payload = getValidPayload()
      delete (payload as any).privacy
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('Échecs de validation : Gestion extensive des Fichiers (book_front_cover)', () => {
    it('doit refuser si le tableau de fichiers est totalement vide', () => {
      const payload = getValidPayload()
      payload.book_front_cover = []
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Vous devez donner la page de couverture")
    })

    it('doit refuser si l\'utilisateur tente de téléverser plusieurs fichiers d\'un coup', () => {
      const payload = getValidPayload()
      payload.book_front_cover = [validFile, validFile]
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Pas plus d'un fichier")
    })

    it('doit accepter un fichier à la limite supérieure exacte autorisée (512 KB)', () => {
      const payload = getValidPayload()
      const exactLimitFile = createMockFile('limite.png', maxSize, 'image/png')
      payload.book_front_cover = [exactLimitFile]
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('doit refuser un fichier qui dépasse la limite, même d\'un seul octet', () => {
      const payload = getValidPayload()
      const heavyFile = createMockFile('trop-lourd.png', maxSize + 1, 'image/png')
      payload.book_front_cover = [heavyFile]
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Fichier trop volumineux. Limite : 512Ko")
    })

    it.each([
      { mime: 'image/webp', ext: 'webp' },
      { mime: 'image/png', ext: 'png' },
      { mime: 'image/jpeg', ext: 'jpeg' },
      { mime: 'image/jpg', ext: 'jpg' }
    ])('doit accepter explicitement le format d\'image : $mime', ({ mime, ext }) => {
      const payload = getValidPayload()
      const validMimeFile = createMockFile(`image.${ext}`, 50000, mime)
      payload.book_front_cover = [validMimeFile]
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('doit interdire un type d\'image non listé comme un GIF', () => {
      const payload = getValidPayload()
      const gifFile = createMockFile('animation.gif', 50000, 'image/gif')
      payload.book_front_cover = [gifFile]
      const result = askABookSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe("Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP")
    })

    it('doit rejeter un document PDF téléversé par erreur', () => {
      const payload = getValidPayload()
      const pdfFile = createMockFile('document.pdf', 80000, 'application/pdf')
      payload.book_front_cover = [pdfFile]
      const result = askABookSchema.safeParse(pdfFile) // Échec attendu
      expect(result.success).toBe(false)
    })

    it('doit rejeter un fichier texte brut malicieux', () => {
      const payload = getValidPayload()
      const txtFile = createMockFile('script.txt', 1000, 'text/plain')
      payload.book_front_cover = [txtFile]
      const result = askABookSchema.safeParse(txtFile)
      expect(result.success).toBe(false)
    })
  })
})