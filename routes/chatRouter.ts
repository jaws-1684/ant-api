import express from 'express';
import chatsController from '../controllers/chatsController.ts';
const router = express.Router();

router.get('/', chatsController.getChats);
router.get('/:id', chatsController.getMessages);
router.post('/', chatsController.createChat);
router.patch('/:id', chatsController.updateChat);
router.delete('/:id', chatsController.deleteChat);
export default router;