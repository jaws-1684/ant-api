import { redis } from "../utils/redis.ts";

const EXPIRY = 60;

const setOnline = async (userId: string): Promise<void> => {
  await redis.set(`user:${userId}:online`, "1", "EX", EXPIRY);
};

const setOffline = async (userId: string): Promise<void> => {
  await redis.del(`user:${userId}:online`);
};

const isOnline = async (userId: string): Promise<boolean> => {
  const result = await redis.get(`user:${userId}:online`);
  return result === "1";
};

// const getOnlineUsers = async (userIds: string[]): Promise<string[]> => {
//   if (!userIds.length) return [];
//   const pipeline = redis.pipeline();
//   userIds.forEach((id) => pipeline.get(`user:${id}:online`));
//   const results = await pipeline.exec();
//   return userIds.filter((_, i) => results?.[i]?.[1] === "1");
// };

export default { setOnline, setOffline, isOnline };