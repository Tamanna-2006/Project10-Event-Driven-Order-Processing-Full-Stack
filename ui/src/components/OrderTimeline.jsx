import React, { useEffect, useState } from "react";

export default function OrderTimeline({ orderId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!orderId) return;

    const es = new EventSource(`/api/orders/${orderId}/stream`);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents(data);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      es.close();
    };

    return () => es.close();
  }, [orderId]);

  if (!events.length)
    return <p>Waiting for events... Make sure order ID is correct.</p>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2>Order Status Timeline</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {events.map((ev) => (
          <li
            key={ev.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              margin: "8px 0",
              background:
                ev.type === "OrderShipped"
                  ? "#d4edda"
                  : ev.type.includes("Failed")
                  ? "#f8d7da"
                  : "#fff3cd",
            }}
          >
            <strong>{ev.type}</strong>
            <div style={{ fontSize: "13px", color: "#555" }}>
              {new Date(ev.timestamp).toLocaleString()}
            </div>
            <div style={{ fontSize: "13px", marginTop: "5px" }}>
              {JSON.stringify(ev.payload)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
