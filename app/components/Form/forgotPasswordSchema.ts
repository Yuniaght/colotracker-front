import * as zod from 'zod'
import {zodShared} from '#shared/zod'

export const forgotPasswordSchema = zod.object({
    ...zodShared.forgotPassword.shape,
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

export type forgotPasswordValues = zod.infer<typeof forgotPasswordSchema>
