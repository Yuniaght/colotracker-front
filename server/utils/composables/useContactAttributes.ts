import * as z from "zod";
import { defineForm } from "~~/server/utils/validation/zod";
import { zodShared, subjectEnum } from '#shared/zod'

export const formTypes = Object.values(subjectEnum.enum);

const formTypesLabels: Record<(typeof formTypes)[number], string> = {
    "message": "Nouveau message",
    "copyright": "Réclamation Droit d'Auteur"
};

function useMessageForm() {
    return defineForm({
        schema: {
            body: z.object({
                ...zodShared.commonContactPartial.shape,
            })
        },
        getSubject(body: z.infer<typeof zodShared.commonContactPartial>) {
            return `[${formTypesLabels.message}] ${body.firstName} ${body.lastName}`;
        }
    });
}

function useLegalForm<T extends "copyright">(type: T) {
    return defineForm({
        schema: {
            body: z.object({
                ...zodShared.problemUrlContactPartial.shape,
            })
        },
        getSubject(body: z.infer<typeof zodShared.problemUrlContactPartial>) {
            return `[${formTypesLabels[type]}] ${body.firstName} ${body.lastName}`;
        }
    });
}

export const formRegistry = {
    message: () => useMessageForm(),
    copyright: () => useLegalForm('copyright'),
} as const;


type Registry = typeof formRegistry;
type RegistryKey = keyof Registry;
type BodySchemaByKey = { 
    [K in RegistryKey]: ReturnType<Registry[K]>["schema"]["body"] 
};
export const BaseContactQuerySchema = z.object({
    form_type: z.enum(subjectEnum.options),
});
export type InferBody<K extends RegistryKey> = z.infer<BodySchemaByKey[K]>;
export function useContactAttributes<K extends RegistryKey>(key: K): ReturnType<(Registry)[K]> {
    return formRegistry[key]() as ReturnType<(Registry)[K]>;
}