import type {
  DTOType,
  InferDocument,
  ReturnedChat,
  ReturnedMessage,
  ReturnedNotification,
  ReturnedUser,
  ReturnedType,
  DocumentType,
  InferDTO,
  InferReturnType
} from "../types.ts";

const pick = <T extends ReturnedType, Out extends InferReturnType<T>, K extends keyof Out>(
  obj: T,
  keys: K[],
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as K)),
  ) as { [P in keyof Out]: Out[P] };
};
const omit = <T extends ReturnedType, Out extends InferReturnType<T>, K extends keyof Out>(
  obj: Out,
  keys: K[],
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K)),
  ) as { [P in keyof Out]: Out[P] };
};

const serializer = <T extends ReturnedType, Out extends InferReturnType<T>>(selector?: (obj: Out) => Out) => {
  return (obj: Out) => {
    const omitted = omit(obj, ["_id", "__v"]);
    const returned = selector 
      ? selector(omitted)
      : obj;
    return {
      ...returned,
      id: obj._id.toString()
    };
  };
};
export const userSerializer = serializer((returnedUser: ReturnedUser) => {
   return pick(returnedUser, [
    "email",
    "username",
    "image",
    "chats",
  ]);
});
export const chatSerializer = serializer((returnedChat: ReturnedChat) => returnedChat);
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
export const withDTO = <Doc extends DocumentType, Params, DTO extends DTOType>(
  getDocument: (obj: Params) => Promise<Doc>,
  toDTO: (doc: InferDocument<Doc>) => Promise<DTO>,
  broadcast?: (dto: InferDTO<Doc>) => Promise<void>) => {
  return async (obj: Params) => {
    const document = await getDocument(obj) as InferDocument<Doc>;
    const dto = await toDTO(document) as InferDTO<Doc>;
    if (broadcast !== undefined) await broadcast(dto);
    return dto;
  };
};