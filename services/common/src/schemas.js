const { z } = require('zod');

// Base schema for all events
const BaseEvent = z.object({
  id: z.string(),
  type: z.string(),
  version: z.number().default(1),
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  timestamp: z.string(),
});

// Specific events
const OrderCreated = BaseEvent.extend({
  type: z.literal('OrderCreated'),
  payload: z.object({
    orderId: z.string(),
    items: z.array(
      z.object({
        sku: z.string(),
        qty: z.number(),
      })
    ),
    total: z.number(),
    customer: z.object({
      name: z.string(),
    }),
  }),
});

module.exports = { BaseEvent, OrderCreated };
