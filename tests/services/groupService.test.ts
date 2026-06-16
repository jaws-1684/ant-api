import db from "../../utils/db.ts";
import chatService from "../../services/chatService.ts";
import { addRandomUser } from "../test_helper.ts";
import { initLazy } from "../test_lazy.ts";
import { ChatDocument, UserDocument } from "../../types.ts";
import groupService from "../../services/groupService.ts";

describe("Group service", () => {
  const { lazy, define, resolve, clear } = initLazy<{
    admin: UserDocument;
    member: UserDocument;
    group: ChatDocument;
  }>();

  define("admin", addRandomUser);
  define("member", addRandomUser);
  define("group", async () =>
    groupService.addGroup({
      name: "Test Group",
      admin: (await lazy.admin).id,
      participants: [(await lazy.admin).id, (await lazy.member).id],
    }),
  );

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

  it("#addGroup should create a group", async () => {
    const { group, admin } = await resolve(["group", "admin"]);
    expect(group.isGroup).toBe(true);
    expect(group.name).toEqual("Test Group");
    expect(group.admin).toEqual(admin.id);
  });

  it("#getChats should return groups for the user", async () => {
    const { admin } = await resolve(["admin", "group"]);
    const groups = await chatService.getChats(admin.id, { group: true });
    expect(groups.length).toEqual(1);
  });

  it("#getChats should not return regular chats when fetching groups", async () => {
    const { admin } = await resolve(["admin", "group"]);
    const chats = await chatService.getChats(admin.id, { group: false });
    expect(chats.length).toEqual(0);
  });

  it("#deleteChat should allow member to leave group", async () => {
    const { group, member } = await resolve(["group", "member"]);
    await chatService.deleteChat({ id: group.id, userId: member.id });
    const updated = await chatService.findById(group.id);
    expect(updated?.deletedFor.map(String)).toContain(member.id);
  });

  it("#deleteGroup should allow admin to close group", async () => {
    const { group, admin } = await resolve(["group", "admin"]);
    await groupService.deleteGroup({ id: group.id, userId: admin.id });
    const updated = await chatService.findById(group.id);
    expect(updated?.closed).toBe(true);
  });

  it("#deleteGroup should not allow non-admin to close group", async () => {
    const { group, member } = await resolve(["group", "member"]);
    await expect(
      groupService.deleteGroup({ id: group.id, userId: member.id }),
    ).rejects.toThrow();
  });

  it("#updateGroup should allow admin to update group", async () => {
    const { group, admin } = await resolve(["group", "admin"]);
    const updated = await groupService.updateGroup({ admin: admin.id, update: {
        id: group.id,
        name: "Updated Group" ,
    }});
    expect(updated.name).toEqual("Updated Group");
  });

  it("#updateGroup should not allow non-admin to update group", async () => {
    const { group, member } = await resolve(["group", "member"]);
    await expect(
      groupService.updateGroup({ admin: member.id, update: {
        id: group.id,
        name: "Hacked" ,
      }}),
    ).rejects.toThrow();
  });
});