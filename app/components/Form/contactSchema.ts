import * as zod from 'zod'
import {zodShared} from '#shared/zod'

export const baseFields = zod.object({
  ...zodShared.commonContactPartial.shape
})

export const reclamationFields = zod.object({
  ...zodShared.problemUrlContactPartial.shape
})

const baseSchema = zod.object({type: zod.literal("message"), ...baseFields.shape})
const reclamationSchema = (lit: "copyright" | "offensive_content") => zod.object({type: zod.literal(lit), ...reclamationFields.shape})

export const formSchema = zod.discriminatedUnion('type', [
  baseSchema,
  reclamationSchema("copyright"),
  reclamationSchema("offensive_content")
])

export type FormValues = zod.infer<typeof formSchema>