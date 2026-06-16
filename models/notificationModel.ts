import mongoose, { Schema } from "mongoose";
import type { NotificationDocument } from "../types.ts";
import { notificationSerializer } from "../utils/serializers.ts";

export const notificationSchema = new mongoose.Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    newMessages: { type: Number, default: 0 },    
  },
  { timestamps: true },
);


const Notification = mongoose.model<NotificationDocument>("Notification", notificationSchema);
notificationSchema.set("toJSON", {
  transform: (_doc, returnedObject) =>
    notificationSerializer(returnedObject),
});
export default Notification;
