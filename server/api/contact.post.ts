import { formRegistry, BaseContactQuerySchema } from '~~/server/utils/composables/useContactAttributes';
import * as z from 'zod';
import type {ZodError} from "zod";
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    const _query = getQuery(event);
    const parsedQuery = BaseContactQuerySchema.safeParse(_query);

    if (!parsedQuery.success) {
        throw createError({
            statusCode: 400,
            message: "Type de formulaire manquant ou invalide",
        });
    }

    const selectedFormType = parsedQuery.data!.form_type;
    const formConfig = formRegistry[selectedFormType]();
    

    let body: Record<string, any>;
    body = await readBody(event); 
    const vBody = await formConfig.schema.body.safeParseAsync(body);
    
    if (!vBody.success) {
        throw createError({
            message: "Données invalides",
            statusCode: 400,
            data: z.treeifyError(vBody.error as ZodError)
        });
    }

    try {
        const templatePath = path.resolve('server/utils/mails/contact.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf-8');

        const excludedFields = ['subject', 'token', 'privacy'];

        const fieldLabels: Record<string, string> = {
            lastName: "Nom",
            firstName: "Prénom",
            email: "E-mail de contact",
            message: "Message",
            problematicUrl: "URL signalée",
        };

        const dataList = Object.entries(vBody.data as any)
        .filter(([key]) => !excludedFields.includes(key))
        .map(([key, val]) => {
            const label = fieldLabels[key] || key;
            return `<p style="margin-bottom: 10px;">
                <strong style="color: #4f46e5;">${label} :</strong><br>
                ${val}
            </p>`;
        })
        .join('');


        const cleanSubject = `[${parsedQuery.data!.form_type}] ${vBody.data.subject}`;

        htmlContent = htmlContent
            .replace('{{formType}}', parsedQuery.data!.form_type)
            .replace('{{content}}', dataList);
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '127.0.0.1',
            port: parseInt(process.env.SMTP_PORT || '1025'),
            secure: false,
            ignoreTLS: true
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"ColoTracker" <noreply@colotracker.local>',
            to: "admin@votre-domaine.com",
            replyTo: vBody.data.email,
            subject: cleanSubject,
            html: htmlContent
        });

        return {
            success: true,
            message: "Message envoyé",

        };

    } catch (e: any) {

        let globalMsg = "Une erreur est survenue lors de l'envoi.";
        let fieldError: Record<string, string[]> = {};

        throw createError({
            statusCode: 400,
            message: globalMsg,
            data: fieldError   
        });
    }
});