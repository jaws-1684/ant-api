import mongoose, { Schema } from "mongoose";
import type { ChatDocument, UserDocument } from "../types/index.ts";

export const chatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedFor: [{ type: String }],
    lastReadAt: {
        type: Map,
        of: Date,
        default: {}
    },
    name: {
      type: String,
      default: null
    },
    isGroup: { type: Boolean, default: false },
    admin: { type: String },
    closed: { type: Boolean, default: false }
});

chatSchema.set('toJSON', {
  transform: (_document: ChatDocument, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id?.toString();
    returnedObject.participants = returnedObject.participants.map((p: UserDocument) => ({
      id: p._id?.toString(),
      username: p.username,
      email: p.email,
      image: p.image ?? "https://i.pravatar.cc/300"
    }))
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject._isSeenBy;
    
    return returnedObject
  }
});

const Chat = mongoose.model<ChatDocument>('Chat', chatSchema);


export default Chat;

