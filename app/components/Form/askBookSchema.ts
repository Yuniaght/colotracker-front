import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const askABookFields = {
  ...zodShared.askABookPartial.shape,
  avatar: zod.array(zod.file().max(maxSize).mime(allowedTypes)).max(maxFiles).default([]).optional()
}

export const askABookSchema = zod.object(askABookFields)

export type askABookFormValues = zod.infer<typeof askABookSchema>