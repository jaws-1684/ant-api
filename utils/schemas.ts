import * as w from "./w.ts"

export const userSchema = w.object({
    username: w.string().min(3),
    email: w.email(),
    password: w.password().min(8),
    image: w.url().optional()
})
export const updateUserSchema = w.object({
    id: w.objectId(),
    username: w.string().min(3).optional(),
    email: w.email().optional(),
    password: w.password().min(8).optional(),
    image: w.url().optional()
})

export const messageSchema = w.object({
    chatId: w.objectId(),
    userId: w.objectId(),
    content: w.string().min(1).max(5000)
})
export const updateMessageSchema = w.object({
    id: w.objectId(),
    userId: w.objectId(),
    content: w.string().min(1).max(5000)
})
export const objectIdSchema = w.objectId()