import db from "../../utils/db.ts";
import messageService from "../../services/messageService.ts";
import { addTestEntry } from "../test_helper.ts";
import type { MessageDocument } from "../../types/index.ts";

describe("Message service", () => {
   
    let testEntry: Record<"userId" | "chatId" | "friendId", string>;

    beforeAll(async () => {
        await db.connect();
        const { user, chat, friend } = await addTestEntry()
        testEntry = {
            userId: user.id,
            chatId: chat.id,
            friendId: friend.id

        }
    });

    afterAll(async () => {
        await db.drop();
        await db.disconnect();
    });

    describe("#create, #update and #delete", () => {
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
        it("#deleteMessage should set the softDeleted flag and change the content to 'This message was deleted'", async () => {
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
            await messageService.updateMessage({ id, userId, content: updateContent });
            const updatedMessage = await messageService.findMessage({ id, userId }) as MessageDocument
            expect(updatedMessage.content).toBe(updateContent);
        });
    })

    describe("#getMessages", () => {
        const MESSAGES_COUNT = 20;
        beforeAll(async () => {
            messageService.dropMessages()
            for (let i = 0; i < MESSAGES_COUNT; i++) {
                await messageService.addMessage({
                    chatId: testEntry.chatId,
                    userId: testEntry.userId,
                    content: `message ${i}`
                });
            }
        });
        it("should return all chat messages for current user", async () => {
            const messages = await messageService.getMessages({ userId: testEntry.userId, chatId: testEntry.chatId})
            expect(messages.length).toEqual(MESSAGES_COUNT);
        });
        it("should return all chat messages for the other user", async () => {
            const messages = await messageService.getMessages({ userId: testEntry.friendId, chatId: testEntry.chatId})
            expect(messages.length).toEqual(MESSAGES_COUNT);
        });
            it("should return messages sorted by date descending", async () => {
            const messages = await messageService.getMessages({ chatId: testEntry.chatId, userId: testEntry.userId });
            expect(messages[0].content).toBe("message 19");
            expect(messages[messages.length - 1].content).toBe("message 0");
        });

        it("should return first page of messages", async () => {
            const messages = await messageService.getMessages({ 
                chatId: testEntry.chatId, 
                userId: testEntry.userId,
                offset: 0,
                limit: 10
            });
            expect(messages.length).toBe(10);
            expect(messages[0].content).toBe("message 19");
        });

        it("should return second page of messages", async () => {
            const messages = await messageService.getMessages({ 
                chatId: testEntry.chatId, 
                userId: testEntry.userId,
                offset: 10,
                limit: 10
            });
            expect(messages.length).toBe(10);
            expect(messages[0].content).toBe("message 9");
        });
        it("should return second page of messages", async () => {
            const messages = await messageService.getMessages({ 
                chatId: testEntry.chatId, 
                userId: testEntry.userId,
                offset: 10,
                limit: 10
            });
            expect(messages.length).toBe(10);
            expect(messages[0].content).toBe("message 9");
        });

        it("should return no messages on non exiting page", async () => {
            const messages = await messageService.getMessages({ 
                chatId: testEntry.chatId, 
                userId: testEntry.userId,
                offset: 200000,
                limit: 10
            });
            expect(messages.length).toBe(0);
        });
        it("should replace deleted message content", async () => {
            const id = (await messageService.getMessages({ userId: testEntry.userId, chatId: testEntry.chatId}))[0].id!;
            await messageService.deleteMessage({ id, userId: testEntry.userId });
            const messages = await messageService.getMessages({ chatId: testEntry.chatId, userId: testEntry.userId });
            expect(messages[0].content).toBe("This message was deleted");
        });
    })
});