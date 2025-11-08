const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const orders = [];
const events = [];

function makeId() { return "ORD-" + Math.floor(1000 + Math.random() * 9000); }
function now() { return new Date().toLocaleString(); }

function simulateFlow(order) {
  const steps = ["PROCESSING", "PAYMENT_CONFIRMED", "SHIPPED", "DELIVERED"];
  let i = 0;
  (function next() {
    if (i >= steps.length) return;
    setTimeout(() => {
      order.status = steps[i];
      order.updatedAt = now();
      events.unshift({
        id: "EVT-" + Math.floor(Math.random() * 100000),
        orderId: order.id,
        type: steps[i],
        time: now(),
      });
      i++;
      next();
    }, 1500);
  })();
}

app.post("/api/orders", (req, res) => {
  const order = {
    id: makeId(),
    userId: req.body.userId || "user_" + Math.floor(Math.random() * 1000),
    items: req.body.items || [{ productId: "P1", qty: 1 }],
    status: "CREATED",
    createdAt: now(),
    updatedAt: now(),
  };
  orders.unshift(order);
  events.unshift({
    id: makeId(),
    orderId: order.id,
    type: "CREATED",
    time: now(),
  });
  simulateFlow(order);
  res.status(201).json(order);
});
app.get("/api/orders", (_, r) => r.json(orders));
app.get("/api/events", (_, r) => r.json(events));
app.post("/api/admin/clear", (_, r) => { orders.length = 0; events.length = 0; r.json({ ok: true }); });

