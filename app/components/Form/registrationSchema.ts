import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const registrationFields = {
  ...zodShared.registerPartial.shape,
  avatar: zod.array(zod.file().max(maxSize, "Fichier trop volumineux. Limite : 512Ko").mime(allowedTypes, "Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP")).max(maxFiles, "Pas plus d'un fichier").optional().default([])
}

export const registrationSchema = zod.object(registrationFields)

export type RegistrationFormValues = zod.infer<typeof registrationSchema>