import type { MessageEntry } from "../types.ts";
const getMessages = (): MessageEntry[] => {
    return [{
        id: 1,
        content: "hello",
        creatorId: 1,
        createdAt:  new Date().toUTCString(),
    }];
};

export default {
    getMessages
};
