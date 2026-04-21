import * as zod from "zod";
import {minFiles,maxFiles, maxSize, allowedTypes} from '#shared/zod'
import {defineForm, zStringRuleConstructor, zMultipleFilesConstructor} from "~~/server/utils/validation/zod";

export const askABookConfig = defineForm({
  schema: {
    body: zod.object({
        book_name: zStringRuleConstructor(false, 100),
        author: zStringRuleConstructor(false, 100),
        page_count: zod.coerce.bigint().positive(),
        release_date: zod.coerce.date(),
        store_link: zod.url(),
        book_front_cover: zMultipleFilesConstructor({
                minFiles: minFiles,
                maxFiles: maxFiles,
                maxFileSizeMB: maxSize,
                allowedExtensions: allowedTypes
            })
    })
  },
  filesKeys: ['book_front_cover']
})