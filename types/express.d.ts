import { UserDocument } from "./index.ts";

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}
