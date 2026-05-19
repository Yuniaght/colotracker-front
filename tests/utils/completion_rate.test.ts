// tests/utils/completion_rate.spec.ts
import { describe, it, expect } from 'vitest'
import { calculateProgress } from '../../app/utils/completion_rate'

describe('Utility: calculateProgress', () => {

  describe('Cas de Réussite (Comportements Classiques)', () => {
    it('doit retourner 0.00% quand aucun coloriage n\'est terminé', () => {
      expect(calculateProgress(0, 100)).toBe('0.00%')
    })

    it('doit retourner 50.00% à la moitié du livre', () => {
      expect(calculateProgress(10, 20)).toBe('50.00%')
    })

    it('doit retourner 100.00% quand le livre est entièrement complété', () => {
      expect(calculateProgress(45, 45)).toBe('100.00%')
    })

    it('doit arrondir correctement au centième inférieur (ex: 1/3)', () => {
      expect(calculateProgress(1, 3)).toBe('33.33%')
    })

    it('doit arrondir correctement au centième supérieur (ex: 2/3)', () => {
      expect(calculateProgress(2, 3)).toBe('66.67%')
    })

    it('doit formater correctement avec un nombre décimal à un chiffre après la virgule', () => {
      expect(calculateProgress(1, 8)).toBe('12.50%')
    })

    it('doit fonctionner correctement sur de gros volumes de pages', () => {
      expect(calculateProgress(150000, 300000)).toBe('50.00%')
    })

    it('doit accepter les nombres complétés décimaux (ex: progression partielle d\'une page)', () => {
      expect(calculateProgress(1.5, 3)).toBe('50.00%')
    })

    it('doit formater à 99.90% un cas presque fini', () => {
      expect(calculateProgress(99.9, 100)).toBe('99.90%')
    })
  })

  describe('Gestion des Valeurs par Défaut et Optionnelles', () => {
    it('doit utiliser 0 par défaut si le paramètre completedCount est omis ou indéfini', () => {
      expect(calculateProgress(undefined, 10)).toBe('0.00%')
    })
  })

  describe('Cas d\'Échec : Total de pages Invalide, Nul ou Absent', () => {
    it('doit renvoyer "0%" (sans décimales) si le total de pages est égal à 0', () => {
      expect(calculateProgress(5, 0)).toBe('0%')
    })

    it('doit renvoyer "0%" si completedCount et totalPages valent tous deux 0', () => {
      expect(calculateProgress(0, 0)).toBe('0%')
    })

    it('doit renvoyer "0%" si le total de pages est négatif', () => {
      expect(calculateProgress(5, -10)).toBe('0%')
    })

    it('doit renvoyer "0%" si le total de pages vaut -1', () => {
      expect(calculateProgress(0, -1)).toBe('0%')
    })

    it('doit renvoyer "0%" si le total de pages est null', () => {
      expect(calculateProgress(5, null)).toBe('0%')
    })

    it('doit renvoyer "0%" si le total de pages est undefined', () => {
      expect(calculateProgress(5, undefined)).toBe('0%')
    })

    it('doit renvoyer "0%" si le total de pages est un NaN (Not a Number)', () => {
      expect(calculateProgress(5, Number.NaN)).toBe('0%')
    })
  })

  describe('Cas aux Limites Extrêmes (Edge Cases)', () => {
    it('doit calculer un pourcentage supérieur à 100% si completedCount dépasse totalPages', () => {
      expect(calculateProgress(12, 10)).toBe('120.00%')
    })

    it('doit calculer un pourcentage négatif si completedCount est négatif', () => {
      expect(calculateProgress(-5, 10)).toBe('-50.00%')
    })

    it('doit renvoyer 0.01% pour de très petits ratios', () => {
      expect(calculateProgress(1, 10000)).toBe('0.01%')
    })

    it('doit arrondir à 0.00% si le ratio est inférieur à 0.005%', () => {
      expect(calculateProgress(1, 100000)).toBe('0.00%')
    })

    it('doit arrondir au centième supérieur si le ratio est par exemple 0.0066%', () => {
      expect(calculateProgress(2, 30000)).toBe('0.01%')
    })

    it('doit supporter une précision très fine avec des totaux décimaux', () => {
      expect(calculateProgress(5, 5.5)).toBe('90.91%')
    })

    it('doit gérer la division par un nombre infiniment grand (Infinity)', () => {
      expect(calculateProgress(10, Number.POSITIVE_INFINITY)).toBe('0.00%')
    })

    it('doit retourner "Infinity%" si completedCount vaut Infinity avec un total valide', () => {
      expect(calculateProgress(Number.POSITIVE_INFINITY, 10)).toBe('Infinity%')
    })

    it('doit retourner "NaN%" si completedCount vaut NaN avec un total valide', () => {
      expect(calculateProgress(Number.NaN, 10)).toBe('NaN%')
    })
  })

})