import app from "./app.ts";
import config from "./utils/config.ts";
import logger from "./utils/logger.ts";
import db from "./utils/db.ts";
import io from "./utils/socket.ts";
import http from "http";

const server = http.createServer(app);
io.attach(server);

await db.connect();
server.listen(config.PORT, () => {
 logger.info(`Server running on port ${config.PORT}`);
});
process.on("SIGINT", () => {
  db.disconnect()
    .then(() => process.exit())
    .catch((e: Error) => logger.error(e.message));
});