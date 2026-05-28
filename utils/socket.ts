import { type ExtendedError, Server, type Socket } from "socket.io";
import config from "./config.ts";
import presenceService from "../services/presenceService.ts";
import { decodeAccessToken } from "./auth.ts";
import { UnauthorizedError } from "./errors.ts";
import type { ClientToServerEvents, ServerToClientEvents } from "../types.ts";

interface SocketData {
  userId: string;
};
const io = new Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>({
  cors: { origin: config.CLIENT_URL, credentials: true },
});
const socketAuth = (socket: Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.auth?.token as string;
  if (!token) return next(new UnauthorizedError());
  try {
    const decoded = decodeAccessToken(token);
    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new UnauthorizedError());
  }
};
io.use(socketAuth);

io.on("connection", async (socket) => {
  const userId = socket.data.userId;

  await presenceService.setOnline(userId);
  await socket.join(`user:${userId}`);
  socket.broadcast.emit("user:online", { userId });

  socket.on("typing:start", (chatId: string) => {
    socket.to(`chat:${chatId}`).emit("typing:start", { userId, chatId });
  });

  socket.on("typing:stop", (chatId: string) => {
    socket.to(`chat:${chatId}`).emit("typing:stop", { userId, chatId });
  });

  socket.on("disconnect", async () => {
    await presenceService.setOffline(userId);
    io.emit("user:offline", { userId });
  });
});

export default io;