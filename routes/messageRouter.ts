import express from 'express';
import messagesController from '../controllers/messagesController.ts';

const router = express.Router();


router.post('/', messagesController.createMessage);
router.delete('/:id', messagesController.deleteMessage);
router.put('/:id', messagesController.updateMessage);
export default router;