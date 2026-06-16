import mongoose, { Schema } from "mongoose";
import { NotAcceptedError } from "../utils/errors.ts";
import { userSerializer } from "../utils/serializers.ts";

export const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  authProvider: {
    type: String,
    enum: ["local", "google", "github"],
    required: true,
  },
  password: { type: String },
  image: { type: String, default: null },
  googleId: { type: String },
  githubId: { type: String },
  refreshToken: { type: String, unique: true, sparse: true },
  chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
  deleted: { type: Boolean, default: false },
});

userSchema.pre("save", function () {
  if (this.authProvider === "local" && !this.password) {
    throw new NotAcceptedError("Password required for local accounts");
  }
});

userSchema.set("toJSON", {
  transform: (_document, returnedObject) =>
    userSerializer(returnedObject),
});

const User = mongoose.model("User", userSchema);

export default User;
