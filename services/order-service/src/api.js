// Defines REST API routes for creating orders and streaming status
const { uuid, nowIso } = require("../../common/src/utils");
const { createOrderDoc } = require("./orderModel");

function registerApi(app, db, producer, client, log) {
  const orders = db.collection("orders");
  const events = db.collection("events");
  const outbox = db.collection("outbox");

  // POST /api/orders - create new order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderId = uuid();
      const eventId = uuid();

      const event = {
        id: eventId,
        type: "OrderCreated",
        version: 1,
        correlationId: eventId,
        timestamp: nowIso(),
        payload: {
          orderId,
          items: req.body.items || [],
          total: req.body.total || 0,
        },
      };

      const session = client.startSession();
      await session.withTransaction(async () => {
        await orders.insertOne(createOrderDoc(orderId, event.payload.items, event.payload.total), { session });
        await events.insertOne(event, { session });
        await outbox.insertOne(
          { event, processed: false, attempts: 0, createdAt: new Date() },
          { session }
        );
      });
      await session.endSession();

      res.status(201).json({ orderId });
    } catch (err) {
      log.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/orders/:orderId/stream - SSE live event stream
  app.get("/api/orders/:orderId/stream", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    const orderId = req.params.orderId;
    const cursor = events.find({ "payload.orderId": orderId }).sort({ timestamp: 1 });
    const all = await cursor.toArray();
    res.write(`data: ${JSON.stringify(all)}\\n\\n`);

    req.on("close", () => {
      res.end();
    });
  });
}

module.exports = { registerApi };
