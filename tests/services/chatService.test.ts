import db from "../../utils/db.ts";
import chatService from "../../services/chatService.ts";
import { addChat, addRandomUser, randomUser } from "../test_helper.ts";
import messageService from "../../services/messageService.ts";
import userService from "../../services/userService.ts";
import { initLazy } from "../test_lazy.ts";
import type { ChatDTO, UserDTO } from "../../types.ts";

const TOTAL_CHATS = 10;
describe("Chat service", () => {
  const { lazy, define, resolve, clear } = initLazy<{
    user: UserDTO;
    friend: UserDTO;
    participants: [string, string];
    chat: ChatDTO;
    chatList: ChatDTO[];
  }>();

  define("user", addRandomUser);
  define("friend", addRandomUser);

  define("participants", async () => [
    (await lazy.user).id,
    (await lazy.friend).id,
  ]);

  define("chat", async () => addChat(await lazy.participants));
  define("chatList", async () => {
    const users = await userService.insertUsers(
      Array.from({ length: TOTAL_CHATS }, () => ({
        authProvider: "local",
        ...randomUser(),
      })),
    );
    const userId = (await lazy.user).id;
    return await Promise.all(users.map((user) => addChat([userId, user.id])));
  });

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.drop();
    clear();
  });

  it("#addChat should create a chat", async () => {
    const chat = await lazy.chat;
    expect(chat.participants.map(p => p.id)).toEqual(await lazy.participants);
  });

  it("#deleteChat should soft delete a chat", async () => {
    const { chat, user } = await resolve(["chat", "user"]);
    await chatService.deleteChat({
      id: chat.id,
      userId: user.id,
    });
    const deletedChat = await chatService.findById(chat.id);
    expect(deletedChat?.deletedFor.map(String)).toEqual([user.id]);
  });

  it("#markAsRead should not update lastReadAt for the user if the is no new messages", async () => {
    const { chat, user } = await resolve(["chat", "user"]);
    await chatService.markAsRead({
      id: chat.id,
      userId: user.id,
    });

    const updateChat = await chatService.findById(chat.id);
    const lastRead = updateChat?.lastReadAt?.get(user.id);
    expect(lastRead).toBeUndefined();
  });
  it("#markAsRead should update lastReadAt for the user if there are new messages", async () => {
    const { chat, user, friend } = await resolve(["chat", "user", "friend"]);
     await messageService.addMessage({
          chatId: chat.id,
          userId: friend.id,
          content: "are you there?",
        });
    await chatService.markAsRead({
      id: chat.id,
      userId: user.id,
    });

    const updateChat = await chatService.findById(chat.id); 
    const lastRead = updateChat?.lastReadAt?.get(user.id);
    expect(lastRead).toBeDefined();
    expect(lastRead).toBeInstanceOf(Date);
  });

  describe("#getChats", () => {
    it("should return all chats for the current user", async () => {
      const { user, chatList } = await resolve(["user", "chatList"]);
      const chats = await chatService.getChats(user.id);
      expect(chats.length).toEqual(chatList.length);
    });

    it("should not return soft deleted chats for the current user", async () => {
      const { user, chatList } = await resolve(["user", "chatList"]);
      const { id } = chatList[0];
      await chatService.deleteChat({
        id,
        userId: user.id,
      });

      const chats = await chatService.getChats(user.id);
      expect(chats.length).toEqual(chatList.length - 1);
    });

    it("should return all the chats for the other user", async () => {
      const { user, chatList } = await resolve(["user", "chatList"]);
      const { id, participants } = chatList[0];
      const friendId = participants.find(p => p.id !== user.id)?.id!;
      await chatService.deleteChat({
        id,
        userId: user.id,
      });

      const chats = (await chatService.getChats(friendId.toString())).map(
        (chat) => chat.id,
      );
      expect(chats).toContain(id);
    });

    describe("unread and lastMessage", () => {
      beforeEach(async () => {
        const { chat, friend } = await resolve(["chat", "friend"]);
        await messageService.addMessage({
          chatId: chat.id,
          userId: friend.id,
          content: "hello",
        });

        await messageService.addMessage({
          chatId: chat.id,
          userId: friend.id,
          content: "are you there?",
        });
      });

      it("should return notifications for each chat", async () => {
        const { chat, user } = await resolve(["chat", "user"]);
        const chats = await chatService.getChats(user.id);
        const unreadChat = chats.find((c) => c.id === chat.id);
        expect(unreadChat).toHaveProperty("notifications");
        
        const notifications = unreadChat?.notifications;
        const unread = notifications?.find(n => n.userId !== user.id);
        expect(unread?.newMessages).toEqual(2);
      });

      it("should return 0 unread after marking as read", async () => {
        const { chat, user } = await resolve(["chat", "user"]);
        await chatService.markAsRead({
          id: chat.id,
          userId: user.id,
        });
        const chats = await chatService.getChats(user.id);
        const readChat = chats.find((c) => c.id === chat.id);
        const unread = readChat?.notifications?.find(n => n.userId !== user.id);
        expect(unread?.newMessages).toEqual(0);
      });

      it("should count messages sent by the user themselves", async () => {
        const { chat, user } = await resolve(["chat", "user"]);
        await messageService.addMessage({
          chatId: chat.id,
          userId: user.id,
          content: "my own message",
        });

        const chats = await chatService.getChats(user.id);
        const readChat = chats.find((c) => c.id === chat.id);
        const unread = readChat?.notifications?.find(n => n.userId === user.id);
        expect(unread?.newMessages).toEqual(1);
      });

      it("should return the most recent message per chat", async () => {
        const { chat, user } = await resolve(["chat", "user"]);
        const chats = await chatService.getChats(user.id);

        const chatWithMostRecentMessage = chats.find((c) => c.id === chat.id);

        expect(chatWithMostRecentMessage).toHaveProperty("lastMessage");

        expect(chatWithMostRecentMessage?.lastMessage?.content).toEqual(
          "are you there?",
        );
      });

      it("should be sorted by most recent message", async () => {
        const { chat, user } = await resolve(["chat", "user"]);
        await messageService.addMessage({
          chatId: chat.id,
          userId: user.id,
          content: "newer message",
        });

        const chats = await chatService.getChats(user.id);

        expect(chats[0].id).toEqual(chat.id);
      });
    });
  });
});
