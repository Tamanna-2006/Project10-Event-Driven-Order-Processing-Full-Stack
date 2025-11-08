# Event-driven E-commerce Pipeline

An event-driven e-commerce order pipeline built with Node.js, Kafka, MongoDB, and React.

### 🧩 Features
- Event-based services (Order → Inventory → Payment → Shipping)
- Kafka topics for event flow
- MongoDB persistence
- Idempotency, retries, DLQ
- Live React dashboard using SSE

### 🧰 Requirements
- Docker + Docker Compose
- Node.js (optional, for local testing)

### ▶️ How to Run
```bash
docker compose up --build
