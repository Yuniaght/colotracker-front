import * as zod from 'zod'

export const maxSize = 1024 * 1024 * 0.5 // 512KB
export const maxFiles = 1
export const allowedTypes: zod.core.util.MimeTypes[] = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg',]

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
  book_author: zod.string().min(1).max(100),
  page_count: zod.coerce.bigint().positive(),
  release_date: zod.date(),
  store_link: zod.url(),
  privacy: zod.coerce.boolean().refine(value => {
    return value;
  }, {message: "Ce champ est obligatoire"}),
})

export const zodShared = {
  registerPartial,
  askABookPartial,
}