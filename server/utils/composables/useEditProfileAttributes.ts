import * as zod from "zod";
import {emptyAsNull, maxFiles, maxSize, allowedTypes, zodShared} from '#shared/zod'
import {defineForm, zStringRuleConstructor, zMultipleFilesConstructor} from "~~/server/utils/validation/zod";
import {useZCaptcha} from "~~/server/utils/composables/useForm";

const zCaptcha = useZCaptcha()

export const editProfileFormConfig = defineForm({
    schema: {
        body: zod.object({
            ...zodShared.editProfilePartial.shape,
            avatar: zMultipleFilesConstructor({
                maxFiles: maxFiles,
                maxFileSizeMB: maxSize,
                allowedExtensions: allowedTypes
            }),
            token: zCaptcha
        })
    },
    filesKeys: ['avatar']
});