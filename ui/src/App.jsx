import React, { useState } from "react";
import OrderTimeline from "./components/OrderTimeline";

export default function App() {
  const [orderId, setOrderId] = useState("");
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderId(input.trim());
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📦 E-Commerce Order Tracker</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Enter Order ID"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
        <button
          type="submit"
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Track
        </button>
      </form>
      {orderId && <OrderTimeline orderId={orderId} />}
    </div>
  );
}
