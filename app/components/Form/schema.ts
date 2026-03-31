import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const registrationFields = {
  ...zodShared.registerPartial.shape,
  avatar: zod.array(zod.file().max(maxSize).mime(allowedTypes)).max(maxFiles).default([]).optional()
}

const registrationSchema = zod.object({type: zod.literal("registration"), ...registrationFields})

export const formSchema = zod.discriminatedUnion('type', [
  registrationSchema
])

export type FormValues = zod.infer<typeof formSchema>