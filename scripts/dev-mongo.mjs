import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import fs from "node:fs";
import net from "node:net";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dbPath = path.join(root, ".data", "mongodb");
fs.mkdirSync(dbPath, { recursive: true });

const PORT = 27017;
const HOST = "127.0.0.1";

function portInUse(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

if (await portInUse(PORT, HOST)) {
  console.log(`MongoDB is already running on ${HOST}:${PORT} - nothing to start.`);
  console.log("Skip `npm run mongo`; just run `npm run dev`.");
  process.exit(0);
}

const mongod = await MongoMemoryServer.create({
  instance: {
    port: PORT,
    ip: HOST,
    dbPath,
    storageEngine: "wiredTiger",
  },
});

const uri = mongod.getUri("auraedu");
console.log(`Local MongoDB (persisted in .data/mongodb) running:`);
console.log(`  ${uri}`);
console.log("Keep this process running while using the app. Ctrl+C to stop.");

const shutdown = async () => {
  await mongod.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);