import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, minFiles, maxFiles} from '#shared/zod'

export const addPageSchema = (max_page: number) => {
  return zod.object({
    ...zodShared.pagePartial(max_page).shape,
    image: zod.array(zod.file().max(maxSize, "Fichier trop volumineux. Limite : 512Ko").mime(allowedTypes, "Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP")).min(minFiles, "Vous devez donner la page de couverture").max(maxFiles, "Pas plus d'un fichier")
  })
}

export const editPageSchema = (max_page: number) => {
  return zod.object({
    ...zodShared.pagePartial(max_page).shape,
    image: zod.array(zod.file().max(maxSize, "Fichier trop volumineux. Limite : 512Ko").mime(allowedTypes, "Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP")).max(maxFiles, "Pas plus d'un fichier").optional().default([])
  })
}

export type AddPageFormValues = zod.infer<ReturnType<typeof addPageSchema>>
export type EditPageFormValues = zod.infer<ReturnType<typeof editPageSchema>>