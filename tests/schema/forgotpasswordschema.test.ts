import { describe, it, expect, vi } from 'vitest'

vi.mock('#shared/zod', async () => {
  const actual = await vi.importActual('../../shared/zod/index')
  return actual
})

import { forgotPasswordSchema } from '../../app/components/Form/forgotPasswordSchema'

describe('Schema Zod: forgotPasswordSchema', () => {

  const getBaseFormPayload = () => ({
    password: '',
    confirm_password: ''
  })

  describe('Validation des Mots de passe', () => {
    it('devrait valider si les deux mots de passe correspondent et respectent les critères de sécurité', () => {
      const data = {
        password: 'ValidPassword123!',
        confirm_password: 'ValidPassword123!'
      }
      
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('devrait échouer si les deux mots de passe ne correspondent pas', () => {
      const data = {
        password: 'ValidPassword123!',
        confirm_password: 'DifferentPassword123!'
      }
      
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.format()
        expect(error.confirm_password?._errors).toContain('Les mots de passe ne correspondent pas')
      }
    })

    it('devrait échouer si le mot de passe est trop court (critère de base)', () => {
      const data = {
        password: 'Short1!',
        confirm_password: 'Short1!'
      }
      
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si le mot de passe ne contient aucune lettre majuscule', () => {
      const data = {
        password: 'password123!',
        confirm_password: 'password123!'
      }
      
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si le mot de passe ne contient aucun caractère spécial', () => {
      const data = {
        password: 'Password123',
        confirm_password: 'Password123'
      }
      
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('devrait échouer si la confirmation est fournie mais que le mot de passe principal reste vide', () => {
      const data = {
        password: '',
        confirm_password: 'Password123!'
      }
      
      const result = forgotPasswordSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})