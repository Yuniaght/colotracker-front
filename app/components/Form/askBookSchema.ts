import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const askABookFields = {
  ...zodShared.askABookPartial.shape,
  book_front_cover: zod.array(zod.file().max(maxSize).mime(allowedTypes)).max(maxFiles)
}

export const askABookSchema = zod.object(askABookFields)

export type askABookFormValues = zod.infer<typeof askABookSchema>