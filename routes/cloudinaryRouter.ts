
import { Router } from 'express';
import type { NextFunction, Response } from 'express';
import cloudinary from '../utils/cloudinary.ts';
const router = Router();

router.get('/signature', (_, response: Response, next: NextFunction) => {
    try {
        const signed = cloudinary.sign();
        response.send(signed);
    } catch(e) {
        next(e);
    }
});
export default router;