import type { mongo } from "mongoose";
import type { ChatDocument, ChatDTO, MessageDocument, MessageDTO, UserDocument, UserDTO } from "../types/index.ts";

const pick = <T extends mongo.Document, K extends keyof T>(obj: T, keys: K[]) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => keys.includes(key as K))
    ) as { [P in K]: T[P] };
};
const omit = <T extends mongo.Document, K extends keyof T>(obj: T, keys: K[]) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key as K))
    ) as { [P in keyof T]: T[P] };
};

export const userSerializer = (userDocument: UserDocument): UserDTO => {
    const serialized = pick(userDocument, [
        "email", 
        "username", 
        "image", 
        "chats", 
    ]);
    return {
        ...serialized,    
        id: userDocument?._id?.toString() ?? userDocument?.id,
    };
};
export const chatSerializer = (chatDocument: ChatDocument): ChatDTO => {
    const serialized = omit(chatDocument, [
        "_id",
        "__v",
        "participants"
    ]);
    const participants = chatDocument.participants.map((u: mongo.Document) => userSerializer(u as UserDocument));
    return {
        ...serialized,
        participants,
        id: chatDocument?.id?.toString()
    };
};
export const messageSerializer = (messageDocument: MessageDocument): MessageDTO => {
    const serialized = omit(messageDocument, [
        "_id",
        "__v",
    ]);
    return {
        ...serialized,
        id: messageDocument?.id?.toString()
    };
}
