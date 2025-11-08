const { Kafka } = require('kafkajs');
const { createLogger } = require('./logger');

const logger = createLogger('kafkaClient');
const brokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(',')
  : ['kafka:9092'];

const kafka = new Kafka({
  clientId: 'ecom-app',
  brokers,
});

const admin = kafka.admin();
const producer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 1,
});

function consumer(groupId) {
  return kafka.consumer({ groupId });
}

module.exports = { kafka, admin, producer, consumer };
