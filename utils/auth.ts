import type { NextFunction, Response, Request } from "express"
import type { AuthenticatedRequest, UserDTO } from "../types/index.ts"
import authService from "../services/authService.ts"
import config from "./config.ts"

export const withAuth = async (
    fn: () => Promise<UserDTO>,
    response: Response,
    next: NextFunction,
    status = 200
) => {
    try {
        const user = await fn()
        const refreshToken = await authService.createRefreshToken(user.id)
        response.cookie('refreshToken', refreshToken, config.cookieOptions)
        response.status(status).json(user)
    } catch(e: unknown) {
        next(e)
    }
}
export const getCurrentUserId = (request: Request<unknown, unknown, unknown>) => {
    const autRequest = request as AuthenticatedRequest;
    return autRequest.user._id.toString();
}
