import * as zod from 'zod'
import {zodShared} from '#shared/zod'

export const baseFields = zod.object({
  ...zodShared.commonContactPartial.shape
})

export const reclamationFields = zod.object({
  ...zodShared.problemUrlContactPartial.shape
})

const baseSchema = zod.object({type: zod.literal("message"), ...baseFields.shape})
const reclamationSchema = zod.object({type: zod.literal("copyright"), ...reclamationFields.shape})

export const formSchema = zod.discriminatedUnion('type', [
  baseSchema,
  reclamationSchema
])

export type FormValues = zod.infer<typeof formSchema>