import * as zod from "zod";
import {minFiles,maxFiles, maxSize, allowedTypes} from '#shared/zod'
import {defineForm, zStringRuleConstructor, zMultipleFilesConstructor} from "~~/server/utils/validation/zod";

export const addPageConfig = defineForm({
  schema: {
    body: zod.object({
      page_number: zod.coerce.bigint("Le chiffre entré doit être un entier").positive("Le chiffre entré doit être positif"),
      date_finished: zod.coerce.date("Veuillez entrer une date valide"),
      detailed_info: zStringRuleConstructor(false, ).min(1, "Vous devez décrire votre oeuvre"),
      image: zMultipleFilesConstructor({
                minFiles: minFiles,
                maxFiles: maxFiles,
                maxFileSizeMB: maxSize,
                allowedExtensions: allowedTypes
            })
    })
  },
  filesKeys: ['image']
})

export const editPageConfig = defineForm({
  schema: {
    body: zod.object({
      page_number: zod.coerce.bigint("Le chiffre entré doit être un entier").positive("Le chiffre entré doit être positif"),
      date_finished: zod.coerce.date("Veuillez entrer une date valide"),
      detailed_info: zStringRuleConstructor(false, ).min(1, "Vous devez décrire votre oeuvre"),
      image: zMultipleFilesConstructor({
                maxFiles: maxFiles,
                maxFileSizeMB: maxSize,
                allowedExtensions: allowedTypes
            })
    })
  },
  filesKeys: ['image']
})