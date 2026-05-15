import mongoose, { Schema } from "mongoose";
import type { MessageDTO, MessageDocument } from "../types/index.ts";

export const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    userId: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    images: [{ type: String }],
    chatId: {
        type: Schema.Types.ObjectId, ref: 'Chat',
        required: true
    },
    isEdited: { type: Boolean },
    softDeleted: { type: Boolean }
}, { timestamps: true});

messageSchema.set('toJSON', {
  transform: (_document: MessageDocument, returnedObject: MessageDTO) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

const Message = mongoose.model<MessageDocument>('Message', messageSchema);


export default Message;

