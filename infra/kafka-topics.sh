#!/bin/bash
# ---------------------------------------------------------------------
# Kafka Topic Setup Script
# ---------------------------------------------------------------------
# Creates all required topics for the e-commerce event pipeline.
# You can run it anytime after Kafka container is up:
#   chmod +x infra/kafka-topics.sh
#   ./infra/kafka-topics.sh
# ---------------------------------------------------------------------

set -e

KAFKA_CONTAINER=$(docker ps -qf "name=kafka")
if [ -z "$KAFKA_CONTAINER" ]; then
  echo "❌ Kafka container not running. Start with 'docker compose up -d kafka'"
  exit 1
fi

echo "📦 Creating Kafka topics..."

docker exec -it "$KAFKA_CONTAINER" kafka-topics \
  --create --topic OrderCreated \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 --partitions 3 || true

docker exec -it "$KAFKA_CONTAINER" kafka-topics \
  --create --topic InventoryReserved \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 --partitions 3 || true

docker exec -it "$KAFKA_CONTAINER" kafka-topics \
  --create --topic InventoryFailed \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 --partitions 3 || true

docker exec -it "$KAFKA_CONTAINER" kafka-topics \
  --create --topic PaymentAuthorized \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 --partitions 3 || true

docker exec -it "$KAFKA_CONTAINER" kafka-topics \
  --create --topic PaymentFailed \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 --partitions 3 || true

docker exec -it "$KAFKA_CONTAINER" kafka-topics \
  --create --topic OrderShipped \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 --partitions 3 || true

echo "✅ Kafka topics ready!"
