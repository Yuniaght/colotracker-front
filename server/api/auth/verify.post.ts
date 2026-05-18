import { readUsers, updateUser } from '@directus/sdk';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const token = body.token;

    if (!token) {
        throw createError({
            statusCode: 400,
            message: "Jeton de vérification manquant."
        });
    }

    const directus = useDirectusAdmin(); 

    try {
        const users = await directus.request(readUsers({
            filter: {
                verification_token: { _eq: token }
            },
            fields: ['id', 'status', 'verif_token_expires_at']
        }));

        if (!users || users.length === 0) {
            throw createError({
                statusCode: 400,
                message: "Ce lien de vérification est invalide ou a déjà été utilisé."
            });
        }

        const user = users[0];

        if (user.verif_token_expires_at) {
            const expiryDate = new Date(user.verif_token_expires_at);
            if (expiryDate < new Date()) {
                throw createError({
                    statusCode: 400,
                    message: "Ce lien de vérification a expiré (limite de 24 heures dépassée)."
                });
            }
        }

        await directus.request(updateUser(user.id, {
            status: 'active',
            verification_token: null, 
            verif_token_expires_at: null
        }));

        return {
            success: true,
            message: "Votre compte a été activé avec succès !"
        };

    } catch (error: any) {
        if (error.statusCode) throw error;
        throw createError({
            statusCode: 500,
            message: "Une erreur est survenue lors de l'activation de votre compte."
        });
    }
});