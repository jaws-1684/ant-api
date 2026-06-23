/* eslint-disable */
import { Router } from "express";
import passport from "../utils/passport.ts";
import middleware from "../utils/middleware.ts";
import authController from "../controllers/authController.ts";
import config from "../utils/config.ts";

const router = Router();
/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Create a new account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error (e.g. username/email taken, weak password)
 */

router.post("/signup", authController.signup);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with username/email + password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginPayload'
 *     responses:
 *       200:
 *         description: Logged in. Sets refreshToken as an HttpOnly cookie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email/username or password
 *       401:
 *         description: Invalid credentials
 */

router.post("/login", authController.login);
/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange the refreshToken cookie for a new access token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Missing, invalid, or expired refreshToken cookie
 */

router.post("/refresh", authController.refresh);
/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth flow
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirects to Google's consent screen
 */

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     security: []
 *     description: Not directly callable from the docs UI — Google redirects here after consent.
 *     responses:
 *       302:
 *         description: Sets refreshToken cookie and redirects to CLIENT_URL
 */

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.CLIENT_URL}`,
  }),
  authController.oauthCallback,
);
/**
 * @openapi
 * /api/auth/github:
 *   get:
 *     summary: Start GitHub OAuth flow
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirects to GitHub's consent screen
 */

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);
/**
 * @openapi
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Auth]
 *     security: []
 *     description: Not directly callable from the docs UI — GitHub redirects here after consent.
 *     responses:
 *       302:
 *         description: Sets refreshToken cookie and redirects to CLIENT_URL
 */

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${config.CLIENT_URL}`,
  }),
  authController.oauthCallback,
);
router.use(middleware.authMiddleware);
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out and clear the refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       401:
 *         description: Missing or invalid access token
 */

router.post("/logout", authController.logout);
/**
 * @openapi
 * /api/auth/credentials:
 *   patch:
 *     summary: Update email and/or password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCredentialsPayload'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing/invalid access token, or wrong current password
 */

router.patch("/credentials", authController.updateCredentials);
/**
 * @openapi
 * /api/auth/profile:
 *   delete:
 *     summary: Delete the current account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile deleted, refreshToken cookie cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       401:
 *         description: Missing/invalid access token, or wrong password
 */
router.delete("/profile", authController.deleteProfile);

export default router;
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 *     NewUser:
 *       type: object
 *       required: [username, email, password]
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 20
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 *     LoginPayload:
 *       type: object
 *       required: [password]
 *       description: Either username or email is required.
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     UpdateCredentialsPayload:
 *       type: object
 *       description: Provide email and/or password to update. newPassword required when changing password.
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           description: Current password, required when changing email or password
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           maxLength: 20
 */
