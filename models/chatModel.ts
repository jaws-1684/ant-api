import mongoose, { Schema } from "mongoose";
import type { ChatDocument } from "../types.ts";
import { chatSerializer } from "../utils/serializers.ts";


export const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  notifications: [{ type: Schema.Types.ObjectId, ref: "Notification"}],
  lastReadAt: {
    type: Map,
    of: Date,
    default: {},
  },
  name: {
    type: String,
    default: null,
  },
  image: { type: String, default: null },
  isGroup: { type: Boolean, default: false },
  admin: { type: String },
  closed: { type: Boolean, default: false },
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null }
});
chatSchema.set("toJSON", {
  transform: (_doc, returnedObject) =>
    chatSerializer(returnedObject),
});

const Chat = mongoose.model<ChatDocument>("Chat", chatSchema);

export default Chat;
