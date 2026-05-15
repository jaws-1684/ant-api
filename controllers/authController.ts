import config from '../utils/config.ts';
import { UnauthorizedError } from '../utils/errors.ts';
import userService from '../services/userService.ts';
import type { Request, Response, NextFunction } from 'express';
import authService from '../services/authService.ts';
import { loginSchema, userSchema } from '../utils/schemas.ts';
import { withAuth } from '../utils/auth.ts';


const signup = async (request: Request, response: Response, next: NextFunction) => {
    await withAuth((() => {
        const newUser = userSchema.parse(request.body)
        return userService.addUser(newUser)
    }), response, next, 201)
}
const login = async (request: Request, response: Response, next: NextFunction) => {
    await withAuth((() => {
        const user = loginSchema.parse(request.body)
        return authService.loginUser(user)
    }), response, next)
};
const refresh = async (request: Request, response: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const refreshToken = request?.cookies?.refreshToken;
        if (!refreshToken) throw new UnauthorizedError();
        const accessToken = await authService.createAccessToken(refreshToken)
        return response.json({ accessToken });
    } catch(e) {
        next(e);
    }
};
const logout = (_request: Request, response: Response) => {
    response.clearCookie('refreshToken')
    response.json({ ok: true })
}
const oauthCallback  = async (request: Request, response: Response, next: NextFunction) => {
        try {
            if (!request.user)  throw new UnauthorizedError();
            const refreshToken = await authService.createRefreshToken(request.user.id)
            response.cookie('refreshToken', refreshToken, config.cookieOptions)
            response.redirect(config.CLIENT_URL as string)  
        } catch(e) {
            next(e)
        }
       
    }

export default {
    signup,
    login,
    refresh,
    logout,
    oauthCallback
};