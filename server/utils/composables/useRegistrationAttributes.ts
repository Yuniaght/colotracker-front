import * as zod from "zod";
import type {ZodSafeParseSuccess, ZodType} from "zod";
import {zodShared, maxFiles, maxSize, allowedTypes} from '#shared/zod'
import {defineForm, zStringRuleConstructor, zMultipleFilesConstructor} from "~~/server/utils/validation/zod";


export const registrationFormConfig = defineForm({
    schema: {
        body: zod.object({
            user_name: zStringRuleConstructor(false, 100),
            email: zod.email("Format d'email invalide"),
            password: zStringRuleConstructor(false, 100).min(8, "Le mot de passe doit faire 8 caractères min."),
            avatar: zMultipleFilesConstructor({
                maxFiles: maxFiles,
                maxFileSizeMB: maxSize,
                allowedExtensions: allowedTypes
            })
        })
    },
    filesKeys: ['avatar']
});