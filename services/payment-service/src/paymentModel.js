// Simulate random payment outcomes (for testing fault handling)
function processPayment(orderId, total) {
  const success = Math.random() > 0.1; // 90% chance of success
  return {
    success,
    transactionId: `TXN-${Math.floor(Math.random() * 1_000_000)}`,
    message: success ? "Payment Authorized" : "Payment Failed",
  };
}

module.exports = { processPayment };
