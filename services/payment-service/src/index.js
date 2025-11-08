const { consumer } = require("../../common/src/kafkaClient");
const { producer } = require("../../common/src/kafkaClient");
const { createLogger } = require("../../common/src/logger");
const { nowIso } = require("../../common/src/utils");
const { processPayment } = require("./paymentModel");
const { v4: uuid } = require("uuid");

const log = createLogger("payment-service");

async function main() {
  const cons = consumer("payment-group");
  await cons.connect();
  await cons.subscribe({ topic: "InventoryReserved", fromBeginning: false });

  await producer.connect();

  await cons.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const orderId = payload.payload.orderId;

      // Simulate processing payment
      const result = processPayment(orderId, payload.payload.total);

      const ev = {
        id: uuid(),
        type: result.success ? "PaymentAuthorized" : "PaymentFailed",
        version: 1,
        correlationId: payload.correlationId,
        causationId: payload.id,
        timestamp: nowIso(),
        payload: {
          orderId,
          transactionId: result.transactionId,
          message: result.message,
        },
      };

      await producer.send({
        topic: ev.type,
        messages: [{ key: orderId, value: JSON.stringify(ev) }],
      });

      log.info(`${ev.type} for order ${orderId} (${result.transactionId})`);
    },
  });

  log.info("Payment service is running and waiting for events...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
