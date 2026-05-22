import { Router } from "express";
import middleware from "../utils/middleware.ts";
import searchController from "../controllers/searchController.ts";

const router = Router();

router.use(middleware.authMiddleware);

router.get("/users", searchController.searchUsers);
router.get("/groups", searchController.searchGroups);

export default router;