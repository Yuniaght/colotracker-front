import { createItem, readMe } from '@directus/sdk';
import { ReportPageConfig } from '../utils/composables/useReportPageAttributes';
import * as z from 'zod';
import type { ZodError } from "zod";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies['directus_session_token'];

  if (!token) throw createError({ statusCode: 401, message: "Non authentifié" });

  const form = ReportPageConfig;
  const directusAdmin = useDirectusAdmin()
  const directusUser = useDirectusUser(token)

  const userMe = await directusUser.request(readMe({ fields: ['id'] }));
  if (!userMe) throw createError({ statusCode: 401, message: "Cet utilisateur n'existe pas" });

  let body = await readBody(event); 
  const vBody = await form.schema.body.safeParseAsync(body);

  if (!vBody.success) {
    throw createError({
      message: "Données invalides",
      statusCode: 400,
      data: z.treeifyError(vBody.error as ZodError)
    });
  }

  try { 
    const payload = vBody.data
    const finalPayload = {
      reported_page_id: payload.page,
      requested_by: payload.user,
      reason: payload.reason,
      status: 'open',
      requested_date: new Date() 
    } 
    
    await directusAdmin.request(createItem("reported_pages", {
              ...finalPayload
            }));
    return {
      success: true,
    };

  } catch(e: any) {
    let globalMsg = "Une erreur est survenue lors de la demande.";
    throw createError({
      statusCode: 400,
      message: globalMsg
    });
  }
})