app.get("/", (_, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>E-Driven Dashboard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;width:100%;overflow:hidden;font-family:Inter,Segoe UI,Arial,sans-serif;background:#f5f7fa;color:#222}
  body.dark{background:#071126;color:#dbeafe}

  header{
    display:flex;align-items:center;justify-content:space-between;
    padding:1rem 2rem;background:#fff;border-bottom:1px solid #ddd;
    height:64px;flex-shrink:0;
  }
  body.dark header{background:#0a1c2d;border-color:#14283c;}

  .brand{font-size:1.3rem;font-weight:700;color:#007bff}
  nav{display:flex;gap:.5rem}
  .tab{
    padding:.5rem 1rem;border-radius:8px;cursor:pointer;
    font-weight:600;color:#333;background:transparent;
  }
  .tab.active{background:#007bff;color:#fff}
  body.dark .tab{color:#dbeafe}
  body.dark .tab.active{background:#0056b3}

  .actions{display:flex;gap:.5rem;align-items:center}
  button{
    background:#007bff;color:#fff;border:none;
    padding:.5rem 1rem;border-radius:8px;cursor:pointer;font-weight:500;
  }
  button.ghost{background:transparent;color:#007bff;border:1px solid #cfe2ff;}
  body.dark button{background:#0563b6;color:#fff}
  body.dark button.ghost{border-color:#004f99;color:#99ccff;}

  main{
    flex:1;height:calc(100vh - 64px);display:flex;
    align-items:center;justify-content:center;flex-direction:column;
    width:100%;
  }
  .cards{display:flex;gap:2vw;justify-content:center;flex-wrap:wrap;margin-bottom:2vh;}
  .card{
    background:#fff;padding:2vw;border-radius:1vw;box-shadow:0 3px 10px rgba(0,0,0,0.05);
    min-width:200px;text-align:center;
  }
  .card h3{font-size:.9rem;color:#666;margin-bottom:.3rem;}
  .card p{font-size:2rem;font-weight:700;}
  body.dark .card{background:#0b2233;color:#dbeafe}

  table{
    border-collapse:collapse;background:#fff;border-radius:10px;
    overflow:hidden;box-shadow:0 3px 8px rgba(0,0,0,0.05);
    width:90vw;max-width:1200px;
  }
  th,td{padding:.8rem 1rem;text-align:left;}
  th{background:#f1f3f6;color:#555;}
  tr:nth-child(even){background:#fafafa;}
  .status{padding:4px 10px;border-radius:999px;font-size:.8rem;font-weight:600;text-transform:capitalize;}
  .CREATED{background:#e2e3e5;color:#41464b;}
  .PROCESSING{background:#cfe2ff;color:#084298;}
  .PAYMENT_CONFIRMED{background:#d1e7dd;color:#0f5132;}
  .SHIPPED{background:#fff3cd;color:#664d03;}
  .DELIVERED{background:#cff4fc;color:#055160;}
  body.dark table{background:#0b2233;color:#dbeafe}
  body.dark th{background:#0f2c44;color:#99cfff;}
  body.dark tr:nth-child(even){background:#0a1c2d;}
</style>
</head>
<body>
<header>
  <div class="brand">📦 E-Driven</div>
  <nav>
    <div class="tab active" onclick="show('dashboard',this)">Dashboard</div>
    <div class="tab" onclick="show('orders',this)">Orders</div>
    <div class="tab" onclick="show('events',this)">Events</div>
    <div class="tab" onclick="show('settings',this)">Settings</div>
  </nav>
  <div class="actions">
    <button onclick="createOrder()">+ Order</button>
    <button class="ghost" onclick="toggleTheme()">Theme</button>
  </div>
</header>

<main id="main"></main>

<script>
let active="dashboard";
async function get(path){return await (await fetch(path)).json();}
async function createOrder(){
  await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
  render();
}
function toggleTheme(){document.body.classList.toggle("dark");}
function activate(el){document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));el.classList.add("active");}
async function show(tab,el){active=tab;activate(el);await render();}
async function render(){
  const m=document.getElementById("main");
  if(active==="dashboard"){
    const d=await get("/api/orders");
    const total=d.length,pending=d.filter(o=>o.status!=="DELIVERED").length,del=d.filter(o=>o.status==="DELIVERED").length;
    m.innerHTML=\`
      <div class='cards'>
        <div class='card'><h3>Total Orders</h3><p>\${total}</p></div>
        <div class='card'><h3>Pending</h3><p>\${pending}</p></div>
        <div class='card'><h3>Delivered</h3><p>\${del}</p></div>
      </div>
      <table><thead><tr><th>ID</th><th>User</th><th>Items</th><th>Status</th><th>Updated</th></tr></thead>
      <tbody>\${d.slice(0,8).map(o=>\`<tr><td>\${o.id}</td><td>\${o.userId}</td><td>\${o.items.map(i=>i.productId+'×'+i.qty).join(', ')}</td><td><span class='status \${o.status}'>\${o.status.replace('_',' ')}</span></td><td>\${o.updatedAt}</td></tr>\`).join('')}</tbody></table>\`;
  }
  else if(active==="orders"){
    const d=await get("/api/orders");
    m.innerHTML=\`
      <table><thead><tr><th>ID</th><th>User</th><th>Items</th><th>Status</th><th>Created</th><th>Updated</th></tr></thead>
      <tbody>\${d.map(o=>\`<tr><td>\${o.id}</td><td>\${o.userId}</td><td>\${o.items.map(i=>i.productId+'×'+i.qty).join(', ')}</td><td><span class='status \${o.status}'>\${o.status.replace('_',' ')}</span></td><td>\${o.createdAt}</td><td>\${o.updatedAt}</td></tr>\`).join('')}</tbody></table>\`;
  }
  else if(active==="events"){
    const ev=await get("/api/events");
    m.innerHTML=\`
      <table><thead><tr><th>Event ID</th><th>Order ID</th><th>Type</th><th>Time</th></tr></thead>
      <tbody>\${ev.slice(0,12).map(e=>\`<tr><td>\${e.id}</td><td>\${e.orderId}</td><td>\${e.type}</td><td>\${e.time}</td></tr>\`).join('')}</tbody></table>\`;
  }
  else if(active==="settings"){
    m.innerHTML=\`
      <div class='cards'>
        <div class='card'><h3>Toggle Theme</h3><button onclick="toggleTheme()">Switch Mode</button></div>
        <div class='card'><h3>Clear All</h3><button onclick="clearAll()">Reset Data</button></div>
      </div>\`;
  }
}
async function clearAll(){await fetch("/api/admin/clear",{method:"POST"});render();}
render();
setInterval(render,4000);
</script>
</body>
</html>`);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT,"0.0.0.0",()=>console.log("✅ Full-screen dashboard at http://localhost:"+PORT));
