// Defines the structure for the order aggregate document
module.exports = {
  createOrderDoc: (orderId, items, total) => ({
    orderId,
    items,
    total,
    status: "CREATED",
    updatedAt: new Date().toISOString(),
  }),
};
