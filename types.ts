import type { InferSchemaType, HydratedDocument, mongo } from "mongoose";
import type { messageSchema as mongoMessageSchema } from "./models/messageModel.ts";
import type { chatSchema as mongoChatSchema } from "./models/chatModel.ts";
import type { userSchema as mongoUserSchema } from "./models/userModel.ts";
import type {
  userSchema,
  updateUserSchema,
  messageSchema,
  updateMessageSchema,
  loginSchema,
  updateCredentialsSchema,
} from "./utils/schemas.ts";
import type { Infer } from "./utils/w.ts";

import type { Request } from "express";

interface WithMongoId {
  id: string;
}

export type MessageEntry = InferSchemaType<typeof mongoMessageSchema>;
export type MessageDocument = HydratedDocument<MessageEntry>;
export type MessageDTO = MessageEntry & WithMongoId;
export type NewMessage = Infer<typeof messageSchema>;
export type UpdateMessage = Infer<typeof updateMessageSchema>;

export type ChatEntry = InferSchemaType<typeof mongoChatSchema>;
export type ChatDocument = HydratedDocument<ChatEntry>;
export type ChatDTO = Omit<ChatEntry & {
  lastMessage?: MessageDTO | null;
  unread?: number;
} & WithMongoId, "participants"> & { participants: UserDTO[] | mongo.ObjectId[] };

type UserSensitiveFields =
  | "password"
  | "refreshToken"
  | "authProvider"
  | "googleId"
  | "githubId"
  | "deleted";
export type UserEntry = InferSchemaType<typeof mongoUserSchema>;
export type UserDocument = HydratedDocument<UserEntry>;
export type UserDTO = Omit<UserEntry & { id: string }, UserSensitiveFields>;
export type NewUser = Infer<typeof userSchema>;
export type UpdateUser = Infer<typeof updateUserSchema>;
export type LoginPayload = Infer<typeof loginSchema>;
export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}
export type UpdateCredentialsPayload = Infer<typeof updateCredentialsSchema>;
interface Profile {
  id: string;
  emails: Record<"value", string>[];
  photos: Record<"value", string>[]
}
export type GoogleProfile = Profile & { displayName: string };
export type GithubProfile = Profile & { username: string };