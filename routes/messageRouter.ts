import express from "express";
import messagesController from "../controllers/messagesController.ts";

const router = express.Router();
/**
 * @openapi
 * /api/messages/{chatId}:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "hey, you free later?"
 *     responses:
 *       201:
 *         description: Message created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid access token
 */

router.post("/", messagesController.createMessage);

/**
 * @openapi
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID (ObjectId)
 *     responses:
 *       200:
 *         description: Deleted message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Message not found, or not owned by current user
 */
router.delete("/:id", messagesController.deleteMessage);
/**
 * @openapi
 * /api/messages/{id}:
 *   patch:
 *     summary: Update a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID (ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMessage'
 *     responses:
 *       200:
 *         description: Updated message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Message not found, or not owned by current user
 */
router.patch("/:id", messagesController.updateMessage);
export default router;
/**
 * @openapi
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         chatId:
 *           type: string
 *         userId:
 *           type: string
 *         content:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *     NewMessage:
 *       type: object
 *       required: [chatId]
 *       description: At least one of content or images is required.
 *       properties:
 *         chatId:
 *           type: string
 *         content:
 *           type: string
 *           maxLength: 5000
 *           example: "hey, you free later?"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *     UpdateMessage:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 5000
 */