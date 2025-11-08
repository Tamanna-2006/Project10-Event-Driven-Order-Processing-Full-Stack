/**
 * Load Generator Script
 * ----------------------
 * Sends a configurable number of fake orders to the Order Service
 * to test the full event-driven pipeline.
 *
 * Usage:
 *   node tools/load-generator.js [count]
 * Example:
 *   node tools/load-generator.js 10
 */

const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001/api/orders";
const TOTAL = parseInt(process.argv[2] || "5", 10);

async function sendOrder(i) {
  const order = {
    items: [
      { sku: "ITEM001", qty: Math.ceil(Math.random() * 3) },
      { sku: "ITEM002", qty: Math.ceil(Math.random() * 2) },
    ],
    total: Math.floor(Math.random() * 500) + 100,
  };

  try {
    const res = await axios.post(API_URL, order);
    console.log(`[${i}] ✅ Order created: ${res.data.orderId}`);
  } catch (err) {
    console.error(`[${i}] ❌ Error:`, err.message);
  }
}

(async () => {
  console.log(`🚀 Sending ${TOTAL} test orders to ${API_URL} ...`);
  for (let i = 1; i <= TOTAL; i++) {
    await sendOrder(i);
  }
  console.log("🎯 Done! Check the React UI or MongoDB for updates.");
})();
