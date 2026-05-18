import { readUsers } from '@directus/sdk';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const email = body.email;

    if (!email) return { status: 'not_found' };

    const directus = useDirectusAdmin();

    try {
        const users = await directus.request(readUsers({
            filter: { email: { _eq: email } },
            fields: ['status']
        }));

        if (!users || users.length === 0) {
            return { status: 'not_found' };
        }

        return { status: users[0].status };
    } catch (error) {
        throw createError({ statusCode: 500, message: "Erreur de vérification" });
    }
});