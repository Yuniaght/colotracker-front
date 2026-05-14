import { readMe, readUser, updateUser, uploadFiles, deleteFile } from '@directus/sdk';
import { editProfileFormConfig } from '../utils/composables/useEditProfileAttributes';
import { parseMultiPartData, splitBodyFiles } from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type { ZodError } from "zod";
import { DirectusUser } from '~~/shared/types/directus';

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies['directus_session_token'];
  const config = useRuntimeConfig()

  if (!token) throw createError({ statusCode: 401, message: "Non authentifié" });

  const directusAdmin = useDirectusAdmin()
  const directusUser = useDirectusUser(token)
  const userMe = await directusUser.request(readMe({ fields: ['id', 'avatar'] }));
  const oldAvatar = userMe.avatar 

  const form = editProfileFormConfig;
  const _contentType = getRequestHeader(event, 'content-type');
  const contentType = (_contentType || '')?.split(';')[0]?.trim();
 
   let body: Record<string, any>;
    if (contentType === 'multipart/form-data') {
      const _body = await readMultipartFormData(event);
      body = await parseMultiPartData(_body);
  
      if (body['avatar[]'] && !body['avatar']) {
        body['avatar'] = body['avatar[]'];
        delete body['avatar[]'];
      }
  
      if (body['avatar'] && !Array.isArray(body['avatar'])) {
        body['avatar'] = [body['avatar']];
      }
    } else {
      body = await readBody(event);
    }  

    if (userMe.id !== body.id) {
      throw createError({
        statusCode: 400,
        message: "Vous ne pouvez pas modifier un utilisateur autre que vous même"
      });
    }

    const vBody = await form.schema.body.safeParseAsync(body);
    if (!vBody.success) {
       throw createError({
         message: "Données invalides",
         statusCode: 400,
         data: z.treeifyError(vBody.error as ZodError)
       });
    }

    const { confirm_password, delete_avatar, token: reCaptchaToken, ...editedProfile} = vBody.data
    const { body: profileData, files } = splitBodyFiles(editedProfile, form.filesKeys);
     
    if (profileData.password === null) delete profileData.password
    
    if (delete_avatar) {
      profileData.avatar = null;
    }
    const folder = config.avatarFolder
    try {
        let avatarId = null;
        const avatarFile = files.find(f => f && f.data);

        if (avatarFile) {
          const formData = new FormData();
          
          const blob = new Blob([avatarFile.data], { type: avatarFile.type });
          formData.append('folder', folder);
          formData.append('owned_by', userMe.id)
          formData.append('file', blob, avatarFile.filename);
  
          const fileResponse = await directusAdmin.request(uploadFiles(formData));

          avatarId = fileResponse.id;
          profileData.avatar = avatarId
        }

        await directusAdmin.request(
          updateUser(userMe.id, {
            ...profileData
          })
        )

        if ((avatarFile && oldAvatar) || delete_avatar) {
          try {
            await directusAdmin.request(deleteFile(userMe.avatar));
          } catch (e) {
            console.error("Échec de la suppression de l'ancienne image:", e);
          }
        }

        return {
            success: true,
            message: "Profil modifié",
        };

    } catch (e: any) {
      console.error(e)
      let globalMsg = "Une erreur est survenue lors de la demande.";
      throw createError({
          statusCode: 400,
      message: globalMsg
      });
    }
})