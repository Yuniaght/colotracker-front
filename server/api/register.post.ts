import { createUser, uploadFiles } from '@directus/sdk';
import { registrationFormConfig } from '~~/server/utils/composables/useRegistrationAttributes';
import {parseMultiPartData, splitBodyFiles} from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type {ZodError} from "zod";
import { glob } from 'node:fs';

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
        console.error("Erreur Directus:", e);

        let globalMsg = "Une erreur est survenue lors de l'inscription.";
        let fieldError: Record<string, string[]> = {};

        const directusError = e.errors?.[0];

        if (directusError) {
            const code = directusError.extensions?.code;
            const rawMessage = directusError.message || "";

            if (code === 'RECORD_NOT_UNIQUE' || rawMessage.includes('unique')) {
                
                // Si l'erreur concerne l'email
                if (rawMessage.includes('email')) {
                    globalMsg = "Cet e-mail est déjà utilisé.";
                    fieldError = { email: ["Cet e-mail est déjà utilisé."] };
                } 
                // Si l'erreur concerne le nom d'utilisateur
                else if (rawMessage.includes('user_name')) {
                    globalMsg = "Ce nom d'utilisateur est déjà pris.";
                    fieldError = { user_name: ["Ce nom d'utilisateur est déjà pris."] };
                } 
                else {
                    globalMsg = "Cette information est déjà utilisée.";
                }
            } else {
                globalMsg = rawMessage;
            }
        }

        throw createError({
            statusCode: 400,
            message: globalMsg,
            data: fieldError   
        });
    }
});