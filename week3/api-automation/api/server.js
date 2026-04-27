const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// In-memory store (no DB needed for quick start)
let users = [{ id: 1, email: "admin@shopeasy.com", password: "password123", name: "Admin User" }];
let products = [
  { id: 1, name: "Wireless Headphones", price: 99.99, category: "electronics", stock: 50 },
  { id: 2, name: "Running Shoes", price: 59.99, category: "footwear", stock: 30 },
  { id: 3, name: "Coffee Maker", price: 149.99, category: "appliances", stock: 15 },
  { id: 4, name: "Yoga Mat", price: 29.99, category: "sports", stock: 100 },
  { id: 5, name: "Laptop Stand", price: 45.00, category: "electronics", stock: 75 },
];
let carts = {};
let orders = {};
let payments = {};
let tokens = {};
let idCounters = { user: 2, order: 1001, payment: 5001 };

// --- Auth middleware ---
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.split(" ")[1];
  const userId = tokens[token];
  if (!userId) return res.status(401).json({ error: "Invalid or expired token" });
  req.userId = userId;
  next();
}

// ============================
// AUTH ENDPOINTS
// ============================

// POST /auth/login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = "tok_" + Math.random().toString(36).slice(2) + Date.now();
  tokens[token] = user.id;
  res.json({ token, userId: user.id, message: "Login successful" });
});

// POST /auth/register
app.post("/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "email, password, and name are required" });

  if (users.find(u => u.email === email))
    return res.status(409).json({ error: "Email already registered" });

  const user = { id: idCounters.user++, email, password, name };
  users.push(user);
  res.status(201).json({ userId: user.id, message: "User registered successfully" });
});

// ============================
// PRODUCT ENDPOINTS
// ============================

// GET /products
app.get("/products", (req, res) => {
  let result = [...products];
  const { category, page = 1, limit = 10 } = req.query;
  if (category) result = result.filter(p => p.category === category);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start * 1 + limit * 1);
  res.json({ total: result.length, page: Number(page), limit: Number(limit), data: paginated });
});

// GET /products/:id
app.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// ============================
// CART ENDPOINTS
// ============================

// POST /cart/items
app.post("/cart/items", auth, (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity)
    return res.status(400).json({ error: "productId and quantity are required" });

  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (!carts[req.userId]) carts[req.userId] = [];
  const existing = carts[req.userId].find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    carts[req.userId].push({ productId, name: product.name, price: product.price, quantity });
  }
  const total = carts[req.userId].reduce((s, i) => s + i.price * i.quantity, 0);
  res.status(201).json({ message: "Item added to cart", cartTotal: parseFloat(total.toFixed(2)) });
});

// GET /cart
app.get("/cart", auth, (req, res) => {
  const items = carts[req.userId] || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ items, subtotal: parseFloat(subtotal.toFixed(2)), itemCount: items.length });
});

// DELETE /cart/items/:itemId
app.delete("/cart/items/:itemId", auth, (req, res) => {
  const productId = Number(req.params.itemId);
  if (!carts[req.userId]) return res.status(404).json({ error: "Cart is empty" });
  const idx = carts[req.userId].findIndex(i => i.productId === productId);
  if (idx === -1) return res.status(404).json({ error: "Item not found in cart" });
  carts[req.userId].splice(idx, 1);
  const total = carts[req.userId].reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ message: "Item removed from cart", cartTotal: parseFloat(total.toFixed(2)) });
});

// ============================
// ORDER ENDPOINTS
// ============================

// POST /orders
app.post("/orders", auth, (req, res) => {
  const items = carts[req.userId] || [];
  if (items.length === 0)
    return res.status(400).json({ error: "Cart is empty. Add items before placing an order." });

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const orderId = "ORD-" + idCounters.order++;
  orders[orderId] = {
    orderId, userId: req.userId, items: [...items],
    total: parseFloat(total.toFixed(2)), status: "pending",
    createdAt: new Date().toISOString()
  };
  carts[req.userId] = [];
  res.status(201).json({ orderId, total: orders[orderId].total, status: "pending", message: "Order placed successfully" });
});

// GET /orders/:orderId
app.get("/orders/:orderId", auth, (req, res) => {
  const order = orders[req.params.orderId];
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });
  res.json(order);
});

// DELETE /orders/:orderId/cancel
app.delete("/orders/:orderId/cancel", auth, (req, res) => {
  const order = orders[req.params.orderId];
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });
  if (order.status === "shipped" || order.status === "delivered")
    return res.status(422).json({ error: `Cannot cancel order with status: ${order.status}` });
  order.status = "cancelled";
  res.json({ orderId: order.orderId, status: "cancelled", message: "Order cancelled successfully" });
});

// ============================
// PAYMENT ENDPOINTS
// ============================

// POST /payments
app.post("/payments", auth, (req, res) => {
  const { orderId, method } = req.body;
  if (!orderId || !method)
    return res.status(400).json({ error: "orderId and method are required" });

  const order = orders[orderId];
  if (!order) return res.status(404).json({ error: "Order not found" });

  const existing = Object.values(payments).find(p => p.orderId === orderId && p.status === "success");
  if (existing)
    return res.status(409).json({ error: "Payment already processed for this order" });

  const paymentId = "PAY-" + idCounters.payment++;
  payments[paymentId] = {
    paymentId, orderId, method, amount: order.total,
    status: "success", processedAt: new Date().toISOString()
  };
  order.status = "paid";
  res.status(201).json({ paymentId, status: "success", amount: order.total, message: "Payment processed" });
});

// GET /payments/:paymentId
app.get("/payments/:paymentId", auth, (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  res.json(payment);
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", service: "ShopEasy API", version: "1.0.0" }));

// Swagger UI
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "../swagger/openapi.yaml"), "utf8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log("ShopEasy API running on http://localhost:3000");
  console.log("Swagger UI available at http://localhost:3000/api-docs");
});
