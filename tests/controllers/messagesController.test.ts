import db from "../../utils/db.ts";
import messageService from "../../services/messageService.ts";
import {
  addRandomUser,
  addChat,
  agent,
  api,
  getAccessToken,
  randomUser,
} from "../test_helper.ts";
import { initLazy } from "../test_lazy.ts";
import userService from "../../services/userService.ts";

describe("/api/messages", () => {
  const { lazy, define, clear, resolve } = initLazy();
  define("user", async () => {
    const user = randomUser();
    return userService.addUser({ ...user, password: "12345678" });
  });
  define("friend", addRandomUser);
  define("participants", async () => [
    (await lazy.user).id,
    (await lazy.friend).id,
  ]);
  define("chat", async () => addChat(await lazy.participants));
  define("messagePayload", async () => {
    return {
      content: "content",
      chatId: (await lazy.chat).id,
    };
  });
  define("message", async () =>
    messageService.addMessage({
      ...(await lazy.messagePayload),
      userId: (await lazy.user).id,
    }),
  );
  define("friendMessage", async () =>
    messageService.addMessage({
      ...(await lazy.messagePayload),
      userId: (await lazy.friend).id,
    }),
  );
  define("accessToken", async () => {
    const user = await lazy.user;
    return getAccessToken({
      email: user.email,
      password: "12345678",
    });
  });
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.drop();
    await db.disconnect();
  });
  beforeEach(async () => clear());

  describe("unauthenticated requests", () => {
    beforeEach(async () => clear());
    it("should reject creating a message", async () => {
      const { messagePayload } = await resolve(["messagePayload"]);
      await api.post("/api/messages").send(messagePayload).expect(401);
    });

    it("should reject deleting a message", async () => {
      const { message } = await resolve(["message"]);
      await api.delete("/api/messages/" + message.id).expect(401);
    });

    it("should reject updating a message", async () => {
      const { message, messagePayload } = await resolve([
        "message",
        "messagePayload",
      ]);
      await api
        .patch("/api/messages/" + message.id)
        .send(messagePayload)
        .expect(401);
    });
  });

  describe("authenticated requests", () => {
    it("should create a message", async () => {
      const { messagePayload, accessToken, chat } = await resolve([
        "messagePayload",
        "accessToken",
        "chat",
      ]);
      const response = await agent
        .post("/api/messages")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(messagePayload)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      expect(response.body.content).toBe(messagePayload.content);
      expect(response.body.chatId).toBe(chat.id);
    });

    it("should update a message", async () => {
      const { message, accessToken } = await resolve([
        "message",
        "accessToken",
      ]);
      const response = await agent
        .patch(`/api/messages/${message.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "updated" })
        .expect(200);

      expect(response.body.content).toBe("updated");
    });

    it("should delete a message", async () => {
      const { message, accessToken } = await resolve([
        "message",
        "accessToken",
      ]);
      const response = await agent
        .delete(`/api/messages/${message.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.softDeleted).toBe(true);
    });
    it("should not update a message of another user", async () => {
      const message = await lazy.friendMessage;
      const accessToken = await lazy.accessToken;
      await agent
        .patch(`/api/messages/${message.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "updated" })
        .expect(404);
    });
    it("should not delete a message of another user", async () => {
      const { friendMessage, accessToken } = await resolve([
        "friendMessage",
        "accessToken",
      ]);
      await agent
        .delete(`/api/messages/${friendMessage.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
