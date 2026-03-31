import * as zod from "zod";
import type {ZodSafeParseSuccess, ZodType} from "zod";
import {zodShared, maxFiles, maxSize, allowedTypes} from '#shared/zod'
import {defineForm, zStringRuleConstructor, zMultipleFilesConstructor} from "~~/server/utils/validation/zod";


function useRegisterForm() {
    return defineForm({
        type: "registration",
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
}

export const registerRegistry = {
    registration: () => useRegisterForm(),
} as const;

type Registry = typeof registerRegistry;
type RegistryKey = keyof Registry;

export function useRegisterAttributes<K extends RegistryKey>(key: K): ReturnType<(Registry)[K]> {
    const factory = registerRegistry[key];
    return factory() as ReturnType<(Registry)[K]>;
}