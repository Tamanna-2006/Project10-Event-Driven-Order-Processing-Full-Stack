// Simple mock inventory store for demonstration
const initialInventory = [
  { sku: "ITEM001", available: 100 },
  { sku: "ITEM002", available: 50 },
  { sku: "ITEM003", available: 0 }
];

function hasStock(items) {
  return items.every(item => {
    const inv = initialInventory.find(i => i.sku === item.sku);
    return inv && inv.available >= item.qty;
  });
}

module.exports = { hasStock };
