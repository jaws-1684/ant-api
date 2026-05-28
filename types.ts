import type { InferSchemaType, HydratedDocument, mongo } from "mongoose";
import type { messageSchema as mongoMessageSchema } from "./models/messageModel.ts";
import type { chatSchema as mongoChatSchema } from "./models/chatModel.ts";
import type { userSchema as mongoUserSchema } from "./models/userModel.ts";
import type { notificationSchema as mongoNotificationSchema } from "./models/notificationModel.ts";
import type {
  userSchema,
  updateUserSchema,
  messageSchema,
  updateMessageSchema,
  loginSchema,
  updateCredentialsSchema,
  groupSchema,
  updateGroupSchema,
} from "./utils/schemas.ts";
import type { Infer } from "./utils/w.ts";

import type { Request } from "express";

interface WithId {
  id: string;
} 
interface WithMongoId {
  _id: mongo.ObjectId;
  __v: number;
};
export type NotificationEntry = InferSchemaType<typeof mongoNotificationSchema>;
export type NotificationDocument = HydratedDocument<NotificationEntry>;
export type NotificationDTO = NotificationEntry & WithId;
export type ReturnedNotification = NotificationEntry & WithMongoId;
export type MessageEntry = InferSchemaType<typeof mongoMessageSchema>;
export type MessageDocument = HydratedDocument<MessageEntry>;
export type MessageDTO = MessageEntry & WithId;
export type NewMessage = Infer<typeof messageSchema>;
export type UpdateMessage = Infer<typeof updateMessageSchema>;
export type ReturnedMessage = MessageEntry & WithMongoId;

export type ChatEntry = InferSchemaType<typeof mongoChatSchema>;
export type ChatDocument = HydratedDocument<ChatEntry>;
type ChatDTOTransform = {
  participants: UserDTO[] | mongo.ObjectId[],
  notifications: NotificationDTO[],
  lastMessage?: MessageDTO | null | undefined,
  unread?: number
};
export type ChatDTO = Omit<ChatEntry, keyof ChatDTOTransform> & ChatDTOTransform & WithId;
export type ReturnedChat = ChatEntry & WithMongoId;
export type UserEntry = InferSchemaType<typeof mongoUserSchema>;
export type UserDocument = HydratedDocument<UserEntry>;
export type UserDTO = {
    username: string;
    email: string;
    chats: mongo.ObjectId[];
    deleted: boolean;
    image?: string | null | undefined;
} & WithId;
export type NewUser = Infer<typeof userSchema>;
export type UpdateUser = Infer<typeof updateUserSchema>;
export type ReturnedUser = UserEntry & WithMongoId;
export type LoginPayload = Infer<typeof loginSchema>;
export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}
export type UpdateCredentialsPayload = Infer<typeof updateCredentialsSchema>;
export type GroupPayload = Infer<typeof groupSchema>;
export type UpdateGroup = Infer<typeof updateGroupSchema>;
interface Profile {
  id: string;
  emails: Record<"value", string>[];
  photos: Record<"value", string>[];
}
export type GoogleProfile = Profile & { displayName: string };
export type GithubProfile = Profile & { username: string };
export interface ChatServiceParams {
  id: string;
  userId: string;
}
export interface ServerToClientEvents {
  "user:online": (data: { userId: string }) => void;
  "user:offline": (data: { userId: string }) => void;
  "chat:new": (chat: ChatDTO) => void;
  "chat:updated": (chats: ChatDTO) => void;
  "message:new": (message: MessageDTO) => void;
  "message:updated": (message: MessageDTO) => void;
  "typing:start": (data: { userId: string; chatId: string }) => void;
  "typing:stop": (data: { userId: string; chatId: string }) => void;
}
export interface ClientToServerEvents {
  "typing:start": (chatId: string) => void;
  "typing:stop": (chatId: string) => void;
}

export type DocumentType =
  | MessageDocument
  | ChatDocument
  | NotificationDocument
  | UserDocument;
export type DTOType =
  | MessageDTO
  | ChatDTO
  | NotificationDTO
  | UserDTO;
export type InferDTO<T extends DocumentType> = T extends MessageDocument 
  ? MessageDTO
  : T extends ChatDocument
  ? ChatDTO
  : T extends NotificationDocument
  ? NotificationDTO
  : T extends UserDocument
  ? UserDTO
  : never;
export type InferDocument<T extends DocumentType> = T extends MessageDocument 
  ? MessageDocument
  : T extends ChatDocument
  ? ChatDocument
  : T extends NotificationDocument
  ? NotificationDocument
  : T extends UserDocument
  ? UserDocument
  : never;
  
export type ReturnedType =
  | ReturnedUser
  | ReturnedChat
  | ReturnedNotification
  | ReturnedMessage;
export type InferReturnType<T extends ReturnedType> = T extends ReturnedChat 
  ? ReturnedChat
  : T extends ReturnedMessage
  ? ReturnedMessage
  : T extends ReturnedNotification
  ? ReturnedNotification
  : T extends ReturnedUser
  ? ReturnedUser
  : never;