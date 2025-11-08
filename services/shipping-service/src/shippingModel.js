// Simple mock shipping function
function shipOrder(orderId) {
  return {
    success: true,
    trackingId: `TRK-${Math.floor(Math.random() * 1_000_000)}`,
    carrier: "EComExpress",
    message: "Order shipped successfully",
  };
}

module.exports = { shipOrder };
