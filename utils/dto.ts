import Message from "../models/messageModel.ts";
import Notification from "../models/notificationModel.ts";
import User from "../models/userModel.ts";
import type { ChatDTO, ChatDocument, DTOType, DocumentType, MessageDTO, MessageDocument, UserDTO, UserDocument } from "../types.ts";
import { NotFoundError } from "./errors.ts";

export const initDTO = <Doc extends DocumentType, DTO extends DTOType>(
  toDTO: (doc: Doc) => Promise<DTO> | DTO
) => {
  return <Params>(
    getDocument: (obj: Params) => Promise<Doc | null>,
    broadcast?: (dto: DTO) => Promise<void> | void
  ) => {
    return async (obj: Params): Promise<DTO> => {
      const doc = await getDocument(obj);
      if (!doc) throw new NotFoundError();
      const dto = await toDTO(doc);
      if (broadcast) await broadcast(dto);
      return dto;
    };
  };
};
export const toChatDTO = async <T extends ChatDocument>(doc: T): Promise<ChatDTO> => {
  const lastMessage = await Message.findOne({ _id: doc.lastMessage });
  const notifications = await Notification.find({ chatId: doc._id });
  const participants = await User.find({ '_id': { $in: doc.participants } });
  const chat = doc.toJSON() as unknown as ChatDTO;
  return {
    ...chat,
    notifications: notifications.map(n => n.toJSON()),
    participants: participants.map(p => p.toJSON() as unknown as UserDTO),
    lastMessage: lastMessage?.toJSON()
  };
};
export const toUserDTO = (user: UserDocument) => user.toJSON() as unknown as UserDTO;
export const toMessageDTO = (doc: MessageDocument) => doc.toJSON() as unknown as MessageDTO;
export const withUserDTO = initDTO<UserDocument, UserDTO>(toUserDTO);
export const withChatDTO = initDTO<ChatDocument, ChatDTO>(toChatDTO);
export const withMessageDTO = initDTO<MessageDocument, MessageDTO>(toMessageDTO);