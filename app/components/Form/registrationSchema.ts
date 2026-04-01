import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const registrationFields = {
  ...zodShared.registerPartial.shape,
  avatar: zod.array(zod.file().max(maxSize).mime(allowedTypes)).max(maxFiles).default([]).optional()
}

export const registrationSchema = zod.object(registrationFields)

export type RegistrationFormValues = zod.infer<typeof registrationSchema>