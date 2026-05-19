import { describe, it, expect, vi } from 'vitest'

vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { editProfileSchema } from '../../app/components/Form/editProfileSchema'

const createMockFile = (name: string, sizeInBytes: number, mimeType: string): File => {
  const file = new File([''], name, { type: mimeType })
  Object.defineProperty(file, 'size', { value: sizeInBytes, writable: false })
  return file
}

describe('editProfileSchema', () => {

  const getBaseFormPayload = () => ({
    discord_pseudonym: '',
    instagram_link: '',
    password: '',
    confirm_password: '',
    delete_avatar: 'false',
    avatar: undefined as any
  })
  
  describe('Validation des mots de passe', () => {
    it('devrait valider avec succès si aucun mot de passe n\'est fourni', () => {
      const data = {
        ...getBaseFormPayload(),
        discord_pseudonym: 'User#1234',
      }
      
      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait valider si les deux mots de passe correspondent et respectent les regex', () => {
      const data = {
        ...getBaseFormPayload(),
        password: 'ValidPassword123!',
        confirm_password: 'ValidPassword123!',
      }
      
      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait échouer si les mots de passe ne correspondent pas', () => {
      const data = {
        ...getBaseFormPayload(),
        password: 'ValidPassword123!',
        confirm_password: 'DifferentPassword123!',
      }
      
      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.format()
        expect(error.confirm_password?._errors).toContain('Les mots de passe ne correspondent pas')
      }
    })

    it('devrait échouer si le mot de passe ne respecte pas les critères (ex: pas de majuscule)', () => {
      const data = {
        ...getBaseFormPayload(),
        password: 'password123!',
        confirm_password: 'password123!',
      }
      
      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Validation de l\'avatar', () => {
    it('devrait accepter un avatar valide (1 fichier, bonne taille, bon type)', () => {
      const validFile = createMockFile('avatar.png', 1024 * 200, 'image/png') // 200KB
      const data = {
        ...getBaseFormPayload(),
        avatar: [validFile]
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait échouer si plus d\'un fichier est envoyé', () => {
      const file1 = createMockFile('avatar1.png', 1024 * 100, 'image/png')
      const file2 = createMockFile('avatar2.jpg', 1024 * 100, 'image/jpeg')
      const data = {
        ...getBaseFormPayload(),
        avatar: [file1, file2]
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.format()
        expect(error.avatar?._errors).toContain("Pas plus d'un fichier")
      }
    })

    it('devrait échouer si le fichier dépasse 512ko', () => {
      const heavyFile = createMockFile('huge.png', 1024 * 1024 * 1, 'image/png') // 1MB
      const data = {
        ...getBaseFormPayload(),
        avatar: [heavyFile]
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error: any = result.error.format()
        expect(JSON.stringify(error)).toContain('La taille ne doit pas exceder 512ko.')
      }
    })

    it('devrait échouer si le type MIME n\'est pas autorisé', () => {
      const badFile = createMockFile('document.pdf', 1024 * 100, 'application/pdf')
      const data = {
        ...getBaseFormPayload(),
        avatar: [badFile]
      }

      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error: any = result.error.format()
        expect(JSON.stringify(error)).toContain('Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP')
      }
    })
  })

  describe('Validation globale / Champs partagés', () => {
    it('devrait échouer si le lien Instagram n\'est pas une URL valide', () => {
      const data = {
        ...getBaseFormPayload(),
        instagram_link: 'pas-une-url',
      }
      
      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait transformer une chaîne vide en null pour les réseaux sociaux', () => {
      const data = {
        ...getBaseFormPayload(),
        instagram_link: '',
        discord_pseudonym: '',
      }
      
      const result = editProfileSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.instagram_link).toBeNull()
        expect(result.data.discord_pseudonym).toBeNull()
      }
    })
  })
})