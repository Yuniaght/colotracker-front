import * as zod from 'zod'
import {maxSize, allowedTypes, zodShared, maxFiles} from '#shared/zod'

export const editProfileSchema = zod.object({
    ...zodShared.editProfilePartial.shape,
    avatar: zod.array(zod.file().max(maxSize, "La taille ne doit pas exceder 512ko.").mime(allowedTypes)).max(maxFiles).optional()
  }).refine((data) => {
  if (data.password || data.confirm_password) {
    return data.password === data.confirm_password;
  }
  return true;
},
{
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
})

export type editProfileValues = zod.infer<typeof editProfileSchema>
