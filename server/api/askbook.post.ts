import { createItem, uploadFiles } from '@directus/sdk';
import { askABookConfig } from '../utils/composables/useAskABookAttributes';
import {parseMultiPartData, splitBodyFiles} from "~~/server/utils/composables/parseMultiPartData";
import * as z from 'zod';
import type {ZodError} from "zod";
import { AskedBook } from '~~/shared/types/directus';

export default defineEventHandler(async (event) => {
    const form = askABookConfig;

    const directus = useDirectusAdmin(); 

    let body: Record<string, any>;
    const _body = await readMultipartFormData(event);
    body = await parseMultiPartData(_body);
    if (body['book_front_cover[]'] && !body['book_front_cover']) {
      body['book_front_cover'] = body['book_front_cover[]'];
      delete body['book_front_cover[]']; 
    }
    if (body['book_front_cover'] && !Array.isArray(body['book_front_cover'])) {
      body['book_front_cover'] = [body['book_front_cover']];
    }
    const vBody = await form.schema.body.safeParseAsync(body);
    if (!vBody.success) {
        throw createError({
            message: "Données invalides",
            statusCode: 400,
            data: z.treeifyError(vBody.error as ZodError)
        });
    }
    const { body: askedBookData, files } = splitBodyFiles(vBody.data, form.filesKeys);
    try {
        let askedBookFrontCoverID = null;
        const askedBookFile = files.find(f => f && f.data);
        const formData = new FormData();
        const blob = new Blob([askedBookFile.data], { type: askedBookFile?.type });
        formData.append('file', blob, askedBookFile?.filename);
        const fileResponse = await directus.request(uploadFiles(formData));
        askedBookFrontCoverID = fileResponse.id;
        const newAskedBook = await directus.request(createItem("asked_book", {
            ...askedBookData,
            page_count: Number(askedBookData.page_count),
            release_date: askedBookData.release_date,
            book_front_cover: askedBookFrontCoverID,
            requested_number: 1
        } as AskedBook));
        
        return {
            success: true,
            message: "Le livre à bien été demandé, merci de votre contribution",

        };

    } catch (e: any) {
        console.log("error")
        let globalMsg = "Une erreur est survenue lors de la demande.";
        throw createError({
            statusCode: 400,
            message: globalMsg
        });
    }
});