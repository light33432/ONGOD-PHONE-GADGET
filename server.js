require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// --- CORS: Allow local frontend and your Render backend domain ---
const allowedOrigins = [
  'http://localhost:3000', // local frontend (React, etc.)
  'https://your-backend-name.onrender.com' // your Render backend domain
  // Add your frontend production domain here if you deploy frontend elsewhere
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(bodyParser.json());

// Serve static images from the "images" folder
app.use('/images', express.static(path.join(__dirname, 'images')));

const SECRET = process.env.SECRET || 'ongod_secret_key';
const PORT = process.env.PORT || 3000;

// In-memory data (replace with DB in production)
let users = [];
let products = [
  { id: 1, name: "iPhone 11", price: 900000, category: "phones", image: "iphone11.jpg" },
  { id: 2, name: "HP Pavilion", price: 650000, category: "laptops", image: "hplaptop.jpg" },
  { id: 3, name: "Mouse", price: 120000, category: "accessories", image: "mouse.jpg" }
];

let orders = [];
let notifications = [];
let customerCareMessages = [];

// --- IMAGE UPLOAD ENDPOINT (ADMIN/DEV) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Upload a product image (admin/dev)
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.json({
    success: true,
    filename: req.file.filename,
    url: `/images/${req.file.filename}`
  });
});

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// --- API ROUTES ---

// Get all products
app.get('/api/products', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  if (search) {
    const filtered = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(search)) ||
      (p.category && p.category.toLowerCase().includes(search))
    );
    return res.json(filtered);
  }
  res.json(products);
});

// Add a new product (for admin/dev)
app.post('/api/products/add', (req, res) => {
  const { name, price, category, image } = req.body;
  if (!name || !price || !category || !image) return res.status(400).json({ error: 'Missing product fields' });
  const id = products.length ? products[products.length - 1].id + 1 : 1;
  products.push({ id, name, price, category, image });
  res.json({ success: true, product: { id, name, price, category, image } });
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

// Get all notifications (for admin panel and user)
app.get('/api/notifications', (req, res) => {
  const user = req.query.user;
  if (user) {
    const userNotifs = notifications.filter(n =>
      n.username === user || n.user === user || n.email === user
    );
    return res.json(userNotifs);
  }
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

// Get all orders for a user
app.get('/api/orders/user/:username', (req, res) => {
  const username = req.params.username;
  const userOrders = orders.filter(o => o.username === username);
  res.json(userOrders);
});

// Place a new order
app.post('/api/orders', (req, res) => {
  const { username, product, price, status, base_price, payment_method, order_type, address, image, date } = req.body;
  if (!username || !product || !price) return res.status(400).json({ error: 'Missing order fields' });
  const id = orders.length ? orders[orders.length - 1].id + 1 : 1;
  orders.push({
    id, username, product, price, status: status || 'pending',
    base_price, payment_method, order_type, address, image, date
  });
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
  res.json(users.map(u => {
    const { password, verificationCode, ...rest } = u;
    return rest;
  }));
});

// Check if username or email exists
app.get('/api/users/check', (req, res) => {
  const { username, email } = req.query;
  const exists = users.some(u => u.username === username || u.email === email);
  res.json({ exists });
});

// --- REGISTRATION WITH EMAIL VERIFICATION ---
app.post('/api/users/register', async (req, res) => {
  const { username, password, state, area, street, email, phone, address } = req.body;
  if (!username || !password || !email || !phone) return res.status(400).json({ error: 'Missing required fields' });
  if (users.find(u => u.username === username || u.email === email)) return res.status(409).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  users.push({ username, password: hash, state, area, street, email, phone, address, verified: false, verificationCode });

  try {
    await transporter.sendMail({
      from: `"ONGOD Gadget" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'ONGOD Gadget Email Verification',
      text: `Your verification code is: ${verificationCode}`
    });
    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send verification email.', details: err.message });
  }
});

// --- EMAIL VERIFICATION ENDPOINT ---
app.post('/api/users/verify', (req, res) => {
  const { email, code } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.verified) return res.json({ success: true, message: 'Already verified.' });
  if (user.verificationCode === code) {
    user.verified = true;
    user.verificationCode = null;
    return res.json({ success: true, message: 'Verification successful.' });
  }
  res.status(400).json({ error: 'Invalid verification code.' });
});

// --- LOGIN ENDPOINT (only allow verified users) ---
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
  if (!user.verified) return res.status(403).json({ error: 'Please verify your email before logging in.' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });
  const token = jwt.sign({ username: user.username, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({
    token,
    username: user.username,
    email: user.email,
    state: user.state,
    area: user.area,
    street: user.street
  });
});

// Get user info (for address and map)
app.get('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, verificationCode, ...userInfo } = user;
  res.json(userInfo);
});

// Get full address for a user (for map)
app.get('/api/users/:username/address', (req, res) => {
  const username = req.params.username;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const address = user.address || `${user.street}, ${user.area}, ${user.state}, Nigeria`;
  res.json({ address });
});

// Delete all users
app.delete('/api/users', (req, res) => {
  users = [];
  res.json({ message: 'All users deleted.' });
});

// Delete a user by username
app.delete('/api/users/:username/delete', (req, res) => {
  const username = req.params.username;
  users = users.filter(u => u.username !== username);
  res.json({ message: `User ${username} deleted.` });
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
  if (!text || !username) return res.status(400).json({ error: 'Missing text or username' });
  customerCareMessages.push({
    from: 'user',
    text,
    date: new Date(),
    username,
    email: email || ''
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

// --- EXTRA: Delete all orders, notifications, and customer care messages (admin utility) ---
app.delete('/api/admin/clear-all', (req, res) => {
  users = [];
  orders = [];
  notifications = [];
  customerCareMessages = [];
  res.json({ message: 'All users, orders, notifications, and customer care messages deleted.' });
});

// --- Start server ---
// Listen on all interfaces for LAN/mobile access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT} (accessible on your local network)`);
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    console.log('Public URL: https://' + process.env.RENDER_EXTERNAL_HOSTNAME);
  }
});

// --- EXTRA: Utility endpoint to add a test user quickly (for development only) ---
app.post('/api/dev-add-user', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).json({ error: 'Missing username, password, or email' });
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash, email, verified: true });
  res.json({ success: true, user: { username, email } });
});

// --- 404 Handler for unknown routes ---
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});