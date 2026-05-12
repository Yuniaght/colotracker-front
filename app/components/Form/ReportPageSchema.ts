import * as zod from 'zod'
import {zodShared} from '#shared/zod'

export const reportPageFields = {
  ...zodShared.reportPagePartial.shape,
}

export const reportPageSchema = zod.object(reportPageFields)

export type ReportPageFormValues = zod.infer<typeof reportPageSchema>