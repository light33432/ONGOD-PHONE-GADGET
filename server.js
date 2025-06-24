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

// ...existing code...

// --- Start server ---
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));