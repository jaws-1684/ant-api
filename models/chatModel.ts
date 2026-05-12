import mongoose, { Schema } from "mongoose";
import type { ChatDocument } from "../types/index.ts";

export const chatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedFor: [{ type: String }],
    lastReadAt: {
        type: Map,
        of: Date,
        default: {}
    }
});

chatSchema.set('toJSON', {
  transform: (_document: ChatDocument, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject._isSeenBy;
  }
});

const Chat = mongoose.model<ChatDocument>('Chat', chatSchema);


export default Chat;

