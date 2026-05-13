import * as zod from "zod";
import {defineForm, zStringRuleConstructor} from "~~/server/utils/validation/zod";
import {useZCaptcha} from "~~/server/utils/composables/useForm";

const zCaptcha = useZCaptcha()

export const ReportPageConfig = defineForm({
    schema: {
        body: zod.object({
            reason: zStringRuleConstructor(false),
            user: zod.string(),
            page: zod.number().positive(),
            token: zCaptcha
        })
    }
});