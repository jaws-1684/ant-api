import { Router } from "express";
import middleware from "../utils/middleware.ts";
import searchController from "../controllers/searchController.ts";

const router = Router();

router.use(middleware.authMiddleware);

/**
 * @openapi
 * /api/search/users:
 *   get:
 *     summary: Search users
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Username or text to search for
 *     responses:
 *       200:
 *         description: Matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Missing or invalid access token
 */
router.get("/users", searchController.searchUsers);

/**
 * @openapi
 * /api/search/groups:
 *   get:
 *     summary: Search groups
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Group name to search for
 *     responses:
 *       200:
 *         description: Matching groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Missing or invalid access token
 */
router.get("/groups", searchController.searchGroups);
export default router;