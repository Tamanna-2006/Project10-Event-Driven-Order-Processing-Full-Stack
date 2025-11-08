const { MongoClient } = require("mongodb");
const { consumer } = require("../../common/src/kafkaClient");
const { producer } = require("../../common/src/kafkaClient");
const { createLogger } = require("../../common/src/logger");
const { nowIso } = require("../../common/src/utils");
const { hasStock } = require("./inventoryModel");
const { v4: uuid } = require("uuid");

const log = createLogger("inventory-service");
const MONGO = process.env.MONGO_URI || "mongodb://mongo:27017/ecom";

async function main() {
  const client = new MongoClient(MONGO);
  await client.connect();
  const db = client.db();
  const events = db.collection("events");
  const dedupe = db.collection("dedupe");

  await dedupe.createIndex({ eventId: 1 }, { unique: true });

  const c = consumer("inventory-group");
  await c.connect();
  await c.subscribe({ topic: "OrderCreated", fromBeginning: false });

  const prod = producer;
  await prod.connect();

  await c.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value.toString());
      const eventId = payload.id;
      const orderId = payload.payload.orderId;

      try {
        await dedupe.insertOne({ eventId, createdAt: new Date() });

        const stockOk = hasStock(payload.payload.items);

        const newEvent = {
          id: uuid(),
          type: stockOk ? "InventoryReserved" : "InventoryFailed",
          version: 1,
          correlationId: payload.correlationId,
          causationId: eventId,
          timestamp: nowIso(),
          payload: { orderId },
        };

        await events.insertOne(newEvent);

        await prod.send({
          topic: newEvent.type,
          messages: [{ key: orderId, value: JSON.stringify(newEvent) }],
        });

        log.info(`Processed ${payload.type} → ${newEvent.type} for ${orderId}`);
      } catch (err) {
        if (err.code === 11000) {
          log.info(`Duplicate event ignored: ${eventId}`);
        } else {
          log.error(`Error processing event: ${err.message}`);
        }
      }
    },
  });

  log.info("Inventory service running...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
