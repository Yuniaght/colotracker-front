import { describe, it, expect, vi } from 'vitest'

vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { formSchema } from '../../app/components/Form/contactSchema'

describe('Schema Zod: contactSchema (formSchema)', () => {

  const getValidBasePayload = () => ({
    lastName: 'Dupont',
    firstName: 'Jean',
    email: 'jean.dupont@example.com',
    subject: 'Demande d’assistance',
    message: 'Bonjour, j’ai un problème avec mes statistiques.',
    privacy: true
  })

  describe('Union discriminée (Sélection du type)', () => {
    it('doit rejeter si la clé discriminante "type" est absente', () => {
      const payload = {
        ...getValidBasePayload()
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    it('doit rejeter si la clé "type" contient une valeur non autorisée', () => {
      const payload = {
        ...getValidBasePayload(),
        type: 'autre_chose'
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('Branche "message" (baseSchema)', () => {
    it('doit valider un payload de type message complet et valide', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload()
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('doit accepter un type message contenant des informations additionnelles superflues comme problematicUrl', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        problematicUrl: 'https://www.google.fr' // Devrait être ignoré ou toléré selon la politique d'union de Zod
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('doit rejeter un type message si un champ obligatoire commun est vide', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        lastName: ''
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Vous devez remplir votre nom')
    })
  })

  describe('Branche "copyright" (reclamationSchema)', () => {
    it('doit valider un payload de type copyright avec une URL Colotracker valide', () => {
      const payload = {
        type: 'copyright' as const,
        ...getValidBasePayload(),
        problematicUrl: 'https://www.colotracker.com/libraries/mon-livre'
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('doit rejeter un type copyright si problematicUrl est totalement absente', () => {
      const payload = {
        type: 'copyright' as const,
        ...getValidBasePayload()
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Veuillez entrer une url')
    })

    it('doit rejeter un type copyright si l’URL ne provient pas du domaine colotracker', () => {
      const payload = {
        type: 'copyright' as const,
        ...getValidBasePayload(),
        problematicUrl: 'https://www.amazon.fr/livre'
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Le domaine doit forcement être appartenir à colotracker')
    })

    it('doit rejeter un type copyright si un champ obligatoire commun comme le prénom est manquant', () => {
      const payload = {
        type: 'copyright' as const,
        ...getValidBasePayload(),
        problematicUrl: 'https://www.colotracker.com/page',
        firstName: ''
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Vous devez remplir votre prénom')
    })
  })

  describe('Validation extensive des contraintes partagées (zodShared)', () => {
    it('doit refuser un nom qui dépasse 100 caractères', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        lastName: 'A'.repeat(101)
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Votre nom ne peut excéder 100 caractères')
    })

    it('doit refuser un prénom qui dépasse 100 caractères', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        firstName: 'B'.repeat(101)
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Votre prénom ne peux excéder 100 caractères')
    })

    it.each([
      { email: 'bademail' },
      { email: 'user@' },
      { email: '@domain.com' },
      { email: '' }
    ])('doit rejeter les formats d’email invalides', ({ email }) => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        email
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Entrez un email valide')
    })

    it('doit refuser un sujet qui excède 300 caractères', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        subject: 'S'.repeat(301)
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Votre sujet ne peux excéder 300 caractères')
    })

    it('doit refuser un message vide', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        message: ''
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Veuillez décrire votre demande')
    })

    it('doit rejeter si la politique de confidentialité n’est pas acceptée', () => {
      const payload = {
        type: 'message' as const,
        ...getValidBasePayload(),
        privacy: false
      }
      const result = formSchema.safeParse(payload)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Vous devez accepter les CGUs')
    })
  })
})