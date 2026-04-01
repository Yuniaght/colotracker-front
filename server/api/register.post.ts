import { createUser, uploadFiles } from '@directus/sdk';
import { registrationFormConfig } from '~~/server/utils/composables/useRegistrationAttributes';
import {parseMultiPartData, splitBodyFiles} from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type {ZodError} from "zod";

export default defineEventHandler(async (event) => {
    const form = registrationFormConfig;

    const directus = useDirectusAdmin(); 
    

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
    const vBody = await form.schema.body.safeParseAsync(body);
    
    if (!vBody.success) {
        throw createError({
            message: "Données invalides",
            statusCode: 400,
            data: z.treeifyError(vBody.error as ZodError)
        });
    }

    const { body: userData, files } = splitBodyFiles(vBody.data, form.filesKeys);
    try {
        let avatarId = null;
        const avatarFile = files.find(f => f && f.data);

        if (avatarFile) {
          const formData = new FormData();
          
          const blob = new Blob([avatarFile.data], { type: avatarFile.type });
          formData.append('file', blob, avatarFile.filename);

          const fileResponse = await directus.request(uploadFiles(formData));
          avatarId = fileResponse.id;
        }
        
        const newUser = await directus.request(createUser({
            ...userData,
            avatar: avatarId
        }));
        
        return {
            success: true,
            message: "Utilisateur créé avec succès",

        };

    } catch (e: any) {
        const errorMessage = e.errors?.[0]?.message || e.message;
        console.error("Erreur Directus:", e);
        
        throw createError({
            message: errorMessage || "Erreur lors de l'enregistrement",
            statusCode: e.status || 500
        });
    }
});