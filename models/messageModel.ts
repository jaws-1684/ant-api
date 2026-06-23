import mongoose, { Schema } from "mongoose";
import type { MessageDocument } from "../types.ts";
import { messageSerializer } from "../utils/serializers.ts";

export const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minlength: 1,
      maxLength: 5000,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [{ type: String }],
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    isEdited: { type: Boolean },
    softDeleted: { type: Boolean },
  },
  { timestamps: true },
);

messageSchema.set("toJSON", {
  transform: (_document, returnedObject) =>
    messageSerializer(returnedObject),
});

const Message = mongoose.model<MessageDocument>("Message", messageSchema);

export default Message;
