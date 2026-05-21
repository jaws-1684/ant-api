import type { mongo } from "mongoose";
import type { UserDocument, UserDTO } from "../types/index.ts";

const pick = <T extends mongo.Document, K extends keyof T>(obj: T, keys: K[]) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => keys.includes(key as K))
    ) as { [P in K]: T[P] };
};
export const userSerializer = (userDocument: UserDocument): UserDTO => {
    return {...pick(userDocument, [
        "email", 
        "username", 
        "image", 
        "chats", 
        "deleted"]),
        id: userDocument?._id?.toString()
    };
};