import { createItem, uploadFiles, readItem, readMe } from '@directus/sdk';
import { addPageConfig } from '../utils/composables/usePageAttributes';
import { parseMultiPartData, splitBodyFiles } from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type { ZodError } from "zod";
import { CompletedPage } from '~~/shared/types/directus';

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies['directus_session_token'];
  const config = useRuntimeConfig()

  if (!token) throw createError({ statusCode: 401, message: "Non authentifié" });

  const form = addPageConfig;
  const directusAdmin = useDirectusAdmin()
  const directusUser = useDirectusUser(token)
  const userMe = await directusUser.request(readMe({ fields: ['id'] }));
  let body: Record<string, any>;
  const _body = await readMultipartFormData(event);
  body = await parseMultiPartData(_body);
  const libraryId = body.library_from;
  const libraryEntry = await directusAdmin.request(
    readItem('library', libraryId, {
      fields: [{user: ["id"]},{ book: ['page_count'] },{ completed_pages: ['page_number']}]
    })
  )

  if ( !libraryEntry ) {
    throw createError({
      statusCode: 400,
      message: "Il n'y a pas de livre pour le quel ajouter cette page"
    });
  }

  if ( libraryEntry.user.id !== userMe.id) {
    throw createError({
      statusCode: 400,
      message: "Ce livre n'est pas à vous"
    });
  }

  const maxPages = libraryEntry.book.page_count;
  const alreadyDone = libraryEntry.completed_pages.map((p: any) => BigInt(p.page_number));
  if (body['image[]'] && !body['image']) {
    body['image'] = body['image[]'];
    delete body['image[]'];
  }
  if (body['image'] && !Array.isArray(body['image'])) {
    body['image'] = [body['image']];
  }
  const vBody = await form.schema.body.safeParseAsync(body);
  if (!vBody.success) {
    throw createError({
      message: "Données invalides",
      statusCode: 400,
      data: z.treeifyError(vBody.error as ZodError)
    });
  }
  const requestedPage = vBody.data.page_number;
  if (requestedPage > maxPages) {
    throw createError({
      statusCode: 400,
      data: { page_number: `Ce livre n'a que ${maxPages} pages.` }
    });
  }
  if (alreadyDone.includes(requestedPage)) {
    throw createError({
      statusCode: 400,
      data: { page_number: "Vous avez déjà ajouté cette page à votre collection." }
    });
  }
  const { body: pageData, files } = splitBodyFiles(vBody.data, form.filesKeys);
  const folder = config.drawingFolder

  console.log("dossier : " + folder)
  try {
    let imageID = null;
    const pageFile = files.find(f => f && f.data);
    const formData = new FormData();
    const blob = new Blob([pageFile.data], { type: pageFile?.type });
    formData.append('folder', folder)
    formData.append('owned_by', userMe.id)
    formData.append('file', blob, pageFile?.filename);
    const fileResponse = await directusAdmin.request(uploadFiles(formData));
    imageID = fileResponse.id;
    const finalPayload = {
    ...pageData,
    page_number: Number(pageData.page_number),
    library_from: libraryId,
    image: imageID
  };
    await directusAdmin.request(createItem("completed_pages", {
              ...finalPayload
            } as CompletedPage));
    return {
      success: true,
    };

  } catch (e: any) {
    console.log(e)
    let globalMsg = "Une erreur est survenue lors de la demande.";
    throw createError({
      statusCode: 400,
      message: globalMsg
    });
  }
})