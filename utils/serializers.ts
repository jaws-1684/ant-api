import type {
  ReturnedChat,
  ReturnedMessage,
  ReturnedNotification,
  ReturnedUser,
  ReturnedType,
} from "../types.ts";
const pick = <T extends ReturnedType, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as K)),
  ) as Pick<T, K>;
};
const omit = <T extends ReturnedType, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K)),
  ) as Omit<T, K>;
};
const serializer = <T extends ReturnedType, S = Omit<T, '_id' | '__v'>>(selector?: (obj: T) => S) => {
  return (obj: T): S & { id: string } => {
    const omitted = omit(obj, ["_id", "__v"]);
    const returned = selector 
      ? selector(omitted as T)
      : obj;
    return {
      ...returned,
      id: obj._id.toString()
    } as S & { id: string };
  };
};
export const userSerializer = serializer((returnedUser: ReturnedUser) => {
   return pick(returnedUser, [
    "email",
    "username",
    "image",
    "chats",
  ] as const);
});
export const chatSerializer = serializer((returnedChat: ReturnedChat) => omit(returnedChat, ["deletedFor"]));
export const notificationSerializer = serializer((returnedNotification: ReturnedNotification) => returnedNotification);
export const messageSerializer = serializer((returnedMessage: ReturnedMessage) => {
   const replaceDeleted = (message: ReturnedMessage) => {
    if (message.softDeleted) {
      return { ...message, content: "This message was deleted" };
    }
    return message;
  };
  return replaceDeleted(returnedMessage);
});