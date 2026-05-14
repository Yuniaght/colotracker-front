import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, minFiles, maxFiles} from '#shared/zod'

export const askABookFields = {
  ...zodShared.askABookPartial.shape,
  book_front_cover: zod.array(zod.file().max(maxSize, "Fichier trop volumineux. Limite : 512Ko").mime(allowedTypes, "Type incorrect. Type authorisé : Jpg, Png, Jpeg, WebP")).min(minFiles, "Vous devez donner la page de couverture").max(maxFiles, "Pas plus d'un fichier")
}

export const askABookSchema = zod.object(askABookFields)

export type askABookFormValues = zod.infer<typeof askABookSchema>