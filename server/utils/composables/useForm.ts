import {zCaptcha} from "~~/server/utils/validation/zod";

export function useZCaptcha(minScore = 0.5) {
    const { recaptcha: {v3SecretKey} } = useRuntimeConfig();
    return zCaptcha(v3SecretKey, minScore)
}