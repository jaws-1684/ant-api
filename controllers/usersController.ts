import type { Response, Request, NextFunction } from "express"
import type { UserDTO } from "../types/index.ts"
import { getCurrentUserId } from "../utils/auth.ts"
import { updateUserSchema } from "../utils/schemas.ts"
import userService from "../services/userService.ts"

const updateProfile = async (request: Request, response: Response<UserDTO>, next: NextFunction) => {
    try {
        const id = getCurrentUserId(request)
        const payload = updateUserSchema.parse({...request.body, id })
        const updatedUser = await userService.updateUser(payload)
        response.json(updatedUser as UserDTO)
    } catch (e: unknown) {
        next(e)
    }
    
}

export default {
    updateProfile
}