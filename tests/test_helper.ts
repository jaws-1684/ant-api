import supertest from "supertest";
import app from "../app.ts";
import chatService from "../services/chatService.ts";
import userService from "../services/userService.ts";
import { LoginPayload } from "../types/index.ts";

export const sample = (array: any[]) => {
    return array[Math.floor(Math.random() * array.length)]
}
export const documentToObject = (document: any) => JSON.parse(JSON.stringify(document))
const randomString = () => Math.random().toString(36).slice(2, 8)
export const addTestEntry = async () => {
    const user = await userService.addUser(randomUser());
    const friend = await userService.addUser(randomUser());
    const chat = await chatService.addChat({ participants: [user.id, friend.id] });
    return { user, chat, friend };
};
export const addRandomUser = async () => userService.addUser(randomUser())
export const addChat = async ([ userId, friendId ]: [string, string]) => {
    return await chatService.addChat({ participants: [userId, friendId] });
}
export const randomUser = () => {
    const name = randomString();
    return {
        email: `user_${name}@ant.com`,
        username: `user_${name}`, 
        password: "password123",
        image: undefined 
    };
};

 
export const agent = supertest.agent(app);
export const api = supertest(app);
export const getAccessToken = async (user: LoginPayload) => {
    await agent
        .post("/api/auth/login")
        .send(user)
        .expect(200);
    const res = await agent
        .post("/api/auth/refresh")
        .expect(200);

    return res.body.accessToken;
};



