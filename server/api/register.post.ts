import { createUser, uploadFiles, updateFile } from '@directus/sdk';
import { registrationFormConfig } from '~~/server/utils/composables/useRegistrationAttributes';
import {parseMultiPartData, splitBodyFiles} from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type {ZodError} from "zod";
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';


const config = useRuntimeConfig()

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
    delete userData.token
    const folder = config.avatarFolder
    try {
        let avatarId = null;
        const avatarFile = files.find(f => f && f.data);

        if (avatarFile) {
          const formData = new FormData();
          
          const blob = new Blob([avatarFile.data], { type: avatarFile.type });
          formData.append('folder', folder);
          formData.append('file', blob, avatarFile.filename);


          const fileResponse = await directus.request(uploadFiles(formData));
          avatarId = fileResponse.id;
        }
        const verificationToken = randomUUID()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        const newUser = await directus.request(createUser({
            ...userData,
            role: config.public.userRoleId,
            avatar: avatarId,
            status: "unverified",
            verification_token: verificationToken,
            verif_token_expires_at: expiresAt.toISOString(),
        }));

        if (avatarId) {
            await directus.request(updateFile(avatarId, {
                owned_by: newUser.id
            }));
        }

        const templatePath = path.resolve('server/utils/mails/verification.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf-8');
        const verificationLink = `${config.siteURL}/verify-email?token=${verificationToken}`;
        htmlContent = htmlContent.replace('{{verificationLink}}', verificationLink);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '127.0.0.1', //
            port: parseInt(process.env.SMTP_PORT || '1025'),
            secure: false,
            ignoreTLS: true
        });

        await transporter.sendMail({
            from: '"ColoTracker" <noreply@colotracker.local>',
            to: userData.email,
            subject: "Vérifiez votre adresse e-mail - ColoTracker",
            html: htmlContent
        });
        
        return {
            success: true,
            message: "Utilisateur créé avec succès",

        };

    } catch (e: any) {
        console.log(e)

        let globalMsg = "Une erreur est survenue lors de l'inscription.";
        let fieldError: Record<string, string[]> = {};

        const directusError = e.errors?.[0];

        if (directusError) {
            const code = directusError.extensions?.code;
            const rawMessage = directusError.message || "";

            if (code === 'RECORD_NOT_UNIQUE' || rawMessage.includes('unique')) {
                
                if (rawMessage.includes('email')) {
                    globalMsg = "Cet e-mail est déjà utilisé.";
                    fieldError = { email: ["Cet e-mail est déjà utilisé."] };
                } 

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