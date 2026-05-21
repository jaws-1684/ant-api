import jwt from 'jsonwebtoken'
import config from './config.ts'

export const generateAccessToken = async (userId: string) => {
    return jwt.sign(
        { userId },
        config.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
}
export const generateRefreshToken = async (userId: string) => {
    return jwt.sign(
        { userId },
        config.JWT_REFRESH_SECRET as string,
        { expiresIn: '7d' }
    );
};
