import db from "../../utils/db.ts";
import messageService from "../../services/messageService.ts";
import { addTestEntry } from "../test_helper.ts";
import messageEntries from "../../data/messageEntries.ts";
import type { MessageDocument } from "../../types/index.ts";

describe("Message service", () => {
   
    let testEntry: Record<"user" | "chat" | "friend", string>;

    beforeAll(async () => {
        await db.connect();
        const { user, chat, friend } = await addTestEntry()
        testEntry = {
            user: user.id,
            chat: chat.id,
            friend: friend.id

        }
    });

    afterAll(async () => {
        await db.drop();
        await db.disconnect();
    });
    beforeEach(async () => {
        await messageService.dropMessages();
    });


    it("#addMessage should create a message", async () => {
        const content = "New message";
        const message = await messageService.addMessage({
            ...testEntry,
            content: "New message"
        })
        expect(message.content).toEqual(content);
    });
    it("#deleteMessage should delete a message", async () => {
        const content = "New message";
        const message = await messageService.addMessage({
            ...testEntry,
            content
        }) as MessageDocument;
        const id = message.id
        const userId = testEntry.user
        await messageService.deleteMessage({ id, userId });
        expect(await messageService.findMessage({ id, userId }) ).toBe(null);
    });
    it("#updateMessage should update a message", async () => {
        const content = "New message";
        const message = await messageService.addMessage({
            ...testEntry,
            content
        }) as MessageDocument;
        const id = message.id
        const userId = testEntry.user

        const updateContent = "Updated Message";
        await messageService.updateMessage({ id, user: userId, content: updateContent });
        const updatedMessage = await messageService.findMessage({ id, userId }) as MessageDocument
        expect(updatedMessage.content).toBe(updateContent);
    });
    describe("#getMessages", () => {
        let newMessages;
        beforeEach(async () => {
            const contents = messageEntries.slice(0, 20);
            newMessages = contents.map((content, idx) => ({
                user: idx % 2 == 0 ? testEntry.user : testEntry.friend,
                chat: testEntry.chat,
                content
            }))
            newMessages = await messageService.insertMessages(newMessages)
        });
        it("#getMessages should return all chat messages for current user", async () => {
            const messages = await messageService.getMessages({ userId: testEntry.user, chatId: testEntry.chat})
            expect(messages.length).toEqual(newMessages.length);
        });
        it("#getMessages should return all chat messages for the other user", async () => {
            const messages = await messageService.getMessages({ userId: testEntry.friend, chatId: testEntry.chat})
            expect(messages.length).toEqual(newMessages.length);
        });
    })
    
});