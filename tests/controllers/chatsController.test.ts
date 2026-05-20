import db from "../../utils/db.ts";
import { addRandomUser, addChat, agent, api, getAccessToken, randomUser } from "../test_helper.ts";
import { initLazy } from "../test_lazy.ts";
import userService from "../../services/userService.ts";
import { ChatDocument, MessageDocument, UserDocument, UserDTO } from "../../types/index.ts";
import chatService from "../../services/chatService.ts";
import messageService from "../../services/messageService.ts";
import Message from "../../models/messageModel.ts";

const TOTAL_CHATS = 10;
const TOTAL_MESSAGES = 20;
describe("/api/chats", () => {
   
    const { lazy, define, clear, resolve } = initLazy<{
            user: UserDocument
            friend: UserDocument
            participants: [string, string],
            chat: ChatDocument,
            chatList: ChatDocument[],
            accessToken: string,
            chatPayload: { friendId: string },
            messageList: MessageDocument[]
        }>()
    define("user", async () => {
        const user = randomUser();
        return userService.addUser({ ...user, password: "12345678" })
    })
    define("friend", addRandomUser);
    define("participants", async () => [
        (await lazy.user).id,
        (await lazy.friend).id
    ]);
    define("chat", async () => addChat(await lazy.participants));
    define("chatPayload", async () => {
        return {
            friendId: (await lazy.friend).id
        }
    });
    define("chatList", async () => {
            const users = await userService
                    .insertUsers(
                        Array.from({ length: TOTAL_CHATS }, () => ({
                            authProvider: "local",
                            ...randomUser()
                        }))
                    )
            const userId = (await lazy.user).id;
            return await Promise.all(users.map(user => addChat([userId, user.id]))
            );
    });
    define("messageList", async () => {
        const { chat, user } = await resolve(["chat", "user"])
        const messagePayload = [...Array(TOTAL_MESSAGES).keys()].map(i => ({
            content: `message ${i}`,
            userId: user.id,
            chatId: chat.id
        }))
        return messageService.insertMessages(messagePayload)
    })
    
    define("accessToken", async () => {
        const user = await lazy.user
        return getAccessToken({
            email: user.email,
            password: "12345678"
        })
    })
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.drop();
        await db.disconnect();
    });
    beforeEach(async () => clear())

    describe("unauthenticated requests", () => {
        it("should reject creating a chat", async () => {
            await api
                .post("/api/chats")
                .send(await lazy.chatPayload)
                .expect(401);
        });

        it("should reject deleting a chat", async () => {
            const id = (await lazy.chat).id
            await api
                .delete("/api/chats/" + id)
                .expect(401);
        });

        it("should reject updating a chat", async () => {
            const id = (await lazy.chat).id
            const update = await lazy.chatPayload
            await api
                .patch("/api/chats/" + id)
                .send(update)
                .expect(401);
        });
    });

    describe("authenticated requests", () => {
        it('returns chats as json', async () => {
            const { chatList, accessToken } = await resolve([ "chatList", "accessToken" ])
            const response = await agent
                .get(`/api/chats`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

            expect(response.body).toHaveLength(chatList.length);
        });
        it("should fetch messages for a chat", async () => {
            const { chat, accessToken, messageList, user } = await resolve([ "chat", "accessToken", "messageList", "user" ])
    
            const result = await agent
                .get("/api/chats/" + chat.id)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);          
            expect(result.body.length).toEqual(messageList.length);
        });
        it("should create a chat", async () => {
            const { chatPayload, accessToken, participants } = await resolve(["chatPayload", "accessToken", "participants"])
            const response = await agent
                .post("/api/chats")
                .set("Authorization", `Bearer ${accessToken}`)
                .send(chatPayload)
                .expect(201)
                .expect("Content-Type", /application\/json/);   
            expect(response.body.participants.map((p: UserDTO) => p.id)).toEqual(expect.arrayContaining(participants));
        });

        it("should delete a chat", async () => {
            const { chat, accessToken, user } = await resolve(["chat", "accessToken", "user"])
            const response = await agent
                .delete(`/api/chats/${chat.id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);
            expect(response.body.deletedFor).toEqual(expect.arrayContaining([ user.id ]))
        });
       
        it("should not delete a chat of another user", async () => {
            const { friend } = await resolve(["friend"])
            const randomUser = await addRandomUser()
            const chat = await chatService.addChat({ participants: [ friend.id, randomUser.id ] })
            const accessToken = await lazy.accessToken
            await agent
                .delete(`/api/chats/${chat.id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(404);

        });
    });
});
