import type { UserDocument } from "../types.ts";
/* eslint-disable */
declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}
