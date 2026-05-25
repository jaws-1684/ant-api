import express from "express";
import chatsController from "../controllers/chatsController.ts";
import groupsController from "../controllers/groupsController.ts";
const router = express.Router();

router.get("/", groupsController.getGroups);
router.get("/:id", chatsController.getMessages);
router.post("/", groupsController.createGroup);
router.post("/:id/join", groupsController.joinGroup);
router.patch("/:id/read", chatsController.updateChat);
router.put("/:id", groupsController.updateGroup);
router.delete("/:id/leave", chatsController.deleteChat);
router.delete("/:id/close", groupsController.deleteGroup);

export default router;