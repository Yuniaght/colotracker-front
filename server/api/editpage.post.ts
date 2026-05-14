import { updateItem, uploadFiles, readItem, readMe, deleteFile } from '@directus/sdk';
import { editPageConfig } from '../utils/composables/usePageAttributes';
import { parseMultiPartData, splitBodyFiles } from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type { ZodError } from "zod";
import { CompletedPage } from '~~/shared/types/directus';

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies['directus_session_token'];
  const config = useRuntimeConfig();

  if (!token) throw createError({ statusCode: 401, message: "Non authentifié" });

  const directusAdmin = useDirectusAdmin()
  const directusUser = useDirectusUser(token)
  const userMe = await directusUser.request(readMe({ fields: ['id'] }));
  
  const form = editPageConfig;
  const _contentType = getRequestHeader(event, 'content-type');
  const contentType = (_contentType || '')?.split(';')[0]?.trim();
  let body: Record<string, any>;
  
  if (contentType === 'multipart/form-data') {
    const _body = await readMultipartFormData(event);
    body = await parseMultiPartData(_body);

    if (body['image[]'] && !body['image']) {
      body['image'] = body['image[]'];
      delete body['image[]'];
    }

    if (body['image'] && !Array.isArray(body['image'])) {
      body['image'] = [body['image']];
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
  
  const libraryId = body.library_from;
  const libraryEntry = await directusAdmin.request(
    readItem('library', libraryId, {
      fields: [{user: ["id"]},{ book: ['page_count'] },{ completed_pages: ['id', 'page_number', 'image']}]
    })
  )

  const currentPageRecord = libraryEntry.completed_pages.find((p: any) => String(p.id) === String(body.id));
  const oldImageId = currentPageRecord?.image;

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
  const alreadyDone = libraryEntry.completed_pages.filter((p: any) => String(p.id) !== String(body.id)).map((p: any) => BigInt(p.page_number));

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
  try {
    let imageID = null;
    const pageFile = files.find(f => f && f.data);

    let finalPayload = {
      ...pageData,
      page_number: Number(pageData.page_number),
    };

    if (pageFile) {
      const formData = new FormData();
      const blob = new Blob([pageFile.data], { type: pageFile?.type });
      formData.append('folder', folder)
      formData.append('owned_by', userMe.id)
      formData.append('file', blob, pageFile?.filename);
      const fileResponse = await directusAdmin.request(uploadFiles(formData));
      imageID = fileResponse.id;
      finalPayload = {
        ...finalPayload,
        image: imageID
      }
    } else {
      delete finalPayload.image;
    }
    
    
    const updatedItem = await directusAdmin.request(updateItem("completed_pages", body.id, {
              ...finalPayload
            } as CompletedPage));

    if (pageFile && oldImageId) {
      try {
        await directusAdmin.request(deleteFile(oldImageId));
      } catch (e) {
        console.error("Échec de la suppression de l'ancienne image:", e);
      }
    }        
    return {
      success: true,
      newPage: `${updatedItem.id}-page-${updatedItem.page_number}`
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