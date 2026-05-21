import mongoose, { Schema } from "mongoose";
import type { ChatDocument } from "../types/index.ts";
import { chatSerializer } from "../utils/serializers.ts";

export const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastReadAt: {
    type: Map,
    of: Date,
    default: {},
  },
  name: {
    type: String,
    default: null,
  },
  isGroup: { type: Boolean, default: false },
  admin: { type: String },
  closed: { type: Boolean, default: false },
});

chatSchema.set("toJSON", {
  transform: (_document, returnedObject) => chatSerializer(returnedObject as ChatDocument),
});

const Chat = mongoose.model<ChatDocument>("Chat", chatSchema);

export default Chat;
