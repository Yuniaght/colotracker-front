// tests/schemas/reportPageSchema.test.ts
import { describe, it, expect, vi } from 'vitest'

// Interception de l'alias Nuxt pour pointer vers le fichier physique partagé
vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { reportPageSchema } from '../../app/components/Form/reportPageSchema' // Ajuste le chemin si nécessaire

describe('Schema Zod: reportPageSchema', () => {

  describe('Cas de Réussite (Payloads Valides)', () => {
    it('devrait valider un signalement avec un motif textuel standard', () => {
      const data = {
        reason: "Cette page contient un coloriage hors-sujet ou inapproprié."
      }
      const result = reportPageSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait accepter une justification très courte mais existante', () => {
      const data = {
        reason: "Bug"
      }
      const result = reportPageSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Échecs de Validation', () => {
    it('devrait échouer si le motif du signalement est une chaîne vide', () => {
      const data = {
        reason: ""
      }
      const result = reportPageSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.format().reason?._errors).toContain("Vous devez entrer un justificatif de signalement")
      }
    })

    it('devrait échouer si la clé "reason" est totalement absente du payload', () => {
      const data = {}
      const result = reportPageSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si la valeur de la raison n\'est pas du texte', () => {
      const data = {
        reason: 12345 as any
      }
      const result = reportPageSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})