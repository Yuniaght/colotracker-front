import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const addPageSchema = (max_page: number) => {
  return zod.object({
    ...zodShared.pagePartial(max_page).shape,
    image: zod.array(zod.file().max(maxSize, "La taille ne doit pas exceder 512ko.").mime(allowedTypes)).max(maxFiles)
  })
}

export const editPageSchema = (max_page: number) => {
  return zod.object({
    ...zodShared.pagePartial(max_page).shape,
    image: zod.array(zod.file().max(maxSize, "La taille ne doit pas exceder 512ko.").mime(allowedTypes)).max(maxFiles).optional().default([])
  })
}

export type AddPageFormValues = zod.infer<ReturnType<typeof addPageSchema>>
export type EditPageFormValues = zod.infer<ReturnType<typeof editPageSchema>>