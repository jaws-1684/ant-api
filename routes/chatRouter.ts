import express from "express";
import chatsController from "../controllers/chatsController.ts";
const router = express.Router();

/**
 * @openapi
 * /api/chats:
 *   get:
 *     summary: List the current user's chats
 *     tags: [Chats]
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Missing or invalid access token
 */

router.get("/", chatsController.getChats);
/**
 * @openapi
 * /api/chats/{id}/messages:
 *   get:
 *     summary: Get messages for a chat (paginated)
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID (ObjectId)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of messages in the chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid id or page
 *       401:
 *         description: Missing or invalid access token
 */

router.get("/:id/messages", chatsController.getMessages);
/**
 * @openapi
 * /api/chats:
 *   post:
 *     summary: Start a new chat with another user
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [friendId]
 *             properties:
 *               friendId:
 *                 type: string
 *                 description: ObjectId of the user to start a chat with
 *     responses:
 *       201:
 *         description: Chat created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid or missing friendId
 *       401:
 *         description: Missing or invalid access token
 */

router.post("/", chatsController.createChat);
/**
 * @openapi
 * /api/chats/{id}:
 *   patch:
 *     summary: Mark a chat as read
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID (ObjectId)
 *     responses:
 *       200:
 *         description: Updated chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Chat not found, or current user is not a participant
 */

router.patch("/:id", chatsController.updateChat);
/**
 * @openapi
 * /api/chats/{id}:
 *   delete:
 *     summary: Delete a chat
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID (ObjectId)
 *     responses:
 *       200:
 *         description: Deleted chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Chat not found, or current user is not a participant
 */

router.delete("/:id", chatsController.deleteChat);
export default router;
/**
 * @openapi
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: ObjectIds of users in the chat
 *         createdAt:
 *           type: string
 *           format: date-time
 */
