// tests/schemas/registrationSchema.test.ts
import { describe, it, expect, vi } from 'vitest'

// Interception de l'alias Nuxt pour pointer vers le fichier physique partagé
vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { registrationSchema } from '../../app/components/Form/registrationSchema'

// Helper pour simuler un VRAI objet File natif
const createMockFile = (name: string, sizeInBytes: number, mimeType: string): File => {
  const file = new File([''], name, { type: mimeType })
  Object.defineProperty(file, 'size', { value: sizeInBytes, writable: false })
  return file
}

describe('Schema Zod: registrationSchema', () => {
  const validFile = createMockFile('avatar.webp', 1024 * 150, 'image/webp') // 150KB

  // Fournit un payload valide pour satisfaire registerPartial
  const getValidPayload = () => ({
    user_name: 'ArtisteColo',
    password: 'Password123!',
    email: 'artiste@colotracker.com',
    privacy: true,
    avatar: undefined as any
  })

  describe('Cas de Réussite (Payloads Valides)', () => {
    it('devrait valider une inscription complète et correcte sans avatar', () => {
      const data = getValidPayload()
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait valider une inscription complète avec un avatar conforme', () => {
      const data = {
        ...getValidPayload(),
        avatar: [validFile]
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Validation du nom d’utilisateur (user_name)', () => {
    it('devrait échouer si le nom d’utilisateur est trop court', () => {
      const data = {
        ...getValidPayload(),
        user_name: 'abc' // 3 caractères, minimum 4 requis
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().user_name?._errors).toContain("Votre nom utilisateur doit comprendre au moins 4 caractères")
      }
    })

    it('devrait échouer si le nom d’utilisateur dépasse 100 caractères', () => {
      const data = {
        ...getValidPayload(),
        user_name: 'a'.repeat(101)
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Validation de la complexité du Mot de passe', () => {
    it('devrait échouer si le mot de passe ne contient pas de majuscule', () => {
      const data = {
        ...getValidPayload(),
        password: 'password123!'
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().password?._errors).toContain("Doit contenir une majuscule")
      }
    })

    it('devrait échouer si le mot de passe ne contient pas de caractère spécial', () => {
      const data = {
        ...getValidPayload(),
        password: 'Password123'
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().password?._errors).toContain("Doit contenir un caractère spécial")
      }
    })
  })

  describe('Validation de l’Email et des CGUs', () => {
    it('devrait échouer si l’email n’a pas un format valide', () => {
      const data = {
        ...getValidPayload(),
        email: 'pas-un-email.com'
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si les CGUs ne sont pas acceptées', () => {
      const data = {
        ...getValidPayload(),
        privacy: false
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().privacy?._errors).toContain("Vous devez accepter les CGUs")
      }
    })
  })

  describe('Validation de l’Avatar', () => {
    it('devrait échouer si le fichier dépasse 512ko', () => {
      const heavyFile = createMockFile('too-heavy.jpg', 1024 * 600, 'image/jpeg') // 600KB
      const data = {
        ...getValidPayload(),
        avatar: [heavyFile]
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(JSON.stringify(result.error.format().avatar)).toContain("Fichier trop volumineux. Limite : 512Ko")
      }
    })

    it('devrait échouer si plus d’un fichier est envoyé', () => {
      const file1 = createMockFile('a1.png', 10000, 'image/png')
      const file2 = createMockFile('a2.png', 10000, 'image/png')
      const data = {
        ...getValidPayload(),
        avatar: [file1, file2]
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().avatar?._errors).toContain("Pas plus d'un fichier")
      }
    })

    it('devrait échouer si le type MIME n’est pas autorisé', () => {
      const badFile = createMockFile('presentation.pptx', 50000, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
      const data = {
        ...getValidPayload(),
        avatar: [badFile]
      }
      const result = registrationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})