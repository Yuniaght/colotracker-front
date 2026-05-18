import { readUsers, updateUser } from '@directus/sdk';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const email = body.email;

    if (!email) {
        throw createError({ statusCode: 400, message: "L'adresse e-mail est requise." });
    }

    const directus = useDirectusAdmin();

    try {
        const users = await directus.request(readUsers({
            filter: { email: { _eq: email } },
            fields: ['id', 'status', 'user_name']
        }));

        if (!users || users.length === 0) {
            return { success: true, message: "Si cette adresse existe et n'est pas activée, un e-mail a été envoyé." };
        }

        const user = users[0];

        if (user.status === 'active') {
            throw createError({ statusCode: 400, message: "Ce compte est déjà activé. Vous pouvez vous connecter." });
        }
        if (user.status !== 'unverified') {
            throw createError({ statusCode: 403, message: "Ce compte ne peut pas être activé (statut invalide)." });
        }

        const newVerificationToken = randomUUID();
        const newExpiresAt = new Date();
        newExpiresAt.setHours(newExpiresAt.getHours() + 24);

        await directus.request(updateUser(user.id, {
            verification_token: newVerificationToken,
            verif_token_expires_at: newExpiresAt.toISOString()
        }));

        const templatePath = path.resolve('server/utils/mails/verification.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf-8');
        const config = useRuntimeConfig()

        const verificationLink = `${config.siteURL}/verify-email?token=${newVerificationToken}`;
        htmlContent = htmlContent
            .replace('{{verificationLink}}', verificationLink)
            .replace('{{firstName}}', user?.user_name || 'Utilisateur');

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '127.0.0.1',
            port: parseInt(process.env.SMTP_PORT || '1025'),
            secure: false,
            ignoreTLS: true
        });

        await transporter.sendMail({
            from: '"ColoTracker" <noreply@colotracker.local>',
            to: email,
            subject: "Nouveau lien d'activation - ColoTracker",
            html: htmlContent
        });

        return {
            success: true,
            message: "Un nouveau lien d'activation a été envoyé à votre adresse e-mail."
        };

    } catch (error: any) {
        if (error.statusCode) throw error;
        throw createError({ statusCode: 500, message: "Erreur lors du renvoi de l'e-mail." });
    }
});