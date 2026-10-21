const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");

let localDatabase;

async function connectDatabase() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Set MONGODB_URI before deploying the backend");
    }
    const runtimeFolder = path.join(
      process.env.LOCALAPPDATA || os.tmpdir(),
      "SDN302",
      "assignment4",
    );
    const databaseFolder = path.join(runtimeFolder, "mongodb");
    const downloadFolder = path.join(runtimeFolder, "mongodb-binaries");
    const sharedBinary = path.join(
      process.env.LOCALAPPDATA || os.tmpdir(),
      "SDN302",
      "runtime",
      "mongodb-binaries",
      "mongod.exe",
    );

    fs.mkdirSync(databaseFolder, { recursive: true });
    const binaryOptions = { downloadDir: downloadFolder };
    if (fs.existsSync(sharedBinary)) {
      binaryOptions.systemBinary = sharedBinary;
    }
    localDatabase = await MongoMemoryServer.create({
      instance: {
        port: Number(process.env.MONGODB_LOCAL_PORT || 27019),
        dbPath: databaseFolder,
        dbName: "SimpleQuizFullstack",
        storageEngine: "wiredTiger",
      },
      binary: binaryOptions,
    });
    uri = localDatabase.getUri();
  }
  await mongoose.connect(uri, { dbName: "SimpleQuizFullstack" });
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (localDatabase) {
    await localDatabase.stop();
  }
}

module.exports = { connectDatabase, disconnectDatabase };
