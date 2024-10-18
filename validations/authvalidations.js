import vine from '@vinejs/vine'

export const registerSchema = vine.object({
  name: vine.string().minLength(2).maxLength(190),
  email: vine.string().email(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed(),
    image: vine.string().url().optional(), 
})

export const loginSchema = vine.object({
    email:vine.string().email(),
    password: vine.string(),
})

export const StoreSchema = vine.object({
  title:vine.string().minLength(3).maxLength(190),
  content:vine.string().minLength(10).maxLength(3000),
  price:vine.number(),
  category:vine.string().minLength(10).maxLength(200)
})