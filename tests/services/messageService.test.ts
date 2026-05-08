import db from "../../utils/db.ts";
import messageService from "../../services/messageService.ts";
import { addTestEntry } from "../test_helper.ts";
import messageEntries from "../../data/messageEntries.ts";
import type { MessageDocument } from "../../types/index.ts";

describe("Message service", () => {
   
    let testEntry: Record<"userId" | "chatId" | "friend", string>;

    beforeAll(async () => {
        await db.connect();
        const { user, chat, friend } = await addTestEntry()
        testEntry = {
            userId: user.id,
            chatId: chat.id,
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
    it("#deleteMessage should set the softDeleted flag and change the contetn to 'This message was deleted'", async () => {
        const content = "New message";
        const message = await messageService.addMessage({
            ...testEntry,
            content
        }) as MessageDocument;
        const id = message.id
        const userId = testEntry.userId
        await messageService.deleteMessage({ id, userId });
        const deletedMessage = await messageService.findMessage({ id, userId })
        expect(deletedMessage?.softDeleted ).toBe(true);
    });
    it("#updateMessage should update a message", async () => {
        const content = "New message";
        const message = await messageService.addMessage({
            ...testEntry,
            content
        }) as MessageDocument;
        const id = message.id
        const userId = testEntry.userId

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
                userId: idx % 2 == 0 ? testEntry.userId : testEntry.friend,
                chatId: testEntry.chatId,
                content
            }))
            newMessages = await messageService.insertMessages(newMessages)
        });
        it("should return all chat messages for current user", async () => {
            const messages = await messageService.getMessages({ userId: testEntry.userId, chatId: testEntry.chatId})
            expect(messages.length).toEqual(newMessages.length);
        });
        it("should return all chat messages for the other user", async () => {
            const messages = await messageService.getMessages({ userId: testEntry.friend, chatId: testEntry.chatId})
            expect(messages.length).toEqual(newMessages.length);
        });
    })
    
});