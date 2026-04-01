import * as z from "zod";
import type { AnyZodObject, Form } from "~~/server/types";

export function zStringRuleConstructor<Value extends boolean = false>(
    isOptional: Value, 
    nbCharacters: number = 255
): Value extends true ? z.ZodOptional<z.ZodString> : z.ZodString {
    const base = z.string().trim().max(nbCharacters);
    const opt = (isOptional ?? false) as Value;
    const schema = opt ? base.optional() : base.min(1);

    // Cast nécessaire pour refléter le type conditionnel
    return schema as Value extends true ? z.ZodOptional<z.ZodString> : z.ZodString;
}

export function zMultipleFilesConstructor(options?: {
    allowedExtensions?: string[];
    maxFileSizeMB?: number;
    minFiles?: number;
    maxFiles?: number;
}) {
    const allowed = (options?.allowedExtensions?.map(e => e.toLowerCase()) ?? ["png", "jpg", "jpeg", "webp"]);
    const maxMB = options?.maxFileSizeMB ?? 0.5;
    const maxBytes = maxMB * 1024 * 1024;
    const minFiles = options?.minFiles;
    const maxFiles = options?.maxFiles;

    const fileSchema = z.object({
        filename: z.string(),
        type: z.string(),
        size: z.number(),
        data: z.instanceof(Buffer),
    });

    return z
        .array(fileSchema)
        .default([])
        .refine(
            (files) => files.every((file) => {
                return allowed.includes(file.type.toLowerCase());
            }),
            { message: `Type de fichier invalide. Extensions autorisées: ${allowed.join(", ")}` }
        )
        .refine(
            (files) => files.every((file) => file.size <= maxBytes),
            { message: `Fichier trop volumineux (max ${maxMB}MB)` }
        )
        .refine(
            (files) => (typeof minFiles !== "number") || files.length >= minFiles,
            { message: `Fichier requis` }
        )
        .refine(
            (files) => (typeof maxFiles !== "number") || files.length <= maxFiles,
            { message: `Trop de fichiers (max ${maxFiles})` }
        );
}

export function defineForm<
    Body extends AnyZodObject,
    Query extends AnyZodObject | undefined = undefined,
    Headers extends AnyZodObject | undefined = undefined
>(args: Form<Body, Query, Headers>) {
    return args;
}