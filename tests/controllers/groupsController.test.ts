import db from "../../utils/db.ts";
import {
  agent,
  getAccessToken,
  randomUser,
} from "../test_helper.ts";
import { initLazy } from "../test_lazy.ts";
import userService from "../../services/userService.ts";
import { ChatDocument, UserDocument } from "../../types.ts";
import groupService from "../../services/groupService.ts";

describe("/api/groups", () => {
    const { lazy, define, clear, resolve } = initLazy<{
        admin: UserDocument;
        member: UserDocument;
        group: ChatDocument;
        accessToken: string;
        groupPayload: { name: string };
    }>();

    define("admin", async () => {
        const user = randomUser();
        return userService.addUser({ ...user, password: "12345678" });
    });

    define("member", async () => userService.addUser({...randomUser(), password: "12345678" }))

    define("group", async () =>
        groupService.addGroup({
        name: "Test Group",
        admin: (await lazy.admin).id,
        participants: [(await lazy.admin).id, (await lazy.member).id],
        }),
    );

    define("groupPayload", async () => ({ name: "New Group" }));

    define("accessToken", async () => {
        const user = await lazy.admin;
        return getAccessToken({ email: user.email, password: "12345678" });
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
        it("should reject creating a group", async () => {
        await agent.post("/api/groups").send({ name: "Group" }).expect(401);
        });

        it("should reject deleting a group", async () => {
        const id = (await lazy.group).id;
        await agent.delete(`/api/groups/${id}/close`).expect(401);
        });

        it("should reject updating a group", async () => {
        const id = (await lazy.group).id;
        await agent.put(`/api/groups/${id}`).send({ name: "Updated" }).expect(401);
        });
    });

    describe("authenticated requests", () => {
        it("should return groups as json", async () => {
        const { accessToken } = await resolve(["group", "accessToken"]);
        const response = await agent
            .get("/api/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        expect(response.body).toHaveLength(1);
        });

        it("should create a group", async () => {
        const { accessToken, groupPayload } = await resolve([
            "accessToken",
            "groupPayload",
        ]);
        const response = await agent
            .post("/api/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(groupPayload)
            .expect(201)
            .expect("Content-Type", /application\/json/);
        expect(response.body.name).toEqual(groupPayload.name);
        expect(response.body.isGroup).toBe(true);
        });

        it("should update a group as admin", async () => {
        const { group, accessToken } = await resolve(["group", "accessToken"]);
        const response = await agent
            .put(`/api/groups/${group.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Updated Group" })
            .expect(200);
        expect(response.body.name).toEqual("Updated Group");
        });

        it("should not update a group as non-admin", async () => {
        const { group, member } = await resolve(["group", "member"]);
        const memberToken = await getAccessToken({
            email: member.email,
            password: "12345678",
        });
        await agent
            .put(`/api/groups/${group.id}`)
            .set("Authorization", `Bearer ${memberToken}`)
            .send({ name: "Hacked" })
            .expect(404);
        });

        it("should allow member to leave a group", async () => {
        const { group, member } = await resolve(["group", "member"]);
        const memberToken = await getAccessToken({
            email: member.email,
            password: "12345678",
        });
        const response = await agent
            .delete(`/api/groups/${group.id}/leave`)
            .set("Authorization", `Bearer ${memberToken}`)
            .expect(200);
        expect(response.body.deletedFor).toContain(member.id);
        });

        it("should allow admin to close a group", async () => {
        const { group, accessToken } = await resolve(["group", "accessToken"]);
        const response = await agent
            .delete(`/api/groups/${group.id}/close`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
        expect(response.body.closed).toBe(true);
        });

        it("should not allow non-admin to close a group", async () => {
        const { group, member } = await resolve(["group", "member"]);
        const memberToken = await getAccessToken({
            email: member.email,
            password: "12345678",
        });
        await agent
            .delete(`/api/groups/${group.id}/close`)
            .set("Authorization", `Bearer ${memberToken}`)
            .expect(404);
        });
    });
});