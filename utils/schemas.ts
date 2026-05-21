
import * as w from "./w.ts"

export const pageSchema = w.coerce.number().int().min(1).default(1)
export const passwordSchema =  w.password().min(8).max(20)
export const objectIdSchema = w.objectId()
export const idSchema = w.object({
    id: w.objectId()
})
export const userSchema = w.object({
    username: w.string().min(3).max(20).escape(),
    email: w.email(),
    password: passwordSchema,
    image: w.url().image().nullable().optional()
})
export const updateUserSchema = w.union([
    userSchema.pick(["username", "image"]).partial(),
    idSchema,
])
export const updateCredentialsSchema = w.union([
     userSchema.pick(["email", "password"]).partial({
        password: false
     }),
     idSchema,
     w.object({
        newPassword: passwordSchema.optional()
     })

])
export const messageSchema = w.object({
    chatId: w.objectId(),
    userId: w.objectId(),
    images: w.array(w.url().image()).optional(),
    content: w.string().trim().min(1).max(5000).escape()
})
export const updateMessageSchema = w.union([
    messageSchema.pick(["userId", "content"]),
    idSchema
])

export const loginSchema = w.union([
    userSchema.pick(["username", "email", "password"]).partial({
        password: false
    }),

]).refine(obj => Boolean(obj.email) || Boolean(obj.username), "Email or username expected")
