import type { ChatDTO, MessageDTO, ServerToClientEvents } from "../types.ts";
import config from "../utils/config.ts";
import logger from "../utils/logger.ts";
import io from "../utils/socket.ts";
import chatService from "./chatService.ts";

const broadcastMessage = async (event: keyof ServerToClientEvents, message: MessageDTO) => {
  if (config.TEST_ENV) return;
  try {
    const chat = await chatService.findOneUserChat({ id: message.chatId.toString(), userId: message.userId.toString()});
    io.to(`chat:${message.chatId}`).emit(event, message);
    broadcastChat("chat:updated", await chatService.toChatDTO(chat));
  } catch {
    logger.error("Broadcasting failed from #broadcastMessage");
    return;
  };
};
const broadcastChat = (event: keyof ServerToClientEvents, chat: ChatDTO) => {
  if (config.TEST_ENV) return;
  try {
    for (const p of chat.participants) {
      io.to(`user:${String(p.id)}`).emit(event, chat);
    };
  } catch {
    logger.error("Broadcasting failed from #broadcastChat");
    return;
  }
};
export default { broadcastMessage, broadcastChat };