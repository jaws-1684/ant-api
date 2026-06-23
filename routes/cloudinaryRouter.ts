
import { Router } from 'express';
import type { NextFunction, Response } from 'express';
import cloudinary from '../utils/cloudinary.ts';
const router = Router();

/**
 * @openapi
 * /api/cloudinary/signature:
 *   get:
 *     summary: Get a signed Cloudinary upload signature
 *     tags: [Cloudinary]
 *     description: Returns a short-lived Cloudinary signature that allows authenticated clients to upload files directly to Cloudinary.
 *     responses:
 *       200:
 *         description: Signed upload parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CloudinarySignature'
 *       401:
 *         description: Missing or invalid access token
 */
router.get('/signature', (_, response: Response, next: NextFunction) => {
    try {
        const signed = cloudinary.sign();
        response.send(signed);
    } catch(e) {
        next(e);
    }
});
export default router;
/**
 * @openapi
 * components:
 *   schemas:
 *     CloudinarySignature:
 *       type: object
 *       required:
 *         - timestamp
 *         - signature
 *         - cloudName
 *         - apiKey
 *       properties:
 *         timestamp:
 *           type: integer
 *           description: Unix timestamp used to generate the signature
 *           example: 1715347200
 *         signature:
 *           type: string
 *           description: Cloudinary API signature
 *           example: 8e4a9f5b4d7e7e4d5d7a8c9e0f1a2b3c4d5e6f7a
 *         cloudName:
 *           type: string
 *           description: Cloudinary cloud name
 *           example: my-cloud
 *         apiKey:
 *           type: string
 *           description: Public Cloudinary API key
 *           example: "123456789012345"
 */