const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use environment variable or fallback for SECRET and PORT
const SECRET = process.env.SECRET || 'ongod_secret_key';
const PORT = process.env.PORT || 3000;

// In-memory data (replace with DB in production)
let users = [];
let products = [
  { id: 1, name: "iPhone 11", price: 900000, category: "phones", image: "images/iphone11.jpg" },
  { id: 2, name: "HP Pavilion", price: 650000, category: "laptops", image: "images/hplaptop.jpg" },
  { id: 3, name: "AirPods Pro", price: 120000, category: "accessories", image: "images/airpods.png" }
];
let orders = [];
let notifications = [];
let customerCareMessages = []; // {from, text, date, username, email}

// --- API ROUTES ---

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Update product price
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { price } = req.body;
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (typeof price !== 'number' || price < 0) return res.status(400).json({ error: 'Invalid price' });
  product.price = price;
  res.json({ success: true, product });
});

// Get notifications for a user (by email or username)
app.get('/api/notifications/user', (req, res) => {
  const user = req.query.user;
  if (!user) return res.json([]);
  const userNotifs = notifications.filter(n => n.user === user || n.username === user);
  res.json(userNotifs);
});

// Get all notifications (for admin panel)
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// Post a new notification
app.post('/api/notifications', (req, res) => {
  const notif = req.body;
  notifications.push(notif);
  res.json({ success: true });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Place a new order
app.post('/api/orders', (req, res) => {
  const { username, product, price, status } = req.body;
  if (!username || !product || !price) return res.status(400).json({ error: 'Missing order fields' });
  const id = orders.length ? orders[orders.length - 1].id + 1 : 1;
  orders.push({ id, username, product, price, status: status || 'pending' });
  res.json({ success: true, id });
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  res.json({ success: true, order });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Register a new user
app.post('/api/users', async (req, res) => {
  const { username, password, state, area, street, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash, state, area, street, email });
  res.json({ success: true });
});

// Delete all users
app.delete('/api/users', (req, res) => {
  users = [];
  res.json({ message: 'All users deleted.' });
});

// Get customer care messages for a user
app.get('/api/customer-care/user/:username', (req, res) => {
  const username = req.params.username;
  const msgs = customerCareMessages.filter(m => m.username === username);
  res.json(msgs);
});

// Post a new customer care message (from user)
app.post('/api/customer-care', (req, res) => {
  const { text, username, email } = req.body;
  if (!text || !username || !email) return res.status(400).json({ error: 'Missing text, username, or email' });
  // Only allow registered users to send messages
  const userExists = users.find(u => u.username === username);
  if (!userExists) return res.status(403).json({ error: 'You must be registered and logged in to use customer care.' });
  customerCareMessages.push({
    from: 'user',
    text,
    date: new Date(),
    username,
    email
  });
  res.json({ success: true });
});

// Get all customer care messages (for admin panel)
app.get('/api/customer-care', (req, res) => {
  res.json(customerCareMessages);
});

// Admin sends a reply to a user
app.post('/api/customer-care/reply', (req, res) => {
  const { text, username } = req.body;
  if (!text || !username) return res.status(400).json({ error: 'Missing text or username' });
  // Find the user's email from previous messages
  const lastMsg = customerCareMessages.slice().reverse().find(m => m.username === username && m.email);
  const email = lastMsg ? lastMsg.email : '';
  customerCareMessages.push({
    from: 'admin',
    text,
    date: new Date(),
    username,
    email
  });
  res.json({ success: true });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    console.log('Public URL: https://' + process.env.RENDER_EXTERNAL_HOSTNAME);
  }
});