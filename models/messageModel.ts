import mongoose, { Schema } from "mongoose";
import type { MessageDocument } from "../types/index.ts";
import { messageSerializer } from "../utils/serializers.ts";

export const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
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
  transform: (
    _document,
    returnedObject,
  ) => messageSerializer(returnedObject as MessageDocument),
});

const Message = mongoose.model<MessageDocument>("Message", messageSchema);

export default Message;
