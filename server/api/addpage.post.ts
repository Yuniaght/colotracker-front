import { createItem, uploadFiles } from '@directus/sdk';
import { addPageConfig } from '../utils/composables/usePageAttributes';
import { parseMultiPartData, splitBodyFiles } from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type { ZodError } from "zod";
import { CompletedPage } from '~~/shared/types/directus';
import { readItem } from '@directus/sdk';

export default defineEventHandler(async (event) => {
  const form = addPageConfig;
  const directus = useDirectusAdmin();
  let body: Record<string, any>;
  const _body = await readMultipartFormData(event);
  body = await parseMultiPartData(_body);
  const libraryId = body.library_from;

  const libraryEntry = await directus.request(
    readItem('library', libraryId, {
      fields: [{ book: ['page_count'] },{ completed_pages: ['page_number']}]
    })
  )
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
  try {
    let imageID = null;
    const pageFile = files.find(f => f && f.data);
    const formData = new FormData();
    const blob = new Blob([pageFile.data], { type: pageFile?.type });
    formData.append('file', blob, pageFile?.filename);
    const fileResponse = await directus.request(uploadFiles(formData));
    imageID = fileResponse.id;
    const finalPayload = {
    ...pageData,
    page_number: Number(pageData.page_number),
    library_from: libraryId,
    image: imageID
  };
    await directus.request(createItem("completed_pages", {
              ...finalPayload
            } as CompletedPage));
            console.log(19)
    return {
      success: true,

    };

  } catch (e: any) {
    let globalMsg = "Une erreur est survenue lors de la demande.";
    throw createError({
      statusCode: 400,
      message: globalMsg
    });
  }
})