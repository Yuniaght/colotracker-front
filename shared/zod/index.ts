import * as zod from 'zod'

export const maxSize = 1024 * 1024 * 0.5 // 512KB
export const minFiles = 1
export const maxFiles = 1
export const allowedTypes: zod.core.util.MimeTypes[] = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg',]
export const subjectEnum = zod.enum(["message", "copyright", "offensive_content"])

const registerPartial = zod.object({
  user_name: zod.string().min(1).max(100),
  password: zod.string().min(8).max(100),
  email: zod.email(),
  privacy: zod.coerce.boolean().refine(value => {
        return value;
    }, {message: "Ce champ est obligatoire"}),
})

const askABookPartial = zod.object({
  book_name: zod.string().min(1).max(100),
  author: zod.string().min(1).max(100),
  page_count: zod.coerce.bigint().positive(),
  release_date: zod.coerce.date(),
  store_link: zod.url(),
  privacy: zod.coerce.boolean().refine(value => {
    return value;
  }, {message: "Ce champ est obligatoire"}),
})

const commonContactPartial = zod.object({
  lastName: zod.string().min(1).max(100),
  firstName: zod.string().min(1).max(100),
  subject: zod.string().min(1).max(300),
  message: zod.string().min(1),
  privacy: zod.coerce.boolean().refine(value => {
    return value;
  }, {message: "Ce champ est obligatoire"}),
})

const problemUrlContactPartial = zod.object({
  ...commonContactPartial.shape,
  problematicUrl: zod.url()
})

export const zodShared = {
  registerPartial,
  askABookPartial,
  commonContactPartial,
  problemUrlContactPartial,
}