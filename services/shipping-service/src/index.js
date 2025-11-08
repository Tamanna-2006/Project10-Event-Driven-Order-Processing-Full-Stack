const { consumer } = require("../../common/src/kafkaClient");
const { producer } = require("../../common/src/kafkaClient");
const { createLogger } = require("../../common/src/logger");
const { nowIso } = require("../../common/src/utils");
const { shipOrder } = require("./shippingModel");
const { v4: uuid } = require("uuid");

const log = createLogger("shipping-service");

async function main() {
  const cons = consumer("shipping-group");
  await cons.connect();
  await cons.subscribe({ topic: "PaymentAuthorized", fromBeginning: false });

  await producer.connect();

  await cons.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const orderId = payload.payload.orderId;

      const result = shipOrder(orderId);

      const ev = {
        id: uuid(),
        type: result.success ? "OrderShipped" : "ShippingFailed",
        version: 1,
        correlationId: payload.correlationId,
        causationId: payload.id,
        timestamp: nowIso(),
        payload: {
          orderId,
          trackingId: result.trackingId,
          carrier: result.carrier,
          message: result.message,
        },
      };

      await producer.send({
        topic: ev.type,
        messages: [{ key: orderId, value: JSON.stringify(ev) }],
      });

      log.info(`${ev.type} for order ${orderId} (${result.trackingId})`);
    },
  });

  log.info("Shipping service running and listening for events...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
