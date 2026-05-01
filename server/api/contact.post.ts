import { formRegistry, BaseContactQuerySchema } from '~~/server/utils/composables/useContactAttributes';
import * as z from 'zod';
import type {ZodError} from "zod";

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
        const emailSubject = formConfig.getSubject!(vBody.data as any);
        console.log(`Prêt à envoyer l'email: ${emailSubject}`);
        console.log(vBody.data)

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