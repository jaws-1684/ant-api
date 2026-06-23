import express from "express";
import chatsController from "../controllers/chatsController.ts";
import groupsController from "../controllers/groupsController.ts";
const router = express.Router();

/**
 * @openapi
 * /api/groups:
 *   get:
 *     summary: List the current user's groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       401:
 *         description: Missing or invalid access token
 */
router.get("/", groupsController.getGroups);

/**
 * @openapi
 * /api/groups/{id}/messages:
 *   get:
 *     summary: Get messages for a group (paginated)
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID (ObjectId)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of messages in the group
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
router.get("/:id", chatsController.getMessages);

/**
 * @openapi
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user ObjectIds
 *               image:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Group created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Missing or invalid access token
 */
router.post("/", groupsController.createGroup);

/**
 * @openapi
 * /api/groups/{id}/join:
 *   post:
 *     summary: Join an existing group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID (ObjectId)
 *     responses:
 *       201:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid group id
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Group not found
 */
router.post("/:id/join", groupsController.joinGroup);

/**
 * @openapi
 * /api/groups/{id}/read:
 *   patch:
 *     summary: Mark a group chat as read
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID (ObjectId)
 *     responses:
 *       200:
 *         description: Updated group chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid group id
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Group not found
 */
router.patch("/:id/read", chatsController.updateChat);

/**
 * @openapi
 * /api/groups/{id}:
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID (ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroup'
 *     responses:
 *       200:
 *         description: Updated group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: User is not the group admin
 *       404:
 *         description: Group not found
 */
router.put("/:id", groupsController.updateGroup);

/**
 * @openapi
 * /api/groups/{id}/leave:
 *   delete:
 *     summary: Leave a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID (ObjectId)
 *     responses:
 *       200:
 *         description: Successfully left the group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid group id
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Group not found
 */
router.delete("/:id/leave", chatsController.deleteChat);

/**
 * @openapi
 * /api/groups/{id}/close:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID (ObjectId)
 *     responses:
 *       200:
 *         description: Group deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid group id
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: User is not the group admin
 *       404:
 *         description: Group not found
 */
router.delete("/:id/close", groupsController.deleteGroup);

export default router;
/**
 * @openapi
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         admin:
 *           type: string
 *           description: User ObjectId of the group administrator
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: User ObjectIds of group members
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     UpdateGroup:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 */