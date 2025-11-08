// Background publisher for outbox events to Kafka
const { producer } = require("../../common/src/kafkaClient");
const { createLogger } = require("../../common/src/logger");

const log = createLogger("outbox-worker");

async function publishOutboxItem(item, outboxCol) {
  try {
    const payload = item.event;
    await producer.send({
      topic: payload.type,
      messages: [
        { key: payload.payload.orderId, value: JSON.stringify(payload) },
      ],
      acks: -1,
    });
    await outboxCol.updateOne(
      { _id: item._id },
      { $set: { processed: true, processedAt: new Date() } }
    );
    log.info(`Published event: ${payload.type} (${payload.id})`);
  } catch (err) {
    log.error(`Publish failed: ${err.message}`);
    await outboxCol.updateOne(
      { _id: item._id },
      {
        $inc: { attempts: 1 },
        $set: { lastError: err.message, updatedAt: new Date() },
      }
    );
  }
}

async function runOutboxLoop(db) {
  const outbox = db.collection("outbox");
  setInterval(async () => {
    const pending = await outbox
      .find({ processed: false, attempts: { $lt: 5 } })
      .limit(10)
      .toArray();

    for (const item of pending) {
      await publishOutboxItem(item, outbox);
    }

    await outbox.updateMany(
      { processed: false, attempts: { $gte: 5 } },
      { $set: { dlq: true } }
    );
  }, 2000);
}

module.exports = { runOutboxLoop };
