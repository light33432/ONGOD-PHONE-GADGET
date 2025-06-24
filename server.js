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
let customerCareMessages = []; // {from, text, date, username}

// --- API ROUTES ---

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get notifications for a user (by email)
app.get('/api/notifications/user', (req, res) => {
  const user = req.query.user;
  if (!user) return res.json([]);
  const userNotifs = notifications.filter(n => n.user === user);
  res.json(userNotifs);
});

// Get customer care messages for a user
app.get('/api/customer-care/user/:username', (req, res) => {
  const username = req.params.username;
  const msgs = customerCareMessages.filter(m => m.username === username);
  res.json(msgs);
});

// Post a new customer care message
app.post('/api/customer-care', (req, res) => {
  const { text, username } = req.body;
  if (!text || !username) return res.status(400).json({ error: 'Missing text or username' });
  customerCareMessages.push({
    from: 'user',
    text,
    date: new Date(),
    username
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