import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../utils/config.ts';
import userService from './userService.ts';
import { ForbiddenError, InvalidCredentialsError } from '../utils/errors.ts';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.ts';
import type { LoginPayload, UserDTO } from '../types/index.ts';

const createAccessToken = async (refreshToken: string): Promise<string> => {
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET as string) as { userId: string };
    const user = await userService.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) throw new ForbiddenError();
    return generateAccessToken(user.id)
}
const createRefreshToken = async(userId: string): Promise<string> => {
    const refreshToken = await generateRefreshToken(userId);
    await userService.updateRefreshToken({ id: userId, refreshToken });
    return refreshToken
}
const loginUser = async (loginUser: LoginPayload): Promise<UserDTO> => {
    const user = loginUser.email
        ? await userService.findByEmail(loginUser.email)
        : await userService.findByUsername(loginUser.username!)
    const password = loginUser.password       
    if (!user) {
        const dummyHash = '$2b$10$invalidhashtopreventtimingattacks000000000000000000000';
        await bcrypt.compare(password, dummyHash);
        throw new InvalidCredentialsError();
    }  
    const match = await bcrypt.compare(password, user.password!);
    if (!match)  throw new InvalidCredentialsError();
    return { ...user.toJSON(), id: user.id }
}
export default {
    createAccessToken,
    createRefreshToken,
    loginUser
}