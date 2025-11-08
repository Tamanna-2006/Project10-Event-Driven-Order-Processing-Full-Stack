const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { producer, admin } = require("../../common/src/kafkaClient");
const { createLogger } = require("../../common/src/logger");
const { runOutboxLoop } = require("./outboxWorker");
const { registerApi } = require("./api");

const log = createLogger("order-service");
const MONGO = process.env.MONGO_URI || "mongodb://mongo:27017/ecom";
const PORT = process.env.PORT || 3001;

async function main() {
  await admin.connect();
  await producer.connect();

  const client = new MongoClient(MONGO);
  await client.connect();
  const db = client.db();

  const outbox = db.collection("outbox");
  await outbox.createIndex({ processed: 1 });

  const app = express();
  app.use(bodyParser.json());

  registerApi(app, db, producer, client, log);

  app.listen(PORT, () => log.info(`Order service running on port ${PORT}`));

  runOutboxLoop(db);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